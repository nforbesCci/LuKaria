'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useBookingUrl, DEFAULT_BOOKING_URL } from '../../hooks/useBookingUrl';
import styles from './home-static.module.css';

const SLIDES = [
  { src: '/images/weightloss3_16x9.webp', alt: 'Weight loss program slide 1' },
  { src: '/images/weightloss1_16x9.webp', alt: 'Weight loss program slide 2' },
  { src: '/images/weightloss2_16x9.webp', alt: 'Weight loss program slide 3' },
  {
    src: '/images/the-svelte-table.jpg',
    alt: 'The Svelte Table — GLP-1 friendly Jamaican food by Dr. Kadria Fairclough',
    contain: true,
  },
];

/** Full-viewport opener — background photo carousel, Svelte wordmark + tagline. */
export default function HomeHeroBackdropStatic() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { bookingUrl } = useBookingUrl();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const showWordmark = !SLIDES[currentIndex].contain;

  return (
    <section
      className={`${styles.heroBackdrop} home-snap-section`}
      aria-label="Svelte by LuKaria — weight loss for Jamaica"
    >
      <div className={styles.heroBackdropImgHolder}>
        {SLIDES.map((slide, idx) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            fill
            priority={idx === 0}
            sizes="100vw"
            quality={72}
            className={slide.contain ? styles.heroBackdropImageContain : styles.heroBackdropImage}
            style={{ 
              opacity: currentIndex === idx ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
              zIndex: currentIndex === idx ? 1 : 0
            }}
          />
        ))}
      </div>
      <div
        className={styles.heroBackdropOverlay}
        aria-hidden
        style={{ opacity: showWordmark ? 1 : 0, transition: 'opacity 1s ease-in-out' }}
      />
      
      <div className={styles.heroBackdropDots}>
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            className={`${styles.heroBackdropDot} ${currentIndex === idx ? styles.heroBackdropDotActive : ''}`}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      <a
        className={styles.heroBackdropCta}
        href={bookingUrl || DEFAULT_BOOKING_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        Free consultation
      </a>
      <div
        className={styles.heroBackdropContent}
        style={{ opacity: showWordmark ? 1 : 0, transition: 'opacity 1s ease-in-out' }}
        aria-hidden={!showWordmark}
      >
        <p className={styles.heroBackdropSvelte}>Svelte</p>
        <p className={styles.heroBackdropTagline}>Weight loss built for Jamaica</p>
      </div>
    </section>
  );
}
