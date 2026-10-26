import BookCarousel from '../BookCarousel';
import styles from './home-static.module.css';

const AMAZON_URL = 'https://a.co/d/0as3nikh';

/** Book carousel under the home opener, with the Amazon link beside it. */
export default function HomeBookPromo() {
  return (
    <section className={`${styles.bookPromo} home-snap-section`} aria-label="The Svelte Table cookbook">
      <div className={styles.bookPromoMedia}>
        <BookCarousel sizes="(max-width: 900px) 92vw, 400px" />
      </div>
      <div className={styles.bookPromoCopy}>
        <h2 className={styles.bookPromoTitle}>The Svelte Table</h2>
        <p className={styles.bookPromoLead}>
          A luxuriously Jamaican cookbook by Dr. Kadria Fairclough. Familiar island food from the Svelte by LuKaria
          kitchen, including meals shaped for anyone on a GLP-1 medication. The book is available now.
        </p>
        <a className={styles.heroCta} href={AMAZON_URL} target="_blank" rel="noopener noreferrer">
          Available now on Amazon
        </a>
      </div>
    </section>
  );
}
