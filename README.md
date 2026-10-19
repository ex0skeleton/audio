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

## Version 1.1.1 diagnostic update
The supplied log identified desktop Linux Chrome and recorded a receiver code generated successfully after 15 seconds. It did not capture an Android failure.

Code generation now returns after a stable set of routes has been found (typically a few seconds). It waits longer when only local routes exist. Later-discovered routes may not be included, so restrictive networks can still require TURN or a retry. Compression has a 2.5-second fallback to the old uncompressed format instead of leaving code generation waiting indefinitely. The generated code is brought into view and the header shows Code ready.

The footer must show **Version 1.1.1 · Manual pairing**. File URLs are versioned to avoid reusing old JS/CSS. If an old Reset label appears where Export JSON log belongs, refresh the page after deployment; on Android close the old tab and reopen the published URL with `?v=1.1.1` appended. An older cached index.html still needs that reload; versioned assets cannot replace an HTML page already open.

Export now also records touch support, viewport size, and browser mobile/platform hints where available. Export JSON log is initialized by the diagnostics module independently of the main app, so it can work if the main app fails to initialize (provided diagnostics itself loads). Reproduce on Android and export there; if both devices fail, send both logs.

## Version 1.2.0 — audio and help update
The fixed bottom-right glass question-mark button opens instructions and JSON log export. Disconnect is in the connection-panel header. The connection badge is larger/bold; Connected glows once and remains orange (animation disabled for reduced-motion users).

For YouTube choose **YouTube / browser tab audio** on the sending PC. Select the actual YouTube tab and enable Share tab audio in Chrome/Edge's picker. For VLC/PowerPoint choose **PC apps / entire system audio**, Entire Screen and the system-audio checkbox if offered. Stop and pair again when changing sources. Browser sharing permissions cannot be enabled by this app. Some browser/OS combinations do not offer full system capture.

Microphone mode captures room noise; use direct digital capture for PC music. Microphone automatic gain is now disabled, with optional voice echo/noise cleanup. Tab/system capture requests processing off. Audio requests stereo Opus up to 192 kbps where negotiated and supported; it cannot restore quality missing from the source. The browser ultimately controls the capture settings. These are now included in logs without device names or IDs.

Receiving playback uses a single Web Audio path with a 0–300% gain slider and compressor/limiter. This avoids duplicate playback and offers amplification above the old 100% ceiling. Limiting reduces overload but does not guarantee artifact-free audio at high boost. Start with 100%, increase original player/phone media volume, then boost if needed. Amplification also raises pre-existing static. Received recordings remain unboosted. The slider boost requires browser Web Audio support; tap Enable listening if autoplay is blocked.

Diagnostics now also include codec, audio-level and concealed-sample counters where supplied by the browser. These can help investigate packet loss and static. No specific cause of the reported static is proven without a new reproduction and logs.

Validation for this release: JavaScript syntax; mocked tab/system capture requests and microphone processing; receiver gain/limiter graph; Opus SDP parameter preservation and sender bitrate; unique DOM IDs and UI references. An attempted automated browser test could not start because the browser binary is not installed here. Actual YouTube/system capture, sound quality and phone speaker output require testing on the user's PC and Android.

After pushing, reopen the HTTPS page on BOTH devices with `?v=1.2.0` appended. Confirm Version 1.2.0 in the footer, and create new pairing codes. The older setup notes for earlier releases above are retained as history; use these capture and gain instructions for this version.

## Version 1.2.1 — Android silent playback correction
The Android 1.2.0 log showed a connected session receiving about 2.3 MB of Opus RTP with very little packet loss, while reported decoded samples remained zero. The Web Audio context reported ready, and pressing Enable listening did not resolve it. This narrows investigation toward decode/playout rather than proving a network failure or a particular root cause.

Standard playback is now the default: the received stream stays attached to the native HTML audio player and play() is explicitly called. The 1.2.0 path had paused and detached that player in favor of Web Audio. Optional Boost playback retains an attached playing media element but mutes its direct output, so the gain graph is the only audible path. Switching back restores native sound at up to 100% without re-pairing. Browser-generated Opus offer/answer parameters are retained; explicit stereo SDP edits were removed. Codec preference and bitrate ceiling remain.

After pushing, open BOTH devices with ?v=1.2.1 and verify the footer. Disconnect and create fresh codes. Leave Playback mode at Standard and phone media volume up. Tap Enable listening if required. If still silent, export logs on both PC and Android while still connected and the PC source is playing. Logs now include native player state, track mute state, energy and decode counters where available.

Checks: syntax, mocked capture requests, native element srcObject/play/unmuted volume path, optional boost with direct output muted, and switch back. Actual Android speaker playback still requires a device test; no browser binary is available in this environment.
