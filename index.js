/* An efficient memoizer for functions that only receive immutable arguments.
 * Ideal with Redux and similar environments.
 */
import TupleMap from 'tuplemap';

if ( typeof WeakMap === 'undefined' || typeof Map === 'undefined' ) {
  throw new Error('This lib requires an implementation of WeakMap and Map');
}

function memoize(fn, options) {
  const cache = options && options.cache || new TupleMap( options );

  let memoized;

  // Memoizer for functions that accept a single argument
  if ( /^\[object (Weak|LRU|NamedTuple)?Map\]$/.test(cache.toString()) ) {
    memoized = function( arg ) {
      if ( !cache.has(arg) ) {
        const result = fn.call(this, arg);
        cache.set( arg, result );
        return result;
      }
      return cache.get(arg);
    }
  }

  // Memoizer for functions that accept multiple arguments
  else {
    memoized = function() {
      if ( !cache.has( arguments ) ) {
        const result = fn.apply(this, arguments);
        cache.set( arguments, result );
        return result;
      }
      return cache.get(arguments);
    }
  }

  // Give a meaningful displayName to the memoized function
  if ( fn.name ) {
    memoized.displayName = fn.name + 'Memoized';
  }

  return memoized;
}

export default memoize;
