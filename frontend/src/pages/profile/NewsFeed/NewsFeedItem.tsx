import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useGetCommentsByNewsFeedIdQuery, useCreateCommentMutation } from "../../../redux/api/account/newsFeedCommentsApi";
import { fetchUser } from "../../../redux/api/account/accountApi";
import { selectUser } from "../../../redux/slices/auth/authSlice";
import styles from "./NewsFeed.module.scss";

interface Post {
  id: number;
  profile_id: number;
  text: string;
  file: string | null;
  created_at: string;
}

interface UserData {
  [key: number]: {
    id: number;
    nickname: string;
    image: string;
  };
}

interface NewsFeedItemProps {
  post: Post;
  userData: UserData;
}

const MAX_COMMENTS_PREVIEW = 4;

const NewsFeedItem: React.FC<NewsFeedItemProps> = ({ post, userData }) => {
  const { data: comments, refetch } = useGetCommentsByNewsFeedIdQuery(post.id);
  const [createComment] = useCreateCommentMutation();
  const [userCommentsData, setUserCommentsData] = useState<Record<number, any>>(userData || {});
  const [newComment, setNewComment] = useState("");
  const [showAllComments, setShowAllComments] = useState(false); // Для модалки
  const currentUser = useSelector(selectUser);

  // Получаем/обновляем данные авторов комментариев (кеш + текущий юзер)
  useEffect(() => {
    const getUserData = async (profileId: number) => {
      if (!userCommentsData[profileId]) {
        const user = await fetchUser(profileId.toString());
        setUserCommentsData((prevData: Record<number, any>) => ({
          ...prevData,
          [profileId]: user,
        }));
      }
    };

    comments?.forEach((comment) => {
      // Если автор комментария — это текущий юзер, то всегда берем его данные из authSlice
      if (currentUser && comment.profile_id === currentUser.id) {
        setUserCommentsData((prevData) => ({
          ...prevData,
          [currentUser.id]: currentUser,
        }));
      } else {
        getUserData(comment.profile_id);
      }
    });
    // eslint-disable-next-line
  }, [comments, userData, currentUser]);

  const handleCommentSubmit = async () => {
    if (!currentUser) {
      alert("Вы должны быть авторизованы, чтобы оставлять комментарии.");
      return;
    }
    if (!newComment.trim()) {
      alert("Комментарий не может быть пустым.");
      return;
    }

    const newCommentData = {
      profile_id: currentUser.id,
      newsfeed_id: post.id,
      text: newComment,
    };

    try {
      await createComment(newCommentData).unwrap();
      setNewComment("");
      refetch();
    } catch (error) {
      console.error("Ошибка при добавлении комментария:", error);
    }
  };

  // Рендер одного комментария (переиспользуем в основной части и модалке)
  const renderComment = (comment: any) => {
    // Данные пользователя — сперва из userCommentsData, иначе — заглушки
    const author = userCommentsData[comment.profile_id] || {};
    return (
      <div key={comment.id} className={styles.comment}>
        <div className={styles.commentHeader}>
          <img
            src={author.image || "/images/default-user.jpg"}
            alt="User Avatar"
            className={styles.commentAuthorPhoto}
          />
          <div className={styles.commentInfo}>
            <span className={styles.commentAuthor}>
              {author.nickname || `Пользователь ${comment.profile_id}`}
            </span>
            <span className={styles.commentDate}>
              {new Date(comment.created_at).toLocaleString()}
            </span>
          </div>
        </div>
        <span className={styles.commentText}>{comment.text}</span>
      </div>
    );
  };

  // Основная разметка
  return (
    <div className={styles.post}>
      <div className={styles.postHeader}>
        <img
          src={userData[post.profile_id]?.image || "/images/default-user.jpg"}
          alt="User Avatar"
          className={styles.userPhoto}
        />
        <div className={styles.postInfo}>
          <span className={styles.userName}>
            {userData[post.profile_id]?.nickname || `Пользователь ${post.profile_id}`}
          </span>
          <span className={styles.postDate}>
            {new Date(post.created_at).toLocaleString()}
          </span>
        </div>
      </div>

      <p className={styles.postContent}>{post.text}</p>
      {post.file && (
        <img src={post.file} alt="Post Attachment" className={styles.postImage} />
      )}

      <div className={styles.postActions}>
        <button className={styles.likeButton}>👍 Нравится</button>
        <button className={styles.dislikeButton}>👎 Не нравится</button>
      </div>

      <div className={styles.commentsSection}>
        <h4>Комментарии:</h4>
        {comments?.length ? (
          <>
            {comments.slice(0, MAX_COMMENTS_PREVIEW).map(renderComment)}
            {comments.length > MAX_COMMENTS_PREVIEW && (
              <button
                className={styles.showAllCommentsBtn}
                onClick={() => setShowAllComments(true)}
              >
                Посмотреть все комментарии ({comments.length})
              </button>
            )}
          </>
        ) : (
          <p>Комментариев пока нет</p>
        )}

        {/* Форма для добавления комментария */}
        <div className={styles.commentForm}>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Напишите комментарий..."
          />
          <button onClick={handleCommentSubmit}>Отправить</button>
        </div>
      </div>

      {/* Модальное окно со всеми комментариями */}
      {showAllComments && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Все комментарии</h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowAllComments(false)}
                aria-label="Закрыть"
              >
                ×
              </button>
            </div>
            <div className={styles.allCommentsList}>
              {comments?.map(renderComment)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsFeedItem;










// import React, { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import { useGetCommentsByNewsFeedIdQuery, useCreateCommentMutation } from "../../../redux/api/account/newsFeedCommentsApi";
// import { fetchUser } from "../../../redux/api/account/accountApi";
// import { selectUser } from "../../../redux/slices/auth/authSlice";
// import styles from "./NewsFeed.module.scss";

// interface Post {
//   id: number;
//   profile_id: number;
//   text: string;
//   file: string | null;
//   created_at: string;
// }

// interface UserData {
//   [key: number]: {
//     id: number;
//     nickname: string;
//     image: string;
//   };
// }

// interface NewsFeedItemProps {
//   post: Post;
//   userData: UserData;
// }

// const MAX_COMMENTS_PREVIEW = 4;

// const NewsFeedItem: React.FC<NewsFeedItemProps> = ({ post, userData }) => {
//   const { data: comments, refetch } = useGetCommentsByNewsFeedIdQuery(post.id);
//   const [createComment] = useCreateCommentMutation();
//   const [userCommentsData, setUserCommentsData] = useState<Record<number, any>>(userData || {});
//   const [newComment, setNewComment] = useState("");
//   const [showAllComments, setShowAllComments] = useState(false); // Для модалки
//   const currentUser = useSelector(selectUser);

//   // Получаем/обновляем данные авторов комментариев (кеш + текущий юзер)
//   useEffect(() => {
//     const getUserData = async (profileId: number) => {
//       if (!userCommentsData[profileId]) {
//         const user = await fetchUser(profileId.toString());
//         setUserCommentsData((prevData: Record<number, any>) => ({
//           ...prevData,
//           [profileId]: user,
//         }));
//       }
//     };

//     comments?.forEach((comment) => {
//       // Если автор комментария — это текущий юзер, то всегда берем его данные из authSlice
//       if (currentUser && comment.profile_id === currentUser.id) {
//         setUserCommentsData((prevData) => ({
//           ...prevData,
//           [currentUser.id]: currentUser,
//         }));
//       } else {
//         getUserData(comment.profile_id);
//       }
//     });
//     // eslint-disable-next-line
//   }, [comments, userData, currentUser]);

//   const handleCommentSubmit = async () => {
//     if (!currentUser) {
//       alert("Вы должны быть авторизованы, чтобы оставлять комментарии.");
//       return;
//     }
//     if (!newComment.trim()) {
//       alert("Комментарий не может быть пустым.");
//       return;
//     }

//     const newCommentData = {
//       profile_id: currentUser.id,
//       newsfeed_id: post.id,
//       text: newComment,
//     };

//     try {
//       await createComment(newCommentData).unwrap();
//       setNewComment("");
//       refetch();
//     } catch (error) {
//       console.error("Ошибка при добавлении комментария:", error);
//     }
//   };

//   // Рендер одного комментария (переиспользуем в основной части и модалке)
//   const renderComment = (comment: any) => {
//     // Данные пользователя — сперва из userCommentsData, иначе — заглушки
//     const author = userCommentsData[comment.profile_id] || {};
//     return (
//       <div key={comment.id} className={styles.comment}>
//         <div className={styles.commentHeader}>
//           <img
//             src={author.image || "/images/default-user.jpg"}
//             alt="User Avatar"
//             className={styles.commentAuthorPhoto}
//           />
//           <div className={styles.commentInfo}>
//             <span className={styles.commentAuthor}>
//               {author.nickname || `Пользователь ${comment.profile_id}`}
//             </span>
//             <span className={styles.commentDate}>
//               {new Date(comment.created_at).toLocaleString()}
//             </span>
//           </div>
//         </div>
//         <span className={styles.commentText}>{comment.text}</span>
//       </div>
//     );
//   };

//   // Основная разметка
//   return (
//     <div className={styles.post}>
//       <div className={styles.postHeader}>
//         <img
//           src={userData[post.profile_id]?.image || "/images/default-user.jpg"}
//           alt="User Avatar"
//           className={styles.userPhoto}
//         />
//         <span className={styles.userName}>
//           {userData[post.profile_id]?.nickname || `Пользователь ${post.profile_id}`}
//         </span>
//         <span className={styles.postDate}>
//           {new Date(post.created_at).toLocaleString()}
//         </span>
//       </div>

//       <p className={styles.postContent}>{post.text}</p>
//       {post.file && <img src={post.file} alt="Post Attachment" className={styles.postImage} />}

//       <div className={styles.postActions}>
//         <button className={styles.likeButton}>👍 Нравится</button>
//         <button className={styles.dislikeButton}>👎 Не нравится</button>
//       </div>

//       <div className={styles.commentsSection}>
//         <h4>Комментарии:</h4>
//         {comments?.length ? (
//           <>
//             {comments.slice(0, MAX_COMMENTS_PREVIEW).map(renderComment)}
//             {comments.length > MAX_COMMENTS_PREVIEW && (
//               <button
//                 className={styles.showAllCommentsBtn}
//                 onClick={() => setShowAllComments(true)}
//               >
//                 Посмотреть все комментарии ({comments.length})
//               </button>
//             )}
//           </>
//         ) : (
//           <p>Комментариев пока нет</p>
//         )}

//         {/* Форма для добавления комментария */}
//         <div className={styles.commentForm}>
//           <input
//             type="text"
//             value={newComment}
//             onChange={(e) => setNewComment(e.target.value)}
//             placeholder="Напишите комментарий..."
//           />
//           <button onClick={handleCommentSubmit}>Отправить</button>
//         </div>
//       </div>

//       {/* Модальное окно со всеми комментариями */}
//       {showAllComments && (
//         <div className={styles.modalOverlay}>
//           <div className={styles.modalContent}>
//             <div className={styles.modalHeader}>
//               <h3>Все комментарии</h3>
//               <button
//                 className={styles.modalClose}
//                 onClick={() => setShowAllComments(false)}
//                 aria-label="Закрыть"
//               >
//                 ×
//               </button>
//             </div>
//             <div className={styles.allCommentsList}>
//               {comments?.map(renderComment)}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default NewsFeedItem;











