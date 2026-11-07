import { copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const source = resolve('.env.example');
const target = resolve('.env');

if (!existsSync(source)) {
  console.error('Missing .env.example. Run this script from the repository root.');
  process.exitCode = 1;
} else if (existsSync(target)) {
  console.log('.env already exists. Leaving it unchanged.');
} else {
  copyFileSync(source, target);
  console.log('Created .env from .env.example.');
}
