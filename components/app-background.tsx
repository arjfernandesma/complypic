export function AppBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background px-4">
      {/* Dynamic drifting neon orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="animate-float absolute -top-[10%] left-[5%] size-[75vmax] rounded-full bg-cyan-400/20 blur-[130px]" />
        <div className="animate-float-reverse absolute top-[5%] -right-[20%] size-[65vmax] rounded-full bg-purple-500/25 blur-[150px]" />
        <div className="animate-float absolute -bottom-[20%] left-[15%] size-[70vmax] rounded-full bg-emerald-400/20 blur-[140px]" />
        <div className="animate-float-reverse absolute bottom-[5%] left-[-15%] size-[55vmax] rounded-full bg-indigo-500/20 blur-[120px]" />
      </div>

      {/* Neon Mesh Gradient Overlay */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          background:
            "radial-gradient(circle at 10% 10%, oklch(0.7 0.25 250 / 0.15) 0%, transparent 45%)," +
            "radial-gradient(circle at 90% 10%, oklch(0.7 0.2 300 / 0.15) 0%, transparent 45%)," +
            "radial-gradient(circle at 50% 90%, oklch(0.7 0.25 180 / 0.15) 0%, transparent 50%)",
        }}
      />

      {/* Light texture / Noise */}
      <svg className="absolute inset-0 size-full opacity-[0.02] mix-blend-overlay" xmlns="http://www.w3.org/2000/svg">
        <filter id="neon-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#neon-noise)" />
      </svg>

      {/* Surface highlights with neon touch */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-background/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
    </div>
  )
}
