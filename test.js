var expect = require('chai').expect;

var memoize = require('./index');

describe('memoize', function() {
  var cache1;
  var cache2;
  var idMap;
  var id;
  var limit = 10;

  beforeEach(function() {
    cache1 = new Map();
    cache2 = new Map();
    idMap = new Map();
    id = { id: 0 };
  });

  it('should memoize a result when called with 0 args', function(done) {
    var nbExecs = 0;
    var fn = function() {
      return ++nbExecs;
    };
    var memoizedFn = memoize(fn, limit, cache1, cache2, idMap, id);

    // first execution with empty cache1
    expect(memoizedFn()).to.equal(1);
    expect(nbExecs).to.equal(1);
    expect(cache1.size).to.equal(1);
    expect(cache1.get('')).to.equal(1);
    expect(idMap.size).to.equal(0);

    // second execution
    expect(memoizedFn()).to.equal(1);
    expect(nbExecs).to.equal(1);
    expect(cache1.size).to.equal(1);
    expect(cache1.get('')).to.equal(1);
    expect(idMap.size).to.equal(0);

    done();
  });

  it('should memoize a result when called with 1 primitive arg', function(done) {
    var nbExecs = 0;
    var fn = function() {
      return ++nbExecs;
    };
    var memoizedFn = memoize(fn, limit, cache1, cache2, idMap, id);
    var arg1 = 12;

    // first execution with empty cache1
    expect(memoizedFn(arg1)).to.equal(1);
    expect(nbExecs).to.equal(1);
    expect(cache1.size).to.equal(1);
    expect(cache1.get('number(12)')).to.equal(1);
    expect(idMap.size).to.equal(0);

    // second execution
    expect(memoizedFn(arg1)).to.equal(1);
    expect(nbExecs).to.equal(1);
    expect(cache1.size).to.equal(1);
    expect(cache1.get('number(12)')).to.equal(1);
    expect(idMap.size).to.equal(0);

    done();
  });

  it('should memoize a result when called with 1 non-primitive arg', function(done) {
    var nbExecs = 0;
    var fn = function() {
      return ++nbExecs;
    };
    var memoizedFn = memoize(fn, limit, cache1, cache2, idMap, id);
    var arg1 = {};

    // first execution with empty cache1
    expect(memoizedFn(arg1)).to.equal(1);
    expect(nbExecs).to.equal(1);
    expect(cache1.size).to.equal(1);
    expect(cache1.get('0')).to.equal(1)
    expect(idMap.size).to.equal(1);

    // second execution
    expect(memoizedFn(arg1)).to.equal(1);
    expect(nbExecs).to.equal(1);
    expect(cache1.size).to.equal(1);
    expect(cache1.get('0')).to.equal(1)
    expect(idMap.size).to.equal(1);

    done();
  });

  it('should memoize a result when called with mixed primitive and non-primitive args', function(done) {
    var nbExecs = 0;
    var fn = function() {
      return ++nbExecs;
    };
    var memoizedFn = memoize(fn, limit, cache1, cache2, idMap, id);
    var arg1 = {a:'b'};
    var arg2 = 'string';
    var arg3 = [1,2];
    var arg4 = function() {};
    var arg5 = 12;
    var arg6 = null;
    var arg7 = false;
    var arg8 = undefined;

    // first execution with empty cache1
    expect(memoizedFn(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8)).to.equal(1);
    expect(nbExecs).to.equal(1);
    expect(cache1.size).to.equal(1);
    expect(cache1.get('0_///_string(string)_///_1_///_2_///_number(12)_///_null_///_boolean(false)_///_undefined'))
      .to.equal(1);
    expect(idMap.size).to.equal(3);

    // second execution
    expect(memoizedFn(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8)).to.equal(1);
    expect(nbExecs).to.equal(1);
    expect(cache1.size).to.equal(1);
    expect(cache1.get('0_///_string(string)_///_1_///_2_///_number(12)_///_null_///_boolean(false)_///_undefined'))
      .to.equal(1);
    expect(idMap.size).to.equal(3);

    done();
  });

  it('should limit the size of the cache', function(done) {
    // ...and swap between two caches every time the limit is reached

    var nbExecs = 0;
    var fn = function(n) {
      ++nbExecs;
      return n * n;
    };
    var memoizedFn = memoize(fn, limit, cache1, cache2, idMap, id);

    var i;

    for ( i = 0; i < 10; i++ ) {
      memoizedFn(i);
    }
    expect(cache1.size).to.equal(10);
    expect(cache2.size).to.equal(1);

    memoizedFn(10);

    expect(cache1.size).to.equal(0);
    expect(cache2.size).to.equal(2);

    for ( i = 11; i < 19; i++ ) {
      memoizedFn(i);
    }

    expect(cache1.size).to.equal(1);
    expect(cache2.size).to.equal(10);

    memoizedFn(19);

    expect(cache1.size).to.equal(2);
    expect(cache2.size).to.equal(0);

    done();
  });
});
