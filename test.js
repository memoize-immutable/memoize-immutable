var expect = require('chai').expect;

var memoize = require('./index');

describe('memoize', function() {
  var options;
  var cache;
  var idMap;

  beforeEach(function() {
    options = {
      cache: ( cache = new Map() ),
      _idMap: ( idMap = new Map() ),
      _id: { id: 0 }
    };
  });

  it('should memoize a result when called with 0 args', function(done) {
    var nbExecs = 0;
    var fn = function() {
      return ++nbExecs;
    };
    var memoizedFn = memoize(fn, options);

    // first execution with empty cache
    expect(memoizedFn()).to.equal(1);
    expect(nbExecs).to.equal(1);
    expect(cache.size).to.equal(1);
    expect(cache.get('')).to.equal(1);
    expect(idMap.size).to.equal(0);

    // second execution
    expect(memoizedFn()).to.equal(1);
    expect(nbExecs).to.equal(1);
    expect(cache.size).to.equal(1);
    expect(cache.get('')).to.equal(1);
    expect(idMap.size).to.equal(0);

    done();
  });

  it('should memoize a result when called with 1 primitive arg', function(done) {
    var nbExecs = 0;
    var fn = function() {
      return ++nbExecs;
    };
    var memoizedFn = memoize(fn, options);
    var arg1 = 12;

    // first execution with empty cache
    expect(memoizedFn(arg1)).to.equal(1);
    expect(nbExecs).to.equal(1);
    expect(cache.size).to.equal(1);
    expect(cache.get('number(12)')).to.equal(1);
    expect(idMap.size).to.equal(0);

    // second execution
    expect(memoizedFn(arg1)).to.equal(1);
    expect(nbExecs).to.equal(1);
    expect(cache.size).to.equal(1);
    expect(cache.get('number(12)')).to.equal(1);
    expect(idMap.size).to.equal(0);

    done();
  });

  it('should memoize a result when called with 1 non-primitive arg', function(done) {
    var nbExecs = 0;
    var fn = function() {
      return ++nbExecs;
    };
    var memoizedFn = memoize(fn, options);
    var arg1 = {};

    // first execution with empty cache
    expect(memoizedFn(arg1)).to.equal(1);
    expect(nbExecs).to.equal(1);
    expect(cache.size).to.equal(1);
    expect(cache.get('0')).to.equal(1);
    expect(idMap.size).to.equal(1);

    // second execution
    expect(memoizedFn(arg1)).to.equal(1);
    expect(nbExecs).to.equal(1);
    expect(cache.size).to.equal(1);
    expect(cache.get('0')).to.equal(1);
    expect(idMap.size).to.equal(1);

    done();
  });

  it('should memoize a result in quickMap when useOneObjArg is true', function(done) {
    var nbExecs = 0;
    var fn = function() {
      return ++nbExecs;
    };
    options.useOneObjArg = true;
    var memoizedFn = memoize(fn, options);
    var arg1 = {};

    // first execution with empty cache
    expect(memoizedFn(arg1)).to.equal(1);
    expect(nbExecs).to.equal(1);
    expect(cache.size).to.equal(1);
    expect(cache.get(arg1)).to.equal(1);
    expect(idMap.size).to.equal(0);

    // second execution
    expect(memoizedFn(arg1)).to.equal(1);
    expect(nbExecs).to.equal(1);
    expect(cache.size).to.equal(1);
    expect(cache.get(arg1)).to.equal(1);
    expect(idMap.size).to.equal(0);

    done();
  });

  it('should memoize a result when called with mixed primitive and non-primitive args', function(done) {
    var nbExecs = 0;
    var fn = function() {
      return ++nbExecs;
    };
    var memoizedFn = memoize(fn, options);
    var arg1 = {a:'b'};
    var arg2 = 'string';
    var arg3 = [1,2];
    var arg4 = function() {};
    var arg5 = 12;
    var arg6 = null;
    var arg7 = false;
    var arg8 = undefined;

    // first execution with empty cache
    expect(memoizedFn(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8)).to.equal(1);
    expect(nbExecs).to.equal(1);
    expect(cache.size).to.equal(1);
    expect(cache.get('0/<[MI_SEP]>/string(string)/<[MI_SEP]>/1/<[MI_SEP]>/2/<[MI_SEP]>/number(12)/<[MI_SEP]>/null/<[MI_SEP]>/boolean(false)/<[MI_SEP]>/undefined'))
      .to.equal(1);
    expect(idMap.size).to.equal(3);

    // second execution
    expect(memoizedFn(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8)).to.equal(1);
    expect(nbExecs).to.equal(1);
    expect(cache.size).to.equal(1);
    expect(cache.get('0/<[MI_SEP]>/string(string)/<[MI_SEP]>/1/<[MI_SEP]>/2/<[MI_SEP]>/number(12)/<[MI_SEP]>/null/<[MI_SEP]>/boolean(false)/<[MI_SEP]>/undefined'))
      .to.equal(1);
    expect(idMap.size).to.equal(3);

    done();
  });

  it('should unwrap and sort named arguments before memoizing the result when using useNamedArgs option', function(done) {
    var nbExecs = 0;
    var fn = function() {
      return ++nbExecs;
    };
    options.useNamedArgs = true;
    var memoizedFn = memoize(fn, options);
    var arg1 = {a:'b'};
    var arg2 = 'string';
    var arg3 = [1,2];
    var arg4 = function() {};
    var arg5 = 12;
    var arg6 = null;
    var arg7 = false;
    var arg8 = undefined;

    // first execution with empty cache
    expect(memoizedFn({
      arg3: arg3,
      arg1: arg1,
      arg2: arg2,
      arg6: arg6,
      arg4: arg4,
      arg8: arg8,
      arg5: arg5,
      arg7: arg7
    })).to.equal(1);
    expect(nbExecs).to.equal(1);
    expect(cache.size).to.equal(1);
    expect(idMap.size).to.equal(3);

    // second execution
    expect(memoizedFn({
      arg7: arg7,
      arg2: arg2,
      arg6: arg6,
      arg3: arg3,
      arg1: arg1,
      arg4: arg4,
      arg5: arg5,
      arg8: arg8
    })).to.equal(1);
    expect(nbExecs).to.equal(1);
    expect(cache.size).to.equal(1);
    expect(idMap.size).to.equal(3);

    done();
  });

  it('shouldn\'t produce cache collisions when using the normal cache', function(done) {
    var fn1 = function() {
      return 12;
    };
    var fn2 = function() {
      return 34;
    };
    var arg = { same: true };

    expect(memoize(fn1)(arg)).to.equal(12);
    expect(memoize(fn2)(arg)).to.equal(34);

    done();
  });

  it('shouldn\'t produce cache collisions when using the quick cache', function(done) {
    var fn1 = function() {
      return 12;
    };
    var fn2 = function() {
      return 34;
    };
    var arg = { same: true };
    var options = {useOneObjArg: true};

    expect(memoize(fn1, options)(arg)).to.equal(12);
    expect(memoize(fn2, options)(arg)).to.equal(34);

    done();
  });

  it('shouldn\'t produce cache collisions when using named arguments', function(done) {
    var nbExecs = 0;
    var sum = function(args) {
      nbExecs++;
      return Object.keys(args).reduce(function(acc, currName) {
        return acc + args[currName];
      }, 0);
    };
    options.useNamedArgs = true;
    var sumMemoized = memoize(sum, options);

    expect(sumMemoized({a: 1, b: 2, c: 3})).to.equal(6);
    expect(cache.size).to.equal(1);
    expect(nbExecs).to.equal(1);
    expect(sumMemoized({d: 1, e: 2, f: 3})).to.equal(6);
    expect(cache.size).to.equal(2);
    expect(nbExecs).to.equal(2);

    done();
  });

  it('should set the displayName of the memoized function', function(done) {
    var sum = function sum() {};

    expect(memoize(sum).displayName)
      .to.equal('sumMemoized');
    expect(memoize(sum, {displayNameSuffix: 'Zob'}).displayName)
      .to.equal('sumZob');
    expect(memoize(sum, {displayNameSuffix: ''}).displayName)
      .to.equal('sum');

    done();
  });
});
