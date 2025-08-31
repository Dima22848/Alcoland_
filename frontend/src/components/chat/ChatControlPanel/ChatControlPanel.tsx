import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import {
  useGetChatByIdQuery,
  useEditChatNameMutation,
  useUpdateChatAvatarMutation,
  useInviteToChatMutation,
  useDeleteChatMutation,
  useHideChatForMeMutation,
  useGetParticipantsQuery,
} from "../../../redux/api/chat/chatApi";
import ChatParticipantsPanel from "../ChatParticipantsPanel/ChatParticipantsPanel";
import styles from "./ChatControlPanel.module.scss";
import { Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChatControlPanelProps {
  chatId: number;
}

const ChatControlPanel: React.FC<ChatControlPanelProps> = ({ chatId }) => {
  const { data: chat } = useGetChatByIdQuery(chatId.toString());
  const { data: participants } = useGetParticipantsQuery(chatId);
  const [editNameMode, setEditNameMode] = useState(false);
  const [newName, setNewName] = useState("");
  const [editChatName] = useEditChatNameMutation();
  const [updateChatAvatar] = useUpdateChatAvatarMutation();
  const [inviteToChat] = useInviteToChatMutation();
  const [deleteChat] = useDeleteChatMutation();
  const [hideChatForMe] = useHideChatForMeMutation();
  const [showParticipants, setShowParticipants] = useState(false);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();

  

  const isGroupChat = chat?.is_group || (chat?.participants?.length ?? 0) > 2;
  const currentParticipant = participants?.find(
    (p) => currentUser && p.id === currentUser.id
  );
  const isCreator = currentParticipant?.role === "creator";
  const isAdmin = isCreator || currentParticipant?.role === "admin";

  useEffect(() => {
    if (!isGroupChat) {
      setShowParticipants(false);
    }
  }, [chatId, isGroupChat]);

  if (!chat || !participants) return <div>Загрузка...</div>;

  const handleEditName = async () => {
    if (newName.trim()) {
      await editChatName({ chatId, name: newName });
      setEditNameMode(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file); // <-- используем "image", не "avatar"
      try {
        await updateChatAvatar({ chatId, formData }).unwrap();
        // RTK Query автоматически обновит кэш, если invalidatesTags настроен на ["Chats"]
      } catch (err) {
        alert("Не удалось обновить аватар");
      }
    }
  };


  // Универсальный обработчик удаления
  const handleDeleteChat = async () => {
    try {
      if (isGroupChat) {
        // Удаление чата только если ты создатель
        if (!isCreator) {
          alert("Только создатель группы может удалить групповой чат для всех!");
          return;
        }
        await deleteChat(chatId).unwrap();
        alert("Групповой чат удалён для всех.");
      } else {
        // Скрытие личного чата только для себя
        await hideChatForMe(chatId).unwrap();
        alert("Личный чат скрыт для вас.");
      }
      navigate("/profile/chats");
    } catch (err: any) {
      alert(
        "Ошибка при удалении чата: " +
          (err?.data?.detail || err.message || "Попробуйте позже.")
      );
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.chatTitle}>
        {isGroupChat ? (
          editNameMode ? (
            <div className={styles.editRowInline}>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className={styles.input}
              />
              <button onClick={handleEditName} className={styles.iconBtn}>
                <Check size={18} />
              </button>
              <button
                onClick={() => setEditNameMode(false)}
                className={styles.iconBtn}
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <h3
              onClick={() => {
                setNewName(chat.name || "");
                setEditNameMode(true);
              }}
            >
              {chat.name}
            </h3>
          )
        ) : (
          <h3>{chat.display_name || "Личный чат"}</h3>
        )}
      </div>

      <div className={styles.controls}>
        {isGroupChat && (
          <>
            <button
              className={styles.button}
              onClick={() => {
                setNewName(chat.name || "");
                setEditNameMode(true);
              }}
            >
              Изменить название
            </button>

            <div
              className={styles.button}
              onClick={() =>
                document.getElementById("avatarInput")?.click()
              }
            >
              Изменить аватар
              <input
                type="file"
                accept="image/*"
                id="avatarInput"
                hidden
                onChange={handleAvatarChange}
              />
            </div>

            <button
              className={styles.button}
              onClick={() => setShowParticipants((prev) => !prev)}
            >
              {showParticipants ? "Скрыть участников" : "Участники чата"}
            </button>
          </>
        )}

        <button
          className={styles.button}
          style={{ marginLeft: "auto" }}
          onClick={handleDeleteChat}
        >
          Удалить чат
        </button>
      </div>

      {showParticipants && (
        <ChatParticipantsPanel
          participants={participants.map((p) => ({
            ...p,
            role: p.role ?? "member",
          }))}
          chatId={chatId}
          onClose={() => setShowParticipants(false)}
        />
      )}
    </div>
  );
};

export default ChatControlPanel;









// import React, { useState } from "react";
// import { useSelector } from "react-redux";
// import { RootState } from "../../../redux/store";
// import {
//   useGetChatByIdQuery,
//   useEditChatNameMutation,
//   useUpdateChatAvatarMutation,
//   useInviteToChatMutation,
//   useDeleteChatMutation,
//   useGetParticipantsQuery
// } from "../../../redux/api/chat/chatApi";
// import ChatParticipantsPanel from "../ChatParticipantsPanel/ChatParticipantsPanel";
// import styles from "./ChatControlPanel.module.scss";
// import { Check, X } from "lucide-react";

// interface ChatControlPanelProps {
//   chatId: number;
// }

// const ChatControlPanel: React.FC<ChatControlPanelProps> = ({ chatId }) => {
//   const { data: chat } = useGetChatByIdQuery(chatId.toString());
//   const { data: participants } = useGetParticipantsQuery(chatId);
//   const [editNameMode, setEditNameMode] = useState(false);
//   const [newName, setNewName] = useState("");
//   const [editChatName] = useEditChatNameMutation();
//   const [updateChatAvatar] = useUpdateChatAvatarMutation();
//   const [inviteToChat] = useInviteToChatMutation();
//   const [deleteChat] = useDeleteChatMutation();
//   const [showParticipants, setShowParticipants] = useState(false);
//   const currentUser = useSelector((state: RootState) => state.auth.user);

//   if (!chat || !participants) return <div>Загрузка...</div>;

//   const isGroupChat = chat.participants.length > 2;
//   const currentParticipant = participants.find(p => currentUser && p.id === currentUser.id);
//   const isCreator = currentParticipant?.role === "creator";
//   const isAdmin = isCreator || currentParticipant?.role === "admin";

//   const handleEditName = async () => {
//     if (newName.trim()) {
//       await editChatName({ chatId, name: newName });
//       setEditNameMode(false);
//     }
//   };

//   const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       const formData = new FormData();
//       formData.append("avatar", file);
//       updateChatAvatar({ chatId, formData });
//     }
//   };

//   // ...

//   return (
//     <div className={styles.panel}>
//       <div className={styles.chatTitle}>
//         {isGroupChat ? (
//           editNameMode ? (
//             <div className={styles.editRowInline}>
//               <input
//                 type="text"
//                 value={newName}
//                 onChange={(e) => setNewName(e.target.value)}
//                 className={styles.input}
//               />
//               <button onClick={handleEditName} className={styles.iconBtn}><Check size={18} /></button>
//               <button onClick={() => setEditNameMode(false)} className={styles.iconBtn}><X size={18} /></button>
//             </div>
//           ) : (
//             // --- ВОТ ЗДЕСЬ ---
//             <h3 onClick={() => {
//               setNewName(chat.name || ""); // ← ИСПРАВЛЕНО
//               setEditNameMode(true);
//             }}>{chat.name}</h3>
//           )
//         ) : (
//           <h3>{chat.display_name || "Личный чат"}</h3>
//         )}
//       </div>

//       <div className={styles.controls}>
//         {isGroupChat && (
//           <>
//             <button
//               className={styles.button}
//               onClick={() => {
//                 setNewName(chat.name || ""); // ← ИСПРАВЛЕНО
//                 setEditNameMode(true);
//               }}>
//               Изменить название
//             </button>

//             <div className={styles.button} onClick={() => document.getElementById("avatarInput")?.click()}>
//               Изменить аватар
//               <input
//                 type="file"
//                 accept="image/*"
//                 id="avatarInput"
//                 hidden
//                 onChange={handleAvatarChange}
//               />
//             </div>

//             <button
//               className={styles.button}
//               onClick={() => setShowParticipants(prev => !prev)}>
//               {showParticipants ? "Скрыть участников" : "Участники чата"}
//             </button>
//           </>
//         )}

//         <button
//           className={styles.button}
//           style={{ marginLeft: "auto" }}
//           onClick={() => deleteChat(chatId)}>
//           Удалить чат
//         </button>
//       </div>

//       {showParticipants && (
//         <ChatParticipantsPanel
//           // ---- ЕСЛИ ТРЕБУЕТСЯ ОБЯЗАТЕЛЬНАЯ ROLE:
//           participants={participants.map(p => ({
//             ...p,
//             role: p.role ?? "member"  // ← всегда будет хотя бы "member"
//           }))}
//           chatId={chatId}
//           onClose={() => setShowParticipants(false)}
//         />
//       )}
//     </div>
//   );

// };

// export default ChatControlPanel;






