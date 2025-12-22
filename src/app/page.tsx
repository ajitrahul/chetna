'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './page.module.css';
import { ArrowRight, TrendingUp, Clock, Heart } from 'lucide-react';

export default function Home() {
  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={styles.heroContent}
          >
            <h1 className={styles.heroTitle}>
              Astrology for<br />
              <span className={styles.highlight}>Awareness</span>,<br />
              Not Prediction
            </h1>
            <p className={styles.heroSubtitle}>
              Chetna helps you understand patterns, timing, and tendencies in your chart so you can make grounded, responsible choices.
            </p>
            <div className={styles.heroActions}>
              <Link href="/chart" className={styles.primaryBtn}>
                Generate My Chart <ArrowRight size={20} />
              </Link>
              <Link href="/how-it-works" className={styles.secondaryBtn}>
                Learn How It Works
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={styles.heroImage}
          >
            <div className={styles.chartPreview}>
              <div className={styles.chartCircle}>
                <div className={styles.chartInner}></div>
              </div>
              <p className={styles.chartLabel}>Your Vedic Chart</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.featuresContainer}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={styles.featureCard}
          >
            <div className={styles.featureIcon}>
              <TrendingUp size={32} />
            </div>
            <h3 className={styles.featureTitle}>Explains Patterns</h3>
            <p className={styles.featureText}>
              Astrology is presented as recurring psychological and situational patterns — not fixed outcomes.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={styles.featureCard}
          >
            <div className={styles.featureIcon}>
              <Clock size={32} />
            </div>
            <h3 className={styles.featureTitle}>Shows Timing as Capacity</h3>
            <p className={styles.featureText}>
              Dashas and phases are explained as periods of readiness or resistance, helping you work with the tide.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={styles.featureCard}
          >
            <div className={styles.featureIcon}>
              <Heart size={32} />
            </div>
            <h3 className={styles.featureTitle}>Supports Free Will</h3>
            <p className={styles.featureText}>
              Every insight includes guidance, not commands. You remain the architect of your own response.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What We Don't Do Section */}
      <section className={styles.notDoSection}>
        <div className={styles.notDoContainer}>
          <h2 className={styles.notDoTitle}>
            What Chetna Does <span className={styles.notHighlight}>NOT</span> Do
          </h2>
          <div className={styles.notDoGrid}>
            <div className={styles.notDoItem}>✕ No daily predictions</div>
            <div className={styles.notDoItem}>✕ No fear-based astrology</div>
            <div className={styles.notDoItem}>✕ No guarantees or verdicts</div>
            <div className={styles.notDoItem}>✕ No emotional dependency models</div>
          </div>
        </div>
      </section>
    </main>
  );
}
