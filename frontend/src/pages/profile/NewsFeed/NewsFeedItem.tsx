import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  useGetCommentsByNewsFeedIdQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useLikeCommentMutation,
  useDislikeCommentMutation,
} from "../../../redux/api/account/newsFeedCommentsApi";
import {
  useDeletePostMutation,
  useLikePostMutation,
  useDislikePostMutation,
} from "../../../redux/api/account/newsFeedApi";
import { fetchUser } from "../../../redux/api/account/accountApi";
import { selectUser } from "../../../redux/slices/auth/authSlice";
import styles from "./NewsFeed.module.scss";

interface Post {
  id: number;
  profile_id: number;
  text: string;
  file: string | null;
  created_at: string;
  likes_count: number;
  dislikes_count: number;
  is_liked_by_me: boolean;
  is_disliked_by_me: boolean;
}

interface NewsFeedComment {
  id: number;
  profile_id: number;
  newsfeed_id: number;
  text: string;
  created_at: string;
  likes_count: number;
  dislikes_count: number;
  is_liked_by_me: boolean;
  is_disliked_by_me: boolean;
}

interface UserData {
  [key: number]: { id: number; nickname: string; image: string };
}

interface NewsFeedItemProps {
  post: Post;
  userData: UserData;
  onDelete?: (id: number) => void;
  refetchPosts?: () => void;
}

const MAX_COMMENTS_PREVIEW = 4;

