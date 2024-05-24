export default function scrollToDomClass(className, headerOffset) {
  if (!global.document || !global.document.querySelectorAll || !global.scrollTo) {
    return;
  }
  headerOffset = typeof headerOffset === 'number' ? headerOffset : 0;
  const el = global.document.querySelectorAll(`.${className}`)[0];
  if (el) {
    const elPos = el.getBoundingClientRect().top;
    const offsetPos = elPos + global.pageYOffset - headerOffset;

    global.scrollTo({
      top: offsetPos,
      behavior: 'smooth',
    });
  }
}
