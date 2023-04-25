import { getFile, setFile, runCommand } from './script-helpers.mjs';

// const rootPath = '../package.json';
const corePath = '../dist/libs/margarita-form/package.json';
const reactPath = '../dist/libs/margarita-form-react/package.json';

const { version } = await getFile(corePath);
// const { dependencies } = await getFile(rootPath);

// const dependenciesToUpdate = ['lodash.get', 'nanoid', 'rxjs'];
const libsToUpdate = [corePath, reactPath];

await Promise.all(
  libsToUpdate.map(async (dist) => {
    const contents = await getFile(dist);

    // const hasDependency = (name) => contents.dependencies[name];
    const setPeerDependency = (name, _version) =>
      (contents.peerDependencies[name] = _version);

    // Update core
    const isCore = contents.name === '@margarita-form/core';
    if (!isCore) {
      setPeerDependency('@margarita-form/core', `${version}`);
    }

    /*
    // Update others
    dependenciesToUpdate.forEach((dependency) => {
      if (hasDependency(dependency)) {
        const current = dependencies[dependency];
        setDependency(dependency, current);
      }
    });
      */

    await setFile(dist, contents);
  })
);

await runCommand('git add .');
await runCommand('git commit -m chore:\\supdate\\slib\\sdependencies');
await runCommand('git push');
