# Third-party components

## FFmpeg WebAssembly

Bundled vendor assets come from @ffmpeg/core 0.12.10, distributed through npm/unpkg. The two WASM chunks concatenate in numeric order into the original binary. Vendor code is generated and intentionally not reformatted.

FFmpeg licensing depends on enabled components. Builds containing GPL components require compliance with applicable GPL terms. A wrapper's license is not necessarily the compiled binary's license. Review upstream licensing, build configuration, and source availability before redistributing.

- https://github.com/ffmpegwasm/ffmpeg.wasm
- https://ffmpeg.org/legal.html

## Transcription and fonts

Transformers.js and Whisper model assets retain their upstream licenses. DM Sans and Lilita One are loaded through Google Fonts. Development tools Prettier and http-server retain their respective npm package licenses.

- https://github.com/huggingface/transformers.js
- https://huggingface.co/onnx-community/whisper-small

This project does not assign a new license to these third-party components.
