import fs from 'fs';
import { argv } from 'yargs';
import { debug } from './debug';

interface Output {
  modules: Module[];
  summary: unknown;
}

interface Module {
  source: string;
  followable: boolean;
  coreModule: boolean;
  couldNotResolve: boolean;
  dependencyTypes: string[];
  dependencies: Dependency[];
}

interface Dependency {
  resolved: string;
  coreModule: boolean;
  followable: boolean;
  couldNotResolve: boolean;
  dependencyTypes: string[];
  module: string;
  moduleSystem: string;
  valid?: boolean;
  circular?: boolean;
}

async function readFromFile(path: string): Promise<Output> {
  const str = JSON.parse(await fs.promises.readFile(path, 'utf8'));
  return str as Output;
}

function walkDownward(
  modules: Module[],
  path: string,
  pred: (dep: Dependency) => boolean,
  callback: (dep: Dependency, mod: Module) => void
) {
  modules.some(mod => {
    if (mod.source !== path) {
      return false;
    }

    mod.dependencies.forEach(dep => {
      if (dep.circular || !pred(dep)) {
        return;
      }

      walkDownward(modules, dep.resolved, pred, callback);
      callback(dep, mod);
    });

    return true;
  });
}

function walkUpward(
  modules: Module[],
  path: string,
  pred: (dep: Dependency) => boolean,
  callback: (dep: Dependency, mod: Module) => void
) {
  modules.forEach(mod => {
    mod.dependencies.forEach(dep => {
      // if (dep.circular || !pred(dep)) {
      if (dep.circular || dep.resolved !== path) {
        return;
      }

      walkUpward(modules, mod.source, pred, callback);
      callback(dep, mod);
    });
  });
}

async function main() {
  const up = Boolean((argv as any).up);
  const entryPath = argv._[0] || './fixtures/test.js';
  const depOutputPath = argv._[1] || './fixtures/test.json';
  debug({ entryPath, depOutputPath });

  function print(path: string) {
    console.log(path);
  }

  function pred(dep: Dependency): boolean {
    return dep.dependencyTypes.includes('local');
  }

  const output = await readFromFile(depOutputPath);
  (up ? walkUpward : walkDownward)(
    output.modules,
    entryPath,
    pred,
    (dep, mod) => {
      // print([mod.source, dep.resolved].join(': '));
      print(dep.resolved);
    }
  );
}

main().catch(console.error);
