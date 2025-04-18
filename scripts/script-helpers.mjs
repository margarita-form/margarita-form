import { join, dirname } from 'path';
import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

export const getFile = async (path, json = true) => {
  const res = await readFile(join(__dirname, path));
  if (!json) return res.toString();
  return JSON.parse(res.toString());
};

export const setFile = async (path, content) => {
  if (typeof content === 'object') {
    return await setFile(path, JSON.stringify(content, null, 2));
  }
  return await writeFile(join(__dirname, path), content);
};
