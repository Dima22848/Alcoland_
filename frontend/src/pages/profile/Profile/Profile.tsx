import { useSelector } from "react-redux";
import { selectUser } from "../../../redux/slices/auth/authSlice";
import { useGetNewsfeedQuery } from "../../../redux/api/account/newsFeedApi";
import NewsFeedItem from "../NewsFeed/NewsFeedItem";
import styles from "./Profile.module.scss";

const Profile = () => {
  const user = useSelector(selectUser);
  const { data: posts, isLoading, error } = useGetNewsfeedQuery();

  if (!user) {
    return <p>Загрузка...</p>;
  }

  // Фильтруем посты, оставляя только те, которые принадлежат текущему пользователю
  const userPosts = posts?.filter(post => post.profile_id === user.id);

  return (
    <div className={styles.profileContainer}>
      {/* Блок с фото и инфо */}
      <div className={styles.profileDetails}>
        <img src={user.image} alt="Profile" className={styles.profileImage} />
        <div className={styles.profileText}>
          <p><strong>Возраст:</strong> {user.age ? `${user.age} лет` : "Не указан"}</p>
          <p><strong>Город:</strong> {user.city_display || "Не указан"}</p>
          <p><strong>Профессия:</strong> {user.profession || "Не указана"}</p>
          <p><strong>Хобби:</strong> {user.hobby || "Не указано"}</p>
          <p><strong>О себе:</strong> {user.extra_info || "Нет информации"}</p>
        </div>
      </div>

      {/* Новостная лента */}
      <div className={styles.newsFeed}>
        <h2>Мои посты</h2>

        {isLoading && <p>Загрузка...</p>}
        {error && <p>Ошибка загрузки постов.</p>}
        {userPosts?.length ? (
          userPosts.map(post => <NewsFeedItem key={post.id} post={post} userData={{ [user.id]: user }} />)
        ) : (
          <p>Вы еще не добавили ни одного поста.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;






