import typeCheck from '#common/util/typeCheck.js';

export default function setPageMetadata({ state }, pageMetadata) {
  typeCheck('pageMetadata::Object', pageMetadata);

  const {
    pageTitle,
    robots,
    keywords,
    description,
    image,
  } = pageMetadata;

  typeCheck('pageTitle::NonEmptyString', pageTitle);
  typeCheck('robots::NonEmptyString', robots);
  typeCheck('keywords::NonEmptyString', keywords);
  typeCheck('description::NonEmptyString', description);
  typeCheck('image::NonEmptyString', image);

  state.set(['pageMetadata'], pageMetadata);
}
