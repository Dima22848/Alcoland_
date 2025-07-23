import { Link } from "react-router-dom";
import styles from "./ResetPassword.module.scss";

const ResetPassword = () => (
  <div className={styles.container}>
    {/* Шапка */}
    <nav className={styles.header}>
      <div className={styles.navbarLeft}>
        <Link to="/">Alcoland</Link>
        <Link to="/support">Поддержка</Link>
      </div>
      <div className={styles.navbarRight}>
        <div>Корзина</div>
      </div>
    </nav>

    {/* Контент */}
    <div className={styles.content}>
      <h1 className={styles.title}>Восстановление пароля</h1>
      
      {/* Инструкция */}
      <p className={styles.instruction}>
        Чтобы восстановить пароль, вам нужно указать ваш email, на который будет отправлено сообщение с помощью которого можно будет восстановить ваш пароль.
      </p>

      {/* Форма для ввода email */}
      <form className={styles.form}>
        <div className={styles.inputField}>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" placeholder="Введите ваш email" required />
        </div>

        {/* Кнопка отправить */}
        <button type="submit" className={styles.submitButton}>Отправить</button>
      </form>
    </div>
  </div>
);

export default ResetPassword;
