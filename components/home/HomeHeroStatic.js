import Image from 'next/image';
import styles from './home-static.module.css';

const PORTRAIT = '/images/kadria_no_background.png';

/** Server component — ships in RSC payload for faster LCP */
export default function HomeHeroStatic() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <h1 className={styles.heroH1}>Medically Supervised Weight Loss</h1>
        <p className={styles.heroLead}>
            Effective, physician-guided weight loss, including the use of GLP-1 medications (Ozempic,
            Wegovy, Tirzepatide).
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
          priority
          sizes="(max-width: 900px) 100vw, 400px"
          className={styles.heroImage}
        />
      </div>
    </section>
  );
}
