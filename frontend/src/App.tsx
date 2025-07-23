import React, { useEffect } from 'react';
import Modal from "react-modal";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { initBasket } from './redux/slices/main/basketSlice';

// Импортируем все компоненты
import Layout from './pages/Homepages/Layout/Layout';
import ProfileLayout from './pages/profile/ProfileLayout/ProfileLayout';
import Home from './pages/Homepages/Home/Home';
import Support from './pages/Support/Support';
import TypeOfAlcohol from './pages/catalog/TypeOfAlcohol/TypeOfAlcohol';
import AlcoholItem from './pages/catalog/AlcoholItem/AlcoholItem';
import Reviews from './pages/catalog/Reviews/Reviews';
import SendReviewPage from "./pages/catalog/SendReviewPage/SendReviewPage";
import Login from './pages/authentication/Login/Login';
import Register from './pages/authentication/Register/Register';
import ResetPassword from './pages/authentication/ResetPassword/ResetPassword';
import Profile from './pages/profile/Profile/Profile';
import ProfileById from './pages/profile/ProfileById/ProfileById';
import Settings from './pages/profile/Settings/Settings';
import Friends from './pages/profile/Friends/Friends';
import Follows from './pages/profile/Follows/Follows';
import Messages from './pages/profile/Messages/Messages';
import Chat from './pages/profile/Chat/Chat';
import NewsFeed from './pages/profile/NewsFeed/NewsFeed';
import ProfileReviews from './pages/profile/ProfileReviews/ProfileReviews';
import ProfileBasket from './pages/profile/ProfileBasket/ProfileBasket';
import BuyHistory from './pages/profile/BuyHistory/BuyHistory';

Modal.setAppElement('#root');

// Кастомный хук для инициализации корзины из localStorage
function useInitBasketFromLocalStorage() {
  const dispatch = useDispatch();
  useEffect(() => {
    const basketLS = localStorage.getItem('basket');
    if (basketLS) {
      dispatch(initBasket(JSON.parse(basketLS)));
    }
  }, [dispatch]);
}

const App = () => {
  useInitBasketFromLocalStorage();

  return (
    <Router>
      <Routes>
        {/* Основные страницы */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} /> 
          {/* Страница выбора типа алкоголя */}
          <Route path=":type" element={<TypeOfAlcohol />} />
          {/* Страница с конкретной единицей алкоголя */}
          <Route path=":type/:slug" element={<AlcoholItem />} />
          {/* Страница с отзывами для конкретной единицы алкоголя */}
          <Route path=":type/:slug/reviews" element={<Reviews />} />
          <Route path=":type/:slug/send-review" element={<SendReviewPage />} />
        </Route>
        {/* Страницы логина и регистрации */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="support" element={<Support />} />
        {/* Страница изменения пароля */}
        <Route path="reset-password" element={<ResetPassword />} />
        {/* Вложенные маршруты профиля */}
        <Route path="profile" element={<ProfileLayout />}>
          <Route index element={<Profile />} /> {/* Главная страница профиля */}
          <Route path=":id" element={<ProfileById />} /> {/* Профиль другого пользователя */}
          <Route path="friends" element={<Friends />} />
          <Route path="follows" element={<Follows />} />
          <Route path="chats" element={<Chat />}>
            <Route path=":slug" element={<Messages />} />
          </Route>
          <Route path="news-feed" element={<NewsFeed />} />
          <Route path="reviews" element={<ProfileReviews />} />
          <Route path="basket" element={<ProfileBasket />} />
          <Route path="buy-history" element={<BuyHistory />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;















// import Modal from "react-modal";
// Modal.setAppElement('#root');


// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// // Импортируем все компоненты
// import Layout from './pages/Homepages/Layout/Layout';
// import ProfileLayout from './pages/profile/ProfileLayout/ProfileLayout';
// import Home from './pages/Homepages/Home/Home';
// import Support from './pages/Support/Support';
// import Basket from './pages/catalog/Basket/Basket';
// import TypeOfAlcohol from './pages/catalog/TypeOfAlcohol/TypeOfAlcohol';
// import AlcoholItem from './pages/catalog/AlcoholItem/AlcoholItem';
// import Reviews from './pages/catalog/Reviews/Reviews';
// import SendReviewPage from "./pages/catalog/SendReviewPage/SendReviewPage";
// import Login from './pages/authentication/Login/Login';
// import Register from './pages/authentication/Register/Register';
// import ResetPassword from './pages/authentication/ResetPassword/ResetPassword';
// import Profile from './pages/profile/Profile/Profile';
// import ProfileById from './pages/profile/ProfileById/ProfileById';
// import Settings from './pages/profile/Settings/Settings';
// import Friends from './pages/profile/Friends/Friends';
// import Follows from './pages/profile/Follows/Follows';
// import Messages from './pages/profile/Messages/Messages';
// import Chat from './pages/profile/Chat/Chat';
// import NewsFeed from './pages/profile/NewsFeed/NewsFeed';
// import ProfileReviews from './pages/profile/ProfileReviews/ProfileReviews';
// import ProfileBasket from './pages/profile/ProfileBasket/ProfileBasket';
// import BuyHistory from './pages/profile/BuyHistory/BuyHistory';



// const App = () => (
//   <Router>
//     <Routes>
//       {/* Основные страницы */}
//       <Route path="/" element={<Layout />}>
//         <Route index element={<Home />} /> 
//         <Route path="basket" element={<Basket />} />
      
//         {/* Страница выбора типа алкоголя */}
//         <Route path=":type" element={<TypeOfAlcohol />} />
      
//         {/* Страница с конкретной единицей алкоголя */}
//         <Route path=":type/:slug" element={<AlcoholItem />} />
      
//         {/* Страница с отзывами для конкретной единицы алкоголя */}
//         <Route path=":type/:slug/reviews" element={<Reviews />} />
//         <Route path=":type/:slug/send-review" element={<SendReviewPage />} />
//       </Route>
//       {/* Страницы логина и регистрации */}
//       <Route path="login" element={<Login />} />
//       <Route path="register" element={<Register />} />
//       <Route path="support" element={<Support />} />

//       {/* Страница изменения пароля */}
//       <Route path="reset-password" element={<ResetPassword />} />
      
//       {/* Вложенные маршруты профиля */}
//       <Route path="profile" element={<ProfileLayout />}>
//         <Route index element={<Profile />} /> {/* Главная страница профиля */}
//         <Route path=":id" element={<ProfileById />} /> {/* Профиль другого пользователя */}
//         <Route path="friends" element={<Friends />} />
//         <Route path="follows" element={<Follows />} />
//         <Route path="chats" element={<Chat />}>
//           <Route path=":slug" element={<Messages />} />
//         </Route>
//         <Route path="news-feed" element={<NewsFeed />} />
//         <Route path="reviews" element={<ProfileReviews />} />
//         <Route path="basket" element={<ProfileBasket />} />
//         <Route path="buy-history" element={<BuyHistory />} />
//         <Route path="settings" element={<Settings />} />
//       </Route>
//     </Routes>
//   </Router>
// );

// export default App;





