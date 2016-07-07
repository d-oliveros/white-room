const { host } = __config.server;
const imageHost = process.env.IMAGE_HOST || host;

export default function getUserImagePath(user, size) {
  return user.image
    ? `${imageHost}/uploads/user/${size}/${user.image}`
    : `${host}/images/placeholders/profile-image@2x.jpg`;
}
