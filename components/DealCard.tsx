'use client';

import styles from '@/styles/home.module.css';

interface Deal {
  _id: string;
  dealPrice: number;
  endDate: string;
  productId?: {
    name: string;
    price: number;
    images?: string[];
  };
}

export default function DealCard({ deal }: { deal: Deal }) {
  const endDate = new Date(deal.endDate);
  const now = new Date();
  const timeLeft = endDate.getTime() - now.getTime();
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));

  return (
    <div className={styles.dealCard}>
      <div className={styles.dealImage}>
        {deal.productId?.images?.[0] ? (
          <img src={deal.productId.images[0]} alt={deal.productId.name} />
        ) : (
          <div className={styles.dealPlaceholder}>📦</div>
        )}
      </div>
      <div className={styles.dealContent}>
        <h3 className={styles.dealTitle}>{deal.productId?.name}</h3>
        <div className={styles.dealPrices}>
          <span className={styles.dealPrice}>₹{deal.dealPrice}</span>
          <span className={styles.dealOriginal}>₹{deal.productId?.price}</span>
        </div>
        <div className={styles.dealTimeLeft}>
          {hoursLeft > 0 ? `${hoursLeft}h left` : 'Ended'}
        </div>
      </div>
    </div>
  );
}
