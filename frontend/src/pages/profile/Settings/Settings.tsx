import React, { useEffect, useState } from "react";
import styles from "./Settings.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { fetchUser } from "../../../redux/api/account/accountApi";
import axios from "axios";
import { updateUserProfile, updateUserAvatar } from "../../../redux/api/auth/authApi";

// Добавь defaultAvatar, если хочешь отображать превью
const defaultAvatar = "/images/default-avatar.png";

const Settings = () => {
  const authUser = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    age: "",
    city: "",
    profession: "",
    favorite_alcohol: "",
    hobby: "",
    extra_info: "",
    old_password: "",
    new_password: "",
    confirm_password: ""
  });

  // Состояние для отображения текущего аватара и загрузки файла
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Подгружаем данные юзера при инициализации
  useEffect(() => {
    const loadUser = async () => {
      if (!authUser?.id || !token) return;
      try {
        const userData = await fetchUser(authUser.id.toString());
        setFormData((prev) => ({
          ...prev,
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          email: userData.email || "",
          age: userData.age?.toString() || "",
          city: userData.city || "",
          profession: userData.profession || "",
          favorite_alcohol: userData.favorite_alcohol || "",
          hobby: userData.hobby || "",
          extra_info: userData.extra_info || ""
        }));
        setAvatar(userData.avatar || null);
        setLoading(false);
      } catch (err) {
        setError("Ошибка при загрузке данных.");
      }
    };
    loadUser();
  }, [authUser, token]);

  // Обработка изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Смена пароля
  const handlePasswordChange = async () => {
    if (!formData.old_password || !formData.new_password || !formData.confirm_password) {
      setError("Пожалуйста, заполните все поля для смены пароля.");
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      setError("Новые пароли не совпадают.");
      return;
    }

    try {
      await axios.post(
        `http://127.0.0.1:8000/api/change-password/`,
        {
          old_password: formData.old_password,
          new_password: formData.new_password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Пароль успешно изменён");
      setFormData({ ...formData, old_password: "", new_password: "", confirm_password: "" });
      setError("");
    } catch {
      setError("Ошибка при смене пароля. Проверьте старый пароль.");
    }
  };

  // Обновление отдельных полей (инкрементальная отправка)
  const handleFieldUpdate = async (fieldName: string) => {
    if (!authUser?.id) return;

    const rawValue = formData[fieldName as keyof typeof formData];
    const value = fieldName === "age" ? parseInt(rawValue || "0", 10) : rawValue;

    try {
      await updateUserProfile(authUser.id, { [fieldName]: value });
      // После апдейта сразу подгружаем свежие данные!
      const userData = await fetchUser(authUser.id.toString());
      setFormData((prev) => ({
        ...prev,
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        email: userData.email || "",
        age: userData.age?.toString() || "",
        city: userData.city || "",
        profession: userData.profession || "",
        favorite_alcohol: userData.favorite_alcohol || "",
        hobby: userData.hobby || "",
        extra_info: userData.extra_info || ""
      }));
      setAvatar(userData.avatar || null);
      setError("");
      alert("Профиль успешно обновлён.");
    } catch (error) {
      setError("Ошибка при обновлении данных.");
    }
  };

  // Загрузка нового аватара
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      // Для превью
      setAvatar(URL.createObjectURL(e.target.files[0]));

      if (!authUser?.id) return;
      const formData = new FormData();
      formData.append("avatar", e.target.files[0]);
      try {
        await updateUserAvatar(authUser.id, formData);
        // После апдейта — фетчим юзера
        const userData = await fetchUser(authUser.id.toString());
        setAvatar(userData.avatar || null);
        setError("");
        alert("Аватар успешно обновлён.");
      } catch (error) {
        setError("Ошибка при обновлении аватара.");
      }
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className={styles.settingsContainer}>
      <h1>Мои настройки</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* === АВАТАРКА === */}
      <div className={styles.avatarBlock}>
        <img
          src={avatar ? avatar : defaultAvatar}
          alt="avatar"
          className={styles.avatar}
          style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", marginBottom: 10 }}
        />
        <input type="file" accept="image/*" onChange={handleAvatarChange} />
      </div>

      <div className={styles.section}>
        {Object.entries({
          first_name: "Имя",
          last_name: "Фамилия",
          email: "Email"
        }).map(([key, label]) => (
          <div key={key} className={styles.inputGroup}>
            <label>{label}</label>
            <input type="text" name={key} value={formData[key as keyof typeof formData]} onChange={handleChange} />
            <button onClick={() => handleFieldUpdate(key)}>Подтвердить</button>
          </div>
        ))}
      </div>

      <h2>Дополнительная информация</h2>

      <div className={styles.inputGroup}>
        <label>Возраст</label>
        <select name="age" value={formData.age} onChange={handleChange}>
          <option value="">Выберите возраст</option>
          {Array.from({ length: 83 }, (_, i) => i + 18).map((age) => (
            <option key={age} value={age.toString()}>{age}</option>
          ))}
        </select>
        <button onClick={() => handleFieldUpdate("age")}>Подтвердить</button>
      </div>

      <div className={styles.inputGroup}>
        <label>Город</label>
        <select name="city" value={formData.city} onChange={handleChange}>
          <option value="">Выберите город</option>
          {[{ value: "kyiv", label: "Киев" }, { value: "kharkiv", label: "Харьков" }, { value: "odesa", label: "Одесса" },
            { value: "dnipro", label: "Днепр" }, { value: "lviv", label: "Львов" }, { value: "zaporizhzhia", label: "Запорожье" },
            { value: "vinnitsa", label: "Винница" }, { value: "mykolaiv", label: "Николаев" }, { value: "cherkasy", label: "Черкассы" },
            { value: "chernihiv", label: "Чернигов" }, { value: "chernivtsi", label: "Черновцы" }, { value: "poltava", label: "Полтава" },
            { value: "kherson", label: "Херсон" }, { value: "sumy", label: "Сумы" }, { value: "zhytomyr", label: "Житомир" },
            { value: "ivano_frankivsk", label: "Ивано-Франковск" }, { value: "lutsk", label: "Луцк" }, { value: "ternopil", label: "Тернополь" },
            { value: "uzhhorod", label: "Ужгород" }, { value: "kropyvnytskyi", label: "Кропивницкий" }, { value: "rivno", label: "Ровно" },
            { value: "mariupol", label: "Мариуполь" }, { value: "sevastopol", label: "Севастополь" }, { value: "simferopol", label: "Симферополь" }]
            .map((city) => (
              <option key={city.value} value={city.value}>{city.label}</option>
            ))}
        </select>
        <button onClick={() => handleFieldUpdate("city")}>Подтвердить</button>
      </div>

      {Object.entries({
        profession: "Профессия",
        favorite_alcohol: "Любимый алкоголь",
        hobby: "Хобби",
        extra_info: "Побольше о себе"
      }).map(([key, label]) => (
        <div key={key} className={styles.inputGroup}>
          <label>{label}</label>
          {key === "extra_info" ? (
            <textarea name={key} value={formData[key as keyof typeof formData]} onChange={handleChange} />
          ) : (
            <input type="text" name={key} value={formData[key as keyof typeof formData]} onChange={handleChange} />
          )}
          <button onClick={() => handleFieldUpdate(key)}>Подтвердить</button>
        </div>
      ))}

      <h2>Пароль</h2>
      <p>Для смены пароля введите старый и новый пароли:</p>

      <div className={styles.inputGroup}>
        <label>Старый пароль</label>
        <input type="password" name="old_password" value={formData.old_password} onChange={handleChange} />
        <a href="#">Забыли пароль?</a>
      </div>

      <div className={styles.inputGroup}>
        <label>Новый пароль</label>
        <input type="password" name="new_password" value={formData.new_password} onChange={handleChange} />
      </div>

      <div className={styles.inputGroup}>
        <label>Новый пароль снова</label>
        <input type="password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} />
      </div>

      <button className={styles.submitButton} onClick={handlePasswordChange}>
        Изменить пароль
      </button>
    </div>
  );
};

