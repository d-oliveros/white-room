const { host } = __config.server;
const imageHost = process.env.IMAGE_HOST || host;

export default function getPosterImagePath(post) {
  return !post.userImage
    ? `${host}/images/placeholders/profile-image@2x.jpg`
    : (post.anonymous
      ? `${host}/images/anonymous/${post.userImage}`
      : `${imageHost}/uploads/user/70/${post.userImage}`);
}
