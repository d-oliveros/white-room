export default function moveElementInArray(array, value, positionChange) {
  const oldIndex = array.indexOf(value);
  if (oldIndex > -1) {
    let newIndex = (oldIndex + positionChange);
    if (newIndex < 0) {
      newIndex = 0;
    }
    else if (newIndex >= array.length) {
      newIndex = array.length;
    }
    const arrayClone = array.slice();
    arrayClone.splice(oldIndex, 1);
    arrayClone.splice(newIndex, 0, value);
    return arrayClone;
  }
  return array;
}
