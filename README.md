# Solve Log

A typeset problem log for LeetCode, Codeforces, CSES and quant problems. Each problem has its own write-up page with the statement, your thoughts, one tab per method, code, math and images, plus a spaced-repetition review session.

It is a static site (GitHub Pages) that stores data in Firebase (Firestore and Google sign-in). Anyone with the link can read the log; only the owner's Google account can add or edit.

## Files

- `index.html`, `styles.css`, `app.js`: the site
- `firebase-config.js`: public Firebase settings and the owner's email
- `firestore.rules`: database rules (public read, owner-only write)

## Setup

1. Create a Firebase project, add a web app, and copy its config into `firebase-config.js`.
2. Enable Authentication with the Google provider, and add `<username>.github.io` under Authentication, Settings, Authorized domains.
3. Create a Firestore database and paste `firestore.rules` into its Rules tab, replacing `OWNER_EMAIL` with your Google email.
4. Turn on GitHub Pages for the `main` branch, root folder.
