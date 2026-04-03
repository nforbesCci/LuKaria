import Image from 'next/image';
import styles from './home-static.module.css';

const BACKDROP = '/images/Black_people_construction_202604030253.jpeg';
const CALENDLY_URL = 'https://calendly.com/kadriaf-lukariagroup/30min';

/** Full-viewport opener — background photo, Svelte wordmark + tagline (server component). */
export default function HomeHeroBackdropStatic() {
  return (
    <section
      className={`${styles.heroBackdrop} home-snap-section`}
      aria-label="Svelte by LuKaria — weight loss for Jamaica"
    >
      <div className={styles.heroBackdropImgHolder}>
        <Image
          src={BACKDROP}
          alt="Professionals in construction, healthcare, and education on a busy street in Kingston, Jamaica"
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          quality={72}
          className={styles.heroBackdropImage}
        />
      </div>
      <div className={styles.heroBackdropOverlay} aria-hidden />
      <a
        className={styles.heroBackdropCta}
        href={CALENDLY_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        Free consultation
      </a>
      <div className={styles.heroBackdropContent}>
        <p className={styles.heroBackdropSvelte}>Svelte</p>
        <p className={styles.heroBackdropTagline}>Weight loss built for Jamaica</p>
      </div>
    </section>
  );
}
