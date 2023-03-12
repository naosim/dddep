export class Dependences {
  constructor(list, map, interfaceToImplMap) {
    this.list = list;
    this.map = map;
    this.interfaceToImplMap = interfaceToImplMap;
  }

  /**
   * 
   * @param {string} fullPackage 
   * @param {function(string[])} cb 
   */
  ifDependencesFrom(fullPackage, cb) {
    if(this.map[fullPackage]) {
      cb(this.map[fullPackage])
    }
  }

  /**
   * 
   * @param {any[]} javaClasses 
   * @param {string[]} ignoreClasses 
   * @returns 
   */
  static create(javaClasses, ignoreClasses) {
    const ignoreClassesMap = ignoreClasses.reduce((memo, v) => {memo[v] = true; return memo}, {});

    var classes = javaClasses
      .filter(v => v.className.indexOf('__') == -1)
      .filter(v => !ignoreClassesMap[v.fullPackage])
    var classNameMap = classes.reduce((memo, v) => {
      if (!memo[v.className]) {
        memo[v.className] = [];
      }
      memo[v.className].push(v);
      return memo;
    }, {})

    function getClass(className) {
      var result = classNameMap[className];
      if (!result) {
        return null;
      }
      if (result.length > 1) {
        throw new Error('classが複数ある: ' + className);
      }
      return result.length == 1 ? result[0] : null;
    }
    var fullPackageMap = classes.reduce((memo, v) => {
      memo[v.fullPackage] = v;
      return memo;
    }, {});

    function isBatchApi(className) {
      return className.lastIndexOf('BatchApi') != -1 && className.lastIndexOf('BatchApi') == className.length - 8
    }

    function getClassNameFromFullPackage(fullPackage) {
      return fullPackage.split('.').pop();
    }
    // インターフェースから実装が取れるマップ
    var interfaceToImplMap = classes.filter(v => v.isDiComponent).filter(v => v.implements.length > 0).filter(v => {
      if (v.implements.length > 1) {
        throw new Error('リポジトリのimplementsが複数ある' + v.className)
      }
      return true;
    }).reduce((memo, v) => {
      if (!memo[v.implements[0]]) {
        memo[v.implements[0]] = [];
      }
      memo[v.implements[0]].push(v);
      return memo;
    }, {});
    var dependences = [];
    var dependenceMap = {};

    function addDependence(from, to) {
      dependences.push([from, to])
      if (!dependenceMap[from]) {
        dependenceMap[from] = [];
      }
      dependenceMap[from].push(to);
    }
    classes.filter(v => v.isDiComponent).forEach(v => {
      if (isBatchApi(v.className)) {
        // バッチはActivatorと紐づける
        var activatorName = v.className.slice(0, -8) + 'Activator';
        var activator = getClass(activatorName);
        if (!activator) {
          // ActivatorをServiceActivatorに変換してリトライ
          activatorName = activatorName.split('Activator').join('ServiceActivator');
          activator = getClass(activatorName);
          if(!activator) {
            console.error('Activatorがない: ' + v.fullPackage);
          }
          return;
          // throw new Error('Activatorがない: ' + v.fullPackage)
        }
        addDependence(v.fullPackage, activator.fullPackage);
        // dependences.push([v.fullPackage, activator.fullPackage])
      } else {
        v.imports.filter(imp => !ignoreClassesMap[imp]).forEach(imp => {
          var className = getClassNameFromFullPackage(imp);
          var clazz = fullPackageMap[imp];
          if (clazz != null && clazz.isDiComponent) {
            addDependence(v.fullPackage, clazz.fullPackage);
            // dependences.push([v.fullPackage, clazz.fullPackage]) 
          }
          // Diに関係しているインターフェースなら紐づける
          if (interfaceToImplMap[className]) {
            try {
              addDependence(v.fullPackage, clazz.fullPackage);
              // dependences.push([v.fullPackage, clazz.fullPackage]) 
            } catch (e) {
              console.log(v.className);
              console.log(imp);
              console.log(clazz);
              console.log(interfaceToImplMap[className]);
              console.error(e);
            }
          }
        })
      }
    })

    return new Dependences(dependences, dependenceMap, interfaceToImplMap);
  }
}