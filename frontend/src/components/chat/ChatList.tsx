import { useGetChatsQuery } from "../../redux/api/chat/chatApi";

const ChatList = () => {
    const { data: chats, refetch } = useGetChatsQuery();

    return (
        <div>
            <h2>Список чатов</h2>
            <button onClick={() => refetch()}>🔄 Обновить</button>
            <ul>
                {chats?.map(chat => (
                    <li key={chat.id}>{chat.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default ChatList;
