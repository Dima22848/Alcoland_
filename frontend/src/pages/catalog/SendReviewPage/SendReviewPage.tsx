import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../redux/store";
import { useState } from "react";
import { sendReviewAsync, fetchReviewsAsync } from "../../../redux/slices/main/reviewsSlice";
import styles from './SendReviewPage.module.scss';

const contentTypeMapping: Record<string, number> = {
  pivo: 13,
  cognak: 14,
  vino: 17,    
  vodka: 18,
};

const SendReviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const alcohol = location.state?.alcohol;
  const { type: typeFromParams } = useParams();
  const type = location.state?.type || typeFromParams;
  const user = useSelector((state: RootState) => state.auth.user);

  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);

  if (!alcohol) {
    navigate(-1);
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Передаём корректный content_type!
      await dispatch(sendReviewAsync({
        content_type: contentTypeMapping[type as string] || alcohol.alcoholtype,
        object_id: alcohol.id,
        text,
        rate: rating,
      })).unwrap();

      // Сразу подгружаем свежие отзывы после отправки
      await dispatch(fetchReviewsAsync({
        content_type: contentTypeMapping[type as string] || alcohol.alcoholtype,
        object_id: alcohol.id,
      }));

      navigate(`/${type}/${alcohol.slug}`);
    } catch {
      alert("Ошибка при отправке");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.sendReviewContainer}>
      <h2>Оставить отзыв</h2>
      <div className={styles.productInfo}>
        <img src={alcohol.image} alt={alcohol.name} />
        <div>
          <div>{alcohol.name}</div>
          <div style={{ fontSize: 14, color: '#999', fontWeight: 400 }}>
            {alcohol.type_display || alcohol.type}
          </div>
        </div>
      </div>
      <div className={styles.userInfo}>
        {user?.image && <img src={user.image} alt={user.nickname} />}
        <span>{user?.nickname}</span>
      </div>
      <form className={styles.formBox} onSubmit={handleSubmit}>
        <label>Ваша оценка:</label>
        <div className={styles.ratingBox}>
          {[1, 2, 3, 4, 5].map(val => (
            <span
              key={val}
              className={val <= rating ? styles.star + ' ' + styles.active : styles.star}
              onClick={() => setRating(val)}
            >★</span>
          ))}
        </div>
        <textarea
          className={styles.textArea}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Ваш отзыв..."
          required
        />
        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? "Отправка..." : "Отправить"}
        </button>
      </form>
    </div>
  );
};

export default SendReviewPage;









// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { RootState, AppDispatch } from "../../../redux/store";
// import { useState } from "react";
// import { sendReviewAsync } from "../../../redux/slices/main/reviewsSlice"; // Новый thunk для отправки и обновления отзывов
// // import { sendReview } from "../../../redux/api/main/reviewsApi"; // Старый способ, теперь не нужен
// import styles from './SendReviewPage.module.scss';

// const SendReviewPage = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const dispatch = useDispatch<AppDispatch>();
//   const alcohol = location.state?.alcohol;
//   const { type: typeFromParams } = useParams();
//   const type = location.state?.type || typeFromParams;
//   const user = useSelector((state: RootState) => state.auth.user);

//   const [text, setText] = useState('');
//   const [rating, setRating] = useState(5);
//   const [loading, setLoading] = useState(false);

//   if (!alcohol) {
//     navigate(-1);
//     return null;
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       // Новый способ через Redux-thunk
//       await dispatch(sendReviewAsync({
//         content_type: alcohol.alcoholtype,
//         object_id: alcohol.id,
//         text,
//         rate: rating,
//       })).unwrap();

//       // --- СТАРЫЙ СПОСОБ (если вдруг понадобится) ---
//       // await sendReview({
//       //   content_type: alcohol.alcoholtype,
//       //   object_id: alcohol.id,
//       //   text,
//       //   rate: rating,
//       // });

//       navigate(`/${type}/${alcohol.slug}`);
//     } catch {
//       alert("Ошибка при отправке");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className={styles.sendReviewContainer}>
//       <h2>Оставить отзыв</h2>
//       <div className={styles.productInfo}>
//         <img src={alcohol.image} alt={alcohol.name} />
//         <div>
//           <div>{alcohol.name}</div>
//           <div style={{ fontSize: 14, color: '#999', fontWeight: 400 }}>{alcohol.type_display || alcohol.type}</div>
//         </div>
//       </div>
//       <div className={styles.userInfo}>
//         {user?.image && <img src={user.image} alt={user.nickname} />}
//         <span>{user?.nickname}</span>
//       </div>
//       <form className={styles.formBox} onSubmit={handleSubmit}>
//         <label>Ваша оценка:</label>
//         <div className={styles.ratingBox}>
//           {[1,2,3,4,5].map(val => (
//             <span
//               key={val}
//               className={val <= rating ? styles.star + ' ' + styles.active : styles.star}
//               onClick={() => setRating(val)}
//             >★</span>
//           ))}
//         </div>
//         <textarea
//           className={styles.textArea}
//           value={text}
//           onChange={e => setText(e.target.value)}
//           placeholder="Ваш отзыв..."
//           required
//         />
//         <button type="submit" className={styles.submitButton} disabled={loading}>
//           {loading ? "Отправка..." : "Отправить"}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default SendReviewPage;










// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { RootState } from "../../../redux/store";
// import { useState } from "react";
// import { sendReview } from "../../../redux/api/main/reviewsApi"; 
// import styles from './SendReviewPage.module.scss';


// const SendReviewPage = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const alcohol = location.state?.alcohol;
//   const { type: typeFromParams } = useParams();
//   const type = location.state?.type || typeFromParams;
//   const user = useSelector((state: RootState) => state.auth.user);

//   const [text, setText] = useState('');
//   const [rating, setRating] = useState(5);
//   const [loading, setLoading] = useState(false);

//   if (!alcohol) {
//     navigate(-1);
//     return null;
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await sendReview({
//         content_type: alcohol.alcoholtype, // либо соответствующий content_type
//         object_id: alcohol.id,
//         text,
//         rate: rating,
//       });
//       navigate(`/${type}/${alcohol.slug}`); // редирект на товар
//     } catch {
//       alert("Ошибка при отправке");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className={styles.sendReviewContainer}>
//       <h2>Оставить отзыв</h2>
//       <div className={styles.productInfo}>
//         <img src={alcohol.image} alt={alcohol.name} />
//         <div>
//           <div>{alcohol.name}</div>
//           <div style={{ fontSize: 14, color: '#999', fontWeight: 400 }}>{alcohol.type_display || alcohol.type}</div>
//         </div>
//       </div>
//       <div className={styles.userInfo}>
//         {user?.image && <img src={user.image} alt={user.nickname} />}
//         <span>{user?.nickname}</span>
//       </div>
//       <form className={styles.formBox} onSubmit={handleSubmit}>
//         <label>Ваша оценка:</label>
//         <div className={styles.ratingBox}>
//           {[1,2,3,4,5].map(val => (
//             <span
//               key={val}
//               className={val <= rating ? styles.star + ' ' + styles.active : styles.star}
//               onClick={() => setRating(val)}
//             >★</span>
//           ))}
//         </div>
//         <textarea
//           className={styles.textArea}
//           value={text}
//           onChange={e => setText(e.target.value)}
//           placeholder="Ваш отзыв..."
//           required
//         />
//         <button type="submit" className={styles.submitButton} disabled={loading}>
//           {loading ? "Отправка..." : "Отправить"}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default SendReviewPage;
