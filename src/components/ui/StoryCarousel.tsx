"use client";

import { useEffect, useRef, useState } from "react";
import Carousel, { type CarouselItemData } from "./Carousel";

const ITEMS: CarouselItemData[] = [
  {
    id: 1,
    title: "Lamont McLeod, Founder",
    description:
      "Most people would call that a tragedy. Lamont calls it the moment he stopped lying to himself about what actually matters.",
    image: "/images/carousel/lamont-mcleod.webp",
    imageAlt: "Lamont McLeod smiling in his power wheelchair at the foot of a staircase",
    imageFit: "cover",
    imagePosition: "50% 22%",
  },
  {
    id: 2,
    title: "The Debt Collector Years",
    description:
      "He collected debts for a living while living the very patterns he was collecting on. Practicing poverty until he became an expert.",
    image: "/images/carousel/debt-collector.webp",
    imageAlt: "Figure in a yellow shirt whose head is made of hundred-dollar bills",
    imageFit: "cover",
    imagePosition: "50% 50%",
  },
  {
    id: 3,
    title: "EverRise Press",
    description:
      "You don't need a cheerleader. You need someone who will read your financial chart the way a doctor reads an X-ray.",
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
