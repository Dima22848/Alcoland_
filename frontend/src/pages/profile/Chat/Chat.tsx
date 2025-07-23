import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useGetChatsQuery } from "../../../redux/api/chat/chatApi";
import { useNavigate, Outlet } from "react-router-dom";
import CreateGroupChatPanel from "../../../components/chat/CreateGroupChatPanel/CreateGroupChatPanel";
import styles from "./Chat.module.scss";

const Chat = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreatePanel, setShowCreatePanel] = useState(false);

  const { data: chats = [], isLoading, isError, error } = useGetChatsQuery();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (isLoading) console.log("Загрузка чатов...");
    if (isError) console.error("Ошибка загрузки чатов:", error);
  }, [isLoading, isError, error]);

  // Универсальный поиск по названию группового чата или никнейму собеседника
  const filteredChats = chats.filter((chat) => {
    const isGroupChat = chat.is_group || (chat.participants_info?.length > 2);
    let chatName = isGroupChat
      ? chat.name || "Групповой чат"
      : "Личный чат";
    if (!isGroupChat && chat.participants_info && currentUser) {
      const interlocutor = chat.participants_info.find(
        (p: any) => p.id !== currentUser.id
      );
      if (interlocutor) chatName = interlocutor.nickname;
    }
    return chatName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // --- При создании нового чата, сразу переходим к нему и скрываем панель ---
  const handleChatCreated = (chatId: number) => {
    setShowCreatePanel(false);
    navigate(`/profile/chats/group_${chatId}`);
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatList}>
        <h2>Чаты</h2>
        {/* Обёртка для выравнивания кнопки и поиска в одну линию */}
        <div className={styles.controlsRow}>
          <input
            type="text"
            placeholder="Поиск чатов"
            className={styles.searchBar}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className={styles.createGroupBtn}
            onClick={() => setShowCreatePanel(true)}
          >
            Создать групповой чат
          </button>
        </div>
        <div className={styles.dialogsList}>
          {filteredChats.map((chat) => {
            const isGroupChat = chat.is_group || (chat.participants_info?.length > 2);

            // Групповой чат: название и аватар группы
            let chatLink = `/profile/chats/group_${chat.id}`;
            let title = chat.name || "Групповой чат";
            let avatar = chat.display_image
              ? (chat.display_image.startsWith("/")
                  ? `http://127.0.0.1:8000${chat.display_image}`
                  : chat.display_image)
              : "/default-avatar.png";

            // Личный чат: берём аватар и никнейм собеседника
            if (!isGroupChat && chat.participants_info && currentUser) {
              const interlocutor = chat.participants_info.find(
                (p: any) => p.id !== currentUser.id
              );
              if (interlocutor) {
                chatLink = `/profile/chats/${interlocutor.nickname}`;
                title = interlocutor.nickname;
                avatar = interlocutor.avatar
                  ? (interlocutor.avatar.startsWith("/")
                      ? `http://127.0.0.1:8000${interlocutor.avatar}`
                      : interlocutor.avatar)
                  : "/default-avatar.png";
              }
            }

            return (
              <div
                key={chat.id}
                className={styles.chatItem}
                onClick={() => {
                  setShowCreatePanel(false);
                  navigate(chatLink);
                }}
              >
                <img src={avatar} alt="avatar" className={styles.avatar} />
                <div className={styles.chatText}>
                  <strong>{title}</strong>
                  <p className={styles.lastMessage}>
                    {typeof chat.last_message === "string"
                      ? chat.last_message
                      : chat.last_message?.text || "Последнее сообщение..."}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.chatContent}>
        {showCreatePanel ? (
          <CreateGroupChatPanel
            onClose={() => setShowCreatePanel(false)}
            onChatCreated={handleChatCreated}
          />
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
};

export default Chat;










// import React, { useState, useEffect } from "react";
// import { useSelector } from "react-redux";
// import { RootState } from "../../../redux/store";
// import { useGetChatsQuery } from "../../../redux/api/chat/chatApi";
// import { useNavigate, Outlet, useLocation } from "react-router-dom";
// import CreateGroupChatPanel from "../../../components/chat/CreateGroupChatPanel/CreateGroupChatPanel";
// import styles from "./Chat.module.scss";

// const Chat = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [searchTerm, setSearchTerm] = useState("");
//   const [showCreatePanel, setShowCreatePanel] = useState(false);

//   const { data: chats = [], isLoading, isError, error } = useGetChatsQuery();
//   const currentUser = useSelector((state: RootState) => state.auth.user);

//   useEffect(() => {
//     if (isLoading) console.log("Загрузка чатов...");
//     if (isError) console.error("Ошибка загрузки чатов:", error);
//   }, [isLoading, isError, error]);

//   // Универсальный поиск по названию группового чата или никнейму собеседника
//   const filteredChats = chats.filter((chat) => {
//     const isGroupChat = chat.is_group || (chat.participants_info?.length > 2);
//     let chatName = isGroupChat
//       ? chat.name || "Групповой чат"
//       : "Личный чат";
//     if (!isGroupChat && chat.participants_info && currentUser) {
//       const interlocutor = chat.participants_info.find(
//         (p: any) => p.id !== currentUser.id
//       );
//       if (interlocutor) chatName = interlocutor.nickname;
//     }
//     return chatName.toLowerCase().includes(searchTerm.toLowerCase());
//   });

//   // --- При создании нового чата, сразу переходим к нему и скрываем панель ---
//   const handleChatCreated = (chatId: number) => {
//     setShowCreatePanel(false);
//     navigate(`/profile/chats/group_${chatId}`);
//   };

//   return (
//     <div className={styles.chatContainer}>
//       <div className={styles.chatList}>
//         <h2>Чаты</h2>
//         <button
//           className={styles.createGroupBtn}
//           onClick={() => setShowCreatePanel(true)}
//         >
//           Создать групповой чат
//         </button>
//         <input
//           type="text"
//           placeholder="Поиск чатов"
//           className={styles.searchBar}
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//         <div className={styles.dialogsList}>
//           {filteredChats.map((chat) => {
//             const isGroupChat = chat.is_group || (chat.participants_info?.length > 2);

//             // Групповой чат: название и аватар группы
//             let chatLink = `/profile/chats/group_${chat.id}`;
//             let title = chat.name || "Групповой чат";
//             let avatar = chat.display_image
//               ? (chat.display_image.startsWith("/")
//                   ? `http://127.0.0.1:8000${chat.display_image}`
//                   : chat.display_image)
//               : "/default-avatar.png";

//             // Личный чат: берём аватар и никнейм собеседника
//             if (!isGroupChat && chat.participants_info && currentUser) {
//               const interlocutor = chat.participants_info.find(
//                 (p: any) => p.id !== currentUser.id
//               );
//               if (interlocutor) {
//                 chatLink = `/profile/chats/${interlocutor.nickname}`;
//                 title = interlocutor.nickname;
//                 avatar = interlocutor.avatar
//                   ? (interlocutor.avatar.startsWith("/")
//                       ? `http://127.0.0.1:8000${interlocutor.avatar}`
//                       : interlocutor.avatar)
//                   : "/default-avatar.png";
//               }
//             }

//             return (
//               <div
//                 key={chat.id}
//                 className={styles.chatItem}
//                 onClick={() => {
//                   setShowCreatePanel(false);
//                   navigate(chatLink);
//                 }}
//               >
//                 <img src={avatar} alt="avatar" className={styles.avatar} />
//                 <div className={styles.chatText}>
//                   <strong>{title}</strong>
//                   <p className={styles.lastMessage}>
//                     {typeof chat.last_message === "string"
//                       ? chat.last_message
//                       : chat.last_message?.text || "Последнее сообщение..."}
//                   </p>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       <div className={styles.chatContent}>
//         {showCreatePanel ? (
//           <CreateGroupChatPanel
//             onClose={() => setShowCreatePanel(false)}
//             onChatCreated={handleChatCreated}
//           />
//         ) : (
//           <Outlet />
//         )}
//       </div>
//     </div>
//   );
// };

// export default Chat;













// import React, { useState, useEffect } from "react";
// import { useSelector } from "react-redux";
// import { RootState } from "../../../redux/store";
// import { useGetChatsQuery } from "../../../redux/api/chat/chatApi";
// import { useNavigate, Outlet } from "react-router-dom";
// import styles from "./Chat.module.scss";

// const Chat = () => {
//   const navigate = useNavigate();
//   const [searchTerm, setSearchTerm] = useState("");
//   const { data: chats = [], isLoading, isError, error } = useGetChatsQuery();
//   const currentUser = useSelector((state: RootState) => state.auth.user);
  
//   useEffect(() => {
//     if (isLoading) console.log("Загрузка чатов...");
//     if (isError) console.error("Ошибка загрузки чатов:", error);
//   }, [isLoading, isError, error]);

//   // Универсальный поиск по названию группового чата или никнейму собеседника
//   const filteredChats = chats.filter((chat) => {
//     const isGroupChat = chat.is_group || (chat.participants_info?.length > 2);
//     let chatName = isGroupChat
//       ? chat.name || "Групповой чат"
//       : "Личный чат";
//     // Для личного чата берём имя собеседника
//     if (!isGroupChat && chat.participants_info && currentUser) {
//       const interlocutor = chat.participants_info.find(
//         (p: any) => p.id !== currentUser.id
//       );
//       if (interlocutor) chatName = interlocutor.nickname;
//     }
//     return chatName.toLowerCase().includes(searchTerm.toLowerCase());
//   });

//   return (
//     <div className={styles.chatContainer}>
//       <div className={styles.chatList}>
//         <h2>Чаты</h2>
//         <input
//           type="text"
//           placeholder="Поиск чатов"
//           className={styles.searchBar}
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//         <div className={styles.dialogsList}>
//           {filteredChats.map((chat) => {
//             const isGroupChat = chat.is_group || (chat.participants_info?.length > 2);

//             // Групповой чат: название и аватар группы
//             let chatLink = `/profile/chats/group_${chat.id}`;
//             let title = chat.name || "Групповой чат";
//             let avatar = chat.display_image
//               ? (chat.display_image.startsWith("/")
//                   ? `http://127.0.0.1:8000${chat.display_image}`
//                   : chat.display_image)
//               : "/default-avatar.png";

//             // Личный чат: берём аватар и никнейм собеседника
//             if (!isGroupChat && chat.participants_info && currentUser) {
//               const interlocutor = chat.participants_info.find(
//                 (p: any) => p.id !== currentUser.id
//               );
//               if (interlocutor) {
//                 chatLink = `/profile/chats/${interlocutor.nickname}`;
//                 title = interlocutor.nickname;
//                 avatar = interlocutor.avatar
//                   ? (interlocutor.avatar.startsWith("/")
//                       ? `http://127.0.0.1:8000${interlocutor.avatar}`
//                       : interlocutor.avatar)
//                   : "/default-avatar.png";
//               }
//             }

//             return (
//               <div
//                 key={chat.id}
//                 className={styles.chatItem}
//                 onClick={() => navigate(chatLink)}
//               >
//                 <img src={avatar} alt="avatar" className={styles.avatar} />
//                 <div className={styles.chatText}>
//                   <strong>{title}</strong>
//                   <p className={styles.lastMessage}>
//                     {typeof chat.last_message === "string"
//                       ? chat.last_message
//                       : chat.last_message?.text || "Последнее сообщение..."}
//                   </p>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//       <div className={styles.chatContent}>
//         <Outlet />
//       </div>
//     </div>
//   );
// };

// export default Chat;









