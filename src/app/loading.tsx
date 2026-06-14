import styles from './system.module.css';

export default function Loading() {
    return (
        <main className={styles.wrap}>
            <div className={styles.orb} />
            <p className={styles.text}>Aligning the cosmos…</p>
        </main>
    );
}
