export default function generateRandomPhone() {
  return `${Math.floor(Math.random() * 900) + 100}555${Math.floor(Math.random() * 9000) + 1000}`;
}
