import { ChildProcess, spawn, SpawnOptions } from "child_process";

const AnsiCmd = {
  Up: (n) => `\x1b[${n}A`,
  Down: (n) => `\x1b[${n}B`,
};
const AnsiHideCursor = "\x1b[?25l";
const AnsiShowCursor = "\x1b[?25h";
const AnsiClearLine = "\x1b[K";
const AnsiRestoreColor = "\x1b[0m";

enum AnsiNorm {
  RED = "\x1b[00;31m",
  GREEN = "\x1b[00;32m",
  YELLOW = "\x1b[00;33m",
  BLUE = "\x1b[00;34m",
  PURPLE = "\x1b[00;35m",
  CYAN = "\x1b[00;36m",
  GRAY = "\x1b[00;37m",
}

enum AnsiLight {
  RED = "\x1b[01;31m",
  GREEN = "\x1b[01;32m",
  YELLOW = "\x1b[01;33m",
  BLUE = "\x1b[01;34m",
  PURPLE = "\x1b[01;35m",
  CYAN = "\x1b[01;36m",
  WHITE = "\x1b[01;37m",
}

class StoppableProcessError extends Error {
  constructor(
    private readonly code: number,
    private readonly label: string,
    msg: string,
  ) {
    super(msg);
  }
}

class StoppableProcessDepError extends Error {
  constructor(
    private readonly code: number,
    private readonly label: string,
    msg: string,
  ) {
    super(msg);
  }
}

interface StoppableProcessOptions {
  label: string;
  command: string;
  dependencies?: StoppableProcess[];
  options?: SpawnOptions;
}

class StoppableProcess {
  public readonly label: string;
  public promise: Promise<number | null>;
  private _started: boolean = false;
  private _running: boolean = false;
  private _canceled: boolean = false;
  private _exitCode?: number;
  private _child?: ChildProcess;

  constructor(options: StoppableProcessOptions) {
    this.label = options.label;
    this.promise = new Promise((resolve, reject) => {
      Promise.allSettled(
        (options.dependencies ?? [])
          .filter((dep) => dep)
          .map(({ promise }) => promise),
      ).then((deps) => {
        if (deps.some((dep) => dep.status === "rejected")) {
          this._started = true;
          this._canceled = true;
          reject(
            new StoppableProcessDepError(
              -9998,
              this.label,
              `${this.label}: dependency failed`,
            ),
          );
          return;
        }
        if (this.canceled) {
          this._started = true;
          reject(
            new StoppableProcessError(
              -9999,
              this.label,
              `${this.label}: canceled`,
            ),
          );
          return;
        }
        this._running = true;
        this._started = true;
        this._child = spawn(options.command, {
          stdio: "ignore",
          shell: true,
          ...(options.options ?? {}),
        });
        this._child.on(
          "close",
          (code: number | null, signal: NodeJS.Signals | null) => {
            this._running = false;
            this._exitCode = code ?? -1;
            if (code === 0) {
              resolve(code);
            } else if (signal) {
              resolve(0);
            } else if (code) {
              reject(
                new StoppableProcessError(
                  code,
                  this.label,
                  `${this.label}: exited with code ${code}`,
                ),
              );
            } else {
              reject(
                new StoppableProcessError(
                  9999,
                  this.label,
                  `${this.label}: an unknown error has occured`,
                ),
              );
            }
          },
        );
      });
    });
  }

  get started() {
    return this._started;
  }
  get running() {
    return this._running;
  }
  get canceled() {
    return this._canceled;
  }
  get exitCode() {
    return this._exitCode;
  }

  async Stop() {
    this._canceled = true;
    if (this._child && !this._child.kill()) {
      console.error("failed to kill child process");
    }
  }
}

export type RunnerChildOptions = Omit<
  StoppableProcessOptions,
  "label" | "dependencies"
> & {
  dependencies?: string[],
  condition?: () => boolean,
};

export class Runner {
  public readonly promise: Promise<void>;
  private children: StoppableProcess[] = [];
  private errors: Error[] = [];

  constructor(
    childOpts: Record<string, RunnerChildOptions>,
    private readonly interval: number = 100,
    private readonly animations: {
      loading?: string[];
      waiting?: string[];
      success?: string[];
      failure?: string[];
      canceled?: string[];
    } = {},
  ) {
    animations.loading ??= ["|", "/", "-", "\\"];
    animations.waiting ??= [".", "o", "O", "O", "o", "."];
    animations.success ??= ["✔"];
    animations.failure ??= ["X"];
    animations.canceled ??= ["O"];

    const withoutDeps = Object.entries(childOpts)
      .filter(
        ([_label, opts]) => !opts.condition || opts.condition(),
      )
      .filter(
        ([_label, opts]) => !opts.dependencies,
      );
    this.children.push(
      ...withoutDeps.map(
        ([label, opts]) =>
          new StoppableProcess({
            ...opts,
            label,
            dependencies: undefined,
          }),
      ),
    );

    let i = 5;
    let withDeps = Object.entries(childOpts)
      .filter(
        ([_label, opts]) => !opts.condition || opts.condition(),
      ).filter(
        ([_label, opts]) => opts.dependencies,
      );
    while (withDeps.length && i > 0) {
      this.children.push(
        ...withDeps
          .filter(([_label, opts]) =>
            opts.dependencies?.every((dep) =>
              this.children.find((c) => c.label === dep),
            ),
          )
          .map(
            ([label, opts]) =>
              new StoppableProcess({
                ...opts,
                label,
                dependencies: opts.dependencies?.map(
                  (dep) => this.children.find(({ label }) => label === dep)!,
                ),
              }),
          ),
      );
      i--;
      withDeps = Object.entries(childOpts).filter(
        ([label]) => !this.children.find((c) => c.label === label),
      );
    }

    this.children.forEach(({ promise }) =>
      promise.catch((err) => {
        if (!(err instanceof StoppableProcessDepError)) this.errors.push(err);
      }),
    );

    this.promise = new Promise((resolve) => {
      let i = 0;
      const check = () => {
        this.children.forEach((child) => {
          const status = !child.started
            ? "waiting"
            : child.running
              ? "running"
              : child.canceled
                ? "canceled"
                : child.exitCode === 0
                  ? "success"
                  : "failure";

          const icon = !child.started
            ? `${AnsiNorm.YELLOW}${this.animations.waiting![i % this.animations.waiting!.length]}${AnsiRestoreColor}`
            : child.running
              ? `${AnsiNorm.CYAN}${this.animations.loading![i % this.animations.loading!.length]}${AnsiRestoreColor}`
              : child.canceled
                ? `${AnsiNorm.GRAY}${this.animations.canceled![i % this.animations.canceled!.length]}${AnsiRestoreColor}`
                : child.exitCode === 0
                  ? `${AnsiNorm.GREEN}${this.animations.success![i % this.animations.success!.length]}${AnsiRestoreColor}`
                  : `${AnsiNorm.RED}${this.animations.failure![i % this.animations.failure!.length]}${AnsiRestoreColor}`;
          console.log(
            `${AnsiHideCursor}${AnsiClearLine}${icon} ${child.label} ${status}`,
          );
        });
        console.log(`${AnsiCmd.Up(this.children.length + 1)}\r`);
        i++;
        if (this.children.some(({ running, started }) => running || !started)) {
          setTimeout(check, this.interval);
        } else {
          resolve();
          console.log(
            `${AnsiCmd.Down(this.children.length)}\r${AnsiShowCursor}`,
          );
          if (this.errors.length) {
            console.error(this.errors.map(({ message }) => message).join("\n"));
          }
        }
      };
      check();
    });
  }
}