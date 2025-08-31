import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../../redux/api/auth/authApi";
import styles from "./Register.module.scss";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Пароли не совпадают!");
      return;
    }

    try {
      await registerUser(email, password);
      navigate("/login"); // Редирект на страницу входа
    } catch (err) {
      setError("Ошибка регистрации. Попробуйте снова.");
    }
  };

  return (
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
        <h1 className={styles.title}>Регистрация</h1>

        {error && <p className={styles.error}>{error}</p>}

        {/* Форма для ввода */}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputField}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Введите ваш email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputField}>
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              placeholder="Введите ваш пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputField}>
            <label htmlFor="confirmPassword">Подтвердите пароль</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Подтвердите пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <Link to="/login" style={{ color: "black", fontSize: "20px" }}>Войти</Link>
          {/* Кнопка для регистрации */}
          <button type="submit" className={styles.submitButton}>
            Зарегистрироваться
          </button>
        </form>

        {/* Вход через соцсети */}
        {/* <div className={styles.socialLogin}>
          <h2>Зарегистрироваться через</h2>
          <div className={styles.socialButtons}>
            <button className={styles.socialButton}>
              <img src="gmail-icon.png" alt="Gmail" />
              Gmail
            </button>
            <button className={styles.socialButton}>
              <img src="facebook-icon.png" alt="Facebook" />
              Facebook
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Register;
