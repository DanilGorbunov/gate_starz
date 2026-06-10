import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface Props {
  query: string;
  onQuery: (q: string) => void;
  onToast: (msg: string) => void;
}

export default function Search({ query, onQuery, onToast }: Props) {
  const normalized = query.toUpperCase().replace(/\s/g, "");
  const car = useQuery(api.cars.search, normalized ? { q: normalized } : "skip");
  const events = useQuery(
    api.cars.getEvents,
    car ? { carId: car._id } : "skip"
  );
  const logEntry = useMutation(api.cars.logEntry);

  async function handle(type: "in" | "out") {
    if (!car) return;
    await logEntry({ carId: car._id, type, source: "manual" });
    onToast(type === "in" ? `✅ ${car.plate} — vjazd zaznačený` : `🔴 ${car.plate} — výjazd zaznačený`);
  }

  if (!normalized) return (
    <>
      <div className="search-wrap">
        <input
          className="search-input"
          type="text"
          placeholder="Zadaj ŠPZ..."
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
          value={query}
          onChange={e => onQuery(e.target.value)}
        />
      </div>
      <div className="search-hint">Zadaj časť ŠPZ — nájde automaticky</div>
    </>
  );

  return (
    <>
      <div className="search-wrap">
        <input
          className="search-input"
          type="text"
          placeholder="Zadaj ŠPZ..."
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
          value={query}
          onChange={e => onQuery(e.target.value)}
        />
      </div>
      <div className="search-hint">Zadaj časť ŠPZ — nájde automaticky</div>

      {car === undefined ? null : car === null ? (
        <div className="result-card not-found">
          <div className="result-plate">{normalized}</div>
          <div className="result-category">Nenájdené v zozname</div>
          <div className="btn-row">
            <button className="btn btn-disabled">Nie je v zozname</button>
          </div>
        </div>
      ) : (
        <div className="result-card found">
          <div className="result-plate">{car.plate}</div>
          <div className="result-category">{car.cat}</div>

          {car.status === "inside" && (
            <span className="status-badge status-in">🔴 Vnútri areálu</span>
          )}
          {car.status === "outside" && (
            <span className="status-badge status-out">🟢 Vonku / Odišlo</span>
          )}
          {car.status === "none" && (
            <span className="status-badge status-none">⚪ Ešte nebolo</span>
          )}

          {events && events.length > 0 && (
            <div style={{ marginTop: 8 }}>
              {events.map(ev => (
                <div key={ev._id} className="log-entry">
                  <span className={ev.type === "in" ? "in-tag" : "out-tag"}>
                    {ev.type === "in" ? "▲ VJAZD" : "▼ VÝJAZD"}
                  </span>
                  <span>{ev.time}{ev.source === "ocr" ? " · OCR" : ""}</span>
                </div>
              ))}
            </div>
          )}

          <div className="btn-row">
            <button
              className="btn btn-enter"
              disabled={car.status === "inside"}
              style={car.status === "inside" ? { opacity: 0.4, cursor: "default" } : {}}
              onClick={() => handle("in")}
            >
              ▲ Vjazd
            </button>
            <button
              className="btn btn-exit"
              disabled={car.status !== "inside"}
              style={car.status !== "inside" ? { opacity: 0.4, cursor: "default" } : {}}
              onClick={() => handle("out")}
            >
              ▼ Výjazd
            </button>
          </div>
        </div>
      )}
    </>
  );
}
