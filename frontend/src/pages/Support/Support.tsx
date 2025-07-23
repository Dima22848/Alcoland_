import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Support.module.scss";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const Support = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Запрос отправлен", formData);
  };

  return (
    <div className={styles.supportPage}>
      <nav className={styles.header}>
        <div className={styles.navbarLeft}>
          <Link to="/">Alcoland</Link>
        </div>
        <div className={styles.navbarRight}>
          <div>Корзина</div>
          <Link to="/profile">Профиль</Link>
        </div>
      </nav>
      
      <div className={styles.supportContainer}>
        <h1>Обращение в поддержку</h1>
        <p>
          Укажите ваше имя и email, чтобы мы смогли отправить вам ответ по вашему запросу
        </p>
        <form onSubmit={handleSubmit} className={styles.supportForm}>
          <div className={styles.formGroup}>
            <label>Имя:</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className={styles.formGroup}>
            <label>Email:</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className={styles.formGroup}>
            <label>Тема запроса:</label>
            <input type="text" name="subject" value={formData.subject} onChange={handleChange} required />
          </div>
          <div className={styles.formGroup}>
            <label>Запрос:</label>
            <textarea name="message" value={formData.message} onChange={handleChange} required />
          </div>
          <button type="submit" className={styles.submitButton}>Отправить запрос</button>
        </form>
      </div>
    </div>
  );
};

export default Support;
