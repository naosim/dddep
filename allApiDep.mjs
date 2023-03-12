// 依存関係を解析する
import {toMermaid} from "./src/mermaidView.mjs"
import {ignoreClasses} from "./ignoreClasses.mjs"
import { createGraph } from "./src/dddep.mjs"
import fs from "fs";
import crypto from "crypto";

const javaClassesJsonPath = process.argv[2];
var outputDir = process.argv[3];
if(outputDir.slice(-1) == '/') {
  outputDir = outputDir.slice(0, -1);
}

const json = JSON.parse(fs.readFileSync(javaClassesJsonPath, 'utf8'));
if(json.schemaVersion.split('.')[0] != 2) {
  throw new Error(`schemaVersionが${json.schemaVersion}です。本プログラムは2.xを前提に作られています。`);
}
const javaClasses = json.classes;


const ignoreClassesMap = ignoreClasses.reduce((memo, v) => {memo[v] = true; return memo}, {});
var apis = javaClasses
  .filter(v => !ignoreClassesMap[v.fullPackage])
  .filter(v => v.apiEndPointLength > 0)

function createIndexText(apis) {
  const lines = [];
  lines.push("# ALL APIs");
  lines.push(`classes: ${apis.length}`);
  apis.forEach((v, i) => {
    lines.push(`## ${v.className}`);
    lines.push(`[${v.fullPackage}](./detail/${getFileName(v, i)})`);
    lines.push(``);

    lines.push(`### URL`);
    lines.push(`- ${v.apiEndPoints.join(' \n- ')}`);
    lines.push(``);
  })
  return lines;
}

function getFileName(api) {
  return `${api.className}_${shortMd5(api.fullPackage)}.md`
}

function createDetailText(api) {
  const lines = [];
  lines.push(`# ${api.className}`);
  lines.push(`${api.fullPackage}`);
  lines.push(``);

  lines.push(`## URL`);
  lines.push(`- ${api.apiEndPoints.join(' \n- ')}`);
  lines.push(``);
  lines.push(`## Dependecies Graph`);
  lines.push("```mermaid");
  var fromToPairs = createGraph(javaClasses, ignoreClasses, api.fullPackage);
  lines.push(toMermaid(fromToPairs));
  lines.push("```");
  lines.push(``);
  return lines;
}



function shortMd5(str) {
  const md5 = crypto.createHash('md5')
  return md5.update(str, 'binary').digest('hex').slice(0, 8);
}

fs.writeFileSync(`${outputDir}/index.md`, createIndexText(apis).join('\n'))
apis.forEach((v, i) => {
  fs.writeFileSync(`${outputDir}/detail/${getFileName(v)}`, createDetailText(v).join('\n'))
})