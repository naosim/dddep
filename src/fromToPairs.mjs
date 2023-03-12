export class FromToPairs {
  constructor() {
    this.map = {};
  }
  #id(from, to) {
    return from + ',' + to;
  }
  has(from, to) {
    return !!this.map[this.#id(from, to)]
  }
  /**
   * fromとtoを矢印で繋ぐ
   * @param {string} from 
   * @param {string} to 
   * @param {boolean} isInv 
   */
  add(from, to, isInv) {
    var str = this.#id(from, to);
    var text = from.split('.').pop() + ' --> ' + to.split('.').pop();
    if(isInv) {
      text = to.split('.').pop() + ' <-.- ' + from.split('.').pop();
    }
    this.map[str] = [from, to, isInv];
  }

  toList() {
    return Object.values(this.map);
  }
}