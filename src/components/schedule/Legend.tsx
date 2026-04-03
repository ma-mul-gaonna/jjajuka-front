import { ShiftType, SHIFT_META } from "./types";

export default function Legend({ hint }: { hint: string }) {
  return (
    <div className="sch-legend">
      <div className="sch-legend-shifts">
        {(Object.entries(SHIFT_META) as [ShiftType, typeof SHIFT_META.AM][]).map(([, meta]) => (
          <div key={meta.label} className="sch-legend-item">
            <span className="sch-legend-dot" style={{ background: meta.dot }} />
            <span className="sch-legend-name">{meta.label}</span>
            <span className="sch-legend-time">{meta.time}</span>
          </div>
        ))}
      </div>
      <span className="sch-legend-hint">{hint}</span>
    </div>
  );
}