const NewsFeedItem: React.FC<NewsFeedItemProps> = ({
  post,
  userData,
  onDelete,
  refetchPosts,
}) => {
  const { data: comments } = useGetCommentsByNewsFeedIdQuery(post.id);
  const [commentsState, setCommentsState] = useState<NewsFeedComment[]>([]);
  const [localPost, setLocalPost] = useState<Post>({ ...post });

  const [createComment] = useCreateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const [deletePost] = useDeletePostMutation();
  const [likePost] = useLikePostMutation();
  const [dislikePost] = useDislikePostMutation();
  const [likeComment] = useLikeCommentMutation();
  const [dislikeComment] = useDislikeCommentMutation();

  const [userCommentsData, setUserCommentsData] = useState<Record<number, any>>(userData || {});
  const [newComment, setNewComment] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);

  const currentUser = useSelector(selectUser);

  // Синхронизируем локальное состояние комментариев при обновлении данных
  useEffect(() => {
    if (comments) {
      const initialized = comments.map(c => ({
        ...c,
        likes_count: c.likes_count || 0,
        dislikes_count: c.dislikes_count || 0,
        is_liked_by_me: c.is_liked_by_me || false,
        is_disliked_by_me: c.is_disliked_by_me || false,
      }));
      setCommentsState(initialized);
    }
  }, [comments]);

  // Подгружаем данные пользователей комментариев
  useEffect(() => {
    const getUserData = async (profileId: number) => {
      if (!userCommentsData[profileId]) {
        const user = await fetchUser(profileId.toString());
        setUserCommentsData(prev => ({ ...prev, [profileId]: user }));
      }
    };

    commentsState.forEach(comment => {
      if (currentUser && comment.profile_id === currentUser.id) {
        setUserCommentsData(prev => ({ ...prev, [currentUser.id]: currentUser }));
      } else {
        getUserData(comment.profile_id);
      }
    });
  }, [commentsState, userData, currentUser]);

  // ----------------- Посты -----------------
  const handleDeletePost = async () => {
    if (window.confirm("Удалить пост?")) {
      try {
        await deletePost(localPost.id).unwrap();
        if (onDelete) onDelete(localPost.id);
      } catch (err) {
        console.error("Ошибка при удалении поста", err);
      }
    }
  };

  const handleLike = async () => {
    setLocalPost(prev => {
      const updated = { ...prev };
      if (updated.is_liked_by_me) {
        updated.likes_count -= 1;
      } else {
        updated.likes_count += 1;
        if (updated.is_disliked_by_me) {
          updated.dislikes_count -= 1;
          updated.is_disliked_by_me = false;
        }
      }
      updated.is_liked_by_me = !updated.is_liked_by_me;
      return updated;
    });

    try {
      await likePost(localPost.id).unwrap();
      refetchPosts && refetchPosts();
    } catch (err) {
      console.error("Ошибка при лайке", err);
    }
  };

  const handleDislike = async () => {
    setLocalPost(prev => {
      const updated = { ...prev };
      if (updated.is_disliked_by_me) {
        updated.dislikes_count -= 1;
      } else {
        updated.dislikes_count += 1;
        if (updated.is_liked_by_me) {
          updated.likes_count -= 1;
          updated.is_liked_by_me = false;
        }
      }
      updated.is_disliked_by_me = !updated.is_disliked_by_me;
      return updated;
    });

    try {
      await dislikePost(localPost.id).unwrap();
      refetchPosts && refetchPosts();
    } catch (err) {
      console.error("Ошибка при дизлайке", err);
    }
  };

  // ----------------- Комментарии -----------------
  const handleDeleteComment = async (commentId: number) => {
    if (window.confirm("Удалить комментарий?")) {
      try {
        await deleteComment(commentId).unwrap();
        setCommentsState(prev => prev.filter(c => c.id !== commentId));
      } catch (err) {
        console.error("Ошибка при удалении комментария", err);
      }
    }
  };

  const handleCommentSubmit = async () => {
    if (!currentUser) return alert("Вы должны быть авторизованы, чтобы оставлять комментарии.");
    if (!newComment.trim()) return alert("Комментарий не может быть пустым.");

    const newCommentData = { profile_id: currentUser.id, newsfeed_id: localPost.id, text: newComment };
    try {
      const created = await createComment(newCommentData).unwrap();
      setNewComment("");
      setCommentsState(prev => [
        ...prev,
        {
          ...created,
          likes_count: created.likes_count || 0,
          dislikes_count: created.dislikes_count || 0,
          is_liked_by_me: created.is_liked_by_me || false,
          is_disliked_by_me: created.is_disliked_by_me || false,
        },
      ]);
    } catch (err) {
      console.error("Ошибка при добавлении комментария:", err);
    }
  };

  const handleLikeComment = async (commentId: number) => {
    setCommentsState(prev =>
      prev.map(c => {
        if (c.id === commentId) {
          const isLiked = c.is_liked_by_me;
          return {
            ...c,
            is_liked_by_me: !isLiked,
            likes_count: isLiked ? c.likes_count - 1 : c.likes_count + 1,
            is_disliked_by_me: c.is_disliked_by_me && !isLiked ? false : c.is_disliked_by_me,
            dislikes_count: c.is_disliked_by_me && !isLiked ? c.dislikes_count - 1 : c.dislikes_count,
          };
        }
        return c;
      })
    );

    try {
      await likeComment(commentId).unwrap();
    } catch (err) {
      console.error("Ошибка при лайке комментария", err);
    }
  };

  const handleDislikeComment = async (commentId: number) => {
    setCommentsState(prev =>
      prev.map(c => {
        if (c.id === commentId) {
          const isDisliked = c.is_disliked_by_me;
          return {
            ...c,
            is_disliked_by_me: !isDisliked,
            dislikes_count: isDisliked ? c.dislikes_count - 1 : c.dislikes_count + 1,
            is_liked_by_me: c.is_liked_by_me && !isDisliked ? false : c.is_liked_by_me,
            likes_count: c.is_liked_by_me && !isDisliked ? c.likes_count - 1 : c.likes_count,
          };
        }
        return c;
      })
    );

    try {
      await dislikeComment(commentId).unwrap();
    } catch (err) {
      console.error("Ошибка при дизлайке комментария", err);
    }
  };

  // ----------------- Рендер -----------------
  const renderComment = (comment: NewsFeedComment) => {
    const author = userCommentsData[comment.profile_id] || {};
    const canDelete = currentUser && (currentUser.id === comment.profile_id || currentUser.id === localPost.profile_id);

    return (
      <div key={comment.id} className={styles.comment}>
        <div className={styles.commentHeader}>
          <img src={author.image || "/images/default-user.jpg"} alt="User Avatar" className={styles.commentAuthorPhoto} />
          <div className={styles.commentInfo}>
            <span className={styles.commentAuthor}>
              {author.nickname || `Пользователь ${comment.profile_id}`}
            </span>
            <span className={styles.commentDate}>{new Date(comment.created_at).toLocaleString()}</span>
          </div>
          {canDelete && (
            <button onClick={() => handleDeleteComment(comment.id)} className={styles.deleteCommentButton}>❌</button>
          )}
        </div>
        <span className={styles.commentText}>{comment.text}</span>
        <div className={styles.commentActions}>
          <button className={`${styles.commentLikeButton} ${comment.is_liked_by_me ? styles.active : ""}`} onClick={() => handleLikeComment(comment.id)}>
            👍 {comment.likes_count}
          </button>
          <button className={`${styles.commentDislikeButton} ${comment.is_disliked_by_me ? styles.active : ""}`} onClick={() => handleDislikeComment(comment.id)}>
            👎 {comment.dislikes_count}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.post}>
      <div className={styles.postHeader}>
        <img src={userData[localPost.profile_id]?.image || "/images/default-user.jpg"} alt="User Avatar" className={styles.userPhoto} />
        <div className={styles.postInfo}>
          <span className={styles.userName}>
            {userData[localPost.profile_id]?.nickname || `Пользователь ${localPost.profile_id}`}
          </span>
          <span className={styles.postDate}>{new Date(localPost.created_at).toLocaleString()}</span>
        </div>
        {currentUser?.id === localPost.profile_id && (
          <button onClick={handleDeletePost} className={styles.deleteButton}>❌</button>
        )}
      </div>

      <p className={styles.postContent}>{localPost.text}</p>
      {localPost.file && <img src={localPost.file} alt="Post Attachment" className={styles.postImage} />}

      <div className={styles.postActions}>
        <button className={`${styles.likeButton} ${localPost.is_liked_by_me ? styles.active : ""}`} onClick={handleLike}>
          👍 {localPost.likes_count}
        </button>
        <button className={`${styles.dislikeButton} ${localPost.is_disliked_by_me ? styles.active : ""}`} onClick={handleDislike}>
          👎 {localPost.dislikes_count}
        </button>
      </div>

      <div className={styles.commentsSection}>
        <h4>Комментарии:</h4>
        {commentsState.length ? (
          <>
            {commentsState.slice(0, MAX_COMMENTS_PREVIEW).map(renderComment)}
            {commentsState.length > MAX_COMMENTS_PREVIEW && (
              <button className={styles.showAllCommentsBtn} onClick={() => setShowAllComments(true)}>
                Посмотреть все комментарии ({commentsState.length})
              </button>
            )}
          </>
        ) : (
          <p>Комментариев пока нет</p>
        )}

        <div className={styles.commentForm}>
          <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Напишите комментарий..." />
          <button onClick={handleCommentSubmit}>Отправить</button>
        </div>
      </div>

      {showAllComments && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Все комментарии</h3>
              <button className={styles.modalClose} onClick={() => setShowAllComments(false)} aria-label="Закрыть">×</button>
            </div>
            <div className={styles.allCommentsList}>
              {commentsState.map(renderComment)}
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
// import {
//   useGetCommentsByNewsFeedIdQuery,
//   useCreateCommentMutation,
//   useDeleteCommentMutation,
//   useLikeCommentMutation, 
//   useDislikeCommentMutation
// } from "../../../redux/api/account/newsFeedCommentsApi";
// import { 
//   useDeletePostMutation,
//   useLikePostMutation,
//   useDislikePostMutation,
// } from "../../../redux/api/account/newsFeedApi";
// import { fetchUser } from "../../../redux/api/account/accountApi";
// import { selectUser } from "../../../redux/slices/auth/authSlice";
// import styles from "./NewsFeed.module.scss";

// interface Post {
//   id: number;
//   profile_id: number;
//   text: string;
//   file: string | null;
//   created_at: string;
//   likes_count: number;
//   dislikes_count: number;
//   is_liked_by_me: boolean;
//   is_disliked_by_me: boolean;
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
//   onDelete?: (id: number) => void;
//   refetchPosts?: () => void;
// }

// const MAX_COMMENTS_PREVIEW = 4;

// const NewsFeedItem: React.FC<NewsFeedItemProps> = ({ post, userData, onDelete, refetchPosts }) => {
//   const { data: comments, refetch } = useGetCommentsByNewsFeedIdQuery(post.id);
//   const [createComment] = useCreateCommentMutation();
//   const [deleteComment] = useDeleteCommentMutation();
//   const [deletePost] = useDeletePostMutation();
//   const [likePost] = useLikePostMutation();
//   const [dislikePost] = useDislikePostMutation();
//   const [likeComment] = useLikeCommentMutation();
//   const [dislikeComment] = useDislikeCommentMutation();


//   const [userCommentsData, setUserCommentsData] = useState<Record<number, any>>(userData || {});
//   const [newComment, setNewComment] = useState("");
//   const [showAllComments, setShowAllComments] = useState(false);
//   const currentUser = useSelector(selectUser);

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
//       if (currentUser && comment.profile_id === currentUser.id) {
//         setUserCommentsData((prevData) => ({
//           ...prevData,
//           [currentUser.id]: currentUser,
//         }));
//       } else {
//         getUserData(comment.profile_id);
//       }
//     });
//   }, [comments, userData, currentUser]);

//   const handleDeletePost = async () => {
//     if (window.confirm("Удалить пост?")) {
//       try {
//         await deletePost(post.id).unwrap();
//         if (onDelete) onDelete(post.id);
//       } catch (err) {
//         console.error("Ошибка при удалении поста", err);
//       }
//     }
//   };

//   const handleDeleteComment = async (commentId: number) => {
//     if (window.confirm("Удалить комментарий?")) {
//       try {
//         await deleteComment(commentId).unwrap();
//         refetch();
//       } catch (err) {
//         console.error("Ошибка при удалении комментария", err);
//       }
//     }
//   };

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

//   const handleLike = async () => {
//     try {
//       await likePost(post.id).unwrap();
//       refetchPosts && refetchPosts();
//     } catch (err) {
//       console.error("Ошибка при лайке", err);
//     }
//   };

//   const handleDislike = async () => {
//     try {
//       await dislikePost(post.id).unwrap();
//       refetchPosts && refetchPosts();
//     } catch (err) {
//       console.error("Ошибка при дизлайке", err);
//     }
//   };

//   const handleLikeComment = async (commentId: number) => {
//     try {
//       await likeComment(commentId).unwrap();
//       refetch();
//     } catch (err) {
//       console.error("Ошибка при лайке комментария", err);
//     }
//   };

//   const handleDislikeComment = async (commentId: number) => {
//     try {
//       await dislikeComment(commentId).unwrap();
//       refetch();
//     } catch (err) {
//       console.error("Ошибка при дизлайке комментария", err);
//     }
//   };


//   const renderComment = (comment: any) => {
//     const author = userCommentsData[comment.profile_id] || {};
//     const canDelete =
//       currentUser &&
//       (currentUser.id === comment.profile_id || currentUser.id === post.profile_id);

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
//           {canDelete && (
//             <button
//               onClick={() => handleDeleteComment(comment.id)}
//               className={styles.deleteCommentButton}
//             >
//               ❌
//             </button>
//           )}
//         </div>
//         <span className={styles.commentText}>{comment.text}</span>

//         <div className={styles.commentActions}>
//           <button
//             className={`${styles.commentLikeButton} ${comment.is_liked_by_me ? styles.active : ""}`}
//             onClick={() => handleLikeComment(comment.id)}
//           >
//             👍 {comment.likes_count}
//           </button>
//           <button
//             className={`${styles.commentDislikeButton} ${comment.is_disliked_by_me ? styles.active : ""}`}
//             onClick={() => handleDislikeComment(comment.id)}
//           >
//             👎 {comment.dislikes_count}
//           </button>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className={styles.post}>
//       <div className={styles.postHeader}>
//         <img
//           src={userData[post.profile_id]?.image || "/images/default-user.jpg"}
//           alt="User Avatar"
//           className={styles.userPhoto}
//         />
//         <div className={styles.postInfo}>
//           <span className={styles.userName}>
//             {userData[post.profile_id]?.nickname || `Пользователь ${post.profile_id}`}
//           </span>
//           <span className={styles.postDate}>
//             {new Date(post.created_at).toLocaleString()}
//           </span>
//         </div>

//         {currentUser?.id === post.profile_id && (
//           <button onClick={handleDeletePost} className={styles.deleteButton}>
//             ❌
//           </button>
//         )}
//       </div>

//       <p className={styles.postContent}>{post.text}</p>
//       {post.file && (
//         <img src={post.file} alt="Post Attachment" className={styles.postImage} />
//       )}

//       {/* 👍👎 Лайки/дизлайки */}
//       <div className={styles.postActions}>
//         <button 
//           className={`${styles.likeButton} ${post.is_liked_by_me ? styles.active : ""}`} 
//           onClick={handleLike}
//         >
//           👍 {post.likes_count}
//         </button>
//         <button 
//           className={`${styles.dislikeButton} ${post.is_disliked_by_me ? styles.active : ""}`} 
//           onClick={handleDislike}
//         >
//           👎 {post.dislikes_count}
//         </button>
//       </div>

//       {/* Комментарии */}
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

























