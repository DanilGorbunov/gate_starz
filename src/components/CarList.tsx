import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

type Filter = "all" | "inside" | "outside" | "none";

interface Props {
  onSelect: (plate: string) => void;
}

export default function CarList({ onSelect }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const cars = useQuery(api.cars.list);

  if (!cars) return <div className="empty-msg">Načítavam...</div>;

  const filtered = cars.filter(c => filter === "all" || c.status === filter);
  const insideCount = cars.filter(c => c.status === "inside").length;

  return (
    <div className="list-section">
      <div className="list-header">
        <h3>Všetky vozidlá</h3>
        <span className="count-badge">{insideCount} vnútri / {cars.length}</span>
      </div>

      <div className="filter-tabs">
        {(["all", "inside", "outside", "none"] as Filter[]).map(f => (
          <div
            key={f}
            className={`tab${filter === f ? " active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "Všetky" : f === "inside" ? "Vnútri" : f === "outside" ? "Vonku" : "Ešte neboli"}
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-msg">Žiadne vozidlá</div>
      ) : (
        filtered.map(car => (
          <div
            key={car._id}
            className={`car-row ${car.status === "inside" ? "inside" : car.status === "outside" ? "outside" : ""}`}
            onClick={() => onSelect(car.plate)}
          >
            <span className="car-plate-small">{car.plate}</span>
            <span className="car-cat">{car.cat}</span>
            <span className={`dot ${car.status === "inside" ? "dot-in" : car.status === "outside" ? "dot-out" : "dot-none"}`} />
          </div>
        ))
      )}
    </div>
  );
}
