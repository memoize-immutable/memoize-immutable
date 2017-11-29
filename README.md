# Memoize Immutable [![npm version](https://badge.fury.io/js/memoize-immutable.svg)](https://badge.fury.io/js/memoize-immutable) [![Build Status](https://travis-ci.org/memoize-immutable/memoize-immutable.svg?branch=master)](https://travis-ci.org/memoize-immutable/memoize-immutable) [![Dependency Status](https://david-dm.org/memoize-immutable/memoize-immutable.svg)](https://david-dm.org/memoize-immutable/memoize-immutable) [![Coverage Status](https://coveralls.io/repos/github/memoize-immutable/memoize-immutable/badge.svg?branch=master)](https://coveralls.io/github/memoize-immutable/memoize-immutable?branch=master)

An efficient memoizer for functions that only receive immutable arguments. Ideal for Redux and similar environments, works with [Immutable.js](https://facebook.github.io/immutable-js/) values.

This lib is only compatible with browsers and environments that implement `WeakMap` and `Map` natively (see [compatibility table](https://kangax.github.io/compat-table/es6/#test-WeakMap)).

## How is it different from other memoizers?

In order to index cached results, most memoizers serialize arguments using `JSON.stringify` or similar methods.
When working with immutable data, using a WeakMap based cache is much more CPU and memory efficient.
This memoizer is designed to work with such caches.

## Install

    npm install --save memoize-immutable

Optionally, you can install alternative caches to be used with this memoizer:

    npm install --save namedtuplemap weaktuplemap mixedtuplemap lrumap

## API

    memoize( fn [, options ] )

- `fn`: the function to memoize
- `options` (optional):
  - `cache`: a cache **instance** implementing `.has`, `.get` and `.set` methods (defaults to TupleMap)
  - `limit`: limit the size of the default cache (incompatible with `cache` option)

`return`s a memoized function.
Note: the `.displayName` of the returned function will be `'<original name>Memoized'`.

## Usage

```javascript
var memoize = require('memoize-immutable');

var nbExecs = 0;
var arraySum = function(arr) {
  nbExecs++;
  return arr.reduce(function(acc, curr) {
    return acc + curr;
  }, 0);
};
var arraySumMemoized = memoize(arraySum);


var arr1 = [ 1, 2, 3, 4, 5, 6 ];
var copy = arr1;

expect(arraySumMemoized(arr1)).to.equal(21);
expect(nbExecs).to.equal(1);

expect(arraySumMemoized(copy)).to.equal(21);
expect(nbExecs).to.equal(1);

// Of course, you shouldn't mutate the arguments, or else...
arr1.push(7);
expect(arraySumMemoized(arr1)).to.equal(21);
expect(nbExecs).to.equal(1);

var clone = arr1.concat();
expect(arraySumMemoized(clone)).to.equal(28);
expect(nbExecs).to.equal(2);
```

## Choosing a cache store

NB: When in doubt, don't use an optional cache.

The following instructions will help choose optimal cache store for a given function. Before you proceed, make sure you know the definition of the following terms:
- *primitive*: Any `number`, `string`, `boolean`, `undefined` or `null` value is considered primitive.
- *non-primitive*: An `object`, `array` or `function` value is non-primitive.
- *named arguments*:

    Here is a function that doesn't accept named arguments:
    
    ```js
    drawRect(20, 50, 100, 150, '#000');
    ```
    
    and the same function, accepting named arguments:
    
    ```js
    drawRect({x: 20, y: 50, width: 100, height: 150, color: '#000'});
    ```
    
    which is expected to have the exact same result as:
    
    ```js
    drawRect({color: '#000', width: 100, height: 150, x: 20, y: 50});
    ```

1. The function accepts a single argument (**not named argument**, see below)
    1. The function accepts a single non-primitive argument.
        → use a native [WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap).
    2. The function accepts a single primitive argument.
        → use the [LRUMap](https://github.com/memoize-immutable/LRUMap) (or a native [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) if its size isn't a problem).
2. The function accepts multiple arguments, but the number of arguments never changes
    1. The function accepts primitive arguments, **always mixed with at least one non-primitive argument**
        → use the [MixedTupleMap](https://github.com/memoize-immutable/MixedTupleMap).
    2. The function only accepts non-primitive arguments.
        → use the [WeakTupleMap](https://github.com/memoize-immutable/WeakTupleMap).
3. The function accepts a single object of named arguments
    → use the [NamedTupleMap](https://github.com/memoize-immutable/NamedTupleMap).
4. **In any other case**
    → use the default [TupleMap](https://github.com/memoize-immutable/TupleMap).

## License

MPL-2.0

## Author

[@louis_remi](https://twitter.com/louis_remi)
