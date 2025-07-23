import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchReviewsAsync, deleteReviewAsync } from "../../../redux/slices/main/reviewsSlice";
import { loadAlcoholItems } from "../../../redux/slices/main/alcoholSlice";
import { RootState, AppDispatch } from "../../../redux/store";
import styles from "./Reviews.module.scss";

const contentTypeMapping: Record<string, number> = {
  pivo: 13,
  cognak: 14,
  vino: 17,
  vodka: 18,
};

const Reviews = () => {
  const { type, slug } = useParams<{ type: string; slug: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const alcoholItems = useSelector((state: RootState) => state.alcohol.items);
  const alcohol = alcoholItems.find((item) => item.slug === slug);
  const reviews = useSelector((state: RootState) => state.reviews.reviews);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (type && !alcoholItems.length) {
      dispatch(loadAlcoholItems(type));
    }
  }, [type, alcoholItems.length, dispatch]);

  useEffect(() => {
    if (type && slug && alcohol) {
      const content_type = contentTypeMapping[type] || 0;
      const object_id = alcohol.id;
      dispatch(fetchReviewsAsync({ content_type, object_id }));
    }
  }, [type, slug, alcohol?.id, dispatch]);

  
  const content_type = type ? contentTypeMapping[type] || 0 : 0;

  const handleDelete = (id: number) => {
    dispatch(deleteReviewAsync({ reviewId: id, content_type, object_id: alcohol!.id }));
  };

  

  const renderStars = (rating: number) => (
    <div className={styles.reviewRating}>
      {[...Array(5)].map((_, i) => (
        <span key={i} className={i < Math.round(rating) ? styles.starFilled : styles.starEmpty}>★</span>
      ))}
    </div>
  );

  // Сортируем: последние сверху
  const sortedReviews = reviews.slice().reverse();

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        ← Назад
      </button>
      <h1 className={styles.allReviewsTitle}>Все отзывы</h1>
      <div className={styles.reviews}>
        {sortedReviews.length === 0 && (
          <div className={styles.noReviews}>Пока отзывов нет.</div>
        )}
        {sortedReviews.map((review) => (
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
    </div>
  );
};

export default Reviews;










// import { useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchReviewsAsync } from "../../../redux/slices/main/reviewsSlice";
// import { loadAlcoholItems } from "../../../redux/slices/main/alcoholSlice";
// import { RootState, AppDispatch } from "../../../redux/store";
// import styles from "./Reviews.module.scss";

// const contentTypeMapping: Record<string, number> = {
//   pivo: 13,
//   cognak: 14,
//   vino: 17,
//   vodka: 18,
// };

// const Reviews = () => {
//   const { type, slug } = useParams<{ type: string; slug: string }>();
//   const navigate = useNavigate();
//   const dispatch = useDispatch<AppDispatch>();

//   const alcoholItems = useSelector((state: RootState) => state.alcohol.items);
//   const alcohol = alcoholItems.find((item) => item.slug === slug);
//   const reviews = useSelector((state: RootState) => state.reviews.reviews);

//   useEffect(() => {
//     if (type && !alcoholItems.length) {
//       dispatch(loadAlcoholItems(type));
//     }
//   }, [type, alcoholItems.length, dispatch]);

//   useEffect(() => {
//     if (type && slug && alcohol) {
//       const content_type = contentTypeMapping[type] || 0;
//       const object_id = alcohol.id;
//       dispatch(fetchReviewsAsync({ content_type, object_id }));
//     }
//   }, [type, slug, alcohol?.id, dispatch]);

//   const renderStars = (rating: number) => (
//     <div className={styles.reviewRating}>
//       {[...Array(5)].map((_, i) => (
//         <span key={i} className={i < Math.round(rating) ? styles.starFilled : styles.starEmpty}>★</span>
//       ))}
//     </div>
//   );

//   return (
//     <div className={styles.container}>
//       <button className={styles.backButton} onClick={() => navigate(-1)}>
//         ← Назад
//       </button>
//       <h1 className={styles.allReviewsTitle}>Все отзывы</h1>
//       <div className={styles.reviews}>
//         {reviews.length === 0 && (
//           <div className={styles.noReviews}>Пока отзывов нет.</div>
//         )}
//         {reviews.map((review) => (
//           <div key={review.id} className={styles.review}>
//             <div className={styles.reviewHeader}>
//               <div className={styles.userWithRating}>
//                 {typeof review.author === "object" && review.author !== null && "avatar" in review.author && review.author.avatar ? (
//                   <img
//                     src={review.author.avatar}
//                     alt={review.author.nickname}
//                     className={styles.avatar}
//                   />
//                 ) : (
//                   <span className={styles.userIcon}>👤</span>
//                 )}
//                 <p className={styles.userName}>
//                   {typeof review.author === "object" && review.author !== null && "nickname" in review.author
//                     ? review.author.nickname
//                     : review.author}
//                 </p>
//                 {renderStars(review.rate)}
//               </div>
//               <p className={styles.reviewDate}>{new Date(review.created_at).toLocaleString()}</p>
//             </div>
//             <p className={styles.reviewText}>{review.text}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Reviews;










