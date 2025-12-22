import BirthDataForm from '@/components/BirthDataForm';
import styles from './page.module.css';
import ChartDisplay from '@/components/ChartDisplay';

export default function ChartPage() {
    return (
        <div className={`container ${styles.pageContainer}`}>
            <h1 className={styles.title}>Explore Your Chart</h1>
            <p className={styles.subtitle}>
                Enter your birth details to uncover the patterns and timing in your life.
            </p>

            <div className={styles.formWrapper}>
                <BirthDataForm />
            </div>

            <div className={styles.chartSection} style={{ marginTop: '60px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--primary)', fontSize: '2rem' }}>Your Chart Overlay</h2>
                <ChartDisplay />
            </div>
        </div>
    );
}
