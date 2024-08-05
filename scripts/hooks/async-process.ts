import { ChildProcess, spawn } from "child_process";
import { Writable } from "stream";

export class InMemoryWritableStream extends Writable {
  private offset: number = 0;
  private readonly buffer: Buffer;

  constructor(private readonly size: number = 4096) {
    super();
    this.buffer = Buffer.alloc(this.size);
  }

  _write(
    chunk: Buffer | string,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ): void {
    let str = "";
    if (chunk instanceof Buffer) {
      str = chunk.toString();
    } else if (typeof chunk === "string") {
      str = chunk;
    } else {
      callback(new Error("invalid chunk format"));
      return;
    }

    if (str.length + this.offset > this.size) {
      callback(new Error("Out of memory"));
      return;
    }

    this.offset += this.buffer.write(str, this.offset);
    callback();
  }

  toString(): string {
    return this.buffer.subarray(0, this.offset).toString();
  }
}

export enum AsyncProcessStatus {
  ERROR = "AsyncProcess_ERROR",
  WAITING = "waiting",
  RUNNING = "running",
  STOPPED = "stopped",
  SUCCESS = "success",
  FAILURE = "failure",
}

export class AsyncProcessWasKilledError extends Error {}

export class AsyncProcess {
  public label: string;
  public dependencies: AsyncProcess[] = [];

  private readonly command: string;
  private _started: boolean = false;
  private _status = AsyncProcessStatus.WAITING;
  private readonly errStream = new InMemoryWritableStream();
  private proc?: ChildProcess;

  constructor({
    label,
    command,
    dependencies = [],
  }: {
    label?: string;
    command: string;
    dependencies?: AsyncProcess[];
  }) {
    this.label = label ?? command;
    this.command = command;
    this.dependencies = dependencies;
  }

  public get stdErr(): string {
    return this.errStream.toString();
  }

  public get started(): boolean {
    return this._started;
  }

  public get status(): AsyncProcessStatus {
    return this._status;
  }

  async Start(): Promise<void> {
    await this.awaitDeps();

    if (this._status === AsyncProcessStatus.STOPPED) {
      if (!this._started) {
        throw new AsyncProcessWasKilledError(`${this.label}: was aborted`);
      } else {
        throw new AsyncProcessWasKilledError(`${this.label}: was killed`);
      }
    }

    this._started = true;
    this._status = AsyncProcessStatus.RUNNING;
    this.proc = spawn(this.command, {
      shell: true,
      stdio: ["ignore", "ignore", "pipe"],
    });
    this.proc?.stderr?.pipe(this.errStream);

    return new Promise<void>((resolve, reject) => {
      this.proc?.on(
        "close",
        (code: number | null, _signal: NodeJS.Signals | null) => {
          if (this._status === AsyncProcessStatus.ERROR) {
            reject(new Error(`${this.label}: invalid status`));
          } else if (this.proc?.killed) {
            this._status = AsyncProcessStatus.STOPPED;
            reject(new AsyncProcessWasKilledError(`${this.label}: was killed`));
          } else if (code != 0) {
            this._status = AsyncProcessStatus.FAILURE;
            reject(new Error(`${this.label}: exited with code '${code}'`));
          } else {
            this._status = AsyncProcessStatus.SUCCESS;
            resolve();
          }
        },
      );
    });
  }

  Stop(): void {
    if (!this._started) {
      this._status = AsyncProcessStatus.STOPPED;
      return;
    }

    if (this.proc && !this.proc?.kill("SIGINT")) {
      this._status = AsyncProcessStatus.ERROR;
      throw new Error(`${this.label}: failed to kill`);
    }
  }

  toString(): string {
    return `${this.label} ${this._status}`;
  }

  private awaitDeps(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.blockedLoop(100, resolve, reject);
    });
  }

  private blockedLoop(interval: number, resolve, reject) {
    if (
      this.dependencies.every(
        (dep) =>
          ![AsyncProcessStatus.RUNNING, AsyncProcessStatus.WAITING].includes(
            dep.status,
          ),
      )
    ) {
      if (
        !this.dependencies.every(
          (dep) => dep.status === AsyncProcessStatus.SUCCESS,
        )
      ) {
        this.Stop();
      }
      resolve();
      return;
    }
    setTimeout(() => this.blockedLoop(interval, resolve, reject), interval);
  }
}

// (async () => {
//   const proc = new AsyncProcess({ label: "compile", command: "pnpm build" });
//   try {
//     proc.Stop();
//     const promise = proc.Start();

//     await promise;
//   } catch (err) {
//     const out = proc.stdErr;
//     if (out.length) console.log(out);
//     console.log(err.message);
//   }
// })();
