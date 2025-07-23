import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { fetchUsers } from "../../../redux/api/account/accountApi";
import { selectUser } from "../../../redux/slices/auth/authSlice";
import { useCreateGroupChatMutation } from "../../../redux/api/chat/chatApi";
import styles from "./CreateGroupChatPanel.module.scss";

interface User {
  id: number;
  nickname: string;
  image?: string;
}

interface Props {
  onClose: () => void;
  onChatCreated: (chatId: number) => void;
}

const CreateGroupChatPanel: React.FC<Props> = ({ onClose, onChatCreated }) => {
  const currentUser = useSelector(selectUser);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState<User[]>([]);

  // Новые поля:
  const [chatTitle, setChatTitle] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // RTK Query mutation
  const [createGroupChat, { isLoading }] = useCreateGroupChatMutation();

  // Получаем всех пользователей один раз при маунте
  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch(() => setUsers([]));
  }, []);

  // Получаем друзей (по id из текущего пользователя)
  const friends: User[] = users.filter(user =>
    currentUser?.friends?.includes(user.id)
  );

  // Фильтрация по нику
  useEffect(() => {
    if (!search) {
      setSearchResult([]);
      return;
    }
    setSearchResult(
      friends.filter((friend) =>
        friend.nickname.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, friends]);

  // Превью аватара
  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(avatarFile);
  }, [avatarFile]);

  const handleSelectFriend = (id: number) => {
    if (!selectedFriends.includes(id)) {
      setSelectedFriends([...selectedFriends, id]);
    }
  };

  const handleRemoveSelected = (id: number) => {
    setSelectedFriends(selectedFriends.filter(fId => fId !== id));
  };

  const handleCreate = async () => {
    if (!chatTitle || selectedFriends.length === 0) {
      alert("Укажите название и выберите хотя бы одного участника!");
      return;
    }
    const formData = new FormData();
    formData.append("name", chatTitle);
    formData.append("is_group", "true");
    if (avatarFile) formData.append("image", avatarFile);
    // Участников — каждый id отдельным полем, DRF поддерживает
    selectedFriends.forEach(id => formData.append("participants", id.toString()));
    // НЕ добавляй currentUser.id, backend уже делает это сам в perform_create

    try {
      const chat = await createGroupChat(formData).unwrap();
      onChatCreated(chat.id);
    } catch (err: any) {
      alert(
        "Ошибка создания чата: " +
          (err?.data?.name?.[0] ||
            err?.data?.detail ||
            err?.error ||
            "Неизвестная ошибка")
      );
    }
  };

  return (
    <div className={styles.panelWrapper}>
      {/* Название чата */}
      <input
        className={styles.chatTitleInput}
        type="text"
        placeholder="Название группового чата"
        value={chatTitle}
        onChange={(e) => setChatTitle(e.target.value)}
        maxLength={60}
        disabled={isLoading}
      />

      {/* Аватарка */}
      {avatarPreview && (
        <img
          src={avatarPreview}
          alt="avatar"
          className={styles.avatarPreview}
        />
      )}
      <input
        className={styles.avatarInput}
        type="file"
        accept="image/*"
        onChange={e => {
          if (e.target.files && e.target.files[0]) setAvatarFile(e.target.files[0]);
        }}
        disabled={isLoading}
      />

      {/* Селект друзей */}
      <select
        className={styles.selectFriend}
        onChange={(e) => handleSelectFriend(Number(e.target.value))}
        defaultValue=""
        disabled={isLoading}
      >
        <option value="" disabled>
          Выбрать друга
        </option>
        {friends.map((friend) => (
          <option key={friend.id} value={friend.id}>
            {friend.nickname}
          </option>
        ))}
      </select>

      {/* Поиск по нику */}
      <input
        className={styles.searchInput}
        type="text"
        placeholder="Поиск по нику"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        disabled={isLoading}
      />

      {/* Список результатов поиска */}
      {search && (
        <div className={styles.searchResults}>
          {searchResult.length === 0 && (
            <div className={styles.resultItem}>Нет совпадений</div>
          )}
          {searchResult.map((friend) => (
            <div
              key={friend.id}
              className={
                styles.resultItem +
                (selectedFriends.includes(friend.id) ? ` ${styles.selected}` : "")
              }
              onClick={() => handleSelectFriend(friend.id)}
              style={isLoading ? { pointerEvents: "none", opacity: 0.7 } : undefined}
            >
              {friend.nickname}
            </div>
          ))}
        </div>
      )}

      {/* Выбранные участники */}
      <div className={styles.selectedFriends}>
        {selectedFriends.length > 0 && <span>Выбраны:&nbsp;</span>}
        {selectedFriends.map((id) => {
          const f = friends.find((fr) => fr.id === id);
          return f ? (
            <span
              key={id}
              onClick={() => handleRemoveSelected(id)}
              title="Убрать из выбранных"
              style={{
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {f.nickname} ×
            </span>
          ) : null;
        })}
      </div>

      {/* Кнопки */}
      <div className={styles.buttonRow}>
        <button
          className={styles.cancelBtn}
          onClick={onClose}
          disabled={isLoading}
        >
          Отмена
        </button>
        <button
          className={styles.createBtn}
          onClick={handleCreate}
          disabled={isLoading}
        >
          {isLoading ? "Создаём..." : "Создать"}
        </button>
      </div>
    </div>
  );
};

export default CreateGroupChatPanel;













