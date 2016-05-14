/* A function memoizer that compares arguments by reference.
 * Ideal with Redux and other immutable environments.
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
  // the last four arguments help with testing
  module.exports = function memoize(fn, limit, cache1, cache2, idMap, id) {
    if ( !limit ) {
      limit = 10000;
    }
    if ( !cache1 ) {
      cache1 = new Map();
    }
    if ( !cache2 ) {
      cache2 = new Map();
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

      if ( !cache1.has(sKey) ) {
        var result = fn.apply(this, arguments);
        cache1.set( sKey, result );
        // before the cache reaches it's max size, start filling a new cache
        if ( cache1.size > limit * 0.9 ) {
          cache2.set( sKey, result );
        }
        // when the cache reaches its maximum size, swap it with the newest and
        // clear it
        if ( cache1.size > limit ) {
          var tmp = cache1;
          cache1 = cache2;
          cache2 = tmp;
          cache2.clear();
        }
      }

      return cache1.get( sKey );
    };
  };
});
