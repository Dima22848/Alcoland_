import { useState, useEffect, useRef } from "react";
import { Outlet, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../redux/store";
import { setToken, setUser, logout } from "../../../redux/slices/auth/authSlice";
import { fetchCurrentUser } from "../../../redux/api/auth/authApi";
import BasketDropdown from "../../../components/basket/BasketDropdown/BasketDropdown";
import BasketFullView from "../../../components/basket/BasketFullView/BasketFullView";
import Modal from "react-modal";
import styles from "./Layout.module.scss";

// ОБЯЗАТЕЛЬНО В МОНТАЖЕ ПРИЛОЖЕНИЯ (index.tsx или App.tsx)
// Modal.setAppElement('#root');

const Layout = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const [currentUser, setCurrentUser] = useState(user);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showFullBasket, setShowFullBasket] = useState(false); // Модалка полной корзины

  const profileDropdownRef = useRef<HTMLDivElement>(null);


  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Node;
    const isInProfile = profileDropdownRef.current?.contains(target);
    if (!isInProfile) {
      setIsProfileOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const email = localStorage.getItem("user_email");
    if (token && email && !user) {
      const loadUser = async () => {
        try {
          const userData = await fetchCurrentUser(token);
          dispatch(setToken(token));
          dispatch(setUser(userData));
        } catch (error) {
          console.error("Ошибка при загрузке пользователя:", error);
          localStorage.removeItem("access_token");
          localStorage.removeItem("user_email");
        }
      };
      loadUser();
    }
  }, [dispatch, user]);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  return (
    <div className={styles.full}>
      <nav className={styles.header}>
        <div className={styles.navbarLeft}>
          <Link to="/">Alcoland</Link>
          {/* <Link to="/support">Поддержка</Link> */}
        </div>
        <div className={styles.navbarRight}>
          {/* Корзина — BasketDropdown */}
          <BasketDropdown onShowFullBasket={() => setShowFullBasket(true)} />
          {/* ========== */}

          {currentUser ? (
            <div onClick={toggleProfile}>{currentUser.nickname}</div>
          ) : (
            <>
              <Link to="/login">Вход</Link>
              <Link to="/register">Регистрация</Link>
            </>
          )}
        </div>
      </nav>

      {isProfileOpen && user && (
        <div className={styles.profileDropdown} ref={profileDropdownRef}>
          <Link to="/profile">Мой профиль</Link>
          <Link to="/profile/settings">Настройки</Link>
          <button onClick={() => dispatch(logout())} className={styles.logoutLink}>Выйти</button>
        </div>
      )}

      <div className={styles.content}>
        <Outlet />
      </div>

      {/* <div className={styles.recommendations}>
        <h3>Рекомендации</h3>
        <div className={styles.recommendItems}>
          <div className={styles.recommendItem}>Item 1</div>
          <div className={styles.recommendItem}>Item 2</div>
          <div className={styles.recommendItem}>Item 3</div>
        </div>
      </div> */}

      {/* ========== МОДАЛКА ПОЛНОЙ КОРЗИНЫ ========== */}
      <Modal
        isOpen={showFullBasket}
        onRequestClose={() => setShowFullBasket(false)}
        className="BasketModal"
        overlayClassName="BasketOverlay"
        style={{
          content: { border: "none", background: "none", inset: "unset" },
          overlay: { background: "rgba(0,0,0,0.22)" },
        }}
      >
        <BasketFullView onClose={() => setShowFullBasket(false)} />
      </Modal>
    </div>
  );
};

export default Layout;










// import { useState, useEffect, useRef } from "react";
// import { Outlet, Link } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { RootState } from "../../../redux/store";
// import { setToken, setUser, logout } from "../../../redux/slices/auth/authSlice";
// import { fetchCurrentUser } from "../../../redux/api/auth/authApi";
// import styles from "./Layout.module.scss";

// interface CartItem {
//   id: number;
//   name: string;
//   price: number;
//   quantity: number;
//   image: string;
// }

