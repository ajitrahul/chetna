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
import CosmicMandala from '@/components/CosmicMandala';
import { useProfile } from '@/context/ProfileContext';

// Zodiac signs with their Sanskrit names and glyphs
const ZODIAC_SIGNS = [
  { glyph: '♈', name: 'Mesha', en: 'Aries' },
  { glyph: '♉', name: 'Vrishabha', en: 'Taurus' },
  { glyph: '♊', name: 'Mithuna', en: 'Gemini' },
  { glyph: '♋', name: 'Karka', en: 'Cancer' },
  { glyph: '♌', name: 'Simha', en: 'Leo' },
  { glyph: '♍', name: 'Kanya', en: 'Virgo' },
  { glyph: '♎', name: 'Tula', en: 'Libra' },
  { glyph: '♏', name: 'Vrishchika', en: 'Scorpio' },
  { glyph: '♐', name: 'Dhanu', en: 'Sagittarius' },
  { glyph: '♑', name: 'Makara', en: 'Capricorn' },
  { glyph: '♒', name: 'Kumbha', en: 'Aquarius' },
  { glyph: '♓', name: 'Meena', en: 'Pisces' },
];

// Navagraha – the 9 Vedic planets
const NAVAGRAHA = [
  { glyph: '☉', name: 'Surya', en: 'Sun' },
  { glyph: '☽', name: 'Chandra', en: 'Moon' },
  { glyph: '♂', name: 'Mangala', en: 'Mars' },
  { glyph: '☿', name: 'Budha', en: 'Mercury' },
  { glyph: '♃', name: 'Guru', en: 'Jupiter' },
  { glyph: '♀', name: 'Shukra', en: 'Venus' },
  { glyph: '♄', name: 'Shani', en: 'Saturn' },
  { glyph: '☊', name: 'Rahu', en: 'North Node' },
  { glyph: '☋', name: 'Ketu', en: 'South Node' },
];

