/* An efficient memoizer for functions that only receive immutable arguments.
 * Ideal with Redux and similar environments.
 */

if ( typeof WeakMap === 'undefined' || typeof Map === 'undefined' ) {
  throw new Error('This lib requires an implementation of WeakMap and Map');
}

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.returnExports = factory();
  }
}(this, function () {

  var _idMap = new WeakMap();
  var _id = { id: 0 };
  // the last two arguments help with testing
  return function memoize(fn, cache, idMap, id) {
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

}));