export default Settings;










// import React, { useEffect, useState } from "react";
// import styles from "./Settings.module.scss";
// import { useSelector } from "react-redux";
// import { RootState } from "../../../redux/store";
// import { fetchUser } from "../../../redux/api/account/accountApi";
// import axios from "axios";
// import { updateUserProfile } from "../../../redux/api/auth/authApi";

// const Settings = () => {
//   const authUser = useSelector((state: RootState) => state.auth.user);
//   const token = useSelector((state: RootState) => state.auth.token);

//   const [formData, setFormData] = useState({
//     first_name: "",
//     last_name: "",
//     email: "",
//     age: "",
//     city: "",
//     profession: "",
//     favorite_alcohol: "",
//     hobby: "",
//     extra_info: "",
//     old_password: "",
//     new_password: "",
//     confirm_password: ""
//   });

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const loadUser = async () => {
//       if (!authUser?.id || !token) return;
//       try {
//         const userData = await fetchUser(authUser.id.toString());
//         setFormData((prev) => ({
//           ...prev,
//           first_name: userData.first_name || "",
//           last_name: userData.last_name || "",
//           email: userData.email || "",
//           age: userData.age?.toString() || "",
//           city: userData.city || "",
//           profession: userData.profession || "",
//           favorite_alcohol: userData.favorite_alcohol || "",
//           hobby: userData.hobby || "",
//           extra_info: userData.extra_info || ""
//         }));
//         setLoading(false);
//       } catch (err) {
//         setError("Ошибка при загрузке данных.");
//       }
//     };
//     loadUser();
//   }, [authUser, token]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handlePasswordChange = async () => {
//     if (!formData.old_password || !formData.new_password || !formData.confirm_password) {
//       setError("Пожалуйста, заполните все поля для смены пароля.");
//       return;
//     }

//     if (formData.new_password !== formData.confirm_password) {
//       setError("Новые пароли не совпадают.");
//       return;
//     }

//     try {
//       await axios.post(
//         `http://127.0.0.1:8000/api/change-password/`,
//         {
//           old_password: formData.old_password,
//           new_password: formData.new_password,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       alert("Пароль успешно изменён");
//       setFormData({ ...formData, old_password: "", new_password: "", confirm_password: "" });
//       setError("");
//     } catch {
//       setError("Ошибка при смене пароля. Проверьте старый пароль.");
//     }
//   };

//   const handleFieldUpdate = async (fieldName: string) => {
//     if (!authUser?.id) return;

//     const rawValue = formData[fieldName as keyof typeof formData];
//     const value = fieldName === "age" ? parseInt(rawValue || "0", 10) : rawValue;

//     console.log("Отправляем в API:", { [fieldName]: value });

//     try {
//       const result = await updateUserProfile(authUser.id, { [fieldName]: value });
//       console.log("✅ Профиль обновлён:", result);
//       alert("Профиль успешно обновлён.");
//       setError("");
//     } catch (error) {
//       console.error("❌ Ошибка при обновлении:", error);
//       setError("Ошибка при обновлении данных.");
//     }
//   };

//   if (loading) return <div>Загрузка...</div>;

//   return (
//     <div className={styles.settingsContainer}>
//       <h1>Мои настройки</h1>

//       {error && <p style={{ color: "red" }}>{error}</p>}

//       <div className={styles.section}>
//         {Object.entries({
//           first_name: "Имя",
//           last_name: "Фамилия",
//           email: "Email"
//         }).map(([key, label]) => (
//           <div key={key} className={styles.inputGroup}>
//             <label>{label}</label>
//             <input type="text" name={key} value={formData[key as keyof typeof formData]} onChange={handleChange} />
//             <button onClick={() => handleFieldUpdate(key)}>Подтвердить</button>
//           </div>
//         ))}
//       </div>

//       <h2>Дополнительная информация</h2>

//       <div className={styles.inputGroup}>
//         <label>Возраст</label>
//         <select name="age" value={formData.age} onChange={handleChange}>
//           <option value="">Выберите возраст</option>
//           {Array.from({ length: 83 }, (_, i) => i + 18).map((age) => (
//             <option key={age} value={age.toString()}>{age}</option>
//           ))}
//         </select>
//         <button onClick={() => handleFieldUpdate("age")}>Подтвердить</button>
//       </div>

//       <div className={styles.inputGroup}>
//         <label>Город</label>
//         <select name="city" value={formData.city} onChange={handleChange}>
//           <option value="">Выберите город</option>
//           {[{ value: "kyiv", label: "Киев" }, { value: "kharkiv", label: "Харьков" }, { value: "odesa", label: "Одесса" },
//             { value: "dnipro", label: "Днепр" }, { value: "lviv", label: "Львов" }, { value: "zaporizhzhia", label: "Запорожье" },
//             { value: "vinnitsa", label: "Винница" }, { value: "mykolaiv", label: "Николаев" }, { value: "cherkasy", label: "Черкассы" },
//             { value: "chernihiv", label: "Чернигов" }, { value: "chernivtsi", label: "Черновцы" }, { value: "poltava", label: "Полтава" },
//             { value: "kherson", label: "Херсон" }, { value: "sumy", label: "Сумы" }, { value: "zhytomyr", label: "Житомир" },
//             { value: "ivano_frankivsk", label: "Ивано-Франковск" }, { value: "lutsk", label: "Луцк" }, { value: "ternopil", label: "Тернополь" },
//             { value: "uzhhorod", label: "Ужгород" }, { value: "kropyvnytskyi", label: "Кропивницкий" }, { value: "rivno", label: "Ровно" },
//             { value: "mariupol", label: "Мариуполь" }, { value: "sevastopol", label: "Севастополь" }, { value: "simferopol", label: "Симферополь" }]
//             .map((city) => (
//               <option key={city.value} value={city.value}>{city.label}</option>
//             ))}
//         </select>
//         <button onClick={() => handleFieldUpdate("city")}>Подтвердить</button>
//       </div>

//       {Object.entries({
//         profession: "Профессия",
//         favorite_alcohol: "Любимый алкоголь",
//         hobby: "Хобби",
//         extra_info: "Побольше о себе"
//       }).map(([key, label]) => (
//         <div key={key} className={styles.inputGroup}>
//           <label>{label}</label>
//           {key === "extra_info" ? (
//             <textarea name={key} value={formData[key as keyof typeof formData]} onChange={handleChange} />
//           ) : (
//             <input type="text" name={key} value={formData[key as keyof typeof formData]} onChange={handleChange} />
//           )}
//           <button onClick={() => handleFieldUpdate(key)}>Подтвердить</button>
//         </div>
//       ))}

//       <h2>Пароль</h2>
//       <p>Для смены пароля введите старый и новый пароли:</p>

//       <div className={styles.inputGroup}>
//         <label>Старый пароль</label>
//         <input type="password" name="old_password" value={formData.old_password} onChange={handleChange} />
//         <a href="#">Забыли пароль?</a>
//       </div>

//       <div className={styles.inputGroup}>
//         <label>Новый пароль</label>
//         <input type="password" name="new_password" value={formData.new_password} onChange={handleChange} />
//       </div>

//       <div className={styles.inputGroup}>
//         <label>Новый пароль снова</label>
//         <input type="password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} />
//       </div>

//       <button className={styles.submitButton} onClick={handlePasswordChange}>
//         Изменить пароль
//       </button>
//     </div>
//   );
// };

// export default Settings;







