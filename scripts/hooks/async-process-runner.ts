import {
  AsyncProcess,
  AsyncProcessStatus,
  AsyncProcessWasKilledError,
} from "./async-process";
import {
  AnsiClearLine,
  AnsiNorm,
  AnsiRestorCursor,
  AnsiRestoreColor,
  AnsiSaveCursor,
} from "./ansi-util";

export class AsyncProcessRunner {
  private frame: number = 0;
  private readonly results: Record<
    string,
    {
      done: boolean;
      hasErr: boolean;
      err?: Error;
      stderr?: string;
      promise?: Promise<void>;
    }
  > = {};

  constructor(
    private readonly children: Record<
      string,
      { process: AsyncProcess; dependsOn?: string[]; spiesOn?: string[] }
    >,
    private readonly options: {
      animations?: {
        loading?: string[];
        waiting?: string[];
        success?: string[];
        failure?: string[];
      };
    } = {},
  ) {
    Object.entries(this.children).forEach(([label, { process }]) => {
      process.label = label;
      this.results[label] = { done: false, hasErr: false };
    });
    this.options.animations ??= {};
    this.options.animations.loading ??= "|/-\\".split("");
    this.options.animations.waiting ??= ".oOOo.".split("");
    this.options.animations.success ??= "✔".split("");
    this.options.animations.failure ??= "X".split("");
  }

  Start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.startChildren();
      console.log(AnsiSaveCursor);
      this.print();
      this.ResultLoop(150, resolve, reject);
    });
  }

  Stop(): void {
    Object.values(this.children).forEach((child) => child.process.Stop());
  }

  private ResultLoop(interval: number, resolve, reject) {
    if (!this.checkResults()) {
      setTimeout(() => this.ResultLoop(interval, resolve, reject), interval);
      return;
    }

    const results = Object.values(this.results);
    if (results.some((res) => res.err)) {
      reject(
        results
          .filter(({ hasErr }) => hasErr)
          .filter(({ err }) => !(err instanceof AsyncProcessWasKilledError))
          .map(({ err, stderr }) => `${err}\n${stderr}`)
          .join("\n"),
      );
    } else {
      resolve();
    }
  }

  private print(): void {
    const loading = this.options.animations!.loading!;
    const waiting = this.options.animations!.waiting!;
    const succees = this.options.animations!.success!;
    const failure = this.options.animations!.failure!;
    const mapper: Record<AsyncProcessStatus, string> = {
      [AsyncProcessStatus.ERROR]: `${AnsiNorm.RED}${failure[this.frame % failure.length]}${AnsiRestoreColor}`,
      [AsyncProcessStatus.FAILURE]: `${AnsiNorm.RED}${failure[this.frame % failure.length]}${AnsiRestoreColor}`,
      [AsyncProcessStatus.RUNNING]: `${AnsiNorm.CYAN}${loading[this.frame % loading.length]}${AnsiRestoreColor}`,
      [AsyncProcessStatus.STOPPED]: `${AnsiNorm.YELLOW}${failure[this.frame % failure.length]}${AnsiRestoreColor}`,
      [AsyncProcessStatus.SUCCESS]: `${AnsiNorm.GREEN}${succees[this.frame % succees.length]}${AnsiRestoreColor}`,
      [AsyncProcessStatus.WAITING]: `${AnsiNorm.PURPLE}${waiting[this.frame % waiting.length]}${AnsiRestoreColor}`,
    };
    const children = Object.values(this.children);

    console.log(AnsiRestorCursor);
    children.forEach((child) => {
      console.log(
        `\r${AnsiClearLine}${mapper[child.process.status]} ${child.process.toString()}`,
      );
    });
    this.frame++;
  }

  private checkResults(): boolean {
    const count = Object.keys(this.children).length;
    const resultEntries = Object.entries(this.results);
    const complete = resultEntries.filter(([_k, v]) => v.done);
    const childEntries = Object.entries(this.children);
    const running = childEntries.filter(
      ([_k, v]) => v.process.status === AsyncProcessStatus.RUNNING,
    );

    this.print();

    if (complete.length === count) {
      return true;
    }

    running.forEach(([key]) => {
      const child = this.children[key];
      child.spiesOn?.forEach((spy) => {
        if (this.results[spy].hasErr) {
          child.process.Stop();
        }
      });
    });

    return false;
  }

  private async startChildren(): Promise<void> {
    const all = Object.keys(this.children);
    const ready = all.filter((key) => !this.children[key].dependsOn?.length);
    const waiting = all.filter((key) => !ready.includes(key));

    waiting.forEach((w) =>
      this.children[w].process.dependencies.push(
        ...(this.children[w].dependsOn?.map((d) => this.children[d].process)
        ?? []),
      ),
    );

    Object.entries(this.children).forEach(([key, child]) => {
      const result = this.results[key];
      result.promise = child.process
        .Start()
        .catch((err) => {
          result.hasErr = true;
          result.err = err;
          result.stderr = child.process.stdErr;
        })
        .finally(() => (result.done = true));
    });
  }
}

