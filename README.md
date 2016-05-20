# Memoize Immutable [![npm version](https://badge.fury.io/js/memoize-immutable.svg)](https://badge.fury.io/js/memoize-immutable) [![Build Status](https://travis-ci.org/louisremi/memoize-immutable.svg?branch=master)](https://travis-ci.org/louisremi/memoize-immutable) [![Dependency Status](https://david-dm.org/louisremi/memoize-immutable.svg)](https://david-dm.org/louisremi/memoize-immutable)

An efficient memoizer for functions that only receive immutable arguments. Ideal for Redux and similar environments.

Dependency free! But requires global `WeakMap` and `Map` constructors
(which have [good browser support](https://kangax.github.io/compat-table/es6/#test-Map)
and [decent polyfills](https://github.com/WebReflection/es6-collections)).

## How is it different from other memoizers?

In order to index cached results, most memoizers serialize arguments using `JSON.stringify` or similar methods.
When working with immutable data, serializing the reference of non-primitive arguments is sufficient and much more efficient.
This memoizer uses a WeakMap and an auto-incrementing id to materialize the reference of non-primitive arguments.
Read [the blog post](https://blog.prototypo.io/memoize-immutable-efficient-memoizer-for-redux-and-other-immutable-environments-59277fefa45f) to learn more about the advantages of this module.

## Install

    npm install --save memoize-immutable

## API

    memoize( fn [, options ] )

- `fn`: the function to memoize
- `options` (optionnal):
  - `cache`: a cache instance implementing `.has`, `.get` and `.set` methods (defaults to a native Map)
  - `useNamedArgs`: set this to `true` when the memoized function only receives named arguments wrapped in a single object,
    instead of a list of arguments,
  - `useOneObjArg`: set this to `true` when the memoized function only receives one non-primitive argument
    (uses a single WeakMap for efficient caching),
  - `displayNameSuffix`: the display name of the returned function will be set to
    the name of the original function + this suffix (defaults to `'Memoized'`).

`return`s a memoized function.

#### Performance tip

Adapting your code to enable `useNamedArgs` or `useOneObjArg` options allows V8 to optimize the original function.

#### Limiting the size of the cache

There are many strategies to limit the size of the cache.
You can pass a simple LRU cache [such as this one](https://gist.github.com/louisremi/ed1f8357642be8ecc4a88a78e4fd9870) with `options.cache`,
or even clear the cache completely every X minutes.

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

## license

[MIT](http://louisremi.mit-license.org/)

## Authors

Original problem by [@louis_remi](https://twitter.com/louis_remi),
original solution by [@LasseFister](https://twitter.com/lassefister),
original implementation by [@louis_remi](https://twitter.com/louis_remi).
