"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollEngine() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Small delay to let DOM settle
    const raf = requestAnimationFrame(() => {
      initAnimations();
    });

    return () => {
      cancelAnimationFrame(raf);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return null;
}

function initAnimations() {
  /* ─── Scroll Progress Bar ─── */
  const progressBar = document.querySelector(".scroll-progress");
  if (progressBar) {
    gsap.to(progressBar, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 0.3,
      },
    });
  }

  /* ─── Hero Parallax ─── */
  const heroContent = document.querySelector(".hero-content");
  if (heroContent) {
    gsap.to(heroContent, {
      y: 120,
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 0.5,
      },
    });
  }

  const heroCanvas = document.querySelector(".hero-canvas-wrap");
  if (heroCanvas) {
    gsap.to(heroCanvas, {
      y: 60,
      scale: 1.1,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 0.5,
      },
    });
  }

  /* ─── Section Fade-Up Reveals ─── */
  document.querySelectorAll(".sr-fade").forEach((el) => {
    gsap.to(el, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        end: "top 60%",
        toggleActions: "play none none none",
      },
    });
  });

  document.querySelectorAll(".sr-scale").forEach((el) => {
    gsap.to(el, {
      scale: 1,
      opacity: 1,
      duration: 0.7,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });
  });

  /* ─── Bento Card Stagger ─── */
  const bentoCards = document.querySelectorAll(".bento-grid .glass-card");
  if (bentoCards.length) {
    gsap.fromTo(
      bentoCards,
      { y: 40, opacity: 0, rotateX: 3 },
      {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".bento-grid",
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );
  }

  /* ─── Timeline Items Sequential Reveal ─── */
  const timelineItems = document.querySelectorAll(".timeline-item");
  if (timelineItems.length) {
    timelineItems.forEach((item, i) => {
      gsap.fromTo(
        item,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: item,
            start: "top 82%",
            toggleActions: "play none none none",
          },
        }
      );
    });
  }

  /* ─── Metric Cards ─── */
  const metricCards = document.querySelectorAll(".metric-card");
  if (metricCards.length) {
    gsap.fromTo(
      metricCards,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".dashboard-grid",
          start: "top 82%",
          toggleActions: "play none none none",
        },
      }
    );
  }

  /* ─── Video Section Scale ─── */
  const videoContainer = document.querySelector(".video-container");
  if (videoContainer) {
    gsap.fromTo(
      videoContainer,
      { scale: 0.9, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: videoContainer,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );
  }

  /* ─── Section Heading Reveals ─── */
  document.querySelectorAll(".section-head").forEach((head) => {
    const tag = head.querySelector(".section-tag");
    const title = head.querySelector(".section-title");
    const desc = head.querySelector(".section-desc");

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: head,
        start: "top 82%",
        toggleActions: "play none none none",
      },
    });

    if (tag) tl.fromTo(tag, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" });
    if (title) tl.fromTo(title, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }, "-=0.2");
    if (desc) tl.fromTo(desc, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }, "-=0.2");
  });
}
