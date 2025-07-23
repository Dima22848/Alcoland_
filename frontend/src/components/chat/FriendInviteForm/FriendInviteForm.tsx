import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { fetchFriends } from "../../../redux/api/account/accountApi";
import { useInviteToChatMutation } from "../../../redux/api/chat/chatApi";
import styles from "./FriendInviteForm.module.scss";

interface Props {
  chatId: number;
  onSuccess?: () => void;
}

const FriendInviteForm: React.FC<Props> = ({ chatId, onSuccess }) => {
  const [nickname, setNickname] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [friends, setFriends] = useState<{ id: number; nickname: string }[]>([]);

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [inviteToChat] = useInviteToChatMutation();

  useEffect(() => {
    const loadFriends = async () => {
      if (currentUser?.id) {
        const data = await fetchFriends(currentUser.id.toString());
        setFriends(data);
      }
    };
    loadFriends();
  }, [currentUser]);

  const handleInviteByNickname = async () => {
    if (nickname.trim()) {
      await inviteToChat({ chatId, nickname });
      setNickname("");
      onSuccess?.();
    }
  };

  const handleInviteByFriend = async () => {
    if (selectedFriend) {
      await inviteToChat({ chatId, nickname: selectedFriend });
      setSelectedFriend(null);
      onSuccess?.();
    }
  };

  return (
    <div className={styles["invite-block"]}>
      <div className={styles["invite-title"]}>➕ Пригласить участника</div>

      <div className={styles["invite-form"]}>
        <div className={styles["invite-row"]}>
          <input
            type="text"
            placeholder="Введите ник вручную"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <button onClick={handleInviteByNickname}>Пригласить</button>
        </div>

        <div className={styles["invite-row"]}>
          <select
            value={selectedFriend ?? ""}
            onChange={(e) => setSelectedFriend(e.target.value || null)}
          >
            <option value="">Выберите друга</option>
            {friends.map((f) => (
              <option key={f.id} value={f.nickname}>
                {f.nickname}
              </option>
            ))}
          </select>
          <button onClick={handleInviteByFriend}>Пригласить</button>
        </div>
      </div>
    </div>
  );
};

export default FriendInviteForm;





// import React, { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import { RootState } from "../../../redux/store";
// import { fetchFriends } from "../../../redux/api/account/accountApi";
// import { useInviteToChatMutation } from "../../../redux/api/chat/chatApi";

// interface Props {
//   chatId: number;
//   onSuccess?: () => void;
// }

// const FriendInviteForm: React.FC<Props> = ({ chatId, onSuccess }) => {
//   const [nickname, setNickname] = useState("");
//   const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
//   const [friends, setFriends] = useState<{ id: number; nickname: string }[]>([]);

//   const currentUser = useSelector((state: RootState) => state.auth.user);
//   const [inviteToChat] = useInviteToChatMutation();

//   useEffect(() => {
//     const loadFriends = async () => {
//       if (currentUser?.id) {
//         const data = await fetchFriends(currentUser.id.toString());
//         setFriends(data);
//       }
//     };
//     loadFriends();
//   }, [currentUser]);

//   const handleInviteByNickname = async () => {
//     if (nickname.trim()) {
//       await inviteToChat({ chatId, nickname });
//       setNickname("");
//       onSuccess?.();
//     }
//   };

//   const handleInviteByFriend = async () => {
//     if (selectedFriend) {
//       await inviteToChat({ chatId, nickname: selectedFriend });
//       setSelectedFriend(null);
//       onSuccess?.();
//     }
//   };

//   return (
//     <div style={{ marginTop: "1rem" }}>
//       <h4>➕ Пригласить участника</h4>

//       <div>
//         <input
//           type="text"
//           value={nickname}
//           placeholder="Введите ник"
//           onChange={(e) => setNickname(e.target.value)}
//         />
//         <button onClick={handleInviteByNickname}>Пригласить по нику</button>
//       </div>

//       <div style={{ marginTop: "0.5rem" }}>
//         <select
//           value={selectedFriend || ""}
//           onChange={(e) => setSelectedFriend(e.target.value || null)}
//         >
//           <option value="">Выберите друга</option>
//           {friends?.map((f) => (
//             <option key={f.id} value={f.nickname}>
//               {f.nickname}
//             </option>
//           ))}
//         </select>
//         <button onClick={handleInviteByFriend} disabled={!selectedFriend}>
//           Пригласить из друзей
//         </button>
//       </div>
//     </div>
//   );
// };

// export default FriendInviteForm;
