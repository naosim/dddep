// 依存関係を解析する

import {Dependences} from "./dependences.mjs"
import {FromToPairs} from "./fromToPairs.mjs"

/**
 * 
 * @param {string} fullPackage 
 * @param {Dependences} dependences
 * @param {number?} nest 
 * @param {FromToPairs?} fromToPairs 
 * @returns FromToPairs
 */
function createGraphWithDependences(fullPackage, dependences, nest, fromToPairs) {
  //console.log(fullPackage);
  var className = fullPackage.split('.').pop();
  if(!fromToPairs) {
    fromToPairs = new FromToPairs();
  }
  var getClassName = function(fullPackage) {
    return fullPackage.split('.').pop();// '.'で区切って最終要素を取る
  };
  if(nest === undefined) {
    nest = 0;
  }
  if(nest > 100) {
    throw new Error('nestが深すぎ。無限ループかも');
  }
  if(dependences.map[fullPackage]) {
    dependences.map[fullPackage]
      .forEach(v => {
        if(fromToPairs.has(fullPackage, v)) {
          return;
        }
        fromToPairs.add(fullPackage, v)
        createGraphWithDependences(v, dependences, nest + 1, fromToPairs)
      })
  } else if(dependences.interfaceToImplMap[className]) {
    fromToPairs.add(dependences.interfaceToImplMap[className][0].fullPackage, fullPackage, true);
    createGraphWithDependences(dependences.interfaceToImplMap[className][0].fullPackage, dependences, nest + 1, fromToPairs);
  }
  
  return fromToPairs;
}

/**
 * 
 * @param {Array} javaClasses 
 * @param {string[]} ignoreClasses 
 * @param {string} entryPackageName 
 * @returns 
 */
export function createGraph(javaClasses, ignoreClasses, entryPackageName) {
  const dependences = Dependences.create(javaClasses, ignoreClasses);
  return createGraphWithDependences(entryPackageName, dependences);
}

export function depRepositories(javaClasses, ignoreClasses, entryPackageName) {
  const pairs = createGraph(javaClasses, ignoreClasses, entryPackageName);
  const map = {};
  pairs.toList().forEach(v => {
    map[v[0]] = true;
    map[v[1]] = true;
  })
  return Object.keys(map).filter(v => v.endsWith('Repository'));

}