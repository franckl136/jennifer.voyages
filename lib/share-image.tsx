import { ImageResponse } from "next/og";

export const shareImageSize = { width: 1200, height: 630 };
export const shareImageAlt =
  "Jennifer & Voyages — itinéraires, réservations et conseils";

export function createShareImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "linear-gradient(145deg, #1a2b88 0%, #243a9e 48%, #6b93b5 100%)",
          color: "#f5f3ef",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#e4edf4",
          }}
        >
          Voyage planner
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 84,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            Jennifer & Voyages
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              maxWidth: 860,
              fontSize: 34,
              lineHeight: 1.35,
              color: "#e8e4dc",
            }}
          >
            Itinéraires sur mesure, réservations et conseils pour partir
            sereinement.
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#e4edf4" }}>
          jennifervoyages.fr
        </div>
      </div>
    ),
    { ...shareImageSize },
  );
}
