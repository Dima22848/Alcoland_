import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyReviewsAsync, deleteMyReviewAsync } from "../../../redux/slices/main/reviewsSlice";
import { RootState, AppDispatch } from "../../../redux/store";
import styles from "./ProfileReviews.module.scss";
import { useNavigate } from "react-router-dom";

// Маппинг типов алкоголя (названия для фильтра)
const typeLabels: Record<string, string> = {
  pivo: "Пиво",
  vino: "Вино",
  vodka: "Водка",
  cognak: "Коньяк",
};

type AlcoholType = keyof typeof typeLabels;

const REVIEWS_PER_PAGE = 4; // Например, 4 отзыва на страницу

const ProfileReviews: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const reviews = useSelector((state: RootState) => state.reviews.reviews);
  const status = useSelector((state: RootState) => state.reviews.status);
  const [selectedType, setSelectedType] = useState<AlcoholType | "all">("all");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchMyReviewsAsync());
  }, [dispatch]);

  // Фильтрация и сортировка (сначала новые)
  const filteredReviews = useMemo(() => {
    let filtered = [...reviews].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (selectedType === "all") return filtered;
    return filtered.filter(
      (r: any) =>
        r.alcohol_info &&
        (r.alcohol_info.type === selectedType ||
          String(r.alcohol_info.type) === selectedType)
    );
  }, [reviews, selectedType]);

  // Пагинация
  const pageCount = Math.max(1, Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE));
  const pageItems = filteredReviews.slice((page - 1) * REVIEWS_PER_PAGE, page * REVIEWS_PER_PAGE);

  // При смене фильтра всегда возвращаемся на первую страницу
  useEffect(() => { setPage(1); }, [selectedType, reviews]);

  const handleDelete = (id: number) => {
    if (window.confirm("Удалить этот отзыв?")) {
      dispatch(deleteMyReviewAsync(id));
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Мои отзывы</h1>
      <div className={styles.filterPanel}>
        <button className={selectedType === "all" ? styles.active : ""} onClick={() => setSelectedType("all")}>Все</button>
        {Object.entries(typeLabels).map(([key, label]) => (
          <button key={key} className={selectedType === key ? styles.active : ""} onClick={() => setSelectedType(key as AlcoholType)}>{label}</button>
        ))}
      </div>

      {status === "loading" && <div>Загрузка отзывов...</div>}
      {filteredReviews.length === 0 && status !== "loading" && (
        <div className={styles.empty}>У вас пока нет отзывов.</div>
      )}

      <div className={styles.reviewsList}>
        {pageItems.map((review: any) => (
          <div key={review.id} className={styles.reviewCard}>
            <img
              src={
                review.alcohol_info?.image
                  ? review.alcohol_info.image.startsWith("http")
                    ? review.alcohol_info.image
                    : `http://localhost:8000${review.alcohol_info.image}`
                  : "https://via.placeholder.com/80x80?text=Нет+фото"
              }
              alt={review.alcohol_info?.name || "Товар"}
              className={styles.alcoholImage}
            />
            <div className={styles.infoBlock}>
              <div className={styles.headerRow}>
                <div className={styles.leftBlock}>
                  <div className={styles.alcoholName}>
                    {review.alcohol_info?.name || "Товар"}
                  </div>
                  {review.alcohol_info?.price && (
                    <div className={styles.price}>
                      {review.alcohol_info.price} грн
                    </div>
                  )}
                </div>
                <div className={styles.buttonsRow}>
                  <button
                    className={styles.viewBtn}
                    onClick={() => {
                      if (review.alcohol_info?.type && review.alcohol_info?.slug) {
                        const typeMap: Record<string, string> = { beer: "pivo", vino: "vino", vodka: "vodka", cognak: "cognak" };
                        const urlType = typeMap[review.alcohol_info.type] || review.alcohol_info.type;
                        navigate(`/${urlType}/${review.alcohol_info.slug}`);
                      }
                    }}
                  >
                    Посмотреть товар
                  </button>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(review.id)}>
                    Удалить
                  </button>
                </div>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.reviewDate}>{new Date(review.created_at).toLocaleString()}</span>
                <span className={styles.rating}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < review.rate ? styles.starFilled : styles.starEmpty}>★</span>
                  ))}
                </span>
                <span className={styles.authorName}>
                  {typeof review.author === "object" ? review.author.nickname : review.author}
                </span>
              </div>
              <div className={styles.reviewText}>{review.text}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Пагинация */}
      {pageCount > 1 && (
        <div className={styles.pagination}>
          {[...Array(pageCount)].map((_, i) => (
            <button
              key={i}
              className={page === i + 1 ? styles.activePage : ""}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileReviews;










// import React, { useEffect, useState, useMemo } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchMyReviewsAsync, deleteMyReviewAsync } from "../../../redux/slices/main/reviewsSlice";
// import { RootState, AppDispatch } from "../../../redux/store";
// import styles from "./ProfileReviews.module.scss";
// import { useNavigate } from "react-router-dom";


// // Маппинг типов алкоголя (названия для фильтра)
// const typeLabels: Record<string, string> = {
//   pivo: "Пиво",
//   vino: "Вино",
//   vodka: "Водка",
//   cognak: "Коньяк",
// };

// type AlcoholType = keyof typeof typeLabels;

// const REVIEWS_PER_PAGE = 4; // например, 4 отзыва на страницу

// const ProfileReviews: React.FC = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const reviews = useSelector((state: RootState) => state.reviews.reviews);
//   const status = useSelector((state: RootState) => state.reviews.status);
//   const [selectedType, setSelectedType] = useState<AlcoholType | "all">("all");
//   const [page, setPage] = useState(1);
//   const navigate = useNavigate();

//   useEffect(() => {
//     dispatch(fetchMyReviewsAsync());
//   }, [dispatch]);

//   // Фильтрация и сортировка (сначала новые)
//   const filteredReviews = useMemo(() => {
//     let filtered = [...reviews].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
//     if (selectedType === "all") return filtered;
//     return filtered.filter(
//       (r: any) =>
//         r.alcohol_info &&
//         (r.alcohol_info.type === selectedType ||
//           String(r.alcohol_info.type) === selectedType)
//     );
//   }, [reviews, selectedType]);

//   // Пагинация
//   const pageCount = Math.max(1, Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE));
//   const pageItems = filteredReviews.slice((page - 1) * REVIEWS_PER_PAGE, page * REVIEWS_PER_PAGE);

//   // При смене фильтра всегда возвращаемся на первую страницу
//   useEffect(() => { setPage(1); }, [selectedType, reviews]);

//   const handleDelete = (id: number) => {
//     if (window.confirm("Удалить этот отзыв?")) {
//       dispatch(deleteMyReviewAsync(id));
//     }
//   };

//   return (
//     <div className={styles.container}>
//       <h1 className={styles.pageTitle}>Мои отзывы</h1>
//       <div className={styles.filterPanel}>
//         <button className={selectedType === "all" ? styles.active : ""} onClick={() => setSelectedType("all")}>Все</button>
//         {Object.entries(typeLabels).map(([key, label]) => (
//           <button key={key} className={selectedType === key ? styles.active : ""} onClick={() => setSelectedType(key as AlcoholType)}>{label}</button>
//         ))}
//       </div>

//       {status === "loading" && <div>Загрузка отзывов...</div>}
//       {filteredReviews.length === 0 && status !== "loading" && (
//         <div className={styles.empty}>У вас пока нет отзывов.</div>
//       )}

//       <div className={styles.reviewsList}>
//         {pageItems.map((review: any) => (
//           <div key={review.id} className={styles.reviewCard}>
//             <div className={styles.alcoholInfo}>
//               <img
//                 src={
//                   review.alcohol_info?.image
//                     ? review.alcohol_info.image.startsWith("http")
//                       ? review.alcohol_info.image
//                       : `http://localhost:8000${review.alcohol_info.image}`
//                     : "https://via.placeholder.com/80x80?text=Нет+фото"
//                 }
//                 alt={review.alcohol_info?.name || "Товар"}
//                 className={styles.alcoholImage}
//               />
//               <div className={styles.detailsBlock}>
//                 <div className={styles.alcoholName}>
//                   {review.alcohol_info?.name || "Товар"}
//                 </div>
//                 {review.alcohol_info?.price && (
//                   <div className={styles.price}>
//                     {review.alcohol_info.price} грн
//                   </div>
//                 )}
//                 <button
//                   className={styles.viewBtn}
//                   onClick={() => {
//                     if (review.alcohol_info?.type && review.alcohol_info?.slug) {
//                       // Маппинг для корректного url
//                       const typeMap: Record<string, string> = { beer: "pivo", vino: "vino", vodka: "vodka", cognak: "cognak" };
//                       const urlType = typeMap[review.alcohol_info.type] || review.alcohol_info.type;
//                       navigate(`/${urlType}/${review.alcohol_info.slug}`);
//                     }
//                   }}
//                 >
//                   Посмотреть товар
//                 </button>
//                 {/* Кнопка удалить */}
//                 <button className={styles.deleteBtn} onClick={() => handleDelete(review.id)}>
//                   Удалить
//                 </button>
//               </div>
//             </div>
//             <div className={styles.reviewContent}>
//               <div className={styles.reviewText}>{review.text}</div>
//               <div className={styles.reviewDate}>
//                 {new Date(review.created_at).toLocaleString()}
//               </div>
//               <div className={styles.rating}>
//                 {[...Array(5)].map((_, i) => (
//                   <span key={i} className={i < review.rate ? styles.starFilled : styles.starEmpty}>★</span>
//                 ))}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//       {/* Пагинация */}
//       {pageCount > 1 && (
//         <div className={styles.pagination}>
//           {[...Array(pageCount)].map((_, i) => (
//             <button
//               key={i}
//               className={page === i + 1 ? styles.activePage : ""}
//               onClick={() => setPage(i + 1)}
//             >
//               {i + 1}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProfileReviews;














