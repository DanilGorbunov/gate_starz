import { useRef, useState } from "react";

interface Props {
  onPlate: (plate: string) => void;
  onToast: (msg: string) => void;
}

// Local OCR service URL — running OpenALPR or EasyOCR on the same network
// Change this to your Pi/NUC address, e.g. http://192.168.1.50:5000/recognize
const OCR_URL = import.meta.env.VITE_OCR_URL ?? "http://localhost:5000/recognize";

export default function CameraCapture({ onPlate, onToast }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(file: File) {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(OCR_URL, { method: "POST", body: formData });
      if (!res.ok) throw new Error("OCR error");
      const data = await res.json() as { plate?: string; results?: { plate: string }[] };
      const plate =
        data.plate ??
        data.results?.[0]?.plate ??
        null;
      if (plate) {
        onPlate(plate.toUpperCase().replace(/\s/g, ""));
        onToast(`📷 OCR: ${plate}`);
      } else {
        onToast("📷 Číslo nenájdené");
      }
    } catch {
      onToast("⚠️ OCR nedostupné — zadaj ručne");
    } finally {
      setLoading(false);
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
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <button
        className="camera-btn"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
      >
        {loading ? "⏳ Rozpoznávam..." : "📷 Nafotiť ŠPZ (OCR)"}
      </button>
    </>
  );
}
