# Audio Wiz
Wireless browser audio between Android and PC. No account, package installation, or pairing backend. Manual WebRTC offer/reply exchange. This is a working implementation; actual phone/PC audio and network behavior must be tested on your devices.

## 1. Open in VS Code
1. Extract this ZIP.
2. VS Code → File → Open Folder → select Audio-Wiz (the folder containing index.html).
3. Optional PC preview: install Node.js 18 or newer, open Terminal → New Terminal, run `npm start`, and open http://localhost:3000. No npm install needed.
4. This localhost preview is only for the PC. Do not use a plain HTTP Wi-Fi IP on Android: the microphone needs a secure HTTPS page.

## 2. Publish on GitHub Pages (recommended)
1. Create an empty public GitHub repository named Audio-Wiz. Do not add a README on GitHub when creating it.
2. In the VS Code terminal inside this folder, run these commands, replacing YOUR-USERNAME:

```powershell
git init
git add .
git commit -m "Add Audio Wiz"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/Audio-Wiz.git
git push -u origin main
```

3. On GitHub open repository → Settings → Pages.
4. Under Build and deployment choose Deploy from a branch, branch main, folder / (root), Save.
5. Wait for deployment. Open https://YOUR-USERNAME.github.io/Audio-Wiz/ on BOTH devices.
6. No tokens or passwords belong in these project files. No app login is required.

For updates: `git add .`, then `git commit -m "Update Audio Wiz"`, then `git push`.

## 3. Android microphone → PC
1. Connect PC and phone to the same Wi-Fi for the first test. Avoid guest Wi-Fi / access point isolation.
2. On PC, leave Receive audio selected. Click Create receiver code. Wait until the code appears.
3. Copy the whole code and send it privately to your phone (e.g. a message to yourself).
4. On phone, select Send audio. Leave Microphone selected. Paste the PC code into Code from your other device.
5. Tap Start source & create reply. Allow microphone access. Keep this page open while it gathers the reply.
6. Copy the phone’s reply code and send it back to the PC.
7. Paste the reply on PC and click Connect audio.
8. If silent, click Enable listening. Speak into the phone. Use headphones to prevent feedback.
9. Record received audio on PC if wanted. Stop recording, then click the generated download link. Recordings remain in memory until downloaded; navigating away discards them.
10. Reset on BOTH devices before making another connection. Codes are unique to a pairing attempt; stale codes do not reconnect.

Reverse sender and receiver to send PC microphone audio to Android.

## 4. Music / audio files → other device
Pair as above, but choose Audio file on the sending device and choose a file before creating the reply. Once connected, use the built-in audio player’s Play / Pause / Seek controls. Only the remote device plays the file; the sender does not locally monitor it. Keep this page open. Browser-supported file formats only.

## 5. PC tab / screen audio → Android
Use Chrome or Edge on PC. Set Android to Receive audio and create its first code. On PC select Send audio → PC tab / screen audio, paste the first code and create the reply. In the browser sharing dialog select a tab and enable Share tab audio. System audio is available only where the browser/OS offers it. If no audio track is supplied, the app explains why. Finish by pasting the PC reply on Android. Video is requested to open the sharing picker, but ONLY the audio track is added to the connection. Stop sharing or Reset when finished. Protected media may not be capturable.

## 6. Different networks
Default STUN discovery can establish direct internet connections on some networks, but cannot guarantee it. For reliable traversal obtain a TURN service or self-host a TURN server. Before creating codes, enter the TURN URL, username and password under Network settings on BOTH devices. Credentials are not stored or included in project files. Use temporary credentials from your provider. Force relay tests whether TURN actually works. Reset and generate new codes after any network setting change.

GitHub Pages serves the app; it is NOT a TURN server. No relay service is bundled or paid for. A TURN relay carries encrypted WebRTC audio; it can still see connection metadata. The default STUN service is Google’s public STUN endpoint. Turn STUN off to attempt same-LAN-only discovery without that service; browsers/router policies can still prevent discovery.

## Limits & troubleshooting
- This streams to the browser. It does not register as a Windows input microphone. For Zoom/games/other apps you need a separately installed virtual audio cable/driver and must route browser playback to it.
- Pairing requires exchanging TWO long codes each time, not a short room PIN. This avoids a signaling server. Codes include network/session details: share only with your own intended device. Do not publish them.
- Audio delay varies. Network round trip is NOT full microphone-to-speaker latency. Do not use as a precise musical monitor.
- Keep Android unlocked, browser foreground, volume up, and disable aggressive battery saving. Screen-off/background capture is not guaranteed.
- If connected but silent: click Enable listening, check permissions and volume, play the chosen file, and verify the screen sharing audio checkbox.
- If failed: Reset both ends, exchange new codes, try a normal non-guest Wi-Fi, then TURN. VPNs/firewalls can block WebRTC.
- On some devices the browser may require another tap to start audio. Microphone access is always permission based.
- Recordings accumulate in RAM. Use short sessions and download before closing the tab.
- Receiver volume changes playback only, not the recording level.
- The uploaded index(8).html was a shell referencing css/fonts.css and css/styles.css, neither attached. The app follows its dark cards, orange controls, header, and main/sidebar arrangement. Inter and Outfit are substitutes loaded from Google Fonts with system fallbacks; exact original fonts cannot be identified from that HTML. Replace css/fonts.css with your original font declarations and font files if you want an exact match.

## Files
index.html — interface
css/fonts.css — font definitions
css/styles.css — responsive theme
js/connection.js — code validation and ICE settings
js/app.js — media, pairing, playback, recording, meters and stats
assets/favicon.svg — Audio Wiz icon
server.js — optional localhost preview, built-in Node.js modules only
package.json — start and syntax-check commands
README.md — setup and usage

## Validation
Run `npm run check` for JavaScript syntax. Device acceptance: phone mic → PC, PC tab → phone, file playback, mute, recording download, reset/reconnect, denied permission, and (if supplied) TURN with Force relay. A real two-device session is required to verify audio and network compatibility.
