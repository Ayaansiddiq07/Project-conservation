export default function Loading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
      }}
    >
      {/* Pulsing logo */}
      <div
        style={{
          fontSize: "1.1rem",
          fontWeight: 600,
          color: "#fff",
          letterSpacing: "-0.5px",
          opacity: 0.7,
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      >
        AERO-SOLAR // vX.1
      </div>

      {/* Loading bar */}
      <div
        style={{
          width: 200,
          height: 2,
          background: "rgba(255,255,255,0.1)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "40%",
            height: "100%",
            background: "#fff",
            borderRadius: 2,
            animation: "loadSlide 1.2s ease-in-out infinite",
          }}
        />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes loadSlide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}
