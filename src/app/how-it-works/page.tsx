import styles from './page.module.css';

export default function HowItWorksPage() {
    return (
        <div className={`container ${styles.container}`}>
            <h1 className={styles.title}>How Chetna Works</h1>

            <section className={styles.timeline}>
                <div className={styles.step}>
                    <div className={styles.marker}>1</div>
                    <div className={styles.content}>
                        <h3>Calculation</h3>
                        <p>We use the Sidereal Zodiac (Lahiri Ayanamsa) to calculate your exact planetary positions. This is the traditional Vedic system, known for its precision in timing.</p>
                    </div>
                </div>

                <div className={styles.step}>
                    <div className={styles.marker}>2</div>
                    <div className={styles.content}>
                        <h3>Pattern Recognition</h3>
                        <p>Instead of &quot;good&quot; or &quot;bad&quot; signs, we look for patterns. A specific alignment might indicate &quot;high energy&quot; which could manifest as either productivity (positive) or conflict (negative), depending on your awareness.</p>
                    </div>
                </div>

                <div className={styles.step}>
                    <div className={styles.marker}>3</div>
                    <div className={styles.content}>
                        <h3>Timing as Seasons</h3>
                        <p>We map your &quot;Dashas&quot; (planetary periods) as seasons. You wouldn&apos;t plant seeds in winter. Similarly, we help you understand when to act and when to rest.</p>
                    </div>
                </div>

                <div className={styles.step}>
                    <div className={styles.marker}>4</div>
                    <div className={styles.content}>
                        <h3>Your Choice</h3>
                        <p>The stars show the terrain, you drive the car. Our goal is to give you a map so you can navigate the terrain with less friction and more grace.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
