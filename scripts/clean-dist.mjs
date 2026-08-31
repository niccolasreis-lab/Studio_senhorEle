import { existsSync, readdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = resolve(process.cwd());
const outputDirectory = resolve(projectRoot, 'dist');

if (outputDirectory !== resolve(projectRoot, 'dist')) {
  throw new Error('Diretório de build inesperado.');
}

if (existsSync(outputDirectory)) {
  for (const entry of readdirSync(outputDirectory)) {
    rmSync(resolve(outputDirectory, entry), { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  }
}
