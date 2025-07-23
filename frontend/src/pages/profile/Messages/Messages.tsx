import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../redux/store";
import { useGetMessagesByChatIdQuery } from "../../../redux/api/chat/messageApi";
import {
  setMessages,
  addMessage,
  clearMessages,
} from "../../../redux/slices/chat/messageSlice";
import styles from "./Messages.module.scss";
import ChatControlPanel from "../../../components/chat/ChatControlPanel/ChatControlPanel";

interface Message {
  id: number;
  chat: number;
  sender: {
    id: number;
    nickname: string;
    image?: string;
  };
  text: string;
  file: any;
  file_url: string | null;
  created_at: string;
  attachments?: Array<{ id: number; file: string; created_at: string }>;
}

const Messages: React.FC = () => {
  const { slug } = useParams<{ slug: string }>(); // nickname, group_<id> или id!
  const [chatId, setChatId] = useState<number | null>(null);
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id;
  const userNickname = user?.nickname;

  // Получаем chatId: если это group_<id> — вытаскиваем id, иначе POST для nickname
  useEffect(() => {
    async function fetchChatId() {
      if (!slug) return;
      // group_17 → 17
      if (slug.startsWith("group_")) {
        setChatId(Number(slug.replace("group_", "")));
      } else if (/^\d+$/.test(slug)) {
        setChatId(Number(slug));
      } else {
        // Никнейм — делаем запрос на эндпоинт
        const token = localStorage.getItem("access_token");
        const response = await fetch(
          `http://localhost:8000/api/chats/with-nickname/${slug}/`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setChatId(data.chat_id);
      }
    }
    fetchChatId();
  }, [slug]);

  // Загружаем сообщения только когда chatId есть
  const { data: messagesData, isLoading, isError } = useGetMessagesByChatIdQuery(
    chatId ? String(chatId) : "",
    { skip: !chatId }
  );

  const [newMessage, setNewMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<
    Array<{ file: File; url: string }>
  >([]);
  const [newMessageWasSent, setNewMessageWasSent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // WebSocket — подключаемся только когда chatId есть
  useEffect(() => {
    if (!chatId) return;
    socketRef.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${chatId}/`);
    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "new_message") {
        dispatch(addMessage(data.message));
      }
    };
    return () => {
      socketRef.current?.close();
    };
  }, [chatId, dispatch]);

  useEffect(() => {
    if (messagesData && chatId) {
      dispatch(setMessages({ chatId, messages: messagesData }));
    }
    return () => {
      if (chatId) dispatch(clearMessages(chatId));
    };
  }, [messagesData, dispatch, chatId]);

  useEffect(() => {
    if (newMessageWasSent) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setNewMessageWasSent(false);
    }
  }, [newMessageWasSent]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }));
      setSelectedFiles((prev) => [...prev, ...filesArray]);
      e.target.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].url);
      updated.splice(index, 1);
      return updated;
    });
  };

  // --- Файлы через API ---
  const sendMessageWithFiles = async () => {
    if (!userId || !chatId) return;
    const text = newMessage.trim();
    if (!text && selectedFiles.length === 0) return;

    const formData = new FormData();
    formData.append("chat", chatId.toString());
    formData.append("text", text);

    selectedFiles.forEach((fileObj) => {
      formData.append("files", fileObj.file);
    });

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://localhost:8000/api/messages/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) throw new Error("Ошибка отправки сообщения с файлом");
      const data = await response.json();

      dispatch(addMessage(data));
      setNewMessage("");
      setSelectedFiles([]);
      setNewMessageWasSent(true);

      if (socketRef.current) {
        socketRef.current.send(
          JSON.stringify({
            type: "new_message",
            chat_id: chatId,
            sender_id: userId,
            text: data.text,
            attachments: data.attachments,
            created_at: data.created_at,
            id: data.id,
          })
        );
      }
    } catch (err) {
      alert("Ошибка при отправке файла: " + (err as Error).message);
    }
  };

  // --- Текст через WebSocket ---
  const sendMessageViaSocket = async () => {
    if (!userId || !chatId || !socketRef.current) return;
    const text = newMessage.trim();
    if (!text) return;

    const payload: any = {
      type: "new_message",
      chat_id: chatId,
      sender_id: userId,
      text,
    };

    const tempMessage: Message = {
      id: Date.now(),
      chat: chatId,
      sender: {
        id: userId,
        nickname: userNickname || "Вы",
        image: user?.image,
      },
      text,
      file: null,
      file_url: null,
      created_at: new Date().toISOString(),
    };

    dispatch(addMessage(tempMessage));
    socketRef.current.send(JSON.stringify(payload));
    setNewMessage("");
    setNewMessageWasSent(true);
  };

  // --- Выбор логики ---
  const handleSendMessage = async () => {
    if (selectedFiles.length > 0) {
      await sendMessageWithFiles();
    } else {
      await sendMessageViaSocket();
    }
  };

  const messagesInStore = useSelector(
    (state: RootState) => (chatId ? state.message.messages[chatId] : []) || []
  );
  const sortedMessages = [...messagesInStore].sort(
    (a, b) => Date.parse(a.created_at) - Date.parse(b.created_at)
  );

  const isImageFile = (name: string) =>
    /\.(jpe?g|png|gif|bmp|webp)$/i.test(name);
  const isVideoFile = (name: string) => /\.(mp4|webm|ogg)$/i.test(name);

  return (
    <div className={styles.messagesContainer}>
      <div className={styles.chatHeader}>
        {chatId && <ChatControlPanel chatId={chatId} />}
      </div>

      <div className={styles.messagesList}>
        {isLoading && <p>Загрузка...</p>}
        {isError && <p>Ошибка при загрузке сообщений</p>}

        {sortedMessages.map((message: Message) => {
          const isOwn = message.sender.id === userId;
          return (
            <div
              key={message.id}
              className={`${styles.messageRow} ${isOwn ? styles.myMessage : styles.theirMessage}`}
            >
              {!isOwn && (
                <>
                  <img
                    src={
                      message.sender.image
                        ? message.sender.image.startsWith("/")
                          ? `http://127.0.0.1:8000${message.sender.image}`
                          : message.sender.image
                        : "/default-avatar.png"
                    }
                    className={styles.avatar}
                    alt="avatar"
                  />
                  <div className={styles.messageContent}>
                    <div className={styles.messageSender}>
                      <strong>{message.sender.nickname}</strong>
                    </div>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className={styles.attachmentsGallery}>
                        {message.attachments.map((att) =>
                          isImageFile(att.file) ? (
                            <img
                              key={att.id}
                              src={att.file}
                              alt=""
                              className={styles.imagePreview}
                              onClick={() => window.open(att.file, "_blank")}
                            />
                          ) : isVideoFile(att.file) ? (
                            <video
                              key={att.id}
                              src={att.file}
                              controls
                              className={styles.videoPreview}
                            />
                          ) : (
                            <a key={att.id} href={att.file} target="_blank" rel="noopener noreferrer">
                              {att.file.split("/").pop()}
                            </a>
                          )
                        )}
                      </div>
                    )}
                    {message.text && <div className={styles.messageText}>{message.text}</div>}
                    <div className={styles.messageTime}>
                      {new Date(message.created_at).toLocaleString()}
                    </div>
                  </div>
                </>
              )}
              {isOwn && (
                <>
                  <div className={styles.messageContent}>
                    <div className={styles.messageSender}>
                      <strong>{message.sender.nickname}</strong>
                    </div>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className={styles.attachmentsGallery}>
                        {message.attachments.map((att) =>
                          isImageFile(att.file) ? (
                            <img
                              key={att.id}
                              src={att.file}
                              alt=""
                              className={styles.imagePreview}
                              onClick={() => window.open(att.file, "_blank")}
                            />
                          ) : isVideoFile(att.file) ? (
                            <video
                              key={att.id}
                              src={att.file}
                              controls
                              className={styles.videoPreview}
                            />
                          ) : (
                            <a key={att.id} href={att.file} target="_blank" rel="noopener noreferrer">
                              {att.file.split("/").pop()}
                            </a>
                          )
                        )}
                      </div>
                    )}
                    {message.text && <div className={styles.messageText}>{message.text}</div>}
                    <div className={styles.messageTime}>
                      {new Date(message.created_at).toLocaleString()}
                    </div>
                  </div>
                  <img
                    src={
                      message.sender.image
                        ? message.sender.image.startsWith("/")
                          ? `http://127.0.0.1:8000${message.sender.image}`
                          : message.sender.image
                        : "/default-avatar.png"
                    }
                    className={styles.avatar}
                    alt="avatar"
                  />
                </>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.messageInput}>
        {selectedFiles.length > 0 && (
          <div className={styles.previewArea}>
            {selectedFiles.map((fileObj, idx) => (
              <div key={idx} className={styles.previewItem}>
                {fileObj.file.type.startsWith("image") ? (
                  <img src={fileObj.url} alt={fileObj.file.name} className={styles.previewImage} />
                ) : (
                  <div className={styles.filePreview}>📌 {fileObj.file.name}</div>
                )}
                <button onClick={() => handleRemoveFile(idx)} className={styles.removeFileButton}>
                  ✖
                </button>
              </div>
            ))}
          </div>
        )}
        <div className={styles.inputRow}>
          <label htmlFor="fileUpload" className={styles.attachButton}>📌</label>
          <input
            type="file"
            id="fileUpload"
            style={{ display: "none" }}
            multiple
            onChange={handleFileChange}
          />
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Введите сообщение..."
          />
          <button onClick={handleSendMessage}>Отправить</button>
        </div>
      </div>
    </div>
  );
};

