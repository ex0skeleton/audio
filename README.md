# Audio Wiz — Manual pairing, updated

This restores the original server-free pairing approach. GitHub Pages can host the entire app. No broadcast server, npm dependencies, app login, or password is required.

## Update your existing GitHub project
Extract this ZIP. Copy the CONTENTS of Audio-Wiz into your existing VS Code project, replacing the previous files. Keep your existing .git folder. The old package-lock.json and node_modules from the broadcast version are no longer needed; remove them if present.

In VS Code Terminal:
```powershell
git add .
git commit -m "Restore manual pairing and add debugging logs"
git push
```
Use GitHub repository → Settings → Pages → Deploy from a branch → main → / (root). Open the published HTTPS link on both devices. After deployment, refresh both pages to load the updated version. Do not double-click index.html; browser ES modules need HTTP/HTTPS hosting.

If creating a new repository instead, initialize and connect it with git init, git add ., git commit, git branch -M main, git remote add origin YOUR-REPOSITORY-URL, then git push -u origin main.

## Phone microphone → PC
- On PC choose Receive audio → Create receiver code. Wait for the code to appear.
- Copy the complete code to your phone using a private message or shared clipboard.
- On phone choose Send audio → Microphone. Paste the PC code in the lower input box.
- Tap Start source & create reply, then allow microphone access.
- Copy the phone’s generated reply back to the PC’s lower input box.
- On PC click Connect audio. Click Enable listening if needed.
- Use headphones to prevent feedback. Keep Android unlocked and the page in the foreground.
- Reset both devices before starting a new pairing. Old codes cannot establish a new session.

To reverse audio direction, reverse sender and receiver. For audio files choose the file before creating the sender reply, then press Play once connected. For PC shared audio use Chrome/Edge, select a tab, and enable the audio checkbox in the sharing picker; OS/system-audio availability varies. Only audio is transmitted.

## Why the codes are still longer than 6–8 characters
A manual connection code carries network routes, session identifiers, audio settings, and cryptographic identity details. This version compresses those details (AW2. prefix), instead of simply base64-encoding them. Length varies, and they still require copy/paste. A short typeable code would only be a lookup key; a server would need to store and deliver the actual connection information. That would bring back the setup you chose to avoid. No six-character lookup service is included.

New versions accept old AW1. codes too. If a browser lacks compression APIs it generates a longer AW1. code. A browser unable to decode compressed codes needs an update. Use the current app on both devices.

## Android debugging
Export JSON log is in the Your connection header. It remains available while code generation or a permission prompt is pending.
- Reproduce the issue, then tap Export JSON log on Android.
- Also export the PC log after the failed pairing.
- Send both JSON files for diagnosis. The download is a snapshot; export again after new errors.

Logs include browser/capability information, secure-context status, action/error messages, candidate TYPE and protocol (not candidate IP), ICE/signaling/connection states, code length, visibility changes, and audio packet/byte statistics. Logs do not intentionally include audio, full connection codes, SDP, TURN passwords, or raw candidate addresses. Logs are kept in memory (last 1,500 events), not uploaded anywhere automatically. Reloading clears them.

Changes intended to help diagnose stalls:
- Network discovery waits up to 15 seconds. If usable routes have already been found, it generates a code with those routes rather than discarding everything on timeout. Routes discovered later are not in that code, so pairing can still fail on restrictive networks.
- If no routes were found, it shows an explicit error rather than emitting an unusable code.
- A waiting audio permission request shows a reminder after 15 seconds. The browser itself controls that permission request; no success is assumed and the app does not silently grant access.
- Code corruption, wrong code type, and audio-permission errors have explicit messages.

Try Chrome on Android, confirm microphone permission for the HTTPS page, disable VPN for a test, and use normal Wi-Fi rather than guest Wi-Fi. Insecure LAN HTTP cannot access the Android microphone. This update improves diagnostics; it does not establish the cause of your particular failure until logs are reviewed.

## Network settings
Default public Google STUN helps discover direct routes. Same Wi-Fi is recommended for the first test; access point isolation/firewalls can block it. Different networks sometimes require TURN. Enter your own relay details on both devices before generating codes. TURN is optional and not bundled. Credentials are memory-only. Share pairing codes privately.

## Optional PC preview
Node.js 18+ → `npm start` → http://localhost:3000. No npm install required. This preview is only for PC; publish on HTTPS for Android. The included server.js only serves static files and is not a pairing backend.

## Limits
This receives/records audio within the browser; it does not appear as a Windows microphone in other software without a virtual audio driver. Android background/screen-off streaming is not guaranteed. Recordings consume RAM: keep them short, stop, and download before closing. Displayed network round trip is not full microphone-to-speaker delay. Receiver volume affects listening, not recording level.

## Design
Orange #ef6823, white text on orange buttons, and no numbered option labels. Inter/Outfit substitutes remain because the supplied original HTML did not include its font/CSS files.

## Project files
index.html — interface
css/fonts.css / css/styles.css — fonts and responsive theme
js/app.js — audio, pairing, playback, recording
js/connection.js — compressed code format, validation, discovery, ICE settings
js/diagnostics.js — in-memory events and JSON export
assets/favicon.svg — icon
server.js / package.json — optional local preview
README.md — setup and troubleshooting

Validation: npm run check; code compression/legacy round trips, invalid code rejection, wrong roles, whitespace handling, and completed/partial/empty ICE discovery checks. Live Android/PC audio compatibility needs device testing.
