import Image from 'next/image';
import styles from './home-static.module.css';

const PORTRAIT = '/images/kadia circular.jpeg';
/** Add MP3 (or M4A) for Safari — Ogg/Opus alone often won’t play in Safari/iOS. */
const RICHIE_B_AUDIO_BASE = 'Audio from kadria';
const RICHIE_B_AUDIO_MP3 = `/media/${encodeURIComponent(`${RICHIE_B_AUDIO_BASE}.mp3`)}`;
const RICHIE_B_AUDIO_OGA = `/media/${encodeURIComponent(`${RICHIE_B_AUDIO_BASE}.oga`)}`;

/** Server component — below hero, secondary image is not LCP */
export default function HomeMeetDoctorStatic() {
  return (
    <section className={`${styles.meet} home-snap-section`}>
      <div className={styles.meetInner}>
        <h2 className={styles.meetH2}>Meet Your Doctor</h2>
        <h3 className={styles.meetH3}>Dr. Kadria Fairclough, Bsc, BMedSci, MBBS, LMCC.</h3>
        <div className={styles.meetRow}>
          <div className={styles.meetSide}>
            <div className={styles.meetAvatar}>
              <Image
                src={PORTRAIT}
                alt="Dr. Kadria Fairclough, licensed physician"
                fill
                loading="lazy"
                decoding="async"
                sizes="(max-width: 600px) 220px, 240px"
                quality={80}
                style={{ objectFit: 'cover', objectPosition: 'center 15%' }}
              />
            </div>
            <div className={styles.socialRow}>
              <a
                className={styles.socialLink}
                href="https://www.instagram.com/thekadriafairclough"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Dr. Kadria Fairclough Instagram profile"
              >
                <svg
                  className={styles.socialIcon}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path
                    fill="currentColor"
                    d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                  />
                </svg>
              </a>
              <a
                className={styles.socialLink}
                href="https://jm.linkedin.com/in/kadria-fairclough-stone"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Dr. Kadria Fairclough LinkedIn profile"
              >
                <svg
                  className={styles.socialIcon}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path
                    fill="currentColor"
                    d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                  />
                </svg>
              </a>
            </div>
          </div>
          <div className={styles.meetCopy}>
            <p className={styles.meetBody}>
              Dr. Kadria Fairclough is a licensed physician with over 15 years of experience helping
              patients achieve their health and wellness goals. At Svelte by LuKaria, she specializes in
              medically supervised weight loss and GLP-1 treatments ensuring safe, effective, and
              personalized care.
            </p>
            <div className={styles.meetMedia}>
              <p className={styles.meetMediaCaption}>
                Hear Dr. Fairclough from Richie B Morning show on December 20, 2024.
              </p>
              <audio className={styles.meetAudio} controls preload="none">
                <source src={RICHIE_B_AUDIO_OGA} type="audio/ogg" />
                <source src={RICHIE_B_AUDIO_MP3} type="audio/mpeg" />
                Your browser does not support embedded audio.
              </audio>
              <div className={styles.meetVideoRow}>
                <a
                  href="https://www.facebook.com/reel/572700465770089"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.meetVideoLink}
                  aria-label="Watch Dr. Fairclough speaking for Massy Pharmaceuticals Jamaica on Facebook"
                >
                  <svg
                    className={styles.meetVideoIcon}
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden
                  >
                    <path
                      fill="currentColor"
                      d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"
                    />
                  </svg>
                  <span>Dr. Fairclough speaking for Massy Pharmaceuticals Jamaica.</span>
                </a>
              </div>
              <a href="/about" className={styles.meetLearnBtn}>
                Learn more
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
