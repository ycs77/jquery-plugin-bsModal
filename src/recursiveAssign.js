/*!
 * recursive-object-assign
 * https://github.com/gmasmejean/recursiveAssign
 */

export const assign = function (ref, key, value) {
  if (isPlainObject(value)) {
    if (!isPlainObject(ref[key])) {
      ref[key] = {};
    }
    mergeInObject(ref[key], value);
  } else {
    ref[key] = value;
  }
}

export const mergeInObject = function (dest, data) {
  Object.keys(data).forEach(key => {
    assign(dest, key, data[key]);
  });
}

export const isPlainObject = function (o) {
  return o !== undefined && o !== null && o.constructor !== undefined && o.constructor.prototype === Object.prototype;
}

export default function (object, ...toassign) {
  if (typeof object === 'object') {
    toassign.forEach(data => {
      if (isPlainObject(data)) {
        mergeInObject(object, data);
      }
    });
  }
  return object;
}
