import { getFile, setFile } from './script-helpers.mjs';

const corePath = '../dist/libs/margarita-form/package.json';
const reactPath = '../dist/libs/margarita-form-react/package.json';

const { version } = await getFile(corePath);

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

    await setFile(dist, contents);
  })
);