export default Messages;










// import React, { useState, useEffect, useRef } from "react";
// import { useParams } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { RootState } from "../../../redux/store";
// import { useGetMessagesByChatIdQuery } from "../../../redux/api/chat/messageApi";
// import {
//   setMessages,
//   addMessage,
//   clearMessages,
// } from "../../../redux/slices/chat/messageSlice";
// import styles from "./Messages.module.scss";
// import ChatControlPanel from "../../../components/chat/ChatControlPanel/ChatControlPanel";

// interface Message {
//   id: number;
//   chat: number;
//   sender: {
//     id: number;
//     nickname: string;
//     image?: string;
//   };
//   text: string;
//   file: any;
//   file_url: string | null;
//   created_at: string;
//   attachments?: Array<{ id: number; file: string; created_at: string }>;
// }

// const Messages: React.FC = () => {
//   const { slug } = useParams<{ slug: string }>(); // это nickname!
//   const [chatId, setChatId] = useState<number | null>(null);
//   const dispatch = useDispatch();
//   const user = useSelector((state: RootState) => state.auth.user);
//   const userId = user?.id;
//   const userNickname = user?.nickname;

//   // 1. Получаем chatId по nickname (slug)
//   useEffect(() => {
//     async function fetchChatId() {
//       if (!slug) return;
//       const token = localStorage.getItem("access_token");
//       const response = await fetch(
//         `http://localhost:8000/api/chats/with-nickname/${slug}/`,
//         {
//           method: "POST",
//           headers: {
//             "Authorization": `Bearer ${token}`,
//           },
//         }
//       );
//       const data = await response.json();
//       setChatId(data.chat_id);
//     }
//     fetchChatId();
//   }, [slug]);

