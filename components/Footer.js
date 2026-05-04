import Link from 'next/link';
import styles from './footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        {/* Brand Column */}
        <div className={styles.brandCol}>
          <div className={styles.brandWordmark}>
            <span className={styles.svelte}>Svelte</span>
            <span className={styles.byLukaria}>by LuKaria</span>
          </div>
          <p className={styles.brandDesc}>
            Jamaica's premier virtual medically supervised weight loss authority. 
            Providing physician-guided care and GLP-1 treatments island-wide.
          </p>
          <div className={styles.contactInfo}>
            <a href="tel:+18762903659" className={styles.contactItem}>
              <span>+1 (876) 290-3659</span>
            </a>
            <a href="mailto:info@lukariagroup.com" className={styles.contactItem}>
              <span>info@lukariagroup.com</span>
            </a>
            <div className={styles.contactItem}>
              <span>Kingston, Jamaica</span>
            </div>
          </div>
        </div>

        {/* Svelte Program Column */}
        <div className={styles.linkCol}>
          <h4 className={styles.colTitle}>The Program</h4>
          <nav className={styles.linkList}>
            <Link href="/glp-1" className={styles.footerLink}>GLP-1 Weight Loss</Link>
            <Link href="/faq" className={styles.footerLink}>Common Questions</Link>
            <Link href="/testimonials" className={styles.footerLink}>Patient Stories</Link>
            <Link href="/blog" className={styles.footerLink}>Insights & Tips</Link>
          </nav>
        </div>

        {/* Company Column */}
        <div className={styles.linkCol}>
          <h4 className={styles.colTitle}>Company</h4>
          <nav className={styles.linkList}>
            <Link href="/about" className={styles.footerLink}>About Dr. Fairclough</Link>
            <Link href="/contact" className={styles.footerLink}>Contact Us</Link>
            <Link href="/privacy-policy" className={styles.footerLink}>Privacy Policy</Link>
            <Link href="/terms" className={styles.footerLink}>Terms of Service</Link>
          </nav>
        </div>

        {/* Journey Column */}
        <div className={styles.linkCol}>
          <h4 className={styles.colTitle}>Your Journey</h4>
          <nav className={styles.linkList}>
            <Link href="/api/auth/login" className={styles.footerLink}>Sign In / Register</Link>
            <Link href="/dashboard" className={styles.footerLink}>My Portal</Link>
            <Link href="https://calendly.com/kadriaf-lukariagroup/30min" target="_blank" className={styles.footerLink}>
              Free Consultation
            </Link>
          </nav>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.maxWrap}>
          <span>© {new Date().getFullYear()} Svelte by LuKaria. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}

