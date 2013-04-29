var toString = Object.prototype.toString;

module.exports.isString = function (obj) {
    return toString.call(obj) == '[object String]';
}
