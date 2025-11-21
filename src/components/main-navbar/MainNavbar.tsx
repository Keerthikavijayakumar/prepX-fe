import Link from "next/link";
import { NavbarUserControls } from "./NavbarUserControls";
import styles from "./MainNavbar.module.css";

export function MainNavbar() {
  return (
    <header className={styles.header}>
      <div className="container">
        <nav className={styles.nav}>
          <Link href="/" className={styles.logo}>
            DevMock<span>.ai</span>
          </Link>
          <ul className={styles.navLinks}>
            <li>
              <Link href="#">Features</Link>
            </li>
            <li>
              <Link href="#">System Design</Link>
            </li>
            <li>
              <Link href="#">Pricing</Link>
            </li>
            <li>
              <Link href="#">Enterprise</Link>
            </li>
          </ul>
          <NavbarUserControls />
        </nav>
      </div>
    </header>
  );
}
