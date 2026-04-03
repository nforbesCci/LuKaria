import Image from 'next/image';
import styles from './home-ymyl.module.css';

const GLP1_CONSULT_IMAGE = '/images/Black_female_doctor_202604030404.jpeg';

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
              adults. They mimic or amplify signals your body already uses to regulate appetite and, for some drugs, blood sugar. In
              practice, many people feel full sooner, think about food less often, and find it easier to stick with the nutrition and
              movement habits their clinician recommends. Medications such as{' '}
              <span className={styles.strong}>semaglutide</span> and <span className={styles.strong}>tirzepatide</span> (and brand
              names you may know, like Ozempic, Wegovy, or Mounjaro) are not “shortcuts”; they are tools used together with diet,
              activity, and medical monitoring. They can have side effects— nausea, digestive upset, and rarer but serious risks—
              which is why they require a prescribing physician, informed consent, and follow-up. Dosing, titration, and whether a
              specific drug is right for you are clinical decisions, not marketing promises.
            </p>
          </div>
        </div>

        <h2 className={styles.yguideH2}>Why medical oversight matters</h2>
        <p>
          YMYL topics—your money and your life—are where Google and patients alike expect demonstrable expertise. Prescription
          weight-loss drugs affect hormones, digestion, and sometimes heart and metabolic risk. Self-directed use, overseas orders
          without examination, or “telehealth” with no meaningful follow-up increases harm. When comparing{' '}
          <span className={styles.strong}>weight loss Jamaica</span> clinics, look for clear physician leadership, published contact
          and practice information, informed consent, and pathways for urgent symptoms. Svelte by LuKaria is structured around
          physician-led decisions, patient education, and documented visits—not influencer-style before-and-after hype.
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
            <li>Drug names (e.g., Ozempic, Mounjaro, Wegovy) are examples; availability and labeling differ by jurisdiction.</li>
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
