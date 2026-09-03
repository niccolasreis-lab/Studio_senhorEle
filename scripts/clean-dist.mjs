import { randomUUID } from 'node:crypto';
import { existsSync, renameSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function cleanBuildOutput(rootDirectory = process.cwd()) {
  const projectRoot = resolve(rootDirectory);
  const outputDirectory = resolve(projectRoot, 'dist');

  if (outputDirectory !== resolve(projectRoot, 'dist')) {
    throw new Error('Diretório de build inesperado.');
  }

  if (existsSync(outputDirectory)) {
    // Some synchronized Windows workspaces restore files deleted in place. Moving
    // the directory first gives the build an atomic, genuinely empty output path.
    const quarantineDirectory = join(tmpdir(), `studio-senhorele-dist-${randomUUID()}`);
    renameSync(outputDirectory, quarantineDirectory);
    rmSync(quarantineDirectory, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });

    if (existsSync(outputDirectory) || existsSync(quarantineDirectory)) {
      throw new Error('Não foi possível limpar completamente o diretório de build.');
    }
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  cleanBuildOutput();
}
