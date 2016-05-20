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
}(this, function() {
  'use strict';

  // non-primitive arguments will be made serializable by assigning them
  // a unique auto-incrementing identifier
  var _idMap = new WeakMap();
  var _id = { id: 0 };

  return function memoize(fn, options) {
    var useOneObjArg = options && !!options.useOneObjArg;
    var useNamedArgs = options && !!options.useNamedArgs;
    var cache = options && options.cache || ( useOneObjArg ?
      // When using a single non-primitive argument, results will be cached
      // in a simple WeakMap
      new WeakMap() :
      new Map()
    );
    var displayNameSuffix = options && 'displayNameSuffix' in options ?
      options.displayNameSuffix :
      'Memoized';

    // The following two options only help with testing
    var idMap = options && options._idMap || _idMap;
    var id = options && options._id || _id;

    var memoized;

    // fast path for single non-primitive arguments
    if ( useOneObjArg ) {
      memoized = function(args) {
        if ( !cache.has(args) ) {
          var result = fn.call(this, args);
          cache.set( args, result );
          return result;
        }
        return cache.get(args);
      }
    }

    // useNamedArgs path doesn't access the arguments object, which allows v8
    // to optimize it
    else if ( useNamedArgs ) {
      memoized = function(args) {
        // when using named args, they need to be sorted alphabetically to
        // make sure we build the cache key the same way every time.
        var argNames = Object.keys(args).sort();
        var length = argNames.length;
        var aKey = [];
        for ( var i = 0; i < length; i++ ) {
          var arg = args[argNames[i]];
          var argType = typeof arg;

          // if the argument is not a primitive, get a unique (memoized?) id for it
          if (
            // typeof null is "object", although we'll consider it as a primitive
            arg !== null &&
            ( argType === 'object' || argType === 'function' || argType === 'symbol' )
          ) {
            if ( !idMap.has(arg) ) {
              idMap.set(arg, id.id++);
            }
            aKey.push( argNames[i] + ':' + idMap.get(arg) );

          // otherwise, add the argument and its type to the aKey
          } else {
            aKey.push( argNames[i] + ':' + ( arg == null ?
              '' + arg :
              argType + '(' + arg + ')'
            ));
          }
        }

        // concatenate serialized arguments using a complex separator
        // (to avoid key collisions)
        var sKey = aKey.join('/<[MI_SEP]>/');

        if ( !cache.has(sKey) ) {
          var result = fn.call(this, args);
          cache.set( sKey, result );
          return result;
        }

        return cache.get( sKey );
      };
    }

    // default path
    else {
      memoized = function() {
        var length = arguments.length;
        var aKey = [];
        for ( var i = 0; i < length; i++ ) {
          var arg = arguments[i];
          var argType = typeof arg;

          // if the argument is not a primitive, get a unique (memoized?) id for it
          if (
            // typeof null is "object", although we'll consider it as a primitive
            arg !== null &&
            ( argType === 'object' || argType === 'function' || argType === 'symbol' )
          ) {
            if ( !idMap.has(arg) ) {
              idMap.set(arg, id.id++);
            }
            aKey.push( idMap.get(arg) );

          // otherwise, add the argument and its type to the aKey
          } else {
            aKey.push( arg == null ?
              '' + arg :
              argType + '(' + arg + ')'
            );
          }
        }

        // concatenate serialized arguments using a complex separator
        // (to avoid key collisions)
        var sKey = aKey.join('/<[MI_SEP]>/');

        if ( !cache.has(sKey) ) {
          var result = fn.apply(this, arguments);
          cache.set( sKey, result );
          return result;
        }

        return cache.get( sKey );
      };
    }

    // Give a meaningful displayName to the memoized function
    if ( fn.name ) {
      memoized.displayName = fn.name + displayNameSuffix;
    }

    return memoized;
  };
}));
