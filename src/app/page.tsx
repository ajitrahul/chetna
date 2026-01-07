'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import styles from './page.module.css';
import { ArrowRight, TrendingUp, Clock, Heart, Calendar, Sparkles, Compass, MessageSquare, Eye, ShieldCheck } from 'lucide-react';
import AIClaritySearchBar from '@/components/AIClaritySearchBar';
import EnergyWidget from '@/components/EnergyWidget';
import JournalWidget from '@/components/JournalWidget';
import PanchangWidget from '@/components/PanchangWidget';
import { useProfile } from '@/context/ProfileContext';

export default function Home() {
  const { data: session, status } = useSession();
  const { openNewProfileModal } = useProfile();
  const isLoggedIn = status === 'authenticated';

  return (
    <main className={styles.main}>
      {isLoggedIn ? (
        <section className={styles.dashboard}>
          <div className={styles.dashboardGrid}>
            <div className={styles.dashboardHeader}>
              <div>
                <h1 className={styles.welcomeText}>
                  Welcome back, <span className={styles.userName}>{session?.user?.name?.split(' ')[0]}</span>
                </h1>
                <p className={styles.dashboardSubtitle}>
                  Observe your patterns and act with awareness today.
                </p>
              </div>
              <Link href="/dashboard" className={styles.primaryBtnSmall}>
                Go to Dashboard <ArrowRight size={16} />
              </Link>
            </div>

            <div className={styles.widgetGrid}>
              <div className={styles.mainColumn}>
                <EnergyWidget />
                <PanchangWidget />
                <JournalWidget />
              </div>

              <div className={styles.sideColumn}>
                <div className={styles.quickLinks}>
                  <Link href="/chart" className={styles.quickLinkItem}>
                    <TrendingUp size={24} color="var(--accent-gold)" />
                    <span>Explore Your Chart</span>
                    <ArrowRight size={16} />
                  </Link>
                  <Link href="/timing" className={styles.quickLinkItem}>
                    <Clock size={24} color="var(--accent-gold)" />
                    <span>View Your Timeline</span>
                    <ArrowRight size={16} />
                  </Link>
                  <Link href="/clarity" className={styles.quickLinkItem}>
                    <MessageSquare size={24} color="var(--accent-gold)" />
                    <span>Ask for Clarity</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* New Redesigned Hero Section for Guests */
        <>
          <div className={styles.bgWrapper}>
            <section className={styles.hero}>
              <div className={styles.heroContainer}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1 }}
                >
                  <h1 className={styles.heroTitle}>
                    Astrology for Awareness,<br />Not Prediction
                  </h1>
                  <div className={styles.heroContent}>
                    <p className={styles.heroSubtitle}>
                      Chetna is a clarity-first astrology platform that helps you understand patterns, timing, and tendencies in your life — so you can make grounded, conscious choices.
                    </p>
                    <p className={styles.heroDescription}>
                      Chetna includes an AI-guided reflection tool where you can explore questions about relationships, career, and life patterns — using astrology as a lens, not a verdict.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  className={styles.quoteSection}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 1 }}
                  viewport={{ once: true }}
                >
                  <p className={styles.quote}>
                    &ldquo;Astrology should increase clarity, responsibility, and self-respect—not fear, dependence, or fantasy.&rdquo;
                  </p>

                  <div className={styles.heroActions}>
                    <Link href="/clarity" className={styles.primaryBtn}>
                      Ask a Reflective Question
                    </Link>
                    <Link href="/chart" className={styles.secondaryBtn}>
                      Explore My Birth Chart
                    </Link>
                  </div>
                </motion.div>
              </div>
            </section>
          </div>

          <section id="how-it-works" className={styles.howItWorks + " section-anchor"}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>How Chetna Works</h2>
            </div>

            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={`${styles.featureIcon} ${styles.iconColors}`}>
                  <Calendar size={28} />
                </div>
                <h3 className={styles.featureTitle}>Explore Your Story</h3>
                <p className={styles.featureText}>
                  We generate your birth chart using accurate astronomical calculations. It tells your blueprint of life. Personality, appearance etc.
                </p>
              </div>

              <div className={styles.featureCard}>
                <div className={`${styles.featureIcon} ${styles.iconColors}`} style={{ background: 'rgba(var(--foreground-rgb), 0.05)', color: 'var(--primary)' }}>
                  <Sparkles size={28} />
                </div>
                <h3 className={styles.featureTitle}>Understand Patterns, Not Outcomes</h3>
                <p className={styles.featureText}>
                  Your chart is explained through psychological and behavioral patterns, how you respond to situations, what themes repeat in your life, what kinds of environments support you.
                </p>
              </div>

              <div className={styles.featureCard}>
                <div className={`${styles.featureIcon} ${styles.iconColors}`} style={{ background: 'rgba(var(--foreground-rgb), 0.05)', color: 'var(--primary)' }}>
                  <Compass size={28} />
                </div>
                <h3 className={styles.featureTitle}>Life Focus Reports</h3>
                <p className={styles.featureText}>
                  Awareness based insights for specific areas of life drawn from multiple charts layers. Without predictions or fear.
                </p>
              </div>

              <div className={styles.featureCard}>
                <div className={`${styles.featureIcon} ${styles.iconColors}`} style={{ background: 'rgba(var(--foreground-rgb), 0.05)', color: 'var(--primary)' }}>
                  <Clock size={28} />
                </div>
                <h3 className={styles.featureTitle}>Explore Timing Through Dasha & Transit</h3>
                <p className={styles.featureText}>
                  Chetna explains dasha and transit as capacity windows — what this phase supports, what it resists, where patience or effort is required.
                </p>
              </div>

              <div className={styles.featureCard}>
                <div className={`${styles.featureIcon} ${styles.iconColors}`} style={{ background: 'rgba(var(--foreground-rgb), 0.05)', color: 'var(--primary)' }}>
                  <MessageSquare size={28} />
                </div>
                <h3 className={styles.featureTitle}>Ask Reflective Questions with AI</h3>
                <p className={styles.featureText}>
                  You can ask focused questions related to — relationships, career, difficult decisions, personal growth.
                </p>
              </div>
            </div>


          </section>

          <section className={styles.philosophySection}>
            <div className={styles.philosophyHeader}>
              <h2 className={styles.philosophyMainTitle}>Our Philosophy</h2>
            </div>

            <div className={styles.philosophyContent}>
              <div className={styles.philosophyPart}>
                <div className={styles.philosophyIcon}>
                  <Eye size={32} />
                </div>
                <h3 className={styles.philosophyTitle}>About Chetna</h3>
                <p className={styles.philosophyText}>
                  Chetna was created with a simple belief: Astrology should help people become clearer, calmer, and more responsible — not more confused.
                </p>
                <p className={styles.philosophyText}>
                  In a world full of prediction-heavy astrology, Chetna offers a different approach.
                </p>
              </div>

              <div className={styles.separator}></div>

              <div className={styles.philosophyPart}>
                <div className={styles.philosophyIcon}>
                  <ShieldCheck size={32} />
                </div>
                <h3 className={styles.philosophyTitle}>Chetna does not:</h3>
                <ul className={styles.doesNotList}>
                  <li className={styles.doesNotItem}>Use fear-based astrology to influence decisions</li>
                  <li className={styles.doesNotItem}>Force or prescribe remedies, rituals</li>
                  <li className={styles.doesNotItem}>Tell you what will or won’t happen in your life</li>
                  <li className={styles.doesNotItem}>Label time periods as good or bad</li>
                </ul>
                <p className={styles.doesNotSummary}>
                  Instead of predicting outcomes, Chetna supports understanding—of patterns, responses, and inner awareness.
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
