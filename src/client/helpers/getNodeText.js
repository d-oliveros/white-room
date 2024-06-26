export default function getNodeText(node) {
  if (['string', 'number'].includes(typeof node)) {
    return node;
  }
  if (node instanceof Array) {
    return node.map(getNodeText).join('');
  }
  if (typeof node === 'object' && node) {
    return getNodeText(node.props.children);
  }
  return '';
}
