"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Minus } from "lucide-react";

const STORIES = [
  { title: "A Ten-Dollar Allowance", body: "Penny candy and arcade games are where the story begins. Chapter 1 explores what McLeod learned from spending his weekly allowance.", image: "/images/stack/img1.jpg", alt: "Illustration of a silhouette with an orange and blue flame" },
  { title: "Waiting for Next Friday", body: "McLeod reflects on spending an allowance before the next one arrived, and how that expectation followed him into working life.", image: "/images/stack/img3.jpg", alt: "Illustration of a man seated in a backyard chair" },
  { title: "Chasing Every Friday", body: "The book follows McLeod's experience of moving between jobs and expecting the next paycheck to solve the same recurring problems.", image: "/images/stack/img2.jpg", alt: "Illustration of a figure seated on a rooftop against a blue sky" },
  { title: "The Awakening", body: "Working in debt collection led McLeod to reconsider his own choices. The book invites readers to reflect on their own money stories.", image: "/images/stack/img4.jpg", alt: "Surreal illustration of a reclining figure opening onto a blue sky" },
];

/** Reader-controlled chapter browsing; no autoplay, scroll capture, or hidden reading prerequisite. */
export default function BookStories() {
  const [active, setActive] = useState(0);
  return (
    <div className="press-stories">
      <div className="press-story-list">
        {STORIES.map((story, i) => (
          <details className="press-story" key={story.title} open={active === i}>
            <summary onClick={event => { event.preventDefault(); setActive(active === i ? -1 : i); }} aria-controls={`story-${i}`} aria-expanded={active === i}>
              <h3>{story.title}</h3>{active === i ? <Minus size={20} aria-hidden/> : <Plus size={20} aria-hidden/>}
            </summary>
            <div id={`story-${i}`} className="press-story-copy"><p>{story.body}</p></div>
          </details>
        ))}
      </div>
      <figure className="press-story-art" aria-label="Artwork accompanying the selected theme">
        {STORIES.map((story, i) => <div className="press-story-image" data-active={i === Math.max(active, 0)} key={story.image} aria-hidden={i !== Math.max(active, 0)}><Image src={story.image} alt={story.alt} fill sizes="(max-width: 767px) calc(100vw - 48px), 480px" className="object-cover"/></div>)}
        <figcaption>Four moments. One money story.</figcaption>
      </figure>
    </div>
  );
}
