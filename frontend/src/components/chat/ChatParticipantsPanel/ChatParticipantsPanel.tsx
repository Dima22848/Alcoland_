import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import {
  useRemoveParticipantMutation,
  useMakeAdminMutation,
  useRevokeAdminMutation
} from "../../../redux/api/chat/chatApi";
import FriendInviteForm from "../FriendInviteForm/FriendInviteForm";
import styles from "./ChatParticipantsPanel.module.scss";

interface ChatParticipant {
  id: number;
  nickname: string;
  role: "creator" | "admin" | "member";
  image?: string; // ✅ добавили image
}


interface Props {
  chatId: number;
  participants: ChatParticipant[];
  onClose: () => void;
}

const roleLabels: Record<string, string> = {
  creator: "создатель",
  admin: "админ",
  member: "участник"
};

const ChatParticipantsPanel: React.FC<Props> = ({ chatId, participants, onClose }) => {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [removeParticipant] = useRemoveParticipantMutation();
  const [makeAdmin] = useMakeAdminMutation();
  const [revokeAdmin] = useRevokeAdminMutation();

  const me = participants.find(p => p.id === currentUser?.id);
  const isCreator = me?.role === "creator";

  return (
    <div className={styles["chat-participants-panel"]}>
      <FriendInviteForm chatId={chatId} />
      <div className={styles["participants-scroll"]}>
        {participants.map((participant) => (
          <div key={participant.id} className={styles["participant-item"]}>
            <div className={styles["participant-info"]}>
              <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <Link to={`/profile/${participant.id}`}>
                  <img
                    src={
                      participant.image
                        ? `http://localhost:8000${participant.image}`
                        : "/default-avatar.png"
                    }

                    alt="avatar"
                    width={32}
                    height={32}
                    style={{ borderRadius: "50%", marginRight: 8, verticalAlign: "middle", objectFit: "cover" }}
                  />
                </Link>
                <span>
                  <strong>{participant.nickname}</strong>{" "}
                  <span style={{ color: "#666" }}>({roleLabels[participant.role]})</span>
                </span>
              </div>
              {isCreator && participant.role !== "creator" && (
                <div className={styles["participant-actions"]}>
                  <button
                    onClick={() => removeParticipant({ chatId, userId: participant.id })}
                  >
                    Удалить из чата
                  </button>
                  {participant.role === "admin" ? (
                    <button
                      onClick={() => revokeAdmin({ chatId, userId: participant.id })}
                    >
                      Лишить прав админа
                    </button>
                  ) : (
                    <button
                      onClick={() => makeAdmin({ chatId, userId: participant.id })}
                    >
                      Сделать админом
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatParticipantsPanel;