//   // 2. Грузим сообщения только когда chatId есть
//   // 2. Грузим сообщения только когда chatId есть
//   const { data: messagesData, isLoading, isError } = useGetMessagesByChatIdQuery(
//     chatId ? String(chatId) : "",
//     { skip: !chatId }
//   );


//   const [newMessage, setNewMessage] = useState("");
//   const [selectedFiles, setSelectedFiles] = useState<
//     Array<{ file: File; url: string }>
//   >([]);
//   const [newMessageWasSent, setNewMessageWasSent] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement | null>(null);
//   const socketRef = useRef<WebSocket | null>(null);

//   // 3. WebSocket — подключаемся по chatId только когда он есть
//   useEffect(() => {
//     if (!chatId) return;
//     socketRef.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${chatId}/`);
//     socketRef.current.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       if (data.type === "new_message") {
//         dispatch(addMessage(data.message));
//       }
//     };
//     return () => {
//       socketRef.current?.close();
//     };
//   }, [chatId, dispatch]);

//   useEffect(() => {
//     if (messagesData && chatId) {
//       dispatch(setMessages({ chatId, messages: messagesData }));
//     }
//     return () => {
//       if (chatId) dispatch(clearMessages(chatId));
//     };
//   }, [messagesData, dispatch, chatId]);

//   useEffect(() => {
//     if (newMessageWasSent) {
//       messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//       setNewMessageWasSent(false);
//     }
//   }, [newMessageWasSent]);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       const filesArray = Array.from(e.target.files).map((file) => ({
//         file,
//         url: URL.createObjectURL(file),
//       }));
//       setSelectedFiles((prev) => [...prev, ...filesArray]);
//       e.target.value = "";
//     }
//   };

//   const handleRemoveFile = (index: number) => {
//     setSelectedFiles((prev) => {
//       const updated = [...prev];
//       URL.revokeObjectURL(updated[index].url);
//       updated.splice(index, 1);
//       return updated;
//     });
//   };

//   // --- НОВАЯ ЛОГИКА! ---
//   const sendMessageWithFiles = async () => {
//     if (!userId || !chatId) return;
//     const text = newMessage.trim();
//     if (!text && selectedFiles.length === 0) return;

//     const formData = new FormData();
//     formData.append("chat", chatId.toString());
//     formData.append("text", text);

//     selectedFiles.forEach((fileObj) => {
//       formData.append("files", fileObj.file);
//     });

//     try {
//       const token = localStorage.getItem("access_token");
//       const response = await fetch("http://localhost:8000/api/messages/", {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         body: formData,
//       });
//       if (!response.ok) throw new Error("Ошибка отправки сообщения с файлом");
//       const data = await response.json();

//       dispatch(addMessage(data));
//       setNewMessage("");
//       setSelectedFiles([]);
//       setNewMessageWasSent(true);

//       if (socketRef.current) {
//         socketRef.current.send(
//           JSON.stringify({
//             type: "new_message",
//             chat_id: chatId,
//             sender_id: userId,
//             text: data.text,
//             attachments: data.attachments,
//             created_at: data.created_at,
//             id: data.id,
//           })
//         );
//       }
//     } catch (err) {
//       alert("Ошибка при отправке файла: " + (err as Error).message);
//     }
//   };

//   const sendMessageViaSocket = async () => {
//     if (!userId || !chatId || !socketRef.current) return;
//     const text = newMessage.trim();
//     if (!text) return;

//     const payload: any = {
//       type: "new_message",
//       chat_id: chatId,
//       sender_id: userId,
//       text,
//     };

//     const tempMessage: Message = {
//       id: Date.now(),
//       chat: chatId,
//       sender: {
//         id: userId,
//         nickname: userNickname || "Вы",
//         image: user?.image,
//       },
//       text,
//       file: null,
//       file_url: null,
//       created_at: new Date().toISOString(),
//     };

//     dispatch(addMessage(tempMessage));
//     socketRef.current.send(JSON.stringify(payload));
//     setNewMessage("");
//     setNewMessageWasSent(true);
//   };

//   const handleSendMessage = async () => {
//     if (selectedFiles.length > 0) {
//       await sendMessageWithFiles();
//     } else {
//       await sendMessageViaSocket();
//     }
//   };

//   const messagesInStore = useSelector(
//     (state: RootState) => (chatId ? state.message.messages[chatId] : []) || []
//   );
//   const sortedMessages = [...messagesInStore].sort(
//     (a, b) => Date.parse(a.created_at) - Date.parse(b.created_at)
//   );

