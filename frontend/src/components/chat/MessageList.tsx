import { useGetMessagesByChatIdQuery } from "../../redux/api/chat/messageApi";

interface MessageListProps {
    chatId: string; // или number, если ID числовой
}

const MessageList: React.FC<MessageListProps> = ({ chatId }) => {
    const { data: messages, refetch } = useGetMessagesByChatIdQuery(chatId);

    return (
        <div>
            {messages?.map((msg) => (
                <p key={msg.id}>{msg.text}</p>
            ))}
        </div>
    );
};

export default MessageList;

