var expect = require('chai').expect;

var memoize = require('./index');

describe('memoize', function() {
  var cache;
  var idMap;
  var id;

  beforeEach(function() {
    cache = new Map();
    idMap = new Map();
    id = { id: 0 };
  });

  it('should memoize a result when called with 0 args', function(done) {
    var nbExecs = 0;
    var fn = function() {
      return ++nbExecs;
    };
    var memoizedFn = memoize(fn, cache, idMap, id);

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
    var arg1 = 12;
    var fn = function(arg) {
      expect(arg).to.equal(arg1);
      return ++nbExecs;
    };
    var memoizedFn = memoize(fn, cache, idMap, id);

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
    var arg1 = {};
    var fn = function(arg) {
      expect(arg).to.equal(arg1);
      return ++nbExecs;
    };
    var memoizedFn = memoize(fn, cache, idMap, id);

    // first execution with empty cache
    expect(memoizedFn(arg1)).to.equal(1);
    expect(nbExecs).to.equal(1);
    expect(cache.size).to.equal(1);
    expect(cache.get('0')).to.equal(1)
    expect(idMap.size).to.equal(1);

    // second execution
    expect(memoizedFn(arg1)).to.equal(1);
    expect(nbExecs).to.equal(1);
    expect(cache.size).to.equal(1);
    expect(cache.get('0')).to.equal(1)
    expect(idMap.size).to.equal(1);

    done();
  });

  it('should memoize a result when called with mixed primitive and non-primitive args', function(done) {
    var nbExecs = 0;
    var arg1 = {a:'b'};
    var arg2 = 'string';
    var arg3 = [1,2];
    var arg4 = function() {};
    var arg5 = 12;
    var arg6 = null;
    var arg7 = false;
    var arg8 = undefined;
    var fn = function(a, b, c, d, e, f, g, h) {
      expect(a).to.equal(arg1);
      expect(b).to.equal(arg2);
      expect(c).to.equal(arg3);
      expect(d).to.equal(arg4);
      expect(e).to.equal(arg5);
      expect(f).to.equal(arg6);
      expect(g).to.equal(arg7);
      expect(h).to.equal(arg8);
      return ++nbExecs;
    };
    var memoizedFn = memoize(fn, cache, idMap, id);

    // first execution with empty cache
    expect(memoizedFn(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8)).to.equal(1);
    expect(nbExecs).to.equal(1);
    expect(cache.size).to.equal(1);
    expect(cache.get('0_///_string(string)_///_1_///_2_///_number(12)_///_null_///_boolean(false)_///_undefined'))
      .to.equal(1);
    expect(idMap.size).to.equal(3);

    // second execution
    expect(memoizedFn(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8)).to.equal(1);
    expect(nbExecs).to.equal(1);
    expect(cache.size).to.equal(1);
    expect(cache.get('0_///_string(string)_///_1_///_2_///_number(12)_///_null_///_boolean(false)_///_undefined'))
      .to.equal(1);
    expect(idMap.size).to.equal(3);

    done();
  });

  it('should strip extra arguments unless unoptimized', function(done) {
    var arg1 = {a:'b'};
    var fn = function() {
      expect(arguments[0]).to.equal(arg1);
    };
    var memoizedFn = memoize(fn, cache, idMap, id);
    var memoizedFnUnoptimized = memoize.unoptimized(fn, cache, idMap, id);

    expect(function () { memoizedFn(arg1) }).to.throw('AssertionError');
    expect(function () { memoizedFnUnoptimized(arg1); }).to.not.throw();

    done();
  });
});
