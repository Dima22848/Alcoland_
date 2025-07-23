import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  selectUser,
  fetchCurrentUser,
} from "../../../redux/slices/auth/authSlice";
import {
  selectUsers,
  fetchUsers,
} from "../../../redux/slices/auth/usersSlice";
import {
  addFriend,
  ignoreRequest,
  removeFriend,
  unfollow,
  follow,
} from "../../../redux/api/account/accountApi";
import { AppDispatch, RootState } from "../../../redux/store";
import styles from "./Friends.module.scss";

// Импорт нового хука RTK Query для создания/поиска чата по nickname
import { useFetchOrCreateChatWithNicknameMutation } from "../../../redux/api/chat/chatApi";

const Friends = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const currentUser = useSelector(selectUser);
  const users = useSelector(selectUsers);
  const token = useSelector((state: RootState) => state.auth.token);
  const [selectedTab, setSelectedTab] = useState<"friends" | "requests">("friends");

  // Хук RTK Query
  const [fetchOrCreateChatWithNickname] = useFetchOrCreateChatWithNicknameMutation();

  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser(token));
      dispatch(fetchUsers(token));
    }
  }, [dispatch, token]);

  if (!currentUser) return <p>Загрузка профиля...</p>;
  if (users.length === 0) return <p>Загрузка списка пользователей...</p>;

  const friendsList = users.filter((user) => currentUser.friends.includes(user.id));
  const friendRequests = users.filter(
    (user) =>
      currentUser.followers.includes(user.id) &&
      !currentUser.friends.includes(user.id) &&
      !currentUser.ignored_requests.includes(user.id)
  );

  const handleViewProfile = (userId: number) => {
    navigate(`/profile/${userId}`);
  };

  // Новый обработчик "Написать сообщение"
  const handleSendMessage = async (nickname: string) => {
    try {
      await fetchOrCreateChatWithNickname(nickname).unwrap();
      navigate(`/profile/chats/${nickname}`);
    } catch (err) {
      alert("Ошибка при создании чата");
    }
  };

  const handleRemoveFriend = async (userId: number) => {
    try {
      await removeFriend(userId);
      if (token) dispatch(fetchCurrentUser(token));
    } catch (err) {
      console.error("Ошибка при удалении из друзей:", err);
    }
  };

  const handleAcceptFriend = async (userId: number) => {
    await addFriend(userId);
    if (token) dispatch(fetchCurrentUser(token));
  };

  const handleDeclineFriend = async (userId: number) => {
    try {
      await ignoreRequest(userId);
      if (token) dispatch(fetchCurrentUser(token));
    } catch (err) {
      console.error("Ошибка при отклонении заявки:", err);
    }
  };

  return (
    <div className={styles.friendsContainer}>
      <div className={styles.tabButtons}>
        <button
          className={selectedTab === "friends" ? styles.activeTab : ""}
          onClick={() => setSelectedTab("friends")}
        >
          Мои друзья ({friendsList.length})
        </button>
        <button
          className={selectedTab === "requests" ? styles.activeTab : ""}
          onClick={() => setSelectedTab("requests")}
        >
          Заявки в друзья ({friendRequests.length})
        </button>
      </div>

      <h2>
        {selectedTab === "friends"
          ? `Мои друзья (${friendsList.length})`
          : `Заявки в друзья (${friendRequests.length})`}
      </h2>

      {selectedTab === "friends" ? (
        <div className={styles.friendsList}>
          {friendsList.map((friend) => (
            <div key={friend.id} className={styles.friendCard}>
              <img
                src={friend.image || "/default-avatar.png"}
                alt={friend.nickname}
                className={styles.avatar}
              />
              <p>{friend.nickname}</p>
              <div className={styles.friendActionsColumn}>
                <button onClick={() => handleViewProfile(friend.id)}>Посмотреть профиль</button>
                <button onClick={() => handleSendMessage(friend.nickname)}>Написать сообщение</button>
                <button onClick={() => handleRemoveFriend(friend.id)}>Удалить из друзей</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.friendsList}>
          {friendRequests.length ? (
            friendRequests.map((user) => (
              <div key={user.id} className={styles.friendCard}>
                <img
                  src={user.image || "/default-avatar.png"}
                  alt={user.nickname}
                  className={styles.avatar}
                />
                <p>{user.nickname}</p>
                <div className={styles.friendActions}>
                  <button onClick={() => handleViewProfile(user.id)}>Посмотреть профиль</button>
                  <button onClick={() => handleAcceptFriend(user.id)}>Принять</button>
                  <button onClick={() => handleDeclineFriend(user.id)}>Отклонить</button>
                </div>
              </div>
            ))
          ) : (
            <p>У вас нет заявок в друзья.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Friends;








// import { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import {
//   selectUser,
//   fetchCurrentUser,
// } from "../../../redux/slices/auth/authSlice";
// import {
//   selectUsers,
//   fetchUsers,
// } from "../../../redux/slices/auth/usersSlice";
// import {
//   addFriend,
//   ignoreRequest,
//   removeFriend,
//   unfollow,
//   follow
// } from "../../../redux/api/account/accountApi";
// import { AppDispatch, RootState } from "../../../redux/store";
// import styles from "./Friends.module.scss";
// import { useState } from "react";

// const Friends = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const navigate = useNavigate();
//   const currentUser = useSelector(selectUser);
//   const users = useSelector(selectUsers);
//   const token = useSelector((state: RootState) => state.auth.token);
//   const [selectedTab, setSelectedTab] = useState<"friends" | "requests">("friends");

//   useEffect(() => {
//     if (token) {
//       dispatch(fetchCurrentUser(token));
//       dispatch(fetchUsers(token));
//     }
//   }, [dispatch, token]);

//   if (!currentUser) return <p>Загрузка профиля...</p>;
//   if (users.length === 0) return <p>Загрузка списка пользователей...</p>;

//   const friendsList = users.filter((user) => currentUser.friends.includes(user.id));
//   const friendRequests = users.filter(
//     (user) => 
//       currentUser.followers.includes(user.id) && 
//       !currentUser.friends.includes(user.id) &&
//       !currentUser.ignored_requests.includes(user.id)
//   );

//   const handleViewProfile = (userId: number) => {
//     navigate(`/profile/${userId}`);
//   };

//   const handleSendMessage = (userId: number) => {
//     navigate(`/profile/chats/${userId}`);
//   };

//   const handleRemoveFriend = async (userId: number) => {
//     try {
//       await removeFriend(userId);
//       if (token) dispatch(fetchCurrentUser(token));
//     } catch (err) {
//       console.error("Ошибка при удалении из друзей:", err);
//     }
//   };

//   const handleAcceptFriend = async (userId: number) => {
//     await addFriend(userId);
//     if (token) dispatch(fetchCurrentUser(token));
//   };

//   const handleDeclineFriend = async (userId: number) => {
//     try {
//       await ignoreRequest(userId);
//       if (token) dispatch(fetchCurrentUser(token));
//     } catch (err) {
//       console.error("Ошибка при отклонении заявки:", err);
//     }
//   };

//   return (
//     <div className={styles.friendsContainer}>
//       <div className={styles.tabButtons}>
//         <button
//           className={selectedTab === "friends" ? styles.activeTab : ""}
//           onClick={() => setSelectedTab("friends")}
//         >
//           Мои друзья ({friendsList.length})
//         </button>
//         <button
//           className={selectedTab === "requests" ? styles.activeTab : ""}
//           onClick={() => setSelectedTab("requests")}
//         >
//           Заявки в друзья ({friendRequests.length})
//         </button>
//       </div>

//       <h2>
//         {selectedTab === "friends"
//           ? `Мои друзья (${friendsList.length})`
//           : `Заявки в друзья (${friendRequests.length})`}
//       </h2>

//       {selectedTab === "friends" ? (
//         <div className={styles.friendsList}>
//           {friendsList.map((friend) => (
//             <div key={friend.id} className={styles.friendCard}>
//               <img
//                 src={friend.image || "/default-avatar.png"}
//                 alt={friend.nickname}
//                 className={styles.avatar}
//               />
//               <p>{friend.nickname}</p>
//               <div className={styles.friendActionsColumn}>
//                 <button onClick={() => handleViewProfile(friend.id)}>Посмотреть профиль</button>
//                 <button onClick={() => handleSendMessage(friend.id)}>Написать сообщение</button>
//                 <button onClick={() => handleRemoveFriend(friend.id)}>Удалить из друзей</button>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className={styles.friendsList}>
//           {friendRequests.length ? (
//             friendRequests.map((user) => (
//               <div key={user.id} className={styles.friendCard}>
//                 <img
//                   src={user.image || "/default-avatar.png"}
//                   alt={user.nickname}
//                   className={styles.avatar}
//                 />
//                 <p>{user.nickname}</p>
//                 <div className={styles.friendActions}>
//                   <button onClick={() => handleViewProfile(user.id)}>Посмотреть профиль</button>
//                   <button onClick={() => handleAcceptFriend(user.id)}>Принять</button>
//                   <button onClick={() => handleDeclineFriend(user.id)}>Отклонить</button>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <p>У вас нет заявок в друзья.</p>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Friends;




