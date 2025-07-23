import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReviewsAsync, deleteReviewAsync } from "../../../redux/slices/main/reviewsSlice";
import { loadAlcoholItems, AlcoholItemData } from "../../../redux/slices/main/alcoholSlice";
import { addItemToBasket } from "../../../redux/slices/main/basketSlice";
import { RootState, AppDispatch } from "../../../redux/store";
import styles from "./AlcoholItem.module.scss";


// Маппинг content_type строго по БД (проверь цифры в админке)
const contentTypeMapping: Record<string, number> = {
  pivo: 13,
  cognak: 14,
  vino: 17,
  vodka: 18,
};

const hiddenFields = [
  "id", "name", "price", "image", "alcoholtype", "slug", "reviews_count", "created_at", "field_verbose_names",
];

const AlcoholItem = () => {
  const { type, slug } = useParams<{ type: string; slug: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const alcoholItems = useSelector((state: RootState) => state.alcohol.items) as AlcoholItemData[];
  const reviews = useSelector((state: RootState) => state.reviews.reviews);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const alcohol = alcoholItems.find((item) => item.slug === slug);
  const content_type = type ? contentTypeMapping[type] || 0 : 0;


  // Загружаем товар если обновили страницу
  useEffect(() => {
    if (type && (!alcoholItems.length || !alcohol)) {
      dispatch(loadAlcoholItems(type));
    }
  }, [type, dispatch, alcoholItems.length, alcohol, slug]);

  // Загружаем отзывы
  useEffect(() => {
    if (alcohol && type) {
      dispatch(fetchReviewsAsync({ content_type, object_id: alcohol.id }));
    }
  }, [alcohol, type, content_type, dispatch]);

  // Удалить отзыв
  const handleDelete = (id: number) => {
    dispatch(deleteReviewAsync({ reviewId: id, content_type, object_id: alcohol!.id }));
  };

  // === Добавление в корзину (только redux/localStorage) ===
  const handleAddToBasket = () => {
    if (!alcohol || !type) return;
    dispatch(addItemToBasket({
      content_type: contentTypeMapping[type],
      object_id: alcohol.id,
      quantity: 1,
      alcohol: {
        id: alcohol.id,
        name: alcohol.name,
        price: alcohol.price,
        image: alcohol.image,
      }
    }));
  };


  if (!alcohol) return <p>Алкоголь не найден</p>;

  const renderStars = (rating: number) => (
    <div className={styles.reviewRating}>
      {[...Array(5)].map((_, i) => (
        <span key={i} className={i < rating ? styles.starFilled : styles.starEmpty}>★</span>
      ))}
    </div>
  );

  const fieldVerbose = alcohol.field_verbose_names || {};
  const characteristics = Object.entries(alcohol)
    .filter(([key, value]) =>
      !hiddenFields.includes(key) &&
      fieldVerbose[key] &&
      value !== null &&
      value !== undefined &&
      value !== ""
    );

  const latestReviews = reviews.slice(-4).reverse();

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        ← Назад
      </button>
      <div className={styles.content}>
        <img src={alcohol.image} alt={alcohol.name} className={styles.image} />
        <div className={styles.details}>
          <h1>{alcohol.name}</h1>
          <p className={styles.price}>{alcohol.price} грн</p>
          {alcohol.volume && <p className={styles.volume}>Объем: {alcohol.volume}</p>}
          {/* === Кнопка корзины === */}
          <button className={styles.addToCart} onClick={handleAddToBasket}>
            Добавить в корзину
          </button>
        </div>
      </div>
      <h2>Характеристики</h2>
      <div className={styles.characteristics}>
        {characteristics.map(([key, value]) => (
          <p key={key}>
            <strong>{fieldVerbose[key]}:</strong> {value}
          </p>
        ))}
      </div>
      <h2>Отзывы</h2>
      <div className={styles.reviews}>
        {latestReviews.map((review) => (
          <div key={review.id} className={styles.review}>
            <div className={styles.userWithRating}>
              {typeof review.author === "object" && review.author !== null && "avatar" in review.author && review.author.avatar ? (
                <img
                  src={review.author.avatar}
                  alt={review.author.nickname}
                  className={styles.avatar}
                />
              ) : (
                <span className={styles.userIcon}>👤</span>
              )}
              <div>
                <p className={styles.userName}>
                  {typeof review.author === "object" && review.author !== null && "nickname" in review.author
                    ? review.author.nickname
                    : review.author}
                </p>
                {renderStars(review.rate)}
              </div>
              {currentUser && typeof review.author === "object" &&
                review.author.nickname === currentUser.nickname && (
                <button className={styles.deleteBtn} onClick={() => handleDelete(review.id)}>
                  Удалить
                </button>
              )}
            </div>
            <div className={styles.reviewContent}>
              <p className={styles.reviewText}>{review.text}</p>
              <p className={styles.reviewDate}>{new Date(review.created_at).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.reviewButtons}>
        <button onClick={() => navigate(
          `/${type}/${slug}/send-review`,
          { state: { alcohol, type } }
        )}>
          Оставить отзыв
        </button>
        <button onClick={() => navigate(`/${type}/${slug}/reviews`, { state: { content_type, object_id: alcohol.id } })}>Все отзывы</button>
      </div>
    </div>
  );
};

export default AlcoholItem;








// import { useParams, useNavigate } from "react-router-dom";
// import { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchReviewsAsync, deleteReviewAsync } from "../../../redux/slices/main/reviewsSlice";
// import { loadAlcoholItems } from "../../../redux/slices/main/alcoholSlice";
// import { addItemToBasket } from "../../../redux/slices/main/basketSlice"; // 👈 импортируем!
// import { RootState, AppDispatch } from "../../../redux/store";
// import styles from "./AlcoholItem.module.scss";
// import { AlcoholItemData } from "../../../redux/slices/main/alcoholSlice";

// const contentTypeMapping: Record<string, number> = {
//   pivo: 13,
//   cognak: 14,
//   vino: 17,
//   vodka: 18,
// };

// const hiddenFields = [
//   "id", "name", "price", "image", "alcoholtype", "slug", "reviews_count", "created_at", "field_verbose_names",
// ];

// const AlcoholItem = () => {
//   const { type, slug } = useParams<{ type: string; slug: string }>();
//   const navigate = useNavigate();
//   const dispatch = useDispatch<AppDispatch>();
//   const alcoholItems = useSelector((state: RootState) => state.alcohol.items) as AlcoholItemData[];
//   const reviews = useSelector((state: RootState) => state.reviews.reviews);
//   const currentUser = useSelector((state: RootState) => state.auth.user);

//   const alcohol = alcoholItems.find((item) => item.slug === slug);
//   const content_type = type ? contentTypeMapping[type] || 0 : 0;

//   // Фикс F5
//   useEffect(() => {
//     if (type && (!alcoholItems.length || !alcohol)) {
//       dispatch(loadAlcoholItems(type));
//     }
//   }, [type, dispatch, alcoholItems.length, alcohol, slug]);

//   // Грузим отзывы
//   useEffect(() => {
//     if (alcohol && type) {
//       const object_id = alcohol.id;
//       dispatch(fetchReviewsAsync({ content_type, object_id }));
//     }
//   }, [alcohol, type, content_type, dispatch]);

//   const handleDelete = (id: number) => {
//     dispatch(deleteReviewAsync({ reviewId: id, content_type, object_id: alcohol!.id }));
//   };

//   // === ДОБАВЛЕНИЕ В КОРЗИНУ ===
//   const handleAddToBasket = () => {
//     if (!alcohol) return;
//     // Собираем нужный объект для корзины
//     dispatch(addItemToBasket({
//       content_type: contentTypeMapping[alcohol.type], // например, 13 для пива
//       object_id: alcohol.id,
//       quantity: 1,
//     }));
//   };

//   if (!alcohol) {
//     return <p>Алкоголь не найден</p>;
//   }

//   const renderStars = (rating: number) => (
//     <div className={styles.reviewRating}>
//       {[...Array(5)].map((_, i) => (
//         <span key={i} className={i < rating ? styles.starFilled : styles.starEmpty}>★</span>
//       ))}
//     </div>
//   );

//   const fieldVerbose = alcohol.field_verbose_names || {};
//   const characteristics = Object.entries(alcohol)
//     .filter(([key, value]) =>
//       !hiddenFields.includes(key) &&
//       fieldVerbose[key] &&
//       value !== null &&
//       value !== undefined &&
//       value !== ""
//     );

//   // Берём последние 4 комментария и переворачиваем их (последние сверху)
//   const latestReviews = reviews.slice(-4).reverse();

//   return (
//     <div className={styles.container}>
//       <button className={styles.backButton} onClick={() => navigate(-1)}>
//         ← Назад
//       </button>
//       <div className={styles.content}>
//         <img src={alcohol.image} alt={alcohol.name} className={styles.image} />
//         <div className={styles.details}>
//           <h1>{alcohol.name}</h1>
//           <p className={styles.price}>{alcohol.price} грн</p>
//           <p className={styles.volume}>Объем: {alcohol.volume}</p>
//           {/* === КНОПКА КОРЗИНЫ === */}
//           <button
//             className={styles.addToCart}
//             onClick={handleAddToBasket}
//           >
//             Добавить в корзину
//           </button>
//         </div>
//       </div>
//       <h2>Характеристики</h2>
//       <div className={styles.characteristics}>
//         {characteristics.map(([key, value]) => (
//           <p key={key}>
//             <strong>{fieldVerbose[key]}:</strong> {value}
//           </p>
//         ))}
//       </div>
//       <h2>Отзывы</h2>
//       <div className={styles.reviews}>
//         {latestReviews.map((review) => (
//           <div key={review.id} className={styles.review}>
//             <div className={styles.userWithRating}>
//               {typeof review.author === "object" && review.author !== null && "avatar" in review.author && review.author.avatar ? (
//                 <img
//                   src={review.author.avatar}
//                   alt={review.author.nickname}
//                   className={styles.avatar}
//                 />
//               ) : (
//                 <span className={styles.userIcon}>👤</span>
//               )}

//               <div>
//                 <p className={styles.userName}>
//                   {typeof review.author === "object" && review.author !== null && "nickname" in review.author
//                     ? review.author.nickname
//                     : review.author}
//                 </p>
//                 {renderStars(review.rate)}
//               </div>

//               {currentUser && typeof review.author === "object" &&
//                 review.author.nickname === currentUser.nickname && (
//                 <button className={styles.deleteBtn} onClick={() => handleDelete(review.id)}>
//                   Удалить
//                 </button>
//               )}
//             </div>
//             <div className={styles.reviewContent}>
//               <p className={styles.reviewText}>{review.text}</p>
//               <p className={styles.reviewDate}>{new Date(review.created_at).toLocaleString()}</p>
//             </div>
//           </div>
//         ))}
//       </div>
//       <div className={styles.reviewButtons}>
//         <button onClick={() => navigate(
//           `/${type}/${slug}/send-review`,
//           { state: { alcohol, type } }
//         )}>
//           Оставить отзыв
//         </button>
//         <button onClick={() => navigate(`/${type}/${slug}/reviews`, { state: { content_type, object_id: alcohol.id } })}>Все отзывы</button>
//       </div>
//     </div>
//   );
// };

// export default AlcoholItem;

























