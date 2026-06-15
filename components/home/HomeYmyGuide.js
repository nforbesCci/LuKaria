import Image from 'next/image';
import styles from './home-ymyl.module.css';

const GLP1_CONSULT_IMAGE = '/images/WhatsApp Image 2026-06-14 at 11.58.55 AM (1).jpeg';

/**
 * Physician-led YMYL homepage copy (crawlable in initial HTML).
 */
export default function HomeYmyGuide() {
  return (
    <section
      className={`${styles.yguide} home-snap-section`}
      aria-label="In-depth guide: GLP-1 therapy, eligibility, and virtual care in Jamaica"
    >
      <div className={styles.yguideInner}>
        <div className={styles.yguideSplit}>
          <div className={styles.yguideSplitFigure}>
            <Image
              src={GLP1_CONSULT_IMAGE}
              alt="Doctor explaining medical information to a patient during a consultation"
              width={420}
              height={520}
              loading="lazy"
              decoding="async"
              sizes="(max-width: 767px) min(100vw, 420px), (max-width: 1100px) 38vw, 420px"
              quality={75}
              className={styles.yguideSplitImage}
            />
          </div>
          <div className={styles.yguideSplitText}>
            <h2 className={styles.yguideH2}>How GLP-1 medications support weight loss (simple explanation)</h2>
            <p>
              GLP-1 (glucagon-like peptide-1) medicines are prescription drugs used for chronic weight management in selected
              adults. They mimic or amplify signals your body already uses to regulate appetite and blood sugar. They also slow down
              how quickly food leaves your stomach. In practice, this means many people feel full sooner, think about food less often,
              and find it easier to stick with the nutrition and movement habits their clinician recommends. Newer medications like{' '}
              <span className={styles.strong}>Tirzepatide</span> also help your body to release insulin more effectively thereby
              helping to stabilize blood sugar levels. <span className={styles.strong}>Semaglutide</span> and{' '}
              <span className={styles.strong}>Tirzepatide</span> (and brand names you may know, like Ozempic, Wegovy, Zepbound or
              Mounjaro) are not “shortcuts”; they are tools used together with diet, activity, and medical monitoring. They can have
              side effects, most commonly nausea and digestive upset. However, rare but serious side effects may occur. This is why
              they require a prescribing physician, informed consent, and follow-up.
            </p>
          </div>
        </div>

        <h2 className={styles.yguideH2}>Why medical oversight matters</h2>
        <p>
          Weight-loss medications like GLP-1s may impact overall health. Using them without proper medical guidance—through overseas
          orders, self-direction, or telehealth with little follow-up—can be risky. When choosing a weight-loss clinic in Jamaica,
          look for clear physician leadership, accessible practice information, informed consent, and a plan for urgent concerns.
          At Svelte by LuKaria, care is physician-led, educational, and documented, not based on social media hype.
        </p>

        <aside className={styles.disclaimer} aria-label="Medical disclaimer">
          <p className={styles.disclaimerTitle}>Medical disclaimer</p>
          <p>
            This website provides <span className={styles.strong}>general educational information only</span>. It is not a substitute
            for individualized medical advice, diagnosis, or treatment. Never disregard professional medical advice or delay seeking
            it because of something you read here. If you think you may have a medical emergency, call your local emergency services
            immediately.
          </p>
          <ul>
            <li>GLP-1 medications require a prescription and monitoring by a licensed clinician.</li>
            <li>Results vary; testimonials or examples do not predict your outcome.</li>
            <li>Drug names (e.g., Ozempic, Mounjaro, Wegovy, Zepbound) are examples; availability and labeling differ by jurisdiction.</li>
            <li>
              Telehealth has limits: some findings require in-person examination, imaging, or labs at a facility near you when your
              doctor orders them.
            </li>
          </ul>
          <p>
            By using this site or booking a consultation, you agree to provide accurate health information and to participate
            honestly in shared decision-making with your physician.
          </p>
        </aside>
      </div>
    </section>
  );
}
