# Audio Wiz
Wireless browser audio between Android and PC. No account, package installation, or pairing backend. Manual WebRTC offer/reply exchange. This is a working implementation; actual phone/PC audio and network behavior must be tested on your devices.


## . Android microphone → PC
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

## . Music / audio files → other device
Pair as above, but choose Audio file on the sending device and choose a file before creating the reply. Once connected, use the built-in audio player’s Play / Pause / Seek controls. Only the remote device plays the file; the sender does not locally monitor it. Keep this page open. Browser-supported file formats only.

## . PC tab / screen audio → Android
Use Chrome or Edge on PC. Set Android to Receive audio and create its first code. On PC select Send audio → PC tab / screen audio, paste the first code and create the reply. In the browser sharing dialog select a tab and enable Share tab audio. System audio is available only where the browser/OS offers it. If no audio track is supplied, the app explains why. Finish by pasting the PC reply on Android. Video is requested to open the sharing picker, but ONLY the audio track is added to the connection. Stop sharing or Reset when finished. Protected media may not be capturable.

## . Different networks
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

