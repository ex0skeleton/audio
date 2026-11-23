import { $, toast, status, save } from "./ui.js";

// -----------------------------------------------------------------------------
// Tool definitions and application state
// -----------------------------------------------------------------------------

const tools = [
  ["extract", "↳", "Extract audio"],
  ["convert", "⇄", "Convert"],
  ["trim", "✂", "Trim & volume"],
  ["mic", "♩", "Mic test"],
  ["record", "●", "Recorder"],
  ["text", "≋", "Transcribe"],
];
let mode = "extract",
  file,
  buffer,
  ctx,
  worker,
  busy = false,
  url,
  stream,
  recorder,
  raf,
  recognition;
const descriptions = {
  extract:
    "Give your video a voice of its own. Keep the original sound, or choose a fresh format.",
  convert:
    "A different format, the same favorite sound. Choose a lossless or compressed export.",
  trim: "Keep the part you love. Set precise times and adjust the volume before exporting.",
  mic: "Check your input level before a meeting, stream, or recording.",
  record: "Capture an idea, a voice note, or your next voiceover.",
  text: "Turn a recording into editable text with multilingual speech recognition.",
};
// -----------------------------------------------------------------------------
// Initial interface rendering
// -----------------------------------------------------------------------------

$("#heroWave").innerHTML = Array.from(
  { length: 31 },
  (_, i) =>
    `<i style="height:${16 + Math.abs(Math.sin(i * 1.9) * Math.cos(i * 0.32)) * 108}px;opacity:${0.3 + Math.sin(i * 0.14) * 0.7}"></i>`,
).join("");
$("#tools").innerHTML = tools
  .map(
    ([id, icon, name]) =>
      `<button class="craft-btn ${id === "extract" ? "active" : ""}" data-mode="${id}" aria-pressed="${id === "extract"}"><span>${icon}</span>${name}</button>`,
  )
  .join("");
// -----------------------------------------------------------------------------
// Microphone lifecycle and tool navigation
// -----------------------------------------------------------------------------

function stopMic() {
  cancelAnimationFrame(raf);
  if (recorder?.state === "recording") recorder.stop();
  stream?.getTracks().forEach((t) => t.stop());
  stream = null;
  $("#micStart").disabled = false;
  $("#micStop").disabled = true;
  $("#micStatus").textContent = "Microphone stopped.";
}
function selectMode(id) {
  if (busy) return toast("Please wait for the current task to finish.");
  stopMic();
  mode = id;
  document.querySelectorAll("[data-mode]").forEach((b) => {
    b.classList.toggle("active", b.dataset.mode === id);
    b.setAttribute("aria-pressed", b.dataset.mode === id);
  });
  $("#toolTitle").textContent = tools.find((t) => t[0] === id)[2];
  $("#toolDesc").textContent = descriptions[id];
  $("#fileArea").hidden = ["mic", "record"].includes(id);
  $("#capture").hidden = !["mic", "record"].includes(id);
  $("#exportPanel").hidden = ["mic", "record", "text"].includes(id);
  $(".studio").style.gridTemplateColumns = ["mic", "record", "text"].includes(id)
    ? "minmax(0,1fr)"
    : "";
  $("#transcribe").hidden = id !== "text";
  $("#edit").hidden = id !== "trim";
  $("#modeBadge").textContent =
    {
      mic: "LIVE LEVELS",
      record: "VOICE STUDIO",
      text: "LOCAL WHISPER",
      trim: "PRECISE EDITING",
      convert: "YOUR FORMAT",
    }[id] || "SOURCE QUALITY";
  $("#micStart").textContent = id === "record" ? "Start recording" : "Start microphone";
  $("#export").firstChild.textContent =
    id === "extract" ? "Extract audio " : "Export audio ";
  $("#result").hidden = true;
  if (id === "trim" && $("#format").value === "copy") $("#format").value = "wav";
  updateQuality();
  status("Ready when you are.");
}
// -----------------------------------------------------------------------------
// Navigation, theme, help, and file input events
// -----------------------------------------------------------------------------