// const Layout = () => {
//   const dispatch = useDispatch();
//   const user = useSelector((state: RootState) => state.auth.user);
//   const [currentUser, setCurrentUser] = useState(user);
//   const [isCartOpen, setIsCartOpen] = useState(false);
//   const [isProfileOpen, setIsProfileOpen] = useState(false);
//   const [cartItems, setCartItems] = useState<CartItem[]>([]);

//   const cartDropdownRef = useRef<HTMLDivElement>(null);
//   const profileDropdownRef = useRef<HTMLDivElement>(null);

//   const updateQuantity = (id: number, delta: number) => {
//     setCartItems(cartItems.map((item) =>
//       item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
//     ));
//   };

//   const getTotalPrice = () => {
//     return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
//   };

//   const handleClickOutside = (event: MouseEvent) => {
//     const target = event.target as Node;
//     const isInCart = cartDropdownRef.current?.contains(target);
//     const isInProfile = profileDropdownRef.current?.contains(target);
//     if (!isInCart && !isInProfile) {
//       setIsCartOpen(false);
//       setIsProfileOpen(false);
//     }
//   };

//   useEffect(() => {
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   useEffect(() => {
//     const token = localStorage.getItem("access_token");
//     const email = localStorage.getItem("user_email");

//     if (token && email && !user) {
//       const loadUser = async () => {
//         try {
//           const userData = await fetchCurrentUser(token);
//           dispatch(setToken(token));
//           dispatch(setUser(userData));
//         } catch (error) {
//           console.error("Ошибка при загрузке пользователя:", error);
//           localStorage.removeItem("access_token");
//           localStorage.removeItem("user_email");
//         }
//       };

//       loadUser();
//     }
//   }, [dispatch, user]);

//   useEffect(() => {
//     setCurrentUser(user);
//   }, [user]);

//   const toggleCart = () => {
//     setIsCartOpen(!isCartOpen);
//     setIsProfileOpen(false);
//   };

//   const toggleProfile = () => {
//     setIsProfileOpen(!isProfileOpen);
//     setIsCartOpen(false);
//   };

//   return (
//     <div className={styles.full}>
//       <nav className={styles.header}>
//         <div className={styles.navbarLeft}>
//           <Link to="/">Alcoland</Link>
//           <Link to="/support">Поддержка</Link>
//         </div>
//         <div className={styles.navbarRight}>
//           <div onClick={toggleCart}>Корзина</div>
//           {currentUser ? (
//             <div onClick={toggleProfile}>{currentUser.nickname}</div>
//           ) : (
//             <>
//               <Link to="/login">Вход</Link>
//               <Link to="/register">Регистрация</Link>
//             </>
//           )}
//         </div>
//       </nav>

//       {isCartOpen && (
//         <div className={styles.cartDropdown} ref={cartDropdownRef}>
//           <h3>Корзина</h3>
//           {cartItems.map(item => (
//             <div key={item.id} className={styles.cartItem}>
//               <img src={item.image} alt={item.name} />
//               <div>
//                 <p>{item.name}</p>
//                 <div className={styles.quantityControl}>
//                   <button onClick={() => updateQuantity(item.id, -1)}>-</button>
//                   <span>{item.quantity}</span>
//                   <button onClick={() => updateQuantity(item.id, 1)}>+</button>
//                 </div>
//                 <p>{item.price * item.quantity} ₽</p>
//               </div>
//             </div>
//           ))}
//           <h4>Всего к оплате: {getTotalPrice()} ₽</h4>
//           <button className={styles.payButton}>Оплатить</button>
//         </div>
//       )}

//       {isProfileOpen && user && (
//         <div className={styles.profileDropdown} ref={profileDropdownRef}>
//           <Link to="/profile">Мой профиль</Link>
//           <Link to="/profile/settings">Настройки</Link>
//           <button onClick={() => dispatch(logout())} className={styles.logoutLink}>Выйти</button>
//         </div>
//       )}

//       <div className={styles.content}>
//         <Outlet />
//       </div>

//       <div className={styles.recommendations}>
//         <h3>Рекомендации</h3>
//         <div className={styles.recommendItems}>
//           <div className={styles.recommendItem}>Item 1</div>
//           <div className={styles.recommendItem}>Item 2</div>
//           <div className={styles.recommendItem}>Item 3</div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Layout;









