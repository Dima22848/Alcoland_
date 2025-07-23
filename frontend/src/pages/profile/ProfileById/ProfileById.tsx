import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, fetchCurrentUser } from "../../../redux/slices/auth/authSlice";
import { AppDispatch } from "../../../redux/store";
import {
  fetchUser,
  removeFriend,
  follow,
  unfollow,
  removeFollower,
  addFriend,
} from "../../../redux/api/account/accountApi";
import { useGetNewsfeedQuery } from "../../../redux/api/account/newsFeedApi";
import NewsFeedItem from "../NewsFeed/NewsFeedItem";
import styles from "./ProfileById.module.scss";

// Импорт нового хука RTK Query для чата
import { useFetchOrCreateChatWithNicknameMutation } from "../../../redux/api/chat/chatApi";

const ProfileById = () => {
  const { id } = useParams();
  const userId = Number(id);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector(selectUser);
  const token = localStorage.getItem("access_token");

  const [targetUser, setTargetUser] = useState<any | null>(null);
  const { data: posts } = useGetNewsfeedQuery();

  // Новый хук RTK Query для чата
  const [fetchOrCreateChatWithNickname] = useFetchOrCreateChatWithNicknameMutation();

  // 🚨 Перенаправление, если пользователь зашёл на свой же профиль
  useEffect(() => {
    if (currentUser && currentUser.id === userId) {
      navigate("/profile", { replace: true });
    }
  }, [currentUser, userId, navigate]);

  // 📥 Загрузка данных целевого пользователя и обновление текущего
  useEffect(() => {
    const loadData = async () => {
      if (!userId || !token) return;
      const user = await fetchUser(userId.toString());
      setTargetUser(user);
      dispatch(fetchCurrentUser(token));
    };
    loadData();
  }, [userId, token, dispatch]);

  if (!currentUser || !targetUser) return <p>Загрузка профиля...</p>;

  const isFriend = currentUser.friends.includes(userId);
  const isFollowing = currentUser.following.includes(userId);
  const isFollower = currentUser.followers.includes(userId);

  const handleAddFriend = async () => {
    if (!targetUser || !targetUser.id) return;
    try {
      await follow(targetUser.id); // просто подписка
      const updatedUser = await fetchUser(targetUser.id.toString());
      setTargetUser(updatedUser);
      dispatch(fetchCurrentUser(token!));
      console.log("Заявка в друзья отправлена");
    } catch (err) {
      console.error("Ошибка при отправке заявки в друзья:", err);
    }
  };

  // Новый обработчик для сообщения
  const handleSendMessage = async () => {
    try {
      await fetchOrCreateChatWithNickname(targetUser.nickname).unwrap();
      navigate(`/profile/chats/${targetUser.nickname}`);
    } catch (err) {
      alert("Ошибка при создании чата");
    }
  };

  const handleRemoveFriend = async () => {
    await removeFriend(targetUser.id);
    dispatch(fetchCurrentUser(token!));
  };

  const handleRemoveFollower = async () => {
    await removeFollower(targetUser.id);
    dispatch(fetchCurrentUser(token!));
  };

  const handleUnfollow = async () => {
    await unfollow(targetUser.id);
    dispatch(fetchCurrentUser(token!));
  };

  const userPosts = posts?.filter((post) => post.profile_id === userId);

  const renderButtons = () => {
    const actions = [];

    actions.push(
      <button key="msg" onClick={handleSendMessage}>
        Написать сообщение
      </button>
    );

    if (isFriend) {
      actions.push(
        <button key="remove-friend" onClick={handleRemoveFriend}>
          Убрать из друзей
        </button>
      );
    } else if (isFollower && !isFriend) {
      actions.push(
        <button key="accept-friend" onClick={async () => {
          await addFriend(targetUser.id);
          const updatedUser = await fetchUser(targetUser.id.toString());
          setTargetUser(updatedUser);
          dispatch(fetchCurrentUser(token!));
        }}>
          Принять запрос в друзья
        </button>
      );

      actions.push(
        <button key="remove-follower" onClick={handleRemoveFollower}>
          Убрать из подписчиков
        </button>
      );
    } else if (isFollowing) {
      actions.push(
        <button key="unfollow" onClick={handleUnfollow}>
          Отписаться
        </button>
      );
    }

    if (!isFriend && !isFollower && !isFollowing) {
      actions.push(
        <button key="add-friend" onClick={handleAddFriend}>
          Добавить в друзья
        </button>
      );
    }

    return actions;
  };

  return (
    <div className={styles.profileContainer}>
      {/* Блок с фото и информацией */}
      <div className={styles.profileDetails}>
        <img src={targetUser.image} alt="Profile" className={styles.profileImage} />
        <div className={styles.profileText}>
          <p><strong>Возраст:</strong> {targetUser.age || "Не указан"}</p>
          <p><strong>Город:</strong> {targetUser.city_display || "Не указан"}</p>
          <p><strong>Профессия:</strong> {targetUser.profession || "Не указана"}</p>
          <p><strong>Хобби:</strong> {targetUser.hobby || "Не указано"}</p>
          <p><strong>О себе:</strong> {targetUser.extra_info || "Нет информации"}</p>
          <div style={{ marginTop: "15px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {renderButtons()}
          </div>
        </div>
      </div>

      {/* Посты пользователя */}
      <div className={styles.newsFeed}>
        <h2>Посты пользователя</h2>
        {userPosts?.length ? (
          userPosts.map((post) => (
            <NewsFeedItem key={post.id} post={post} userData={{ [targetUser.id]: targetUser }} />
          ))
        ) : (
          <p>У пользователя пока нет постов.</p>
        )}
      </div>
    </div>
  );
};

export default ProfileById;










// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { selectUser, fetchCurrentUser } from "../../../redux/slices/auth/authSlice";
// import { AppDispatch } from "../../../redux/store";
// import {
//   fetchUser,
//   removeFriend,
//   follow,
//   unfollow,
//   removeFollower,
//   addFriend,
// } from "../../../redux/api/account/accountApi";
// import { useGetNewsfeedQuery } from "../../../redux/api/account/newsFeedApi";
// import NewsFeedItem from "../NewsFeed/NewsFeedItem";
// import styles from "./ProfileById.module.scss"; // переиспользуем те же стили

// const ProfileById = () => {
//   const { id } = useParams();
//   const userId = Number(id);
//   const navigate = useNavigate();
//   const dispatch = useDispatch<AppDispatch>();
//   const currentUser = useSelector(selectUser);
//   const token = localStorage.getItem("access_token");

//   const [targetUser, setTargetUser] = useState<any | null>(null);
//   const { data: posts } = useGetNewsfeedQuery();

//   // 🚨 Перенаправление, если пользователь зашёл на свой же профиль
//   useEffect(() => {
//     if (currentUser && currentUser.id === userId) {
//       navigate("/profile", { replace: true });
//     }
//   }, [currentUser, userId, navigate]);

//   // 📥 Загрузка данных целевого пользователя и обновление текущего
//   useEffect(() => {
//     const loadData = async () => {
//       if (!userId || !token) return;
//       const user = await fetchUser(userId.toString());
//       setTargetUser(user);
//       dispatch(fetchCurrentUser(token));
//     };
//     loadData();
//   }, [userId, token, dispatch]);

//   if (!currentUser || !targetUser) return <p>Загрузка профиля...</p>;

//   const isFriend = currentUser.friends.includes(userId);
//   const isFollowing = currentUser.following.includes(userId);
//   const isFollower = currentUser.followers.includes(userId);

//   const handleAddFriend = async () => {
//     if (!targetUser || !targetUser.id) return;
//     try {
//       await follow(targetUser.id); // просто подписка
//       const updatedUser = await fetchUser(targetUser.id.toString());
//       setTargetUser(updatedUser);
//       dispatch(fetchCurrentUser(token!));
//       console.log("Заявка в друзья отправлена");
//     } catch (err) {
//       console.error("Ошибка при отправке заявки в друзья:", err);
//     }
//   };


//   const handleSendMessage = () => {
//     navigate(`/profile/chats/${userId}`);
//   };

//   const handleRemoveFriend = async () => {
//     await removeFriend(targetUser.id);
//     dispatch(fetchCurrentUser(token!));
//   };

//   const handleRemoveFollower = async () => {
//     await removeFollower(targetUser.id);
//     dispatch(fetchCurrentUser(token!));
//   };

//   const handleUnfollow = async () => {
//     await unfollow(targetUser.id);
//     dispatch(fetchCurrentUser(token!));
//   };

//   const userPosts = posts?.filter((post) => post.profile_id === userId);

//   const renderButtons = () => {
//     const actions = [];

//     actions.push(
//       <button key="msg" onClick={handleSendMessage}>
//         Написать сообщение
//       </button>
//     );

//     if (isFriend) {
//       actions.push(
//         <button key="remove-friend" onClick={handleRemoveFriend}>
//           Убрать из друзей
//         </button>
//       );
//     } else if (isFollower && !isFriend) {
//       actions.push(
//         <button key="accept-friend" onClick={async () => {
//           await addFriend(targetUser.id);
//           const updatedUser = await fetchUser(targetUser.id.toString());
//           setTargetUser(updatedUser);
//           dispatch(fetchCurrentUser(token!));
//         }}>
//           Принять запрос в друзья
//         </button>
//       );

//       actions.push(
//         <button key="remove-follower" onClick={handleRemoveFollower}>
//           Убрать из подписчиков
//         </button>
//       );
//     } else if (isFollowing) {
//       actions.push(
//         <button key="unfollow" onClick={handleUnfollow}>
//           Отписаться
//         </button>
//       );
//     }

//     if (!isFriend && !isFollower && !isFollowing) {
//       actions.push(
//         <button key="add-friend" onClick={handleAddFriend}>
//           Добавить в друзья
//         </button>
//       );
//     }


//     return actions;
//   };

//   return (
//     <div className={styles.profileContainer}>
//       {/* Блок с фото и информацией */}
//       <div className={styles.profileDetails}>
//         <img src={targetUser.image} alt="Profile" className={styles.profileImage} />
//         <div className={styles.profileText}>
//           <p><strong>Возраст:</strong> {targetUser.age || "Не указан"}</p>
//           <p><strong>Город:</strong> {targetUser.city_display || "Не указан"}</p>
//           <p><strong>Профессия:</strong> {targetUser.profession || "Не указана"}</p>
//           <p><strong>Хобби:</strong> {targetUser.hobby || "Не указано"}</p>
//           <p><strong>О себе:</strong> {targetUser.extra_info || "Нет информации"}</p>
//           <div style={{ marginTop: "15px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
//             {renderButtons()}
//           </div>
//         </div>
//       </div>

//       {/* Посты пользователя */}
//       <div className={styles.newsFeed}>
//         <h2>Посты пользователя</h2>
//         {userPosts?.length ? (
//           userPosts.map((post) => (
//             <NewsFeedItem key={post.id} post={post} userData={{ [targetUser.id]: targetUser }} />
//           ))
//         ) : (
//           <p>У пользователя пока нет постов.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProfileById;







