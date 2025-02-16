import { extname } from "path";
import { AsyncProcessRunner } from "../../scripts/hooks/async-process-runner";
import { AsyncProcess } from "../../scripts/hooks/async-process";

(async () => {
  const argv = process.argv;
  argv.shift();
  argv.shift();
  const srcFiles = argv.filter((file) =>
    [".js", ".jsx", ".ts", ".tsx"].includes(extname(file)),
  );

  try {
    const runner = new AsyncProcessRunner({
      compiler: {
        process: new AsyncProcess({
          command: "pnpm build",
        }),
      },
      "unit tests": {
        process: new AsyncProcess({
          command: "pnpm test:cov",
        }),
        spiesOn: ["compiler"],
      },
      "integration tests": {
        process: new AsyncProcess({
          command: "pnpm test:int",
        }),
        spiesOn: ["compiler"],
      },
      "stage badges": {
        process: new AsyncProcess({
          command: "git add */badge-coverage.svg */badge-version.svg",
        }),
        dependsOn: ["unit tests"],
      },
      // linter: {
      //   process: new AsyncProcess({
      //     command: srcFiles.length
      //       ? `npx eslint ${srcFiles.join(" ")}`
      //       : "sleep 1",
      //   }),
      //   dependsOn: ["compiler"],
      // },
    });

    await runner.Start();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
})();
