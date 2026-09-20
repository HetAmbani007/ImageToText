"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";

type Mode = "upload" | "camera";

function Icon({ name }: { name: "upload" | "camera" | "copy" | "download" | "scan" | "refresh" }) {
  const paths = {
    upload: <><path d="M12 16V3" /><path d="m7 8 5-5 5 5" /><path d="M4 15v5h16v-5" /></>,
    camera: <><path d="M4 7h3l1.5-2h7L17 7h3v12H4z" /><circle cx="12" cy="13" r="3.5" /></>,
    copy: <><rect x="8" y="8" width="11" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></>,
    download: <><path d="M12 3v12" /><path d="m7 11 5 5 5-5" /><path d="M4 21h16" /></>,
    scan: <><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" /><path d="M8 12h8M12 8v8" /></>,
    refresh: <><path d="M20 11a8 8 0 0 0-14.8-4L3 10" /><path d="M3 5v5h5M4 13a8 8 0 0 0 14.8 4L21 14" /><path d="M21 19v-5h-5" /></>
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => streamRef.current?.getTracks().forEach((track) => track.stop()), []);

  const chooseFile = (selected: File | undefined) => {
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setText("");
    setError("");
    setStatus("Image ready to scan");
  };

  const startCamera = async () => {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera access is not supported in this browser. Use the upload option instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setError("Camera permission was denied or unavailable. Allow access, or use Upload image.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) chooseFile(new File([blob], "camera-capture.jpg", { type: "image/jpeg" }));
    }, "image/jpeg", 0.92);
  };

  const extract = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setStatus("Reading image...");
    const body = new FormData();
    body.append("image", file);
    try {
      const response = await fetch("/api/extract", { method: "POST", body });
      const result = (await response.json()) as { text?: string; error?: string };
      if (!response.ok) throw new Error(result.error || "Could not read this image.");
      setText(result.text?.trim() || "No text was found. Try a sharper, better-lit image.");
      setStatus("Scan complete");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong while scanning.");
      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  const onUpload = (event: ChangeEvent<HTMLInputElement>) => chooseFile(event.target.files?.[0]);
  const clear = () => {
    setFile(null); setPreview(""); setText(""); setError(""); setStatus("");
    if (inputRef.current) inputRef.current.value = "";
  };
  const copy = async () => { await navigator.clipboard.writeText(text); setStatus("Copied to clipboard"); };
  const download = () => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    link.download = "cleartext-result.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <main>
      <nav className="nav"><div className="brand"><span className="brand-mark"><Icon name="scan" /></span> clear<span>text</span></div><div className="secure"><i /> secure & private</div></nav>
      <section className="hero"><div className="eyebrow">IMAGE TO TEXT <span>•</span> OCR</div><h1>Make your images<br /><em>speak clearly.</em></h1><p>Extract clean, editable text from any image in seconds.<br className="desktop" /> Upload a file or use your camera to get started.</p></section>
      <section className="workspace">
        <div className="tabs"><button className={mode === "upload" ? "active" : ""} onClick={() => { stopCamera(); setMode("upload"); }}><Icon name="upload" /> Upload image</button><button className={mode === "camera" ? "active" : ""} onClick={() => { setMode("camera"); void startCamera(); }}><Icon name="camera" /> Use camera</button></div>
        <div className="panels">
          <div className="panel input-panel">
            <div className="panel-heading"><div><small>STEP 01</small><h2>{mode === "upload" ? "Choose an image" : "Capture an image"}</h2></div>{file && <button className="text-button" onClick={clear}>Start over</button>}</div>
            {mode === "upload" ? <div className={`dropzone ${preview ? "has-preview" : ""}`} onClick={() => inputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); chooseFile(event.dataTransfer.files[0]); }}>
              {preview ? <img src={preview} alt="Selected image preview" /> : <><span className="upload-circle"><Icon name="upload" /></span><strong>Drop your image here</strong><span>or <u>browse files</u></span><small>PNG, JPG or WEBP · up to 10 MB</small></>}
              <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={onUpload} />
            </div> : <div className="camera-box">{!preview && <video ref={videoRef} playsInline muted aria-label="Camera preview" />}{preview && <img src={preview} alt="Captured image preview" />} {!preview && <div className="camera-guide" />}<button className="capture-button" onClick={capture} aria-label="Capture image"><span /></button></div>}
            {file && <button className="primary" onClick={extract} disabled={loading}>{loading ? <><span className="spinner" /> Extracting text...</> : <><Icon name="scan" /> Extract text</>}</button>}
            {status && <div className="status"><span />{status}</div>}
            {error && <div className="error">{error}</div>}
            <div className="tip"><span>✦</span><div><b>For best results</b><br />Use a well-lit, sharp image with text facing the camera.</div></div>
          </div>
          <div className="panel result-panel"><div className="panel-heading"><div><small>STEP 02</small><h2>Your extracted text</h2></div>{text && <div className="actions"><button onClick={copy} title="Copy text"><Icon name="copy" /></button><button onClick={download} title="Download text"><Icon name="download" /></button></div>}</div><div className={`result ${text ? "filled" : ""}`}>{text ? <textarea value={text} onChange={(event) => setText(event.target.value)} aria-label="Extracted text" /> : <><Icon name="scan" /><span>Your text will appear here</span><small>It will be editable and ready to copy.</small></>}</div>{text && <div className="editable">Text is editable · Make any corrections before copying</div>}</div>
        </div>
      </section>
      <footer>Powered by <b>API Ninjas</b> · Your images are processed securely and never stored.</footer>
    </main>
  );
}
