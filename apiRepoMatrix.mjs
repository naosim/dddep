// APIとRepositoryのマッピング
import {ignoreClasses} from "./ignoreClasses.mjs"
import { depRepositories } from "./src/dddep.mjs"
import fs from "fs";

const javaClassesJsonPath = process.argv[2];

const javaClasses = JSON.parse(fs.readFileSync(javaClassesJsonPath, 'utf8'));

// repo
const ignoreClassesMap = ignoreClasses.reduce((memo, v) => {memo[v] = true; return memo}, {});
var apis = javaClasses
  .filter(v => !ignoreClassesMap[v.fullPackage])
  .filter(v => v.apiEndPointLength > 0).map(api => {
    
  return {
    className: api.className,
    package: api.package,
    fullPackage: api.fullPackage,
    isRestController: api.isRestController,
    apiEndPoints: api.apiEndPoints,
    apiEndPointLength: api.apiEndPointLength,
    depRepositories: depRepositories(javaClasses, ignoreClasses, api.fullPackage)
  };
});

// カラムを決める
var columnsMap = apis.reduce((memo, api) => {
  api.depRepositories.forEach(repo => memo[repo] = true);
  return memo;
}, {})
const columns = Object.keys(columnsMap);

// console.log(columns);

// ヘッダー
console.log(['apiClassName','apiEndPointLength','apiEndPoints',...(columns.map(getRepositoryShortName))].join(','));
// ボディ
apis.map(api => {
  const repoMap = api.depRepositories.reduce((memo, v) => {memo[v] = true; return memo}, {})
  return [
    api.className,
    api.apiEndPointLength,
    api.apiEndPoints.join('<br>'),
    ...columns.map(key => repoMap[key] ? 'o' : '')
  ];
}).forEach(v => console.log(v.join(',')))

/**
 * 短いリポジトリ名を取得する
 * @param {string} fullPackage 
 * @returns 
 */
function getRepositoryShortName(fullPackage) {
  return fullPackage.split('.').slice(-1)[0].replace('Repository', 'R.');
}
