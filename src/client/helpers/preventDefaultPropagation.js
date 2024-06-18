export default function preventDefaultPropagation(e) {
  e.preventDefault();
  e.stopPropagation();
}
