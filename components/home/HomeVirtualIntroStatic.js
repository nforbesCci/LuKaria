import Image from 'next/image';
import styles from './home-static.module.css';
import ymyl from './home-ymyl.module.css';

const PHOTO = '/images/WhatsApp Image 2026-06-14 at 11.58.55 AM.webp';

/**
 * Standalone viewport-height intro: “what is virtual supervised care in Jamaica” + lifestyle photo (server component).
 */
export default function HomeVirtualIntroStatic() {
  return (
    <section
      className={`${styles.virtualIntro} home-snap-section`}
      aria-labelledby="ymyl-main-heading"
    >
      <div className={styles.virtualIntroInner}>
        <div className={styles.virtualIntroCopy}>
          <h2 id="ymyl-main-heading" className={styles.virtualIntroH2}>
            What is medically supervised weight loss in Jamaica, delivered virtually?
          </h2>
          <p className={styles.virtualIntroLead}>
            Choosing our{' '}
            <span className={ymyl.strong}>&ldquo;Weight loss Jamaica program&rdquo;</span> is a serious health decision. Svelte by
            LuKaria exists so persons across the island can access physician-supervised care—not generic advice or unsupervised
            medication orders. Dr. Kadria Fairclough evaluates your history, discusses risks and benefits, and builds a plan that
            reflects your goals, your medical profile, and what is appropriate in a telehealth setting. This guide explains, in plain
            language, how GLP-1–based therapies combined with healthy habits help us achieve your goal. We discuss who may be a good
            candidate, and how our virtual program is structured from first contact to ongoing follow-up.
          </p>
        </div>
        <div className={styles.virtualIntroImageWrap}>
          <Image
            src={PHOTO}
            alt="Woman at home with GLP-1 medication supplies, illustrating virtually delivered medically supervised weight loss"
            width={520}
            height={650}
            loading="lazy"
            decoding="async"
            sizes="(max-width: 767px) min(100vw, 520px), (max-width: 1100px) 42vw, 480px"
            quality={75}
            className={styles.virtualIntroImage}
          />
        </div>
      </div>
    </section>
  );
}
