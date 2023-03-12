import { FromToPairs } from "./fromToPairs.mjs";

/**
 * 
 * @param {FromToPairs} fromToPairs 
 */
export function toMermaid(fromToPairs) {
  const arrows = fromToPairs.toList().map(v => toMermaidArrow(v)).join('\n');
  return `
graph TD;
${arrows}
  `.trim()
}

/**
 * 
 * @param {Array} ary [from, to, isInv]
 * @returns {string}
 */
function toMermaidArrow(ary) {
  const [from, to, isInv] = ary;
  if(isInv) {
    return to.split('.').pop() + ' <-.- ' + from.split('.').pop();
  }
  return from.split('.').pop() + ' --> ' + to.split('.').pop();
}