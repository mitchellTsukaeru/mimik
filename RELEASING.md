# Releasing TaskStitch

TaskStitch uses semantic versions in `package.json`, Git tags named `vX.Y.Z`, GitHub Releases for immutable artifacts, and browser stores for signed installation and automatic updates.

## Release channels

- **Personal testing:** private Chrome Web Store listing restricted to trusted testers.
- **Private distribution:** private domain or enterprise policy distribution where managed Chrome is available.
- **Public release:** public or unlisted browser-store listing after private testing is accepted.
- **Local development only:** unpacked builds from `.output/chrome-mv3`; these are not an update channel.

## Before the first Chrome Web Store release

The first store listing must be created manually in the Chrome Web Store Developer Dashboard.

1. Register and verify the publisher account.
2. Run `pnpm zip` and upload `.output/taskstitch-X.Y.Z-chrome.zip` as a new item.
3. Complete the store listing and privacy questionnaire using `PRIVACY.md` as the public privacy policy.
4. Explain the need for website access, `tabs`, `scripting`, `webNavigation`, `unlimitedStorage`, and `sidePanel`.
5. Select **Private** visibility and add the intended Google Accounts as trusted testers.
6. Submit the item for review and retain deferred publishing control when offered.
7. After approval, record the extension ID and configure automated submission credentials.

## GitHub Actions secrets

Configure only the stores that will be submitted by `.github/workflows/submit.yml`.

Chrome:

- `CHROME_EXTENSION_ID`
- `CHROME_CLIENT_ID`
- `CHROME_CLIENT_SECRET`
- `CHROME_REFRESH_TOKEN`

Firefox:

- `FIREFOX_EXTENSION_ID`
- `FIREFOX_JWT_ISSUER`
- `FIREFOX_JWT_SECRET`

Never commit publishing credentials, API keys, `.env.submit`, private signing keys, or store refresh tokens.

## Release procedure

1. Start from an up-to-date `main` branch with a clean working tree.
2. Update `package.json` and `CHANGELOG.md`.
3. Run the release checks:

   ```bash
   pnpm install --frozen-lockfile
   pnpm lint
   pnpm test
   pnpm zip:all
   ```

4. Smoke-test the unpacked Chrome build in a fresh browser profile:

   - first install and onboarding;
   - record, pause, switch websites, resume, and finish;
   - add text-only, screenshot-only, and combined manual steps;
   - edit rich text and reorder/delete steps;
   - export HTML, Markdown, and PDF;
   - run Guide Me through captured and manual steps;
   - restart Chrome during recording and while paused;
   - run Improve Guide text-only, then with explicitly consented screenshots;
   - verify screenshot blur before any AI request.

5. Commit the release, merge it to `main`, and create the matching tag:

   ```bash
   git tag -s vX.Y.Z -m "TaskStitch vX.Y.Z"
   git push origin vX.Y.Z
   ```

   Use an annotated tag if signed tags are not yet configured. Do not move or reuse a published release tag.

6. In GitHub Actions, run **Submit to Stores** with the exact tag. Use `dryRun: true` first whenever credentials or workflow configuration changed.
7. Confirm the GitHub Release contains the Chrome ZIP, Firefox ZIP, Firefox sources ZIP, and `SHA256SUMS.txt`.
8. Submit or publish the store release. Verify installation and automatic update with a trusted tester before expanding visibility.

## Rollback

Do not overwrite an existing package or tag. If a release is defective, increment the patch version, revert or fix the defect, repeat validation, and publish the new version. Use the Chrome Web Store rollback facility only as an emergency measure while preparing the forward-fix release.
