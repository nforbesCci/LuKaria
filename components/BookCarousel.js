'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './book-carousel.module.css';

const SLIDES = [
  {
    src: '/images/books/svelte-table-1.jpg',
    alt: 'Introducing The Svelte Table, GLP-1 friendly Jamaican food by Dr. Kadria Fairclough',
  },
  {
    src: '/images/books/svelte-table-2.jpg',
    alt: 'The Svelte Table cookbook cover, a luxuriously Jamaican cookbook by Dr. Kadria Fairclough',
  },
  {
    src: '/images/books/svelte-table-3.jpg',
    alt: 'Peanut-Punch Protein Smoothie from The Svelte Table',
  },
  {
    src: '/images/books/svelte-table-4.jpg',
    alt: 'Protein-boosted cornmeal porridge from The Svelte Table',
  },
  {
    src: '/images/books/svelte-table-5.jpg',
    alt: 'High-protein red peas soup from The Svelte Table',
  },
  {
    src: '/images/books/svelte-table-6.jpg',
    alt: 'Steamed kingfish with herb-pickled vegetables from The Svelte Table',
  },
  {
    src: '/images/books/svelte-table-7.jpg',
    alt: 'Coconut-vanilla panna cotta from The Svelte Table',
  },
];

export default function BookCarousel({ sizes = '(max-width: 900px) 100vw, 520px', priorityFirst = false }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const goTo = (index) => {
    setCurrentIndex((index + SLIDES.length) % SLIDES.length);
  };

  const onTouchStart = (event) => {
    touchStartX.current = event.changedTouches[0].clientX;
  };

  const onTouchEnd = (event) => {
    if (touchStartX.current == null) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (delta > 40) goTo(currentIndex - 1);
    else if (delta < -40) goTo(currentIndex + 1);
  };

  return (
    <section className={styles.carousel} aria-roledescription="carousel" aria-label="The Svelte Table">
      <div className={styles.frame} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {SLIDES.map((slide, idx) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            fill
            priority={priorityFirst && idx === 0}
            sizes={sizes}
            quality={75}
            className={styles.slide}
            style={{
              opacity: currentIndex === idx ? 1 : 0,
              transition: 'opacity 0.6s ease',
              zIndex: currentIndex === idx ? 1 : 0,
            }}
          />
        ))}
      </div>
      <div className={styles.controls}>
        <button type="button" className={styles.arrow} onClick={() => goTo(currentIndex - 1)} aria-label="Previous slide">
          ‹
        </button>
        <div className={styles.dots}>
          {SLIDES.map((slide, idx) => (
            <button
              key={slide.src}
              type="button"
              className={`${styles.dot} ${currentIndex === idx ? styles.dotActive : ''}`}
              onClick={() => goTo(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              aria-current={currentIndex === idx ? 'true' : undefined}
            />
          ))}
        </div>
        <button type="button" className={styles.arrow} onClick={() => goTo(currentIndex + 1)} aria-label="Next slide">
          ›
        </button>
      </div>
      <p className={styles.live} aria-live="polite">
        {`Slide ${currentIndex + 1} of ${SLIDES.length}. ${SLIDES[currentIndex].alt}`}
      </p>
    </section>
  );
}
