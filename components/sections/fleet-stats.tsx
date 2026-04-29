import { StatBlock } from "@/components/stat-block";
import { SCRIM_RECIPES } from "@/components/scroll/scrimRecipes";

const STATS = [
  { value: "12", label: "Specialist agents in the fleet" },
  { value: "1,400+", label: "Tasks shipped this month" },
  { value: "99.7%", label: "Heartbeat uptime" },
  { value: "< 30s", label: "Median response latency", countUp: false },
];

export function FleetStats() {
  return (
    <section
      data-section="stats"
      id="stats"
      className="relative h-screen w-full overflow-hidden"
    >
      <div
        data-scrim
        aria-hidden
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: SCRIM_RECIPES.stats }}
      />
      <div className="relative z-[2] h-full max-w-[1280px] mx-auto px-6 lg:px-12 flex flex-col justify-center py-24">
        <div className="mb-12 max-w-2xl">
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
            <div key={s.label} data-anim="stat">
              <StatBlock
                value={s.value}
                label={s.label}
                countUp={s.countUp ?? true}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