//   const isImageFile = (name: string) =>
//     /\.(jpe?g|png|gif|bmp|webp)$/i.test(name);
//   const isVideoFile = (name: string) => /\.(mp4|webm|ogg)$/i.test(name);

//   return (
//     <div className={styles.messagesContainer}>
//       <div className={styles.chatHeader}>
//         {chatId && <ChatControlPanel chatId={chatId} />}
//       </div>

//       <div className={styles.messagesList}>
//         {isLoading && <p>Загрузка...</p>}
//         {isError && <p>Ошибка при загрузке сообщений</p>}

//         {sortedMessages.map((message: Message) => {
//           const isOwn = message.sender.id === userId;
//           return (
//             <div
//               key={message.id}
//               className={`${styles.messageRow} ${isOwn ? styles.myMessage : styles.theirMessage}`}
//             >
//               {!isOwn && (
//                 <>
//                   <img
//                     src={message.sender.image || "/default-avatar.png"}
//                     className={styles.avatar}
//                     alt="avatar"
//                   />
//                   <div className={styles.messageContent}>
//                     <div className={styles.messageSender}>
//                       <strong>{message.sender.nickname}</strong>
//                     </div>
//                     {message.attachments && message.attachments.length > 0 && (
//                       <div className={styles.attachmentsGallery}>
//                         {message.attachments.map((att) =>
//                           isImageFile(att.file) ? (
//                             <img
//                               key={att.id}
//                               src={att.file}
//                               alt=""
//                               className={styles.imagePreview}
//                               onClick={() => window.open(att.file, "_blank")}
//                             />
//                           ) : isVideoFile(att.file) ? (
//                             <video
//                               key={att.id}
//                               src={att.file}
//                               controls
//                               className={styles.videoPreview}
//                             />
//                           ) : (
//                             <a key={att.id} href={att.file} target="_blank" rel="noopener noreferrer">
//                               {att.file.split("/").pop()}
//                             </a>
//                           )
//                         )}
//                       </div>
//                     )}
//                     {message.text && <div className={styles.messageText}>{message.text}</div>}
//                     <div className={styles.messageTime}>
//                       {new Date(message.created_at).toLocaleString()}
//                     </div>
//                   </div>
//                 </>
//               )}
//               {isOwn && (
//                 <>
//                   <div className={styles.messageContent}>
//                     <div className={styles.messageSender}>
//                       <strong>{message.sender.nickname}</strong>
//                     </div>
//                     {message.attachments && message.attachments.length > 0 && (
//                       <div className={styles.attachmentsGallery}>
//                         {message.attachments.map((att) =>
//                           isImageFile(att.file) ? (
//                             <img
//                               key={att.id}
//                               src={att.file}
//                               alt=""
//                               className={styles.imagePreview}
//                               onClick={() => window.open(att.file, "_blank")}
//                             />
//                           ) : isVideoFile(att.file) ? (
//                             <video
//                               key={att.id}
//                               src={att.file}
//                               controls
//                               className={styles.videoPreview}
//                             />
//                           ) : (
//                             <a key={att.id} href={att.file} target="_blank" rel="noopener noreferrer">
//                               {att.file.split("/").pop()}
//                             </a>
//                           )
//                         )}
//                       </div>
//                     )}
//                     {message.text && <div className={styles.messageText}>{message.text}</div>}
//                     <div className={styles.messageTime}>
//                       {new Date(message.created_at).toLocaleString()}
//                     </div>
//                   </div>
//                   <img
//                     src={message.sender.image || "/default-avatar.png"}
//                     className={styles.avatar}
//                     alt="avatar"
//                   />
//                 </>
//               )}
//             </div>
//           );
//         })}
//         <div ref={messagesEndRef} />
//       </div>

//       <div className={styles.messageInput}>
//         {selectedFiles.length > 0 && (
//           <div className={styles.previewArea}>
//             {selectedFiles.map((fileObj, idx) => (
//               <div key={idx} className={styles.previewItem}>
//                 {fileObj.file.type.startsWith("image") ? (
//                   <img src={fileObj.url} alt={fileObj.file.name} className={styles.previewImage} />
//                 ) : (
//                   <div className={styles.filePreview}>📌 {fileObj.file.name}</div>
//                 )}
//                 <button onClick={() => handleRemoveFile(idx)} className={styles.removeFileButton}>
//                   ✖
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}
//         <div className={styles.inputRow}>
//           <label htmlFor="fileUpload" className={styles.attachButton}>📌</label>
//           <input
//             type="file"
//             id="fileUpload"
//             style={{ display: "none" }}
//             multiple
//             onChange={handleFileChange}
//           />
//           <input
//             type="text"
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             placeholder="Введите сообщение..."
//           />
//           <button onClick={handleSendMessage}>Отправить</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Messages;









// import React, { useState, useEffect, useRef } from "react";
// import { useParams } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { RootState } from "../../../redux/store";
// import { useGetMessagesByChatIdQuery } from "../../../redux/api/chat/messageApi";
// import {
//   setMessages,
//   addMessage,
//   clearMessages,
// } from "../../../redux/slices/chat/messageSlice";
// import styles from "./Messages.module.scss";
// import ChatControlPanel from "../../../components/chat/ChatControlPanel/ChatControlPanel";
// import { skipToken } from '@reduxjs/toolkit/query';

