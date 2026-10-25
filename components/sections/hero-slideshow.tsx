"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SLIDES = [
  {
    src: "/images/paysages/europe.jpg",
    alt: "Lac de Braies, dans les Dolomites, en Italie",
  },
  {
    src: "/images/paysages/savane-elephants.jpg",
    alt: "Éléphants dans la savane, au coucher du soleil",
  },
  {
    src: "/images/paysages/rizieres.jpg",
    alt: "Rizières de Tegallalang, à Bali, en Indonésie",
  },
  {
    src: "/images/paysages/maldives.jpg",
    alt: "Villas sur pilotis, dans un lagon des Maldives",
  },
  {
    src: "/images/paysages/monument-valley.jpg",
    alt: "Monument Valley, à la frontière de l’Arizona et de l’Utah",
  },
  {
    src: "/images/paysages/machu.jpg",
    alt: "Machu Picchu, dans les Andes, au Pérou",
  },
] as const;

const INTERVAL_MS = 6500;
const FADE_MS = 900;

type Phase = "settle" | "ready" | "fade";

export function HeroSlideshow() {
  const [current, setCurrent] = useState(0);
  const [previous, setPrevious] = useState(0);
  const [phase, setPhase] = useState<Phase>("settle");

  useEffect(() => {
    let cancelled = false;
    let armFrame = 0;
    let fadeFrame = 0;
    let settleTimer = 0;

    const id = window.setInterval(() => {
      setCurrent((index) => {
        const next = (index + 1) % SLIDES.length;
        setPrevious(index);
        return next;
      });
      setPhase("ready");
      armFrame = window.requestAnimationFrame(() => {
        fadeFrame = window.requestAnimationFrame(() => {
          if (cancelled) return;
          setPhase("fade");
          settleTimer = window.setTimeout(() => {
            if (!cancelled) setPhase("settle");
          }, FADE_MS + 80);
        });
      });
    }, INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.cancelAnimationFrame(armFrame);
      window.cancelAnimationFrame(fadeFrame);
      window.clearTimeout(settleTimer);
    };
  }, []);

  return (
    <div className="relative h-64 w-full overflow-hidden sm:h-80 lg:h-96">
      {SLIDES.map((item, i) => {
        const isCurrent = i === current;
        const isPrevious = i === previous && previous !== current;
        const shown = isCurrent ? phase !== "ready" : isPrevious;
        // Première image + voisines proches : priorité LCP / preload limité
        return (
          <div
            key={item.src}
            className={`absolute inset-0 ${isCurrent ? "z-10" : "z-0"} ${
              shown ? "opacity-100" : "opacity-0"
            }`}
            style={{
              transition:
                isCurrent && (phase === "ready" || phase === "fade")
                  ? `opacity ${FADE_MS}ms ease-in-out`
                  : "none",
            }}
            aria-hidden={!isCurrent || phase === "ready"}
          >
            <Image
              src={item.src}
              alt={isCurrent && phase !== "ready" ? item.alt : ""}
              fill
              priority={i === 0}
              sizes="(max-width: 768px) 100vw, 42rem"
              className="object-cover"
            />
          </div>
        );
      })}
    </div>
  );
}
