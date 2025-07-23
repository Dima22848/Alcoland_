import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectUser, fetchCurrentUser } from "../../../redux/slices/auth/authSlice";
import { selectUsers, fetchUsers } from "../../../redux/slices/auth/usersSlice";
import { unfollow, removeFollower } from "../../../redux/api/account/accountApi";
import styles from "./Follows.module.scss";
import { AppDispatch } from "../../../redux/store";
import { useFetchOrCreateChatWithNicknameMutation } from "../../../redux/api/chat/chatApi";

const Follows = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const currentUser = useSelector(selectUser);
  const users = useSelector(selectUsers);

  const token = localStorage.getItem("access_token");

  // Новый хук для чата
  const [fetchOrCreateChatWithNickname] = useFetchOrCreateChatWithNicknameMutation();

  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser(token));
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (users.length === 0 && token) {
      dispatch(fetchUsers(token));
    }
  }, [dispatch, users, token]);

  if (!currentUser) return <p>Загрузка профиля...</p>;
  if (users.length === 0) return <p>Загрузка подписок и подписчиков...</p>;

  const followingList = users.filter((user) => currentUser.following.includes(user.id));
  const followersList = users.filter((user) => currentUser.followers.includes(user.id));

  const handleViewProfile = (id: number) => {
    navigate(`/profile/${id}`);
  };

  // Новый универсальный обработчик "Написать сообщение"
  const handleSendMessage = async (nickname: string) => {
    try {
      await fetchOrCreateChatWithNickname(nickname).unwrap();
      navigate(`/profile/chats/${nickname}`);
    } catch (err) {
      alert("Ошибка при создании чата");
    }
  };

  const handleUnfollow = async (targetId: number) => {
    try {
      await unfollow(targetId);
      if (token) dispatch(fetchCurrentUser(token));
    } catch (error) {
      console.error("Ошибка при отписке:", error);
      alert("Не удалось отписаться");
    }
  };

  const handleRemoveFollower = async (targetId: number) => {
    try {
      await removeFollower(targetId);
      if (token) dispatch(fetchCurrentUser(token));
    } catch (error) {
      console.error("Ошибка при удалении подписчика:", error);
      alert("Не удалось удалить подписчика");
    }
  };

  return (
    <div className={styles.followsContainer}>
      <h2>Мои подписки</h2>
      <div className={styles.followsGrid}>
        {/* Мои подписки */}
        <div className={styles.followBlock}>
          <h3>Мои подписки</h3>
          {followingList.length > 0 ? (
            followingList.map((user) => (
              <div key={user.id} className={styles.followCard}>
                <div className={styles.followProfile}>
                  <img src={user.image} alt={user.nickname} className={styles.followAvatar} />
                  <p className={styles.followName}>{user.nickname}</p>
                </div>
                <div className={styles.followActions}>
                  <button onClick={() => handleViewProfile(user.id)} className={styles.viewProfile}>
                    Посмотреть профиль
                  </button>
                  <button onClick={() => handleSendMessage(user.nickname)} className={styles.sendMessage}>
                    Написать сообщение
                  </button>
                  <button onClick={() => handleUnfollow(user.id)} className={styles.unfollow}>
                    Отписаться
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>Вы ни на кого не подписаны</p>
          )}
        </div>

        {/* Мои подписчики */}
        <div className={styles.followBlock}>
          <h3>Мои подписчики</h3>
          {followersList.length > 0 ? (
            followersList.map((user) => (
              <div key={user.id} className={styles.followCard}>
                <div className={styles.followProfile}>
                  <img src={user.image} alt={user.nickname} className={styles.followAvatar} />
                  <p className={styles.followName}>{user.nickname}</p>
                </div>
                <div className={styles.followActions}>
                  <button onClick={() => handleViewProfile(user.id)} className={styles.viewProfile}>
                    Посмотреть профиль
                  </button>
                  <button onClick={() => handleSendMessage(user.nickname)} className={styles.sendMessage}>
                    Написать сообщение
                  </button>
                  <button onClick={() => handleRemoveFollower(user.id)} className={styles.removeFollower}>
                    Удалить подписчика
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>У вас пока нет подписчиков</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Follows;










// import { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { selectUser, fetchCurrentUser } from "../../../redux/slices/auth/authSlice";
// import { selectUsers, fetchUsers } from "../../../redux/slices/auth/usersSlice";
// import { unfollow, removeFollower } from "../../../redux/api/account/accountApi";
// import styles from "./Follows.module.scss";
// import { AppDispatch } from "../../../redux/store";

// const Follows = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const navigate = useNavigate();
//   const currentUser = useSelector(selectUser);
//   const users = useSelector(selectUsers);

//   const token = localStorage.getItem("access_token");

//   useEffect(() => {
//     if (token) {
//       dispatch(fetchCurrentUser(token));
//     }
//   }, [dispatch, token]);

//   useEffect(() => {
//     if (users.length === 0 && token) {
//       dispatch(fetchUsers(token));
//     }
//   }, [dispatch, users, token]);

//   if (!currentUser) return <p>Загрузка профиля...</p>;
//   if (users.length === 0) return <p>Загрузка подписок и подписчиков...</p>;

//   const followingList = users.filter((user) => currentUser.following.includes(user.id));
//   const followersList = users.filter((user) => currentUser.followers.includes(user.id));

//   const handleViewProfile = (id: number) => {
//     navigate(`/profile/${id}`);
//   };

//   const handleSendMessage = (id: number) => {
//     navigate(`/profile/chats/${id}`);
//   };

//   const handleUnfollow = async (targetId: number) => {
//     try {
//       await unfollow(targetId);
//       if (token) dispatch(fetchCurrentUser(token));
//     } catch (error) {
//       console.error("Ошибка при отписке:", error);
//       alert("Не удалось отписаться");
//     }
//   };

//   const handleRemoveFollower = async (targetId: number) => {
//     try {
//       await removeFollower(targetId);
//       if (token) dispatch(fetchCurrentUser(token));
//     } catch (error) {
//       console.error("Ошибка при удалении подписчика:", error);
//       alert("Не удалось удалить подписчика");
//     }
//   };

//   return (
//     <div className={styles.followsContainer}>
//       <h2>Мои подписки</h2>
//       <div className={styles.followsGrid}>
//         {/* Мои подписки */}
//         <div className={styles.followBlock}>
//           <h3>Мои подписки</h3>
//           {followingList.length > 0 ? (
//             followingList.map((user) => (
//               <div key={user.id} className={styles.followCard}>
//                 <div className={styles.followProfile}>
//                   <img src={user.image} alt={user.nickname} className={styles.followAvatar} />
//                   <p className={styles.followName}>{user.nickname}</p>
//                 </div>
//                 <div className={styles.followActions}>
//                   <button onClick={() => handleViewProfile(user.id)} className={styles.viewProfile}>
//                     Посмотреть профиль
//                   </button>
//                   <button onClick={() => handleSendMessage(user.id)} className={styles.sendMessage}>
//                     Написать сообщение
//                   </button>
//                   <button onClick={() => handleUnfollow(user.id)} className={styles.unfollow}>
//                     Отписаться
//                   </button>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <p>Вы ни на кого не подписаны</p>
//           )}
//         </div>

//         {/* Мои подписчики */}
//         <div className={styles.followBlock}>
//           <h3>Мои подписчики</h3>
//           {followersList.length > 0 ? (
//             followersList.map((user) => (
//               <div key={user.id} className={styles.followCard}>
//                 <div className={styles.followProfile}>
//                   <img src={user.image} alt={user.nickname} className={styles.followAvatar} />
//                   <p className={styles.followName}>{user.nickname}</p>
//                 </div>
//                 <div className={styles.followActions}>
//                   <button onClick={() => handleViewProfile(user.id)} className={styles.viewProfile}>
//                     Посмотреть профиль
//                   </button>
//                   <button onClick={() => handleSendMessage(user.id)} className={styles.sendMessage}>
//                     Написать сообщение
//                   </button>
//                   <button onClick={() => handleRemoveFollower(user.id)} className={styles.removeFollower}>
//                     Удалить подписчика
//                   </button>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <p>У вас пока нет подписчиков</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Follows;






