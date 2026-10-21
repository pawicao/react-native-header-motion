# Docs versions

The site uses [Docusaurus versioning](https://docusaurus.io/docs/versioning).

1. Edit `docs/docs` for v2 (Next). Docusaurus serves these files at `/docs/next` and shows an unreleased banner.
2. Edit `docs/versioned_docs/version-1.0.1` for the stable v1 docs. Keep changes that apply only to v2 out of this copy.
3. Use relative links between docs. Docusaurus keeps these links in the same version.

All paths above start at the repository root.

The default is the highest stable version in `versions.json`, sorted by Semantic Versioning. A stable version must have a major number of at least 1 and no prerelease suffix. Build metadata does not change stability. The `current` source is always Next, even if the package version is stable. The build fails if no stable docs version exists. This rule uses saved docs versions, not the package version or a live npm request.

The Docs link, home page link, and footer links open the stable docs. Readers can select Next from the version menu.

## Release a docs version

1. Check that the Next docs match the release. Do not save a stable docs version before the package release.
2. From the repository root, run `yarn workspace docs docusaurus docs:version 2.0.0`. Use the full release version. For a prerelease, include its suffix, such as `2.0.0-rc.1`.
3. Commit `docs/versions.json`, the new folder in `docs/versioned_docs`, and the new file in `docs/versioned_sidebars`.
4. Set the `current` label in `docs/docusaurus.config.ts` to the next planned version. Keep its `next` path and unreleased banner.
5. Run `yarn workspace docs test:versioning`, `yarn workspace docs typecheck`, and `yarn workspace docs build`.

The highest stable saved version takes the `/docs` route without a config change. Older saved versions use their version number in the route. Prereleases do not replace the stable default.
