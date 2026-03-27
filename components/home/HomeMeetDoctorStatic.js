import Image from 'next/image';
import styles from './home-static.module.css';

const PORTRAIT = '/images/kadria_no_background.png';

/** Server component — below hero, secondary image is not LCP */
export default function HomeMeetDoctorStatic() {
  return (
    <section className={styles.meet}>
      <div className={styles.meetInner}>
        <h2 className={styles.meetH2}>Meet Your Doctor</h2>
        <h3 className={styles.meetH3}>Dr. Kadria Fairclough, Bsc, BMedSci, MBBS, LMCC.</h3>
        <div className={styles.meetRow}>
          <div className={styles.meetAvatar}>
            <Image
              src={PORTRAIT}
              alt="Dr. Kadria Fairclough, licensed physician"
              fill
              sizes="(max-width: 600px) 220px, 240px"
              style={{ objectFit: 'cover', objectPosition: 'center 15%' }}
            />
          </div>
          <p className={styles.meetBody}>
            Dr. Kadria Fairclough is a licensed physician with over 15 years of experience helping
            patients achieve their health and wellness goals. At Svelte by LuKaria, she specializes in
            medically supervised weight loss and GLP-1 treatments ensuring safe, effective, and
            personalized care.
          </p>
        </div>
        <div className={styles.socialRow}>
          <a
            className={styles.socialLink}
            href="https://www.instagram.com/thekadriafairclough"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Dr. Kadria Fairclough Instagram profile"
          >
            Instagram
          </a>
          <a
            className={styles.socialLink}
            href="https://jm.linkedin.com/in/kadria-fairclough-stone"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Dr. Kadria Fairclough LinkedIn profile"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </section>
  );
}
