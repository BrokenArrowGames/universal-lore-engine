import { readFileSync, writeFileSync } from "fs";

const appVer = GetAppVersion();
GenBadge("version", `v${appVer}`);

const { pct: covPct, color: covColor } = GetCoverageInfo();
GenBadge("coverage", `${covPct}%25`, { color: covColor });



interface BadgeOpts {
  color: string;
};

async function GenBadge(left: string, right: string, opts?: BadgeOpts) {
  const url = `https://img.shields.io/badge/${left}-${right}-${opts?.color ?? "blue"}`;
  const data = await fetch(url).then(res => res.text());
  writeFileSync(`resources/badge-${left}.svg`, data);
}

function GetColor(pct: number) {
  if (pct > 80) return 'green';
  if (pct > 65) return 'yellow';
  return 'red';
}

function GetCoverageInfo() {
  const content = readFileSync("./coverage/coverage-summary.json").toString();
  const summary = JSON.parse(content);
  const pct = summary.total.lines.pct;
  const color = GetColor(pct);
  return { pct, color };
}

function GetAppVersion() {
  const content = readFileSync("./package.json").toString();
  const pkg = JSON.parse(content);
  return pkg.version;
}