$("#tools").onclick = (e) => {
  let b = e.target.closest("[data-mode]");
  if (b) selectMode(b.dataset.mode);
};
selectMode("extract");
$("#theme").onclick = () => {
  let light = document.documentElement.dataset.theme !== "light";
  document.documentElement.dataset.theme = light ? "light" : "dark";
  $("#theme").textContent = light ? "☾ Dark mode" : "☀ Light mode";
};
$("#help").onclick = () => $("#helpDialog").showModal();
$("#closeHelp").onclick = () => $("#helpDialog").close();
$("#drop").onclick = $("#replace").onclick = () => $("#file").click();
$("#file").onchange = () => loadFile($("#file").files[0]);
for (let ev of ["dragover", "dragleave", "drop"])
  $("#drop").addEventListener(ev, (e) => {
    e.preventDefault();
    $("#drop").classList.toggle("drag", ev === "dragover");
    if (ev === "drop") loadFile(e.dataTransfer.files[0]);
  });
// -----------------------------------------------------------------------------
// File loading and audio preview
// -----------------------------------------------------------------------------

async function loadFile(f) {
  if (!f || busy) return;
  if (f.size > 250 * 1024 * 1024) return toast("Please choose a file under 250 MB.");
  file = f;
  buffer = null;
  $("#result").hidden = true;
  $("#filename").textContent = f.name;
  $("#filemeta").textContent =
    (f.size / 1048576).toFixed(2) + " MB · " + (f.type || "Media file");
  $("#loaded").hidden = false;
  $("#drop").hidden = true;
  if (url) URL.revokeObjectURL(url);
  url = URL.createObjectURL(f);
  $("#player").src = url;
  $("#export").disabled = false;
  $("#metadata").textContent = "Preparing waveform…";
  try {
    ctx ??= new AudioContext();
    buffer = await ctx.decodeAudioData(await f.arrayBuffer());
    $("#metadata").textContent =
      `${buffer.duration.toFixed(2)} seconds · ${buffer.sampleRate.toLocaleString()} Hz decoded · ${buffer.numberOfChannels} channel(s)`;
    $("#end").value = buffer.duration.toFixed(3);
    drawWave(buffer);
  } catch {
    $("#metadata").textContent =
      "Waveform unavailable for this codec. You can still try extracting or converting with FFmpeg.";
  }
  status("File ready. Choose your export.");
}
// -----------------------------------------------------------------------------
// Waveform rendering from decoded audio samples
// -----------------------------------------------------------------------------

function drawWave(b) {
  let c = $("#wave"),
    g = c.getContext("2d");
  c.width = 1000;
  c.height = 110;
  let a = b.getChannelData(0);
  g.clearRect(0, 0, c.width, c.height);
  g.fillStyle = "#fc6a20";
  for (let x = 0; x < 500; x++) {
    let p = Math.floor((x * a.length) / 500),
      peak = 0;
    for (
      let j = 0;
      j < Math.max(1, a.length / 500);
      j += Math.max(1, Math.floor(a.length / 500 / 60))
    )
      peak = Math.max(peak, Math.abs(a[p + j] || 0));
    let h = Math.max(2, peak * 100);
    g.fillRect(x * 2, (110 - h) / 2, 1.4, h);
  }
}
// -----------------------------------------------------------------------------
// Export quality controls
// -----------------------------------------------------------------------------

function updateQuality() {
  let f = $("#format").value,
    lossy = ["mp3", "m4a", "opus"].includes(f);
  $("#qualityFields").hidden = !lossy;
  $("#qualityTitle").textContent =
    f === "copy"
      ? "Keep every detail"
      : lossy
        ? "A fresh encode"
        : "Lossless decoded audio";
  $("#qualityNote").textContent =
    f === "copy"
      ? "Copies the original encoded audio stream. No conversion, no added quality loss."
      : lossy
        ? "Re-encoding is lossy. A higher bitrate keeps more detail but does not improve the source."
        : "Preserves decoded samples. FLAC uses 24-bit output; WAV uses 32-bit float. Source detail cannot be restored.";
  $("#format").querySelector('[value="copy"]').disabled = mode === "trim";
}
$("#format").onchange = updateQuality;
$("#gain").oninput = () => ($("#gainValue").textContent = $("#gain").value + "%");
// -----------------------------------------------------------------------------
// Background audio engine communication
// -----------------------------------------------------------------------------

