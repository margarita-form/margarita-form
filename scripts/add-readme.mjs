import { getFile, setFile } from './script-helpers.mjs';

const rootPath = '../README.md';
const corePath = '../dist/libs/margarita-form/README.md';
const reactPath = '../dist/libs/margarita-form-react/README.md';
const angularPath = '../dist/libs/margarita-form-angular/README.md';
const readmeContents = await getFile(rootPath, false);
const libsToUpdate = [corePath, reactPath, angularPath];

await Promise.all(
  libsToUpdate.map(async (dist) => {
    await setFile(dist, readmeContents);
  })
);
