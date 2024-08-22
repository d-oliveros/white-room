const encodeURIComponentIfPresent = (value) => value && encodeURIComponent
  ? encodeURIComponent(value)
  : '';

export default encodeURIComponentIfPresent;
