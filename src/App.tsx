import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import Search from "./components/Search";
import CarList from "./components/CarList";
import AddCar from "./components/AddCar";
import CameraCapture from "./components/CameraCapture";

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    (localStorage.getItem("theme") as "light" | "dark") ?? "light"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const seed = useMutation(api.cars.seed);

  useEffect(() => {
    seed();
  }, [seed]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  function showToast(msg: string) {
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  }

  return (
    <>
      <div className="header-row">
        <h1>🚧 Kontrola vjazdu</h1>
        <button
          className="theme-btn"
          onClick={() => setTheme(t => t === "light" ? "dark" : "light")}
        >
          {theme === "light" ? "🌙 Tmavá" : "☀️ Svetlá"}
        </button>
      </div>
      <div className="subtitle">Zlaté Piesky · BKIS</div>

      <CameraCapture onPlate={setSearchQuery} onToast={showToast} />

      <Search query={searchQuery} onQuery={setSearchQuery} onToast={showToast} />

      <AddCar onToast={showToast} />

      <CarList onSelect={setSearchQuery} />

      <div className={`toast${toastVisible ? " show" : ""}`}>{toast}</div>
    </>
  );
}
