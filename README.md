# Memoize Immutable

An efficient memoizer for functions that only receive immutable arguments. Ideal for Redux and similar environments.

Dependency free! But requires global `WeakMap` and `Map` constructors.

## How is it different from other memoizers?

In order to index cached results, most memoizers serialize arguments using `JSON.stringify` or similar methods.
When working with immutable data, serializing the reference of non-primitive arguments is sufficient and much more efficient.
This memoizer uses a WeakMap and an auto-incrementing id to materialize the reference of non-primitive arguments.

## Install

    npm install --save memoize-immutable

## API

    `memoize( fn [, limit ] )`

- `fn`: the function to memoize
- `limit`: the maximum size of the cache (optional, defaults to 10000)

returns a memoized function

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

MIT

## Authors

Original problem by [@louis_remi](https://twitter.com/louis_remi),
original solution by [@LasseFister](https://twitter.com/lassefister),
original implementation by [@louis_remi](https://twitter.com/louis_remi).
