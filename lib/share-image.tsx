import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const shareImageSize = { width: 1200, height: 630 };
export const shareImageAlt =
  "Jennifer & Voyages — itinéraires, réservations et conseils";

export async function createShareImage() {
  const photo = await readFile(
    join(process.cwd(), "public/images/paysages/europe.jpg"),
  );
  const photoSrc = `data:image/jpeg;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#f5f3ef",
        }}
      >
        <div
          style={{
            width: 500,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 56px",
            background: "#f5f3ef",
            color: "#1a2b88",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Jennifer & Voyages
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 54,
              fontWeight: 700,
              lineHeight: 1.12,
              letterSpacing: "-0.03em",
            }}
          >
            Votre voyage, vos envies, ma passion.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              color: "#5c6570",
            }}
          >
            jennifervoyages.fr
          </div>
        </div>
        <div
          style={{
            display: "flex",
            width: 700,
            height: "100%",
            overflow: "hidden",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoSrc}
            alt=""
            width={700}
            height={630}
            style={{
              width: 700,
              height: 630,
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        </div>
      </div>
    ),
    { ...shareImageSize },
  );
}
