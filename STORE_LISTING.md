# Puzzle Parlor — Google Play release kit

## Listing text

**App name** (30 chars max): Puzzle Parlor

**Short description** (80 chars max):
Relaxing jigsaw puzzles, 100 to 1,000 pieces, with sharp zoom and cross-device sync.

**Full description** (4,000 chars max):

Puzzle Parlor is a calm, beautifully made jigsaw puzzle app for phones and tablets.

Choose from Halloween scenes, cozy Christmas and holiday pictures, classic paintings, fantasy worlds, fairy tales and landscapes. Every puzzle can be played at 100, 150, 200, 300, 400, 500, 750 or 1,000 pieces, so it suits a quick phone session or a long tablet evening.

Features
• Full-resolution pieces that stay sharp however far you zoom in
• A piece tray along the bottom so you can sort and pick pieces easily
• Edges-only filter, tidy button, and a full-screen view of the finished picture
• A movable magnifier in every puzzle, plus a per-puzzle hard mode with rotated pieces
• Turn your own photos into puzzles (full version); photos stay on your device
• Pause button and one-tap offline mode
• Time and move counter for every puzzle
• Pin up to four puzzles in progress to the top of the gallery
• Six table colours including transparent, light grey and lavender
• Lock the table so it never moves while you grab pieces
• Optional sync code to continue the same puzzle on another phone or tablet
• No ads, no account, no tracking

Your progress is saved automatically. Pick a puzzle, start placing pieces, and come back any time.

**Category:** Game > Puzzle
**Tags:** jigsaw, puzzle, relaxing, paintings
**Contact email:** puzzles@kandyphoenix.com
**Privacy policy URL:** https://puzzles.kandyphoenix.com/privacy

## Data safety form answers (as the app is built today)
- Does the app collect or share user data? Data is collected only if the user turns on sync: "App activity > Other app activity" (puzzle progress), optional, not shared, encrypted in transit, user can request deletion. No personal info, no location, no device IDs collected by the app.
- Ads: none. Analytics: none. Third-party SDKs: Capacitor only.
- Content rating questionnaire: no violence, no user-generated content, no gambling. Expect "Everyone".

## Graphics needed (make in Canva)
- App icon 512×512 PNG (public/icon-512.png already exists)
- Feature graphic 1024×500 PNG
- At least 2 phone screenshots (recommended 4 to 8), 16:9 or 9:16, min 320px, max 3840px
- 7-inch and 10-inch tablet screenshots are optional but help, since this app is great on iPad-size screens

## Release steps for Kandy
1. Create a Google Play developer account at https://play.google.com/console (one-time fee, identity verification takes a day or two).
2. In Play Console: Create app > name "Puzzle Parlor", Game, Paid, Free-form. Accept the declarations.
3. Set up > App content: privacy policy URL, ads (No), content rating questionnaire, target audience (13+ keeps it simple), data safety (see above).
4. Monetize > Products > App pricing: set the price (for example $0.99). A paid app cannot later be made free-to-paid in reverse, so decide before the first publish. (I believe paid → free is allowed and free → paid is not. Verify in the Play Console help.)
5. Release > Testing > Closed testing: create a release, upload `app-release.aab`, add a tester email list, and run the closed test for the period Google requires for new personal accounts before you can apply for production access.
6. After Google grants production access: Release > Production > create release, upload the same or a newer AAB, roll out.

## Building a new version (from the repo)
```
export ANDROID_HOME=/path/to/android-sdk
npm install
npx cap sync android
cd android && ./gradlew bundleRelease      # output: android/app/build/outputs/bundle/release/app-release.aab
```
Before each store upload, raise `versionCode` (and `versionName`) in `android/app/build.gradle`. Google rejects an upload that reuses a versionCode.

Signing uses `android/keystore.properties` (gitignored) pointing at the upload keystore. Keep the keystore and its password in a safe place; losing it means you cannot update the app unless Play App Signing is enabled (it is enabled by default for new apps, which lets Google reset the upload key if needed).
