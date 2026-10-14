import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile, readdir, writeFile } from 'node:fs/promises';

const root = 'docs/reviews/issue-40';
const revision = JSON.parse(await readFile(`${root}/checks.json`, 'utf8')).applicationRevision;
const applicationPaths = ['app', 'components', 'lib', 'public', 'assets', 'docs/content', 'package.json', 'bun.lock', 'next.config.ts'];
const applicationChanges = execFileSync('git', ['status', '--porcelain', '--', 'app', 'components', 'lib', 'public', 'assets', 'docs/content', 'package.json', 'bun.lock', 'next.config.ts'], { encoding: 'utf8' }).trim();
execFileSync('git', ['diff', '--exit-code', revision, '--', ...applicationPaths]);
if (applicationChanges) throw new Error('Application revision changed: refresh this checkpoint before recording evidence.');
const cases = new Map();
const runs = [];
for (const file of ['production-run.json', 'production-rerun.json', 'affected-run.json']) {
  if (!existsSync(`${root}/${file}`)) continue;
  const report = JSON.parse(await readFile(`${root}/${file}`, 'utf8'));
  runs.push({ file, applicationRevision: file === 'affected-run.json' ? revision : '240beb7aa31e50fbc0180002789aa447649017cd', stats: report.stats });
  function visit(suite) {
    for (const spec of suite.specs ?? []) for (const test of spec.tests) {
      const key = `${test.projectName}:${spec.file}:${spec.title}`;
      const previous = cases.get(key);
      const result = test.results.at(-1);
      cases.set(key, {
        project: test.projectName, file: spec.file, title: spec.title,
        latestOutcome: result.status, latestRun: file,
        attempts: [...(previous?.attempts ?? []), ...test.results.map(result => ({
          run: file, status: result.status, durationMs: result.duration,
          errors: result.errors.map(error => error.message ?? error.value),
        }))],
      });
    }
    for (const child of suite.suites ?? []) visit(child);
  }
  for (const suite of report.suites) visit(suite);
}
await writeFile(`${root}/case-coverage.json`, JSON.stringify({ applicationRevision: revision, productionBuildId: (await readFile('.next/BUILD_ID', 'utf8')).trim(), runs, cases: [...cases.values()] }, null, 2) + '\n');

async function filesIn(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) files.push(...await filesIn(path));
    else if (entry.name !== 'evidence-files.json') files.push(path);
  }
  return files;
}
const sourceFiles = ['tests/browser/product.spec.ts', 'tests/browser/shopping-checkpoint.spec.ts', 'tests/browser/shopping-captures.spec.ts', 'scripts/verification/capture-shopping-checkpoint.mjs', 'scripts/verification/record-shopping-checkpoint.mjs'];
const files = [];
for (const path of [...await filesIn(root), ...sourceFiles].sort()) {
  const bytes = await readFile(path);
  const source = sourceFiles.includes(path);
  const fingerprint = source ? Buffer.from(bytes.toString('utf8').replace(/\r\n/g, '\n')) : bytes;
  files.push({ file: path, bytes: fingerprint.length, hashMode: source ? 'lf-normalized' : 'exact', sha256: createHash('sha256').update(fingerprint).digest('hex') });
}
await writeFile(`${root}/evidence-files.json`, JSON.stringify({ applicationRevision: revision, applicationTreeUnchanged: true, productionBuildId: (await readFile('.next/BUILD_ID', 'utf8')).trim(), files }, null, 2) + '\n');
console.log(`Recorded ${cases.size} browser cases and ${files.length} evidence/source files for ${revision}.`);