// interface Message {
//   id: number;
//   chat: number;
//   sender: {
//     id: number;
//     nickname: string;
//     image?: string;
//   };
//   text: string;
//   file: any;
//   file_url: string | null;
//   created_at: string;
//   attachments?: Array<{ id: number; file: string; created_at: string }>;
// }

// const Messages: React.FC = () => {
//   // 1. Используем nickname (slug) из URL
//   const { nickname } = useParams<{ nickname: string }>();

//   // 2. Новый стейт для chatId
//   const [chatId, setChatId] = useState<number | null>(null);

//   const dispatch = useDispatch();
//   const user = useSelector((state: RootState) => state.auth.user);
//   const userId = user?.id;
//   const userNickname = user?.nickname;

//   // 3. Получение chatId по nickname
//   useEffect(() => {
//     async function fetchChatId() {
//       if (!nickname) return;
//       const token = localStorage.getItem("access_token");
//       const res = await fetch(`http://127.0.0.1:8000/api/chats/with-nickname/${nickname}/`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       const data = await res.json();
//       setChatId(data.chat_id);
//     }
//     fetchChatId();
//   }, [nickname]);

//   // 4. Запрос сообщений только когда chatId получен!
//   const { data: messagesData, isLoading, isError } = useGetMessagesByChatIdQuery(
//     chatId ? String(chatId) : skipToken
//   );

//   const [newMessage, setNewMessage] = useState("");
//   const [selectedFiles, setSelectedFiles] = useState<Array<{ file: File; url: string }>>([]);
//   const [newMessageWasSent, setNewMessageWasSent] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement | null>(null);
//   const socketRef = useRef<WebSocket | null>(null);

//   // 5. WebSocket — подключаемся только если chatId есть!
//   useEffect(() => {
//     if (!chatId) return;
//     socketRef.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${chatId}/`);
//     socketRef.current.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       if (data.type === "new_message") {
//         dispatch(addMessage(data.message));
//       }
//     };
//     return () => {
//       socketRef.current?.close();
//     };
//   }, [chatId, dispatch]);

//   // 6. Redux-store обновляем только когда chatId есть и есть сообщения
//   useEffect(() => {
//     if (chatId && messagesData) {
//       dispatch(setMessages({ chatId, messages: messagesData }));
//     }
//     return () => {
//       if (chatId) dispatch(clearMessages(chatId));
//     };
//   }, [messagesData, dispatch, chatId]);

//   useEffect(() => {
//     if (newMessageWasSent) {
//       messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//       setNewMessageWasSent(false);
//     }
//   }, [newMessageWasSent]);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       const filesArray = Array.from(e.target.files).map((file) => ({
//         file,
//         url: URL.createObjectURL(file),
//       }));
//       setSelectedFiles((prev) => [...prev, ...filesArray]);
//       e.target.value = "";
//     }
//   };

//   const handleRemoveFile = (index: number) => {
//     setSelectedFiles((prev) => {
//       const updated = [...prev];
//       URL.revokeObjectURL(updated[index].url);
//       updated.splice(index, 1);
//       return updated;
//     });
//   };

//   // --- НОВАЯ ЛОГИКА! ---
//   // Функция для отправки сообщения с файлами через API
//   const sendMessageWithFiles = async () => {
//     if (!userId || !chatId) return;
//     const text = newMessage.trim();
//     if (!text && selectedFiles.length === 0) return;

//     const formData = new FormData();
//     formData.append("chat", chatId.toString());
//     formData.append("text", text);

//     // Теперь все файлы как files[]
//     selectedFiles.forEach((fileObj) => {
//       formData.append("files", fileObj.file); // <-- "files", не "file"
//     });

//     try {
//       const token = localStorage.getItem("access_token");
//       const response = await fetch("http://localhost:8000/api/messages/", {
//         method: "POST",
//         headers: {
//           "Authorization": `Bearer ${token}`,
//         },
//         body: formData,
//       });
//       if (!response.ok) throw new Error("Ошибка отправки сообщения с файлом");
//       const data = await response.json();

//       dispatch(addMessage(data));
//       setNewMessage("");
//       setSelectedFiles([]);
//       setNewMessageWasSent(true);

//       if (socketRef.current) {
//         socketRef.current.send(
//           JSON.stringify({
//             type: "new_message",
//             chat_id: chatId,
//             sender_id: userId,
//             text: data.text,
//             attachments: data.attachments,
//             created_at: data.created_at,
//             id: data.id,
//           })
//         );
//       }
//     } catch (err) {
//       alert("Ошибка при отправке файла: " + (err as Error).message);
//     }
//   };

//   // --- СТАРАЯ ЛОГИКА! ---
//   // Для текстовых сообщений без файлов (WebSocket)
//   const sendMessageViaSocket = async () => {
//     if (!userId || !chatId || !socketRef.current) return;
//     const text = newMessage.trim();
//     if (!text) return;

//     const payload: any = {
//       type: "new_message",
//       chat_id: chatId,
//       sender_id: userId,
//       text,
//     };