let log = "";
async function runEngine(bytes, input, output, args) {
  return new Promise((resolve, reject) => {
    worker ??= new Worker(new URL("./audio-worker.js", import.meta.url));
    worker.onmessage = ({ data: d }) => {
      if (d.log) {
        log = d.log;
        if (/Audio:/.test(log)) status("Audio detected. Processing export…");
      }
      if (d.done) resolve(d.bytes);
      if (d.error) reject(Error(d.error));
    };
    worker.onerror = (e) => {
      worker.terminate();
      worker = null;
      reject(Error("Audio engine could not load. Refresh and try again."));
    };
    worker.postMessage({ bytes, input, output, args }, [bytes]);
  });
}
// -----------------------------------------------------------------------------
// Audio extraction, conversion, and editing
// -----------------------------------------------------------------------------

$("#export").onclick = async () => {
  if (!file || busy) return;
  let f = $("#format").value,
    start = +$("#start").value,
    end = +$("#end").value;
  if (
    mode === "trim" &&
    (!Number.isFinite(start) ||
      start < 0 ||
      !Number.isFinite(end) ||
      end <= start ||
      (buffer && end > buffer.duration + 0.02))
  )
    return toast("Enter a valid start and end within the audio duration.");
  busy = true;
  $("#export").disabled = true;
  $("#progress").hidden = false;
  $("#result").hidden = true;
  status("Loading local audio engine and preparing export…");
  try {
    let ext = file.name.split(".").pop().toLowerCase(),
      input = "source." + ext,
      output = "audio." + ({ copy: "mka" }[f] || f),
      args = ["-i", input, "-map", "0:a:0", "-vn"];
    if (mode === "trim") {
      args.push(
        "-ss",
        String(start),
        "-t",
        String(end - start),
        "-af",
        "volume=" + $("#gain").value / 100,
      );
    }
    // Stream copy preserves encoded audio; all other modes create a new encoding.
    if (f === "copy") args.push("-c:a", "copy");
    if (f === "wav") args.push("-c:a", "pcm_f32le");
    if (f === "flac") args.push("-c:a", "flac", "-sample_fmt", "s32");
    if (f === "mp3") args.push("-c:a", "libmp3lame", "-b:a", $("#bitrate").value + "k");
    if (f === "m4a") args.push("-c:a", "aac", "-b:a", $("#bitrate").value + "k");
    if (f === "opus")
      args.push("-c:a", "libopus", "-b:a", Math.min(256, +$("#bitrate").value) + "k");
    args.push("-y", output);
    let out = await runEngine(await file.arrayBuffer(), input, output, args),
      blob = new Blob([out], {
        type: {
          wav: "audio/wav",
          mp3: "audio/mpeg",
          flac: "audio/flac",
          m4a: "audio/mp4",
          opus: "audio/ogg",
          copy: "audio/x-matroska",
        }[f],
      });
    if (!blob.size)
      throw Error("No audio was produced. The file may not contain an audio track.");
    if ($("#download").href.startsWith("blob:")) URL.revokeObjectURL($("#download").href);
    $("#download").href = URL.createObjectURL(blob);
    $("#download").download =
      file.name.replace(/\.[^.]+$/, "") + "-audio." + output.split(".").pop();
    $("#resultAudio").src = $("#download").href;
    $("#resultAudio").hidden = f === "copy";
    $("#result").hidden = false;
    status(
      f === "copy"
        ? "Original audio stream copied into an MKA container. Some players require VLC for playback."
        : "Export complete. Listen and download below.",
    );
  } catch (e) {
    status(e.message);
    toast("Export failed. " + e.message);
  } finally {
    busy = false;
    $("#export").disabled = false;
    $("#progress").hidden = true;
  }
};
// -----------------------------------------------------------------------------
// Microphone testing and voice recording
// -----------------------------------------------------------------------------