// (async () => {
//   const runner = new AsyncProcessRunner({
//     "test 1":  { process: new AsyncProcess({ command: "sleep 3; echo test 1" }) },
//     "test 2":  { process: new AsyncProcess({ command: "sleep 5; echo test 2" }) },
//     "test 3":  { process: new AsyncProcess({ command: "sleep 3; echo test 3; exit 1" }) },
//     "test 4":  { process: new AsyncProcess({ command: "sleep 1; echo test 4" }), dependsOn: [ "test 2" ] },
//     "test 5":  { process: new AsyncProcess({ command: "sleep 1; echo test 5" }), dependsOn: [ "test 3" ] },
//     "test 6":  { process: new AsyncProcess({ command: "sleep 1; echo test 6" }), dependsOn: [ "test 2", "test 3" ] },
//     "test 7":  { process: new AsyncProcess({ command: "sleep 1; echo test 7" }), spiesOn: [ "test 2" ] },
//     "test 8":  { process: new AsyncProcess({ command: "sleep 1; echo test 8" }), spiesOn: [ "test 3" ] },
//     "test 9":  { process: new AsyncProcess({ command: "sleep 1; echo test 9" }), spiesOn: [ "test 2", "test 3" ] },
//     "test 10": { process: new AsyncProcess({ command: "sleep 10; echo test 10" }), spiesOn: [ "test 2" ] },
//     "test 11": { process: new AsyncProcess({ command: "sleep 10; echo test 11" }), spiesOn: [ "test 3" ] },
//     "test 12": { process: new AsyncProcess({ command: "sleep 10; echo test 12" }), spiesOn: [ "test 2", "test 3" ] },
//     "test 13": { process: new AsyncProcess({ command: "sleep 1; echo test 13" }), dependsOn: [ "test 1" ], spiesOn: [ "test 2" ] },
//     "test 14": { process: new AsyncProcess({ command: "sleep 1; echo test 14" }), dependsOn: [ "test 2" ], spiesOn: [ "test 3" ] },
//     "test 15": { process: new AsyncProcess({ command: "sleep 1; echo test 15" }), dependsOn: [ "test 3" ], spiesOn: [ "test 2" ] },
//     "test 16": { process: new AsyncProcess({ command: "sleep 10; echo test 16" }), dependsOn: [ "test 1" ], spiesOn: [ "test 2" ] },
//     "test 17": { process: new AsyncProcess({ command: "sleep 10; echo test 17" }), dependsOn: [ "test 2" ], spiesOn: [ "test 3" ] },
//     "test 18": { process: new AsyncProcess({ command: "sleep 10; echo test 18" }), dependsOn: [ "test 3" ], spiesOn: [ "test 2" ] },
//     "test 19": { process: new AsyncProcess({ command: "sleep 1; echo test 19" }), dependsOn: [ "test 4" ] },
//     "test 20": { process: new AsyncProcess({ command: "sleep 1; echo test 20" }), dependsOn: [ "test 19" ] },
//   });

//   try {
//     const promise = runner.Start();
//     await promise;
//   } catch (err) {
//     console.log(err);
//   }
// })();
