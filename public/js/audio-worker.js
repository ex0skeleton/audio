/**
 * Dedicated FFmpeg worker. Heavy exports run away from the UI thread.
 * The WASM binary is split to comply with static hosting asset-size limits.
 */

importScripts("../vendor/ffmpeg-core.js");
let core;
onmessage = async ({ data: d }) => {
  try {
    if (!core) {
      // Fetch both binary chunks and reassemble their original byte order.
      const parts = await Promise.all(
        [0, 1].map(async (i) => {
          const r = await fetch("../vendor/ffmpeg-core.wasm." + i);
          if (!r.ok) throw Error("Audio engine download failed");
          return new Uint8Array(await r.arrayBuffer());
        }),
      );
      const wasm = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
      let offset = 0;
      for (const p of parts) {
        wasm.set(p, offset);
        offset += p.length;
      }
      core = await createFFmpegCore({
        wasmBinary: wasm,
        mainScriptUrlOrBlob:
          new URL("../vendor/ffmpeg-core.js", self.location.href).href +
          "#" +
          btoa(
            JSON.stringify({
              wasmURL: new URL("../vendor/ffmpeg-core.wasm", self.location.href).href,
            }),
          ),
        print: () => {},
        printErr: (m) => postMessage({ log: m }),
      });
    }
    core.setLogger(({ message }) => postMessage({ log: message }));
    if (d.init) {
      postMessage({ ready: true });
      return;
    }
    // Use FFmpeg's in-memory filesystem; media never leaves the browser.
    core.FS.writeFile(d.input, new Uint8Array(d.bytes));
    const rc = core.exec(...d.args);
    if (rc !== 0)
      throw Error(
        "This export could not be completed. Try a different format or check that the file contains audio.",
      );
    let out = core.FS.readFile(d.output);
    postMessage({ done: true, bytes: out }, [out.buffer]);
    core.FS.unlink(d.input);
    core.FS.unlink(d.output);
    core.reset();
  } catch (e) {
    postMessage({ error: e.message });
  }
};