//     const tempMessage: Message = {
//       id: Date.now(),
//       chat: chatId,
//       sender: {
//         id: userId,
//         nickname: userNickname || "Вы",
//         image: user?.image,
//       },
//       text,
//       file: null,
//       file_url: null,
//       created_at: new Date().toISOString(),
//     };

//     dispatch(addMessage(tempMessage));
//     socketRef.current.send(JSON.stringify(payload));
//     setNewMessage("");
//     setNewMessageWasSent(true);
//   };

//   // --- ЕДИНАЯ ОБЁРТКА ---
//   const handleSendMessage = async () => {
//     if (selectedFiles.length > 0) {
//       await sendMessageWithFiles();
//     } else {
//       await sendMessageViaSocket();
//     }
//   };

//   // Сообщения только если chatId есть!
//   const messagesInStore = useSelector(
//     (state: RootState) => (chatId ? state.message.messages[chatId] : []) || []
//   );
//   const sortedMessages = [...messagesInStore].sort(
//     (a, b) => Date.parse(a.created_at) - Date.parse(b.created_at)
//   );

//   const isImageFile = (name: string) => /\.(jpe?g|png|gif|bmp|webp)$/i.test(name);
//   const isVideoFile = (name: string) => /\.(mp4|webm|ogg)$/i.test(name);

//   return (
//     <div className={styles.messagesContainer}>
//       <div className={styles.chatHeader}>
//         {/* chatId теперь точно есть, можно передать */}
//         {chatId && <ChatControlPanel chatId={chatId} />}
//       </div>

//       <div className={styles.messagesList}>
//         {isLoading && <p>Загрузка...</p>}
//         {isError && <p>Ошибка при загрузке сообщений</p>}

//         {sortedMessages.map((message: Message) => {
//           const isOwn = message.sender.id === userId;
//           return (
//             <div
//               key={message.id}
//               className={`${styles.messageRow} ${isOwn ? styles.myMessage : styles.theirMessage}`}
//             >
//               {!isOwn && (
//                 <>
//                   <img
//                     src={message.sender.image || "/default-avatar.png"}
//                     className={styles.avatar}
//                     alt="avatar"
//                   />
//                   <div className={styles.messageContent}>
//                     <div className={styles.messageSender}>
//                       <strong>{message.sender.nickname}</strong>
//                     </div>
//                     {message.attachments && message.attachments.length > 0 && (
//                       <div className={styles.attachmentsGallery}>
//                         {message.attachments.map((att) =>
//                           isImageFile(att.file) ? (
//                             <img
//                               key={att.id}
//                               src={att.file}
//                               alt=""
//                               className={styles.imagePreview}
//                               onClick={() => window.open(att.file, "_blank")}
//                             />
//                           ) : isVideoFile(att.file) ? (
//                             <video
//                               key={att.id}
//                               src={att.file}
//                               controls
//                               className={styles.videoPreview}
//                             />
//                           ) : (
//                             <a key={att.id} href={att.file} target="_blank" rel="noopener noreferrer">
//                               {att.file.split("/").pop()}
//                             </a>
//                           )
//                         )}
//                       </div>
//                     )}
//                     {message.text && <div className={styles.messageText}>{message.text}</div>}
//                     <div className={styles.messageTime}>
//                       {new Date(message.created_at).toLocaleString()}
//                     </div>
//                   </div>
//                 </>
//               )}
//               {isOwn && (
//                 <>
//                   <div className={styles.messageContent}>
//                     <div className={styles.messageSender}>
//                       <strong>{message.sender.nickname}</strong>
//                     </div>
//                     {message.attachments && message.attachments.length > 0 && (
//                       <div className={styles.attachmentsGallery}>
//                         {message.attachments.map((att) =>
//                           isImageFile(att.file) ? (
//                             <img
//                               key={att.id}
//                               src={att.file}
//                               alt=""
//                               className={styles.imagePreview}
//                               onClick={() => window.open(att.file, "_blank")}
//                             />
//                           ) : isVideoFile(att.file) ? (
//                             <video
//                               key={att.id}
//                               src={att.file}
//                               controls
//                               className={styles.videoPreview}
//                             />
//                           ) : (
//                             <a key={att.id} href={att.file} target="_blank" rel="noopener noreferrer">
//                               {att.file.split("/").pop()}
//                             </a>
//                           )
//                         )}
//                       </div>
//                     )}
//                     {message.text && <div className={styles.messageText}>{message.text}</div>}
//                     <div className={styles.messageTime}>
//                       {new Date(message.created_at).toLocaleString()}
//                     </div>
//                   </div>
//                   <img
//                     src={message.sender.image || "/default-avatar.png"}
//                     className={styles.avatar}
//                     alt="avatar"
//                   />
//                 </>
//               )}
//             </div>
//           );
//         })}
//         <div ref={messagesEndRef} />
//       </div>