export default function Home() {
  const { data: session, status } = useSession();
  const { openNewProfileModal } = useProfile();
  const isLoggedIn = status === 'authenticated';

  return (
    <main className={styles.main}>
      {isLoggedIn ? (
        <section className={styles.dashboard}>
          <div className={styles.dashboardGrid}>
            {/* Mandala watermark for logged-in home too */}
            <div className={styles.dashboardMandalaBg} aria-hidden="true">
              <CosmicMandala size={500} opacity={0.05} animate />
            </div>
            <div className={styles.dashboardHeader}>
              <div>
                <span className="cosmic-label">✦ Namaste</span>
                <h1 className={styles.welcomeText}>
                  Welcome back, <span className={styles.userName}>{session?.user?.name?.split(' ')[0] || 'Seeker'}</span>
                </h1>
                <p className={styles.dashboardSubtitle}>
                  Observe your patterns and act with awareness today.
                </p>
              </div>
              <Link href="/dashboard" className={styles.primaryBtnSmall}>
                Dashboard <ArrowRight size={16} />
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
        <>
          {/* ═══════════════════════════════════
              HERO SECTION with Mandala + Zodiac Wheel
              ═══════════════════════════════════ */}
          <div className={styles.bgWrapper}>
            <section className={styles.hero}>
              {/* Rotating mandala watermark */}
              <div className={styles.mandalaHero} aria-hidden="true">
                <CosmicMandala size={700} opacity={0.1} animate />
              </div>

              <div className={styles.heroContainer}>
                {/* Vedic cosmic label */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className={styles.heroLabel}
                >
                  <span className="cosmic-label">✦ Jyotish Vidya · Vedic Astrology ✦</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.2 }}
                >
                  <h1 className={styles.heroTitle}>
                    Astrology for Awareness,<br />Not Prediction
                  </h1>
                  <div className={styles.heroContent}>
                    <p className={styles.heroSubtitle}>
                      AskChetna is a clarity-first astrology platform that helps you understand patterns, timing, and tendencies in your life — so you can make grounded, conscious choices.
                    </p>
                    <p className={styles.heroDescription}>
                      AskChetna includes an AI-guided reflection tool where you can explore questions about relationships, career, and life patterns — using astrology as a lens, not a verdict.
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
                    <Link href="/clarity" className="primary-btn-cosmic">
                      ✦ Ask a Reflective Question
                    </Link>
                    <Link href="/chart" className="secondary-btn-cosmic">
                      Explore My Birth Chart
                    </Link>
                  </div>
                </motion.div>

                {/* Navagraha planet symbols strip */}
                <motion.div
                  className={styles.navagrahaStrip}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 1 }}
                  viewport={{ once: true }}
                >
                  {NAVAGRAHA.map((planet) => (
                    <div key={planet.name} className={styles.navagrahaItem}>
                      <span className={styles.planetGlyph}>{planet.glyph}</span>
                      <span className={styles.planetSanskrit}>{planet.name}</span>
                    </div>
                  ))}
                </motion.div>
              </div>
            </section>
          </div>

          {/* ═══════════════════════════════════
              ZODIAC WHEEL ROW
              ═══════════════════════════════════ */}
          <section className={styles.zodiacSection}>
            <div className={styles.zodiacScroll}>
              {[...ZODIAC_SIGNS, ...ZODIAC_SIGNS].map((sign, i) => (
                <div key={`${sign.name}-${i}`} className={styles.zodiacItem}>
                  <span className={styles.zodiacGlyph}>{sign.glyph}</span>
                  <span className={styles.zodiacSanskrit}>{sign.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ═══════════════════════════════════
              HOW IT WORKS
              ═══════════════════════════════════ */}
          <section id="how-it-works" className={styles.howItWorks + " section-anchor"}>
            <div className={styles.sectionHeader}>
              <span className="cosmic-label">❋ Sadhana · The Practice ❋</span>
              <h2 className="mystic-text">How AskChetna Works</h2>
              <div className="sacred-divider"></div>
            </div>

            <div className={styles.featuresGrid}>
              <motion.div 
                className={`${styles.featureCard} ${styles.cardLeft} sacred-card`}
                initial={{ opacity: 0, x: -50, y: 50 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className={`${styles.featureIcon} ${styles.iconColors}`}>
                  <span className="planet-glyph">☉</span>
                </div>
                <h3 className={styles.featureTitle}>Explore Your Story</h3>
                <p className={styles.featureText}>
                  We generate your birth chart using accurate astronomical calculations. It tells your blueprint of life. Personality, appearance etc.
                </p>
              </motion.div>

              <motion.div 
                className={`${styles.featureCard} ${styles.cardRight} sacred-card`}
                initial={{ opacity: 0, x: 50, y: 50 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className={`${styles.featureIcon} ${styles.iconColors}`}>
                  <span className="planet-glyph">☽</span>
                </div>
                <h3 className={styles.featureTitle}>Understand Patterns, Not Outcomes</h3>
                <p className={styles.featureText}>
                  Your chart is explained through psychological and behavioral patterns, how you respond to situations, what themes repeat in your life.
                </p>
              </motion.div>

              <motion.div 
                className={`${styles.featureCard} ${styles.cardLeft} sacred-card`}
                initial={{ opacity: 0, x: -50, y: 50 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className={`${styles.featureIcon} ${styles.iconColors}`}>
                  <span className="planet-glyph">♃</span>
                </div>
                <h3 className={styles.featureTitle}>Life Focus Reports</h3>
                <p className={styles.featureText}>
                  Awareness based insights for specific areas of life drawn from multiple chart layers. Without predictions or fear.
                </p>
              </motion.div>

              <motion.div 
                className={`${styles.featureCard} ${styles.cardRight} sacred-card`}
                initial={{ opacity: 0, x: 50, y: 50 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className={`${styles.featureIcon} ${styles.iconColors}`}>
                  <span className="planet-glyph">♄</span>
                </div>
                <h3 className={styles.featureTitle}>Timing Through Dasha</h3>
                <p className={styles.featureText}>
                  AskChetna explains dasha and transit as capacity windows — what this phase supports, what it resists, where patience or effort is required.
                </p>
              </motion.div>

              <motion.div 
                className={`${styles.featureCard} ${styles.cardCenter} sacred-card`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className={`${styles.featureIcon} ${styles.iconColors}`}>
                  <span className="planet-glyph">☿</span>
                </div>
                <h3 className={styles.featureTitle}>Ask Reflective Questions with AI</h3>
                <p className={styles.featureText}>
                  You can ask focused questions related to — relationships, career, difficult decisions, personal growth.
                </p>
              </motion.div>
            </div>
          </section>

          {/* ═══════════════════════════════════
              PHILOSOPHY SECTION
              ═══════════════════════════════════ */}
          <section className={styles.philosophySection}>
            <div className={styles.philosophyHeader}>
              <span className="cosmic-label">❋ Darshana · Our Vision ❋</span>
              <h2 className={styles.philosophyMainTitle}>Our Philosophy</h2>
              <div className="sacred-divider"></div>
            </div>

            <div className={styles.philosophyContent}>
              <div className={styles.philosophyPart}>
                <div className={styles.philosophyIcon}>
                  <span className="planet-glyph" style={{ fontSize: '2rem' }}>♀</span>
                </div>
                <h3 className={styles.philosophyTitle}>About AskChetna</h3>
                <p className={styles.philosophyText}>
                  AskChetna was created with a simple belief: Astrology should help people become clearer, calmer, and more responsible — not more confused.
                </p>
                <p className={styles.philosophyText}>
                  In a world full of prediction-heavy astrology, AskChetna offers a different approach.
                </p>
              </div>

              <div className={styles.separator}></div>

              <div className={styles.philosophyPart}>
                <div className={styles.philosophyIcon}>
                  <span className="planet-glyph" style={{ fontSize: '2rem' }}>☊</span>
                </div>
                <h3 className={styles.philosophyTitle}>AskChetna does not:</h3>
                <ul className={styles.doesNotList}>
                  <li className={styles.doesNotItem}>Use fear-based astrology to influence decisions</li>
                  <li className={styles.doesNotItem}>Force or prescribe remedies, rituals</li>
                  <li className={styles.doesNotItem}>Tell you what will or won't happen in your life</li>
                  <li className={styles.doesNotItem}>Label time periods as good or bad</li>
                </ul>
                <p className={styles.doesNotSummary}>
                  Instead of predicting outcomes, AskChetna supports understanding—of patterns, responses, and inner awareness.
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
