// 依存関係を解析する
import {toMermaid} from "./src/mermaidView.mjs"
import {ignoreClasses} from "./ignoreClasses.mjs"
import { createGraph } from "./src/dddep.mjs"
import fs from "fs";

const javaClassesJsonPath = process.argv[2];
const entryPackageName = process.argv[3];

const javaClasses = JSON.parse(fs.readFileSync(javaClassesJsonPath, 'utf8'));

// toMermaid
var fromToPairs = createGraph(javaClasses, ignoreClasses, entryPackageName);
console.log(toMermaid(fromToPairs));
