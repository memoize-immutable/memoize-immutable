import memoize from '../index.js';

describe('memoize', function() {
  let nbExecs = 0;
  const fn = function() {
    return ++nbExecs;
  };
  const options = {};
  let cache;

  beforeEach(function() {
    nbExecs = 0;
    options.cache = ( cache = new Map() );
  });

  it('should memoize a result when called with 0 args', function(done) {
    const memoizedFn = memoize(fn, options);

    // first execution with empty cache
    expect(memoizedFn()).toEqual(1);
    expect(nbExecs).toEqual(1);
    expect(cache.size).toEqual(1);
    expect(cache.get()).toEqual(1);

    // second execution
    expect(memoizedFn()).toEqual(1);
    expect(nbExecs).toEqual(1);
    expect(cache.size).toEqual(1);
    expect(cache.get()).toEqual(1);

    done();
  });

  it('should memoize a result when called with 1 primitive arg', function(done) {
    const memoizedFn = memoize(fn, options);
    var arg1 = 12;

    // first execution with empty cache
    expect(memoizedFn(arg1)).toEqual(1);
    expect(nbExecs).toEqual(1);
    expect(cache.size).toEqual(1);
    expect(cache.get(12)).toEqual(1);

    // second execution
    expect(memoizedFn(arg1)).toEqual(1);
    expect(nbExecs).toEqual(1);
    expect(cache.size).toEqual(1);
    expect(cache.get(12)).toEqual(1);

    done();
  });

  it('should memoize a result when called with 1 non-primitive arg', function(done) {
    const memoizedFn = memoize(fn, options);
    var arg1 = {};

    // first execution with empty cache
    expect(memoizedFn(arg1)).toEqual(1);
    expect(nbExecs).toEqual(1);
    expect(cache.size).toEqual(1);
    expect(cache.get(arg1)).toEqual(1);

    // second execution
    expect(memoizedFn(arg1)).toEqual(1);
    expect(nbExecs).toEqual(1);
    expect(cache.size).toEqual(1);
    expect(cache.get(arg1)).toEqual(1);

    done();
  });

  it('should memoize a result when called with mixed primitive and non-primitive args', function(done) {
    const memoizedFn = memoize(fn);
    const arg1 = {a:'b'};
    const arg2 = 'string';
    const arg3 = [1,2];
    const arg4 = function() {};
    const arg5 = 12;
    const arg6 = null;
    const arg7 = false;
    const arg8 = undefined;

    // first execution with empty cache
    expect(memoizedFn(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8)).toEqual(1);
    expect(nbExecs).toEqual(1);

    // second execution
    expect(memoizedFn(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8)).toEqual(1);
    expect(nbExecs).toEqual(1);

    done();
  });

  // Note sure if these tests are still relevant or if they should be moved to hashed caches
  // it('shouldn\'t produce cache collisions when using the normal cache', function(done) {
  //   var fn1 = function() {
  //     return 12;
  //   };
  //   var fn2 = function() {
  //     return 34;
  //   };
  //   var arg = { same: true };
  //
  //   expect(memoize(fn1)(arg)).toEqual(12);
  //   expect(memoize(fn2)(arg)).toEqual(34);
  //
  //   done();
  // });
  //
  // it('shouldn\'t produce cache collisions when using the quick cache', function(done) {
  //   var fn1 = function() {
  //     return 12;
  //   };
  //   var fn2 = function() {
  //     return 34;
  //   };
  //   var arg = { same: true };
  //   var options = {useOneObjArg: true};
  //
  //   expect(memoize(fn1, options)(arg)).toEqual(12);
  //   expect(memoize(fn2, options)(arg)).toEqual(34);
  //
  //   done();
  // });
  //
  // it('shouldn\'t produce cache collisions when using named arguments', function(done) {
  //   var nbExecs = 0;
  //   var sum = function(args) {
  //     nbExecs++;
  //     return Object.keys(args).reduce(function(acc, currName) {
  //       return acc + args[currName];
  //     }, 0);
  //   };
  //   options.useNamedArgs = true;
  //   var sumMemoized = memoize(sum, options);
  //
  //   expect(sumMemoized({a: 1, b: 2, c: 3})).toEqual(6);
  //   expect(cache.size).toEqual(1);
  //   expect(nbExecs).toEqual(1);
  //   expect(sumMemoized({d: 1, e: 2, f: 3})).toEqual(6);
  //   expect(cache.size).toEqual(2);
  //   expect(nbExecs).toEqual(2);
  //
  //   done();
  // });

  it('should set the displayName of the memoized function', function(done) {
    var sum = function sum() {};

    expect(memoize(sum).displayName)
      .toEqual('sumMemoized');

    done();
  });
});
