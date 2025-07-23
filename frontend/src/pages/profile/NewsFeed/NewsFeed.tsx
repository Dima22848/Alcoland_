import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useGetNewsfeedQuery } from "../../../redux/api/account/newsFeedApi";
import { selectUser } from "../../../redux/slices/auth/authSlice";
import { fetchUser } from "../../../redux/api/account/accountApi";
import NewsFeedItem from "./NewsFeedItem"; // Импортируем новый компонент
import styles from "./NewsFeed.module.scss";

interface Post {
  id: number;
  profile_id: number;
  text: string;
  file: string | null;
  created_at: string;
}

interface User {
  id: number;
  nickname: string;
  image: string;
}

const NewsFeed: React.FC = () => {
  const { data: posts, isLoading, error } = useGetNewsfeedQuery();
  const currentUser = useSelector(selectUser);
  const [userData, setUserData] = useState<{ [key: number]: User }>({});

  useEffect(() => {
    const fetchUserData = async (profileId: number) => {
      if (!userData[profileId]) {
        const user = await fetchUser(profileId.toString());
        setUserData(prev => ({ ...prev, [profileId]: user }));
      }
    };

    posts?.forEach(post => {
      fetchUserData(post.profile_id);
    });
  }, [posts]);

  const filteredPosts = posts?.filter(post =>
    currentUser?.following.includes(post.profile_id) || currentUser?.friends.includes(post.profile_id)
  );

  if (isLoading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка загрузки новостей.</p>;

  return (
    <div className={styles.newsFeedContainer}>
      <h1 className={styles.title}>Новостная лента</h1>
      {filteredPosts?.map(post => (
        <NewsFeedItem key={post.id} post={post} userData={userData} />
      ))}
    </div>
  );
};

export default NewsFeed;







// import React, { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import { useGetNewsfeedQuery } from "../../../redux/api/account/newsFeedApi";
// import { selectUser } from "../../../redux/slices/auth/authSlice";
// import { fetchUser } from "../../../redux/api/account/accountApi";
// import NewsFeedItem from "./NewsFeedItem"; // Импортируем новый компонент
// import styles from "./NewsFeed.module.scss";

// interface Post {
//   id: number;
//   profile_id: number;
//   text: string;
//   file: string | null;
//   created_at: string;
// }

// interface User {
//   id: number;
//   nickname: string;
//   image: string;
// }

// const NewsFeed: React.FC = () => {
//   const { data: posts, isLoading, error } = useGetNewsfeedQuery();
//   const currentUser = useSelector(selectUser);
//   const [userData, setUserData] = useState<{ [key: number]: User }>({});

//   useEffect(() => {
//     const fetchUserData = async (profileId: number) => {
//       if (!userData[profileId]) {
//         const user = await fetchUser(profileId.toString());
//         setUserData(prev => ({ ...prev, [profileId]: user }));
//       }
//     };

//     posts?.forEach(post => {
//       fetchUserData(post.profile_id);
//     });
//   }, [posts]);

//   const filteredPosts = posts?.filter(post =>
//     currentUser?.following.includes(post.profile_id) || currentUser?.friends.includes(post.profile_id)
//   );

//   if (isLoading) return <p>Загрузка...</p>;
//   if (error) return <p>Ошибка загрузки новостей.</p>;

//   return (
//     <div className={styles.newsFeedContainer}>
//       <h1 className={styles.title}>Новостная лента</h1>
//       {filteredPosts?.map(post => (
//         <NewsFeedItem key={post.id} post={post} userData={userData} />
//       ))}
//     </div>
//   );
// };

// export default NewsFeed;



