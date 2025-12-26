import { X } from 'lucide-react';
import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'warning' | 'danger' | 'info';
}

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    variant = 'warning',
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onCancel}>
            <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onCancel} aria-label="Close">
                    <X size={20} />
                </button>

                <div className={styles.header}>
                    <h2 className={`${styles.title} ${styles[variant]}`}>{title}</h2>
                </div>

                <div className={styles.content}>
                    <p className={styles.message}>{message}</p>
                </div>

                <div className={styles.actions}>
                    <button className={styles.cancelButton} onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button className={`${styles.confirmButton} ${styles[variant]}`} onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
