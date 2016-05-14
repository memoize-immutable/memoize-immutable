# Memoize Immutable

An efficient function memoizer that uses strict-equality for argument comparison. Ideal with Redux and other immutable environments.

## How is it different from other memoizers?

This memoizer compares arguments by strict-equality,
which means non-primitive arguments (such as objects) are compared by reference.
Most memoizers out-there compare arguments by deep-equality, which requires serializing all arguments,
and is very inefficient when working with Redux and other immutable environments.

## Install

  npm install --save memoize-immutable

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
