'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './page.module.css';
import EnergyWidget from '@/components/EnergyWidget';
import JournalWidget from '@/components/JournalWidget';
import clsx from 'clsx';
import { ArrowRight, Moon, Sparkles, Activity } from 'lucide-react';

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}></div>

        <div className="container">
          <div className={styles.heroContent}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className={styles.widgetColumn}
            >
              <EnergyWidget />
              <div className={styles.journalWrapper}>
                <JournalWidget />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={styles.textColumn}
            >
              <span className={styles.eyebrow}>
                <Sparkles size={16} className={styles.iconGold} />
                Cosmic Awareness
              </span>
              <h1 className={styles.headline}>
                Understand your patterns,<br />
                <span className="text-gradient-gold">not just your future.</span>
              </h1>
              <p className={styles.subtext}>
                Chetna moves beyond fear-based predictions. We use the sky as a mirror for your psychology, helping you navigate timing with grace and intention.
              </p>

              <div className={styles.ctaGroup}>
                <Link href="/chart" className={clsx(styles.cta, styles.primaryCta)}>
                  Generate My Chart <ArrowRight size={18} />
                </Link>
                <Link href="/how-it-works" className={clsx(styles.cta, styles.secondaryCta)}>
                  Our Philosophy
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className={styles.features}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className={styles.sectionHeader}
          >
            <h2>Astrology for the Soul</h2>
            <p>Tools designed to deepen your self-understanding.</p>
          </motion.div>

          <div className={styles.grid}>
            {/* Feature 1 */}
            <div className={styles.featureCard}>
              <div className={styles.iconBox}><Activity size={24} color="var(--accent-gold)" /></div>
              <h3>Dasha Seasons</h3>
              <p>View your life in chapters. Understand why some periods ask for action, and others for rest.</p>
            </div>

            {/* Feature 2 */}
            <div className={styles.featureCard}>
              <div className={styles.iconBox}><Moon size={24} color="var(--accent-gold)" /></div>
              <h3>Emotional Patterns</h3>
              <p>Map your Moon sign to your subconscious reactions. Learn to pause before you react.</p>
            </div>

            {/* Feature 3 */}
            <div className={styles.featureCard}>
              <div className={styles.iconBox}><Sparkles size={24} color="var(--accent-gold)" /></div>
              <h3>Conscious Synastry</h3>
              <p>Relationship analysis that focuses on growth opportunities rather than simple compatibility scores.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
