'use client';

import TopBar from './TopBar';
import MainHeader from './MainHeader';
import CategoriesMenu from './CategoriesMenu';
import styles from './Header.module.css';

export default function Header() {
  return (
    <div className={styles.headerWrapper}>
      <TopBar />
      <MainHeader />
      <CategoriesMenu />
    </div>
  );
}
