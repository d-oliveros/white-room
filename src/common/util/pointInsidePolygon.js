/**
 * Checks if a point [x, y] is inside a polygon [[x1, y1], [x2, y2], ...].
 *
 * Ray-casting algorithm based on
 * http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
 *
 * @param  {Array} point   The point to check: [longitude, latitude].
 * @param  {Array} polygon The polygon to check.
 * @return {boolean}       `true` if the point is inside the polygon.
 */
export default function pointInsidePolygon(point, polygon) {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) { // eslint-disable-line no-plusplus
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}
