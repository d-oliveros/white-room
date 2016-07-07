
export default async function logout() {
  this.clearCookie('token', __config.cookies);
}
