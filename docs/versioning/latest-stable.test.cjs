const assert = require('node:assert/strict');
const { test } = require('node:test');
const { latestStable } = require('./latest-stable');

test('selects the highest stable version by numeric order', () => {
  assert.equal(
    latestStable(['1.9.0', '2.0.0-rc.1', '1.10.0', '1.0.1']),
    '1.10.0'
  );
});

test('selects a released major without a config change', () => {
  assert.equal(latestStable(['1.0.1', '2.0.0', '3.0.0-beta.1']), '2.0.0');
});

test('does not treat build metadata as a prerelease', () => {
  assert.equal(latestStable(['2.0.0+build.1', '1.0.1']), '2.0.0+build.1');
});

test('fails when no stable docs exist', () => {
  for (const versions of [[], ['next', '0.9.0', '2.0.0-alpha.1']]) {
    assert.throws(() => latestStable(versions), /at least one stable version/);
  }
});
