'use client';

import { useToast } from '@/lib/context/ToastContext';
import styles from './Toasts.module.css';

export default function Toasts() {
  const { toasts, remove } = useToast();

  return (
    <div className={styles.toastContainer}>
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className={`${styles.toast} ${styles[toast.type || 'success']}`}
        >
          <div className={styles.content}>
            <span>{toast.message}</span>
            <button 
              onClick={() => remove(toast.id)}
              className={styles.closeBtn}
              aria-label="Close toast"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
