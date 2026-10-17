const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const read = (path) => readFileSync(path, 'utf8');

test('deployment supports repository subpaths without changing classic script semantics', () => {
  assert.equal(require('../vite.config.cjs').base, './');
  assert.match(read('index.html'), /<script src="\.\/src\/app\.js"><\/script>/);
  for (const file of ['index.html', 'src/app.js']) {
    assert.doesNotMatch(read(file), /src="\/art\//);
  }
  assert.match(read('src/prototypes.js'), /fetch\('data\/prototypes\.json'\)/);
});

test('Pages publishes tested build output rather than raw source', () => {
  const workflow = read('.github/workflows/pages.yml');
  assert.match(workflow, /branches: \[main\]/);
  assert.match(workflow, /npm ci/);
  assert.match(workflow, /npm run check/);
  assert.match(workflow, /path: dist/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
});
