import { spawn } from 'child-process-promise';
import inquirer from 'inquirer';

const { name } = await inquirer.prompt({
  name: 'name',
  type: 'string',
  message: 'Library name? @margarita-form/',
});

const nameIsValid = /^[a-z-0-9]+$/.test(name);
if (!nameIsValid) console.error('Invalid name!');

const packageName = `@margarita-form/${name}`;
const nxName = `margarita-form-${name}`;

const args = `g @nrwl/js:lib --publishable --testEnvironment node --unitTestRunner vitest --bundler vite --compiler swc --importPath ${packageName} --name ${nxName}`;

await spawn('nx', args.split(' '), { stdio: 'inherit' });
