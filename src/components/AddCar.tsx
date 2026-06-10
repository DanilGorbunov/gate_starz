import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const CATS = [
  "BKIS", "technika", "catering", "multi-sport", "DJ", "selfiekútik",
  "Fotograf", "iHRYsko.sk", "dračie lode", "Ma-Ya Agency",
  "Slovenská asociácia Frisbee", "DOUBLE AGENCY", "LUKI TURIAK",
  "ARES", "mestská polícia", "SBS", "iné",
];

interface Props { onToast: (msg: string) => void; }

export default function AddCar({ onToast }: Props) {
  const [plate, setPlate] = useState("");
  const [cat, setCat] = useState("BKIS");
  const addCar = useMutation(api.cars.add);

  async function handleAdd() {
    const p = plate.trim().toUpperCase().replace(/\s/g, "");
    if (!p) return;
    try {
      await addCar({ plate: p, cat });
      setPlate("");
      onToast(`✅ ${p} pridané`);
    } catch {
      onToast("⚠️ Vozidlo už existuje");
    }
  }

  return (
    <div className="add-section">
      <h3>➕ Pridať nové vozidlo</h3>
      <div className="add-inputs">
        <input
          type="text"
          placeholder="AA000BB"
          maxLength={10}
          value={plate}
          onChange={e => setPlate(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
        />
        <select value={cat} onChange={e => setCat(e.target.value)}>
          {CATS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <button className="btn-add" onClick={handleAdd}>Pridať do zoznamu</button>
    </div>
  );
}
