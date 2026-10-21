const semver = require('semver');

/** @param {string[]} versions */
function latestStable(versions) {
  const stable = versions.filter(
    (version) =>
      semver.valid(version) &&
      semver.major(version) > 0 &&
      semver.prerelease(version) === null
  );
  const latest = stable.sort(semver.rcompare)[0];
  if (!latest) {
    throw new Error('Docs need at least one stable version in versions.json.');
  }
  return latest;
}

module.exports = { latestStable };
