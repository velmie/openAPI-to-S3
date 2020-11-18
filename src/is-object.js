function isObject(variable) {
  return typeof variable === 'object' && variable !== null;
}

module.exports = isObject;