//       <div className={styles.messageInput}>
//         {selectedFiles.length > 0 && (
//           <div className={styles.previewArea}>
//             {selectedFiles.map((fileObj, idx) => (
//               <div key={idx} className={styles.previewItem}>
//                 {fileObj.file.type.startsWith("image") ? (
//                   <img src={fileObj.url} alt={fileObj.file.name} className={styles.previewImage} />
//                 ) : (
//                   <div className={styles.filePreview}>📌 {fileObj.file.name}</div>
//                 )}
//                 <button onClick={() => handleRemoveFile(idx)} className={styles.removeFileButton}>
//                   ✖
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}
//         <div className={styles.inputRow}>
//           <label htmlFor="fileUpload" className={styles.attachButton}>📌</label>
//           <input
//             type="file"
//             id="fileUpload"
//             style={{ display: "none" }}
//             multiple
//             onChange={handleFileChange}
//           />
//           <input
//             type="text"
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             placeholder="Введите сообщение..."
//           />
//           <button onClick={handleSendMessage}>Отправить</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Messages;










// import React, { useState, useEffect, useRef } from "react";
// import { useParams } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { RootState } from "../../../redux/store";
// import { useGetMessagesByChatIdQuery } from "../../../redux/api/chat/messageApi";
// import {
//   setMessages,
//   addMessage,
//   clearMessages,
// } from "../../../redux/slices/chat/messageSlice";
// import styles from "./Messages.module.scss";
// import ChatControlPanel from "../../../components/chat/ChatControlPanel/ChatControlPanel";

// interface Message {
//   id: number;
//   chat: number;
//   sender: {
//     id: number;
//     nickname: string;
//     image?: string;
//   };
//   text: string;
//   file: any;
//   file_url: string | null;
//   created_at: string;
//   attachments?: Array<{ id: number; file: string; created_at: string }>;
// }

// const Messages: React.FC = () => {
//   const { slug } = useParams<{ slug: string }>();
//   const chatId = Number(slug);
//   const dispatch = useDispatch();
//   const user = useSelector((state: RootState) => state.auth.user);
//   const userId = user?.id;
//   const userNickname = user?.nickname;
//   const { data: messagesData, isLoading, isError } = useGetMessagesByChatIdQuery(slug!);

//   const [newMessage, setNewMessage] = useState("");
//   const [selectedFiles, setSelectedFiles] = useState<Array<{ file: File; url: string }>>([]);
//   const [newMessageWasSent, setNewMessageWasSent] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement | null>(null);
//   const socketRef = useRef<WebSocket | null>(null);

//   useEffect(() => {
//     socketRef.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${chatId}/`);
//     socketRef.current.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       if (data.type === "new_message") {
//         dispatch(addMessage(data.message));
//       }
//     };
//     return () => {
//       socketRef.current?.close();
//     };
//   }, [chatId, dispatch]);

//   useEffect(() => {
//     if (messagesData) {
//       dispatch(setMessages({ chatId, messages: messagesData }));
//     }
//     return () => {
//       dispatch(clearMessages(chatId));
//     };
//   }, [messagesData, dispatch]);

//   useEffect(() => {
//     if (newMessageWasSent) {
//       messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//       setNewMessageWasSent(false);
//     }
//   }, [newMessageWasSent]);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       const filesArray = Array.from(e.target.files).map((file) => ({
//         file,
//         url: URL.createObjectURL(file),
//       }));
//       setSelectedFiles((prev) => [...prev, ...filesArray]);
//       e.target.value = "";
//     }
//   };

//   const handleRemoveFile = (index: number) => {
//     setSelectedFiles((prev) => {
//       const updated = [...prev];
//       URL.revokeObjectURL(updated[index].url);
//       updated.splice(index, 1);
//       return updated;
//     });
//   };

//   // --- НОВАЯ ЛОГИКА! ---
//   // Функция для отправки сообщения с файлами через API
//   const sendMessageWithFiles = async () => {
//     if (!userId || !slug) return;
//     const text = newMessage.trim();
//     if (!text && selectedFiles.length === 0) return;

//     const formData = new FormData();
//     formData.append("chat", chatId.toString());
//     formData.append("text", text);

//     // Теперь все файлы как files[]
//     selectedFiles.forEach((fileObj, idx) => {
//       formData.append("files", fileObj.file); // <-- "files", не "file"
//     });

//     try {
//       const token = localStorage.getItem("access_token");
//       const response = await fetch("http://localhost:8000/api/messages/", {
//         method: "POST",
//         headers: {
//           "Authorization": `Bearer ${token}`,
//         },
//         body: formData,
//       });
//       if (!response.ok) throw new Error("Ошибка отправки сообщения с файлом");
//       const data = await response.json();

//       dispatch(addMessage(data));
//       setNewMessage("");
//       setSelectedFiles([]);
//       setNewMessageWasSent(true);

//       if (socketRef.current) {
//         socketRef.current.send(
//           JSON.stringify({
//             type: "new_message",
//             chat_id: chatId,
//             sender_id: userId,
//             text: data.text,
//             attachments: data.attachments,
//             created_at: data.created_at,
//             id: data.id,
//           })
//         );
//       }
//     } catch (err) {
//       alert("Ошибка при отправке файла: " + (err as Error).message);
//     }
//   };


//   // --- СТАРАЯ ЛОГИКА! ---
//   // Для текстовых сообщений без файлов (WebSocket)
//   const sendMessageViaSocket = async () => {
//     if (!userId || !slug || !socketRef.current) return;
//     const text = newMessage.trim();
//     if (!text) return;

//     const payload: any = {
//       type: "new_message",
//       chat_id: chatId,
//       sender_id: userId,
//       text,
//     };

