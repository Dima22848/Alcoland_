import { useState } from "react";
import { useDispatch } from "react-redux";
import { setToken, setUser } from "../../../redux/slices/auth/authSlice";
import { loginUser, fetchCurrentUser } from "../../../redux/api/auth/authApi";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import styles from "./Login.module.scss";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const data = await loginUser(email, password);
      dispatch(setToken(data.access));
      
      // Сохраняем токен и email в localStorage
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("user_email", email);

      const user = await fetchCurrentUser(data.access);
      dispatch(setUser(user));
      
      navigate("/profile");
    } catch (err) {
      setError("Ошибка входа. Проверьте данные и попробуйте снова.");
    }
  };

  return (
    <div className={styles.container}>
      {/* Шапка */}
      <nav className={styles.header}>
        <div className={styles.navbarLeft}>
          <Link to="/">Alcoland</Link>
          {/* <Link to="/support">Поддержка</Link> */}
        </div>
        <div className={styles.navbarRight}>
          <div>Корзина</div>
        </div>
      </nav>

      {/* Контент */}
      <div className={styles.content}>
        <h1 className={styles.title}>Вход</h1>

        {error && <p className={styles.error}>{error}</p>}

        {/* Форма для ввода */}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputField}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
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
              name="password"
              placeholder="Введите ваш пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Ссылки */}
          <div className={styles.links}>
            {/* <Link to="/forgot-password">Забыли пароль?</Link> */}
            <Link to="/register" style={{ color: "black" }}>Регистрация</Link>
          </div>

          {/* Кнопка для входа */}
          <button type="submit" className={styles.submitButton}>
            Войти
          </button>
        </form>

        {/* Вход через соцсети */}
        {/* <div className={styles.socialLogin}>
          <h2>Войти через</h2>
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

export default Login;