// Usage: node --allow-natives-syntax test-is-optimized.js

'use strict';

const chalk = require('chalk');
const TupleMap = require('tuplemap');
const WeakTupleMap = require('weaktuplemap');
const MixedTupleMap = require('mixedtuplemap');
const NamedTupleMap = require('namedtuplemap');
const LRUMap = require('lrumap');

const memoize = require('../dist/index');

let finalExitCode = 0;

function foo () {
  return 42;
}

function unoptimizable () {
  try {
    return 33;
  } catch (e) {
    return e;
  }
}

check('memoize', function() { memoize(function () {}) }, true);
check('add', foo, true);
check('unoptimizable', unoptimizable, false);
// All following tests are repeated twice, because V8 doesn't really optimize before second time
check('memoized with TupleMap cache', memoize(foo, { cache: new TupleMap() }), false);
check('memoized with TupleMap cache', memoize(foo, { cache: new TupleMap() }), true);
check('memoized with WeakTupleMap cache', memoize(foo, { cache: new WeakTupleMap() }), true);
check('memoized with WeakTupleMap cache', memoize(foo, { cache: new WeakTupleMap() }), true);
check('memoized with MixedTupleMap cache', memoize(foo, { cache: new MixedTupleMap() }), false);
check('memoized with MixedTupleMap cache', memoize(foo, { cache: new MixedTupleMap() }), true);
check('memoized with NamedTupleMap cache', memoize(foo, { cache: new NamedTupleMap() }), true);
check('memoized with NamedTupleMap cache', memoize(foo, { cache: new NamedTupleMap() }), true);
check('memoized with Map cache', memoize(foo, { cache: new Map() }), true);
check('memoized with Map cache', memoize(foo, { cache: new Map() }), true);
check('memoized with WeakMap cache', memoize(foo, { cache: new WeakMap() }), true);
check('memoized with WeakMap cache', memoize(foo, { cache: new WeakMap() }), true);
check('memoized with LRUMap cache', memoize(foo, { cache: new LRUMap() }), true);
check('memoized with LRUMap cache', memoize(foo, { cache: new LRUMap() }), true);

process.exit(finalExitCode);


function printStatus(fn) {
  switch(%GetOptimizationStatus(fn)) {
    case 1: return chalk.green("Function is optimized"); break;
    case 2: return chalk.red("Function is not optimized"); break;
    case 3: return chalk.green("Function is always optimized"); break;
    case 4: return chalk.red("Function is never optimized"); break;
    case 6: return chalk.cyan("Function is maybe deoptimized"); break;
    case 7: return chalk.green("Function is optimized by TurboFan"); break;
    default: return chalk.cyan("Unknown optimization status"); break;
  }
}

function check(label, fn, expectOptimized) {
  // Run function once
  fn({a: 1, b: {b: 2}}, {c: 3});

  // Tag function for optimization
  %OptimizeFunctionOnNextCall(fn);

  // Another call is needed to go from uninitialized -> pre-monomorphic -> monomorphic
  fn({a: 1, b: {b: 2}}, {c: 3});

  // Check/verify it (of not have code that cant be optimised)
  const status = printStatus(fn);
  if (typeof expectOptimized === 'boolean' && expectOptimized !== !!status.match(/is (always )?optimized/)) {
    finalExitCode = 1;
  }
  console.log(chalk.bold(label) + ': ' + status);
}