//     const tempMessage: Message = {
//       id: Date.now(),
//       chat: chatId,
//       sender: {
//         id: userId,
//         nickname: userNickname || "Вы",
//         image: user?.image,
//       },
//       text,
//       file: null,
//       file_url: null,
//       created_at: new Date().toISOString(),
//     };

//     dispatch(addMessage(tempMessage));
//     socketRef.current.send(JSON.stringify(payload));
//     setNewMessage("");
//     setNewMessageWasSent(true);
//   };

//   // --- ЕДИНАЯ ОБЁРТКА ---
//   const handleSendMessage = async () => {
//     if (selectedFiles.length > 0) {
//       await sendMessageWithFiles();
//     } else {
//       await sendMessageViaSocket();
//     }
//   };

//   const messagesInStore = useSelector(
//     (state: RootState) => state.message.messages[chatId] || []
//   );
//   const sortedMessages = [...messagesInStore].sort(
//     (a, b) => Date.parse(a.created_at) - Date.parse(b.created_at)
//   );

//   const isImageFile = (name: string) => /\.(jpe?g|png|gif|bmp|webp)$/i.test(name);
//   const isVideoFile = (name: string) => /\.(mp4|webm|ogg)$/i.test(name);

//   return (
//     <div className={styles.messagesContainer}>
//       <div className={styles.chatHeader}>
//         <ChatControlPanel chatId={chatId} />
//       </div>

//       <div className={styles.messagesList}>
//         {isLoading && <p>Загрузка...</p>}
//         {isError && <p>Ошибка при загрузке сообщений</p>}

//         {sortedMessages.map((message: Message) => {
//           const isOwn = message.sender.id === userId;
//           return (
//             <div
//               key={message.id}
//               className={`${styles.messageRow} ${isOwn ? styles.myMessage : styles.theirMessage}`}
//             >
//               {!isOwn && (
//                 <>
//                   <img
//                     src={message.sender.image || "/default-avatar.png"}
//                     className={styles.avatar}
//                     alt="avatar"
//                   />
//                   <div className={styles.messageContent}>
//                     <div className={styles.messageSender}>
//                       <strong>{message.sender.nickname}</strong>
//                     </div>
//                     {message.file_url && isImageFile(message.file_url) && (
//                       <a href={message.file_url} target="_blank" rel="noopener noreferrer">
//                         <img src={message.file_url} alt="image" className={styles.imagePreview} />
//                       </a>
//                     )}
//                     {message.file_url && isVideoFile(message.file_url) && (
//                       <video controls className={styles.videoPreview} src={message.file_url} />
//                     )}
//                     {message.text && <div className={styles.messageText}>{message.text}</div>}
//                     <div className={styles.messageTime}>
//                       {new Date(message.created_at).toLocaleString()}
//                     </div>
//                   </div>
//                 </>
//               )}
//               {isOwn && (
//                 <>
//                   <div className={styles.messageContent}>
//                     <div className={styles.messageSender}>
//                       <strong>{message.sender.nickname}</strong>
//                     </div>
//                     {message.attachments && message.attachments.length > 0 && (
//                       <div className={styles.attachmentsGallery}>
//                         {message.attachments.map((att) =>
//                           isImageFile(att.file) ? (
//                             <img
//                               key={att.id}
//                               src={att.file}
//                               alt=""
//                               className={styles.imagePreview}
//                               onClick={() => window.open(att.file, "_blank")}
//                             />
//                           ) : isVideoFile(att.file) ? (
//                             <video
//                               key={att.id}
//                               src={att.file}
//                               controls
//                               className={styles.videoPreview}
//                             />
//                           ) : (
//                             <a key={att.id} href={att.file} target="_blank" rel="noopener noreferrer">
//                               {att.file.split("/").pop()}
//                             </a>
//                           )
//                         )}
//                       </div>
//                     )}
//                     {message.text && <div className={styles.messageText}>{message.text}</div>}
//                     <div className={styles.messageTime}>
//                       {new Date(message.created_at).toLocaleString()}
//                     </div>
//                   </div>
//                   <img
//                     src={message.sender.image || "/default-avatar.png"}
//                     className={styles.avatar}
//                     alt="avatar"
//                   />
//                 </>
//               )}
//             </div>
//           );
//         })}
//         <div ref={messagesEndRef} />
//       </div>

//       <div className={styles.messageInput}>
//         {selectedFiles.length > 0 && (
//           <div className={styles.previewArea}>
//             {selectedFiles.map((fileObj, idx) => (
//               <div key={idx} className={styles.previewItem}>
//                 {fileObj.file.type.startsWith("image") ? (
//                   <img src={fileObj.url} alt={fileObj.file.name} className={styles.previewImage} />
//                 ) : (
//                   <div className={styles.filePreview}>📌 {fileObj.file.name}</div>
//                 )}
//                 <button onClick={() => handleRemoveFile(idx)} className={styles.removeFileButton}>
//                   ✖
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}
//         <div className={styles.inputRow}>
//           <label htmlFor="fileUpload" className={styles.attachButton}>📌</label>
//           <input
//             type="file"
//             id="fileUpload"
//             style={{ display: "none" }}
//             multiple
//             onChange={handleFileChange}
//           />
//           <input
//             type="text"
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             placeholder="Введите сообщение..."
//           />
//           <button onClick={handleSendMessage}>Отправить</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Messages;
























