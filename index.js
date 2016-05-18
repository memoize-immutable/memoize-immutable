/* An efficient memoizer for functions that only receive immutable arguments.
 * Ideal with Redux and similar environments.
 */

if ( typeof WeakMap === 'undefined' || typeof Map === 'undefined' ) {
  throw new Error('This lib requires an implementation of WeakMap and Map');
}

if (typeof exports === 'object' && typeof exports.nodeName !== 'string' && typeof define !== 'function') {
  var define = function (factory) {
    factory(require, exports, module);
  };
}

define(function (require, exports, module) {

  var _idMap = new WeakMap();
  var _id = { id: 0 };
  // the last two arguments help with testing
  module.exports = function memoize(fn, cache, idMap, id) {
    if ( !cache ) {
      cache = new Map();
    }
    if ( !idMap ) {
      idMap = _idMap;
    }
    if ( !id ) {
      id = _id;
    }

    return function() {
      var aKey = [];
      for ( var i = 0; i < arguments.length; i++ ) {
        var argType = typeof arguments[i];

        // if the argument is not a primitive, get a unique (memoized?) id for it
        if (
          // typeof null is "object", although we'll consider it as a primitive
          arguments[i] !== null &&
          ( argType === 'object' || argType === 'function' || argType === 'symbol' )
        ) {
          if ( !idMap.has(arguments[i]) ) {
            idMap.set(arguments[i], id.id++);
          }
          aKey.push( idMap.get(arguments[i]) );

        // otherwise, add the argument and its type to the aKey
        } else {
          aKey.push( arguments[i] == null ?
            '' + arguments[i] :
            argType + '(' + arguments[i] + ')'
          );
        }
      }

      var sKey = aKey.join('_///_');

      if ( !cache.has(sKey) ) {
        var result = fn.apply(this, arguments);
        cache.set( sKey, result );
        return result;
      }

      return cache.get( sKey );
    };
  };
});
