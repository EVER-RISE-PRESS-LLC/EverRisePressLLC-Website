"use client";

import { useEffect, useRef, useState } from "react";
import Carousel, { type CarouselItemData } from "./Carousel";

const ITEMS: CarouselItemData[] = [
  {
    id: 1,
    title: "Lamont McLeod, Founder",
    description:
      "Meet the author of How To Have a Financial Heart Attack and explore the background to his book.",
    image: "/images/carousel/lamont-mcleod.webp",
    imageAlt: "Lamont McLeod smiling in his power wheelchair at the foot of a staircase",
    imageFit: "cover",
    imagePosition: "50% 22%",
  },
  {
    id: 2,
    title: "The Debt Collector Years",
    description:
      "McLeod's book describes working in debt collection while reflecting on his own spending and borrowing.",
    image: "/images/carousel/debt-collector.webp",
    imageAlt: "Figure in a yellow shirt whose head is made of hundred-dollar bills",
    imageFit: "cover",
    imagePosition: "50% 50%",
  },
  {
    id: 3,
    title: "EverRise Press",
    description:
      "Explore the book, read the author profile, and try the first chapter free with email signup.",
    image: "/images/carousel/everrise-press.webp",
    imageAlt: "EverRise Press LLC emblem",
    imageFit: "contain",
  },
];

export default function StoryCarousel() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [baseWidth, setBaseWidth] = useState(330);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => {
      setBaseWidth(Math.max(280, el.clientWidth));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapperRef} className="w-full">
      <Carousel
        items={ITEMS}
        baseWidth={baseWidth}
        autoplay
        autoplayDelay={4500}
        pauseOnHover
        loop
        round={false}
      />
    </div>
  );
}
