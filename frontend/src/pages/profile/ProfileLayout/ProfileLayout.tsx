import { Link, Outlet } from 'react-router-dom';
import styles from './ProfileLayout.module.scss';

const ProfileLayout = () => {
  return (
    <div className={styles.container}>
      {/* Navbar */}
      <header className={styles.navbar}>
        <div className={styles.navbarLeft}>
          <Link to="/">Главная</Link>
          <Link to="/profile">Профиль</Link>
        </div>
      </header>

      {/* Основной контент */}
      <main className={styles.mainContent}>
        {/* Сайдбар (1/5 страницы) */}
        <aside className={styles.sidebar}>
          <ul>
            <li><Link to="/profile">Мой профиль</Link></li>
            <li><Link to="/profile/friends">Мои друзья</Link></li>
            <li><Link to="/profile/follows">Мои подписки</Link></li>
            <li><Link to="/profile/chats">Мои сообщения</Link></li>
            <li><Link to="/profile/news-feed">Новостная лента</Link></li>
            <li><Link to="/profile/reviews">Мои отзывы</Link></li>
            <li><Link to="/profile/basket">Моя корзина</Link></li>
            <li><Link to="/profile/buy-history">Моя история покупок</Link></li>
            <li><Link to="/profile/settings">Мои настройки</Link></li>
            <li><Link to="/catalog">Каталог алкоголя</Link></li>
            <li><Link to="/logout">Выйти</Link></li>
          </ul>
        </aside>

        {/* Основной контент (4/5 страницы) */}
        <section className={styles.profileContent}>
          <Outlet /> {/* Здесь будут загружаться страницы профиля */}
        </section>
      </main>
    </div>
  );
};

export default ProfileLayout;
