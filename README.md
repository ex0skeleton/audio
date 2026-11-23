# AudioWiz

Browser-local audio extraction, conversion, trimming, microphone testing, recording, and transcription.

## Start in VS Code

1. Open this folder in VS Code. Install Node.js if needed.
2. Open the integrated terminal and run `npm install`.
3. Run `npm run dev` and open http://localhost:4173.

Use localhost or HTTPS for microphone access. Opening index.html directly will not support workers and modules correctly.

## Files

| Path                      | Purpose                                                    |
| ------------------------- | ---------------------------------------------------------- |
| public/index.html         | Page layout and tool panels                                |
| public/css/brand.css      | Supplied UI tokens and reusable styles                     |
| public/css/app.css        | App layout and responsive overrides                        |
| public/js/app.js          | Tool navigation, preview, export, recording, transcription |
| public/js/ui.js           | DOM, toast, status, and download helpers                   |
| public/js/audio-worker.js | FFmpeg background execution                                |
| public/assets/            | SVG logo and favicon                                       |
| public/vendor/            | Unmodified FFmpeg runtime and split WASM binary            |
| .vscode/                  | Formatter recommendations and editor settings              |

## Maintain

Run `npm run check` for syntax, `npm run format` to format, and `npm run format:check` to verify formatting. Handwritten code uses readable lines and commented sections; third-party generated vendor code is excluded from formatting.

There is no build step. Deploy the contents of public/ to a static HTTPS host. Pushing to GitHub alone does not host the app.

## GitHub

Create an empty repository, then use VS Code Source Control → Initialize Repository, commit, and Publish Branch. Or run:

```bash
git init
git add .
git commit -m "Add AudioWiz audio tools"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Replace the example repository URL. No credentials, Git history, or ChatGPT hosting identity are included.

## Quality and practical limits

Original export copies the first encoded audio stream without re-encoding, into an MKA container. VLC can play this container. WAV uses 32-bit float PCM; FLAC preserves decoded audio. MP3, AAC/M4A, and Opus are lossy conversions. Editing requires re-encoding; no setting can recover detail missing from the source.

One file at a time, up to 250 MB. Browser memory may impose lower practical limits. DRM-protected files are unsupported. Microphone recording uses the browser's supported codec and is not guaranteed lossless.

## Transcription and external downloads

Transcription loads Transformers.js 3.7.2 from jsDelivr and downloads the multilingual onnx-community/whisper-small model on first use. This can require significant download size, memory, and time. Google Fonts requires internet too. Media processing runs locally; code, fonts, and model assets are fetched externally. Review machine transcripts for accuracy.

The full transcription model and microphone permission flow still need testing on your device. Audio engine export paths and JavaScript syntax have been checked.

Read THIRD_PARTY_NOTICES.md before redistribution. Choose a license for your own application code before making the repository public.
