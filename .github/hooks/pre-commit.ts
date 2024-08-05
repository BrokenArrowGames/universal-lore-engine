import { extname } from "path";
import { Runner } from "./runner";

(async () => {
  const argv = process.argv;
  argv.shift();
  argv.shift();
  const srcFiles = argv.filter((file) =>
    [".js", ".jsx", ".ts", ".tsx"].includes(extname(file)),
  );
  try {
    const runner = new Runner({
      compiling: {
        command: "pnpm build",
        // options: { stdio: 'inherit' },
      },
      "unit tests": {
        command: "pnpm test:cov",
        // options: { stdio: 'inherit' },
      },
      "integration tests": {
        command: "pnpm test:int",
        // options: { stdio: 'inherit' },
      },
      linting: {
        condition: () => !!srcFiles.length,
        command: `npx eslint ${srcFiles.join(" ")}`,
        dependencies: ["compiling"],
        // options: { stdio: "inherit" },
      },
      formatting: {
        condition: () => !!srcFiles.length,
        command: `npx prettier ${srcFiles.join(" ")}`,
        dependencies: ["linting"],
        options: { stdio: "inherit" },
      },
    });
    await runner.promise;
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error(err);
    }
    process.exit(1);
  }
  process.exit(9);
})();
