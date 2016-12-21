'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _tuplemap = require('tuplemap');

var _tuplemap2 = _interopRequireDefault(_tuplemap);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (typeof WeakMap === 'undefined' || typeof Map === 'undefined') {
  throw new Error('This lib requires an implementation of WeakMap and Map');
} /* An efficient memoizer for functions that only receive immutable arguments.
   * Ideal with Redux and similar environments.
   */


function memoize(fn, options) {
  var cache = options && options.cache || new _tuplemap2.default(options);

  var memoized = void 0;

  // Memoizer for functions that accept a single argument
  if (/^\[object (Weak|LRU|NamedTuple)?Map\]$/.test(cache.toString())) {
    memoized = function memoized(arg) {
      if (!cache.has(arg)) {
        var result = fn.call(this, arg);
        cache.set(arg, result);
        return result;
      }
      return cache.get(arg);
    };
  }

  // Memoizer for functions that accept multiple arguments
  else {
      memoized = function memoized() {
        if (!cache.has(arguments)) {
          var result = fn.apply(this, arguments);
          cache.set(arguments, result);
          return result;
        }
        return cache.get(arguments);
      };
    }

  // Give a meaningful displayName to the memoized function
  if (fn.name) {
    memoized.displayName = fn.name + 'Memoized';
  }

  return memoized;
}

exports.default = memoize;
module.exports = exports['default'];

//# sourceMappingURL=index.js.map