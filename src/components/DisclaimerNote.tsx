import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import styles from './DisclaimerNote.module.css';

// Consistent "awareness, not prediction" footnote for chart / AI / timing pages (12.1)
export default function DisclaimerNote() {
    return (
        <div className={styles.disclaimerNote}>
            <ShieldCheck size={14} />
            <span>
                Chetna is for awareness and reflection, not prediction.{' '}
                <Link href="/disclaimer">Read our approach.</Link>
            </span>
        </div>
    );
}
