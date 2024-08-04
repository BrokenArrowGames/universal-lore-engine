import { execSync } from "child_process";
import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import * as ts from "typescript";

// add compile time constants to this object
const Constants: Record<string, ()=>any> = {
  APP_VERSION: () => process.env.npm_package_version,
  BUILD_ID: () => execSync('git rev-parse HEAD').toString().trim(),
  BUILD_TIMESTAMP: () => new Date().toISOString(),
};

export function GenerateCompileTimeConstants() {
  const outDir = join("src", "generated");
  const filename = join(outDir, "util", "constants.ts");
  const file = ts.createSourceFile(filename, "", ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  
  const nodeArray = ts.factory.createNodeArray(
    Object.keys(Constants).map((key) => CreateConstant(key)));
  const content = printer.printList(ts.ListFormat.MultiLine, nodeArray, file);
  const dir = join(".", dirname(file.fileName));
  mkdirSync(dir, { recursive: true });
  writeFileSync(file.fileName, content);
}


function CreateConstant(name: string) {
  const valueLiteral = ts.factory.createStringLiteral(Constants[name]());
  const variableDeclaration = ts.factory.createVariableDeclaration(name, undefined, undefined, valueLiteral);
  const variableDeclarationList = ts.factory.createVariableDeclarationList(
    [variableDeclaration],
    ts.NodeFlags.Const);
  
  const statement = ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    variableDeclarationList);
    
  return statement;
}
