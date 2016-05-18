// Usage: node --allow-natives-syntax test-is-optimized.js

const memoize = require('./');
const chalk = require('chalk');

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

function memoizedCall () {
  return memoize.__call__(foo, new Map, new WeakMap, {id: 0}, []);
}



check('memoize', function () { memoize(function () {}) }, true);
check('memoized.__call__', memoizedCall, true);
check('add', foo, true);
check('unoptimizable', unoptimizable, false);
check('memoized(add)', memoize(foo), true);

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

function check (label, fn, expectOptimized) {
  // Run function once
  fn();

  // Tag function for optimization
  %OptimizeFunctionOnNextCall(fn);

  // 2 calls are needed to go from uninitialized -> pre-monomorphic -> monomorphic
  fn();

  // Check/verify it (of not have code that cant be optimised)
  const status = printStatus(fn);
  if (typeof expectOptimized === 'boolean' && expectOptimized !== !!status.match(/is (always )?optimized/)) {
    finalExitCode = 1;
  }
  console.log(chalk.bold(label) + ': ' + status);
}
