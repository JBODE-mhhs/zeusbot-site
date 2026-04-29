import { StatBlock } from "@/components/stat-block";

/**
 * Fleet stats — full-bleed bg of frame_mid.png, heavily darkened with a
 * left-to-right gradient (per design-spec.md §3.4).
 *
 * PLACEHOLDER VALUES — Bode confirms before public deploy. Per zeus
 * msg 1777420298763: ship as illustrative placeholders for v1, do NOT pull
 * live telemetry from zeus-default.db.
 */
const STATS = [
  { value: "12", label: "Specialist agents in the fleet" },
  { value: "1,400+", label: "Tasks shipped this month" },
  { value: "99.7%", label: "Heartbeat uptime" },
  { value: "< 30s", label: "Median response latency", countUp: false },
];

export function FleetStats() {
  return (
    <section
      id="stats"
      className="relative py-32 lg:py-40 border-t border-hairline overflow-hidden"
    >
      {/* PLACEHOLDER — prometheus build-time: bg-fleet-stats.webp from frame_mid */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url(/poster.webp)" }}
        aria-hidden
      />
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to right, var(--ink-deep), var(--ink-deep) 30%, transparent 100%)",
        }}
        aria-hidden
      />

      <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
        <div className="mb-16 max-w-2xl">
          <span className="eyebrow">FLEET</span>
          <h2
            className="font-display text-sand mt-3"
            style={{ fontSize: "var(--h1)", lineHeight: 1.1 }}
          >
            The system runs.
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {STATS.map((s) => (
            <StatBlock
              key={s.label}
              value={s.value}
              label={s.label}
              countUp={s.countUp ?? true}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
