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
})(this, function () {

  var _idMap = new WeakMap();
  var _id = { id: 0 };

  // exported for tests
  memoize.__call__ = memoizedCall;

  // Export shortcut to "unoptimized" version
  memoize.unoptimized = function memoizedUnoptimized (fn, cache, idMap, id) {
    return memoize(fn, cache, idMap, id, true);
  };

  return memoize;

  // the last two arguments help with testing
  function memoize(fn, cache, idMap, id, unoptimized) {
    if ( !cache ) {
      cache = new Map();
    }
    if ( !idMap ) {
      idMap = _idMap;
    }
    if ( !id ) {
      id = _id;
    }

    if (unoptimized) {
      // Allow dynamic list of arguments, but lose V8 optimizations
      return function(/* ...args */) {
        return memoizedCall(fn, cache, idMap, id, arguments);
      };
    } else {
      // Fixed number of arguments, based on fn's signature
      let args = '';
      for (let i = 0; i < fn.length; i++) {
        args += 'a' + i;
        if (i < fn.length - 1) {
          args += ',';
        }
      }
      const builder = new Function(
        'call,fn,cache,idMap,id',
        'return function ' + fn.name + ' (' + args + ') {' +
          'return call(fn, cache, idMap, id, [' + args + ']);' +
        '}'
      );
      return builder(memoizedCall, fn, cache, idMap, id);
    }
  }

  function memoizedCall (fn, cache, idMap, id, args) {
    var aKey = [];
    for ( var i = 0; i < args.length; i++ ) {
      var argType = typeof args[i];

      // if the argument is not a primitive, get a unique (memoized?) id for it
      if (
        // typeof null is "object", although we'll consider it as a primitive
        args[i] !== null &&
        ( argType === 'object' || argType === 'function' || argType === 'symbol' )
      ) {
        if ( !idMap.has(args[i]) ) {
          idMap.set(args[i], id.id++);
        }
        aKey.push( idMap.get(args[i]) );

      // otherwise, add the argument and its type to the aKey
      } else {
        aKey.push( args[i] == null ?
          '' + args[i] :
          argType + '(' + args[i] + ')'
        );
      }
    }

    var sKey = aKey.join('_///_');

    if ( !cache.has(sKey) ) {
      var result = fn.apply(this, args);
      cache.set( sKey, result );
      return result;
    }

    return cache.get( sKey );
  }
})
