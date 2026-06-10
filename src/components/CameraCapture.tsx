import { useRef, useState } from "react";
import Tesseract from "tesseract.js";

interface Props {
  onPlate: (plate: string) => void;
  onToast: (msg: string) => void;
}

export default function CameraCapture({ onPlate, onToast }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function handleFile(file: File) {
    setLoading(true);
    setProgress(0);
    try {
      const result = await Tesseract.recognize(file, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round((m.progress ?? 0) * 100));
          }
        },
      });

      // grab raw text, keep only A-Z and 0-9
      const raw = result.data.text
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .trim();

      // heuristic: plate is 4–10 chars
      // split by whitespace first, find the most plate-like chunk
      const chunks = result.data.text
        .toUpperCase()
        .split(/\s+/)
        .map((c) => c.replace(/[^A-Z0-9]/g, ""))
        .filter((c) => c.length >= 4 && c.length <= 10);

      const plate = chunks[0] ?? (raw.length >= 4 ? raw.slice(0, 10) : null);

      if (plate) {
        onPlate(plate);
        onToast(`📷 OCR: ${plate}`);
      } else {
        onToast("📷 Číslo sa nepodarilo rozpoznať — skús znova");
      }
    } catch {
      onToast("⚠️ Chyba OCR — skús znova");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          // reset so same file can be re-selected
          e.target.value = "";
        }}
      />
      <button
        className="camera-btn"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
      >
        {loading
          ? `⏳ Rozpoznávam… ${progress > 0 ? progress + "%" : ""}`
          : "📷 Nafotiť ŠPZ (OCR)"}
      </button>
    </>
  );
}
