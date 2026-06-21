import Image from 'next/image';
import styles from './home-static.module.css';

const PORTRAIT = '/images/Kadria business.webp';

/** Server component — ships in RSC payload for faster LCP */
export default function HomeHeroStatic() {
  return (
    <section className={`${styles.hero} home-snap-section`}>
      <div className={styles.heroCopy}>
        <h1 className={styles.heroH1}>
          Medically Supervised Weight Loss delivered to you virtually.
        </h1>
        <p className={styles.heroLead}>
          Effective, physician-guided weight loss, including the use of GLP-1 medications (Semaglutide/Ozempic and Tirzepatide/Mounjaro). No waiting rooms, no pharmacies—structured virtual care on your terms.
        </p>
        <a
          className={styles.heroCta}
          href="https://calendly.com/kadriaf-lukariagroup/30min"
          target="_blank"
          rel="noopener noreferrer"
        >
          Start Your Svelte Journey
        </a>
        <span className={styles.heroCaption}>Free no obligation consultation</span>
        <p className={styles.heroTag}>Lose Weight & Feel Your Best with Svelte by LuKaria</p>
      </div>
      <div className={styles.heroImageWrap}>
        <Image
          src={PORTRAIT}
          alt="Dr. Kadria Fairclough, physician for medical weight loss in Jamaica"
          width={400}
          height={400}
          loading="lazy"
          decoding="async"
          sizes="(max-width: 900px) min(100vw, 400px), 400px"
          quality={80}
          className={styles.heroImage}
        />
      </div>
    </section>
  );
}