$("#micStart").onclick = async () => {
  try {
    if (!navigator.mediaDevices?.getUserMedia)
      throw Error("Microphone access is unavailable in this browser.");
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });
    ctx ??= new AudioContext();
    await ctx.resume();
    let source = ctx.createMediaStreamSource(stream),
      an = ctx.createAnalyser();
    an.fftSize = 2048;
    source.connect(an);
    let data = new Float32Array(an.fftSize),
      c = $("#meter"),
      g = c.getContext("2d");
    c.width = 1000;
    c.height = 150;
    const tick = () => {
      an.getFloatTimeDomainData(data);
      let rms = Math.sqrt(data.reduce((s, x) => s + x * x, 0) / data.length),
        peak = Math.max(...data.map(Math.abs));
      g.clearRect(0, 0, 1000, 150);
      g.fillStyle = "#fc6a20";
      for (let x = 0; x < 1000; x += 5) g.fillRect(x, 75 + data[x * 2] * 65, 3, 3);
      $("#micStatus").textContent =
        `${mode === "record" ? "Recording" : "Microphone active"} · ${rms > 0 ? (20 * Math.log10(rms)).toFixed(1) : "−∞"} dBFS · ${peak > 0.98 ? "Clipping detected" : rms < 0.003 ? "Speak to check your input" : "Signal detected"}`;
      raf = requestAnimationFrame(tick);
    };
    tick();
    $("#micStart").disabled = true;
    $("#micStop").disabled = false;
    if (mode === "record") {
      let chunks = [];
      let mime = ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/mp4"].find(
        (x) => MediaRecorder.isTypeSupported(x),
      );
      recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : {});
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      recorder.onstop = () => {
        let blob = new Blob(chunks, { type: recorder.mimeType });
        let a = $("#recordDownload");
        if (a.href.startsWith("blob:")) URL.revokeObjectURL(a.href);
        a.href = URL.createObjectURL(blob);
        a.download =
          "AudioWiz-recording." +
          (recorder.mimeType.includes("mp4")
            ? "m4a"
            : recorder.mimeType.includes("ogg")
              ? "ogg"
              : "webm");
        a.hidden = false;
        $("#recording").src = a.href;
        $("#recording").hidden = false;
        status("Recording ready. Download it below.");
        source.disconnect();
      };
      recorder.start();
    }
  } catch (e) {
    stopMic();
    toast(e.message);
  }
};
$("#micStop").onclick = stopMic;
window.addEventListener("pagehide", stopMic);
// -----------------------------------------------------------------------------
// Local speech transcription and text export
// -----------------------------------------------------------------------------

$("#transcribeBtn").onclick = async () => {
  if (!file) return toast("Choose an audio or video file first.");
  if (busy) return;
  busy = true;
  $("#transcribeBtn").disabled = true;
  $("#progress").hidden = false;
  try {
    if (!buffer) {
      ctx ??= new AudioContext();
      buffer = await ctx.decodeAudioData(await file.arrayBuffer());
    }
    status("Loading Whisper model. First use requires a model download…");
    const { pipeline, env } = await import(
      "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2"
    );
    env.allowLocalModels = false;
    recognition ??= await pipeline(
      "automatic-speech-recognition",
      "onnx-community/whisper-small",
      {
        dtype: "q8",
        device: "wasm",
        progress_callback: (p) => {
          if (p.status === "progress")
            status(`Downloading speech model: ${Math.round(p.progress || 0)}%`);
        },
      },
    );
    status("Transcribing locally. Keep this tab open…");
    let off = new OfflineAudioContext(1, Math.ceil(buffer.duration * 16000), 16000),
      src = off.createBufferSource();
    src.buffer = buffer;
    src.connect(off.destination);
    src.start();
    let mono = await off.startRendering(),
      opts = { chunk_length_s: 25, stride_length_s: 5, task: "transcribe" };
    if ($("#language").value) opts.language = $("#language").value;
    let result = await recognition(mono.getChannelData(0), opts);
    $("#transcript").value = result.text;
    status("Transcript ready. Review and edit before exporting.");
  } catch (e) {
    status("Transcription could not finish: " + e.message);
  } finally {
    busy = false;
    $("#transcribeBtn").disabled = false;
    $("#progress").hidden = true;
  }
};
$("#saveText").onclick = () => {
  if (!$("#transcript").value) return toast("No transcript to export yet.");
  save(
    new Blob([$("#transcript").value], { type: "text/plain;charset=utf-8" }),
    "AudioWiz-transcript.txt",
  );
};
$("#copyText").onclick = async () => {
  try {
    await navigator.clipboard.writeText($("#transcript").value);
    toast("Transcript copied");
  } catch {
    toast("Select the transcript and copy it manually.");
  }
};
