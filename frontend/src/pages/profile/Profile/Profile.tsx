import { useState, useEffect } from "react"; 
import { useSelector } from "react-redux"; 
import { selectUser } from "../../../redux/slices/auth/authSlice";
import { 
  useGetNewsfeedQuery, 
  useCreatePostMutation 
} from "../../../redux/api/account/newsFeedApi";
import NewsFeedItem from "../NewsFeed/NewsFeedItem";
import styles from "./Profile.module.scss";

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

const Profile = () => {
  const user = useSelector(selectUser);
  const { data: posts, isLoading, error, refetch } = useGetNewsfeedQuery();
  const [createPost] = useCreatePostMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postText, setPostText] = useState("");
  const [postFile, setPostFile] = useState<File | null>(null);

  // 🔥 Локальный список постов (для мгновенного удаления/добавления)
  const [localPosts, setLocalPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (posts) setLocalPosts(posts);
  }, [posts]);

  if (!user) return <p>Загрузка...</p>;

  const userPosts = localPosts.filter(post => post.profile_id === user.id);

  const handlePostSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("text", postText);
      if (postFile) {
        formData.append("file", postFile);
      }

      await createPost(formData).unwrap();
      setIsModalOpen(false);
      setPostText("");
      setPostFile(null);
      refetch(); // синхронизация
    } catch (err) {
      console.error("Ошибка при создании поста", err);
    }
  };

  const handleDeletePost = (postId: number) => {
    setLocalPosts(prev => prev.filter(p => p.id !== postId));
    refetch();
  };

  return (
    <div className={styles.profileContainer}>
      {/* Блок с фото и инфо */}
      <div className={styles.profileDetails}>
        <img src={user.image} alt="Profile" className={styles.profileImage} />
        <div className={styles.profileText}>
          <p><strong>Возраст:</strong> {user.age ? `${user.age} лет` : "Не указан"}</p>
          <p><strong>Город:</strong> {user.city_display || "Не указан"}</p>
          <p><strong>Профессия:</strong> {user.profession || "Не указана"}</p>
          <p><strong>Хобби:</strong> {user.hobby || "Не указано"}</p>
          <p><strong>О себе:</strong> {user.extra_info || "Нет информации"}</p>
        </div>
      </div>

      {/* Новостная лента */}
      <div className={styles.newsFeed}>
        <div className={styles.newsFeedHeader}>
          <h2>Мои посты</h2>
          <button onClick={() => setIsModalOpen(true)} className={styles.addPostButton}>
            ➕ Добавить пост
          </button>
        </div>

        {isLoading && <p>Загрузка...</p>}
        {error && <p>Ошибка загрузки постов.</p>}
        {userPosts?.length ? (
          userPosts.map(post => (
            <NewsFeedItem 
              key={post.id} 
              post={post} 
              userData={{ [user.id]: user }}
              onDelete={handleDeletePost} 
              refetchPosts={refetch} // 👈 пробрасываем для лайков/дизлайков
            />
          ))
        ) : (
          <p>Вы еще не добавили ни одного поста.</p>
        )}
      </div>

      {/* Модальное окно */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Создать пост</h3>
            <textarea
              placeholder="Текст поста"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
            />
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => e.target.files && setPostFile(e.target.files[0])} 
            />
            <div className={styles.modalActions}>
              <button onClick={handlePostSubmit}>Опубликовать</button>
              <button onClick={() => setIsModalOpen(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;










// import { useState, useEffect } from "react";
// import { useSelector } from "react-redux"; 
// import { selectUser } from "../../../redux/slices/auth/authSlice";
// import { useGetNewsfeedQuery, useCreatePostMutation } from "../../../redux/api/account/newsFeedApi";
// import NewsFeedItem from "../NewsFeed/NewsFeedItem";
// import styles from "./Profile.module.scss";

// interface Post {
//   id: number;
//   profile_id: number;
//   text: string;
//   file: string | null;
//   created_at: string;
// }

// const Profile = () => {
//   const user = useSelector(selectUser);
//   const { data: posts, isLoading, error, refetch } = useGetNewsfeedQuery();
//   const [createPost] = useCreatePostMutation();

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [postText, setPostText] = useState("");
//   const [postFile, setPostFile] = useState<File | null>(null);

//   // 🔥 Локальный список постов (для мгновенного удаления/добавления)
//   const [localPosts, setLocalPosts] = useState<Post[]>([]);

//   useEffect(() => {
//     if (posts) setLocalPosts(posts);
//   }, [posts]);

//   if (!user) return <p>Загрузка...</p>;

//   const userPosts = localPosts.filter(post => post.profile_id === user.id);

//   const handlePostSubmit = async () => {
//     try {
//       const formData = new FormData();
//       formData.append("text", postText);
//       if (postFile) {
//         formData.append("file", postFile);
//       }

//       await createPost(formData).unwrap();
//       setIsModalOpen(false);
//       setPostText("");
//       setPostFile(null);
//       refetch(); // синхронизация
//     } catch (err) {
//       console.error("Ошибка при создании поста", err);
//     }
//   };

//   const handleDeletePost = (postId: number) => {
//     // удаляем локально мгновенно
//     setLocalPosts(prev => prev.filter(p => p.id !== postId));
//     // и потом обновляем с сервера
//     refetch();
//   };

//   return (
//     <div className={styles.profileContainer}>
//       {/* Блок с фото и инфо */}
//       <div className={styles.profileDetails}>
//         <img src={user.image} alt="Profile" className={styles.profileImage} />
//         <div className={styles.profileText}>
//           <p><strong>Возраст:</strong> {user.age ? `${user.age} лет` : "Не указан"}</p>
//           <p><strong>Город:</strong> {user.city_display || "Не указан"}</p>
//           <p><strong>Профессия:</strong> {user.profession || "Не указана"}</p>
//           <p><strong>Хобби:</strong> {user.hobby || "Не указано"}</p>
//           <p><strong>О себе:</strong> {user.extra_info || "Нет информации"}</p>
//         </div>
//       </div>

//       {/* Новостная лента */}
//       <div className={styles.newsFeed}>
//         <div className={styles.newsFeedHeader}>
//           <h2>Мои посты</h2>
//           <button onClick={() => setIsModalOpen(true)} className={styles.addPostButton}>
//             ➕ Добавить пост
//           </button>
//         </div>

//         {isLoading && <p>Загрузка...</p>}
//         {error && <p>Ошибка загрузки постов.</p>}
//         {userPosts?.length ? (
//           userPosts.map(post => (
//             <NewsFeedItem 
//               key={post.id} 
//               post={post} 
//               userData={{ [user.id]: user }}
//               onDelete={handleDeletePost} // 👈 передаём обработчик
//             />
//           ))
//         ) : (
//           <p>Вы еще не добавили ни одного поста.</p>
//         )}
//       </div>

//       {/* Модальное окно */}
//       {isModalOpen && (
//         <div className={styles.modalOverlay}>
//           <div className={styles.modal}>
//             <h3>Создать пост</h3>
//             <textarea
//               placeholder="Текст поста"
//               value={postText}
//               onChange={(e) => setPostText(e.target.value)}
//             />
//             <input type="file" accept="image/*" onChange={(e) => e.target.files && setPostFile(e.target.files[0])} />
//             <div className={styles.modalActions}>
//               <button onClick={handlePostSubmit}>Опубликовать</button>
//               <button onClick={() => setIsModalOpen(false)}>Отмена</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Profile;

















