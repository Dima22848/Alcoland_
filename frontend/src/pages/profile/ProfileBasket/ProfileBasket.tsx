import React from "react";
import BasketFullView from "../../../components/basket/BasketFullView/BasketFullView";

const ProfileBasket = () => (
  <div>
    <BasketFullView asModal={false} />
  </div>
);

export default ProfileBasket;









// import React, { useState } from 'react';
// import styles from './ProfileBasket.module.scss';

// const basketItems = [
//   {
//     id: 1,
//     alcoholName: 'Вино Красное',
//     alcoholImage: 'https://via.placeholder.com/150',
//     price: 500,
//     quantity: 1,
//   },
//   {
//     id: 2,
//     alcoholName: 'Виски Шотландский',
//     alcoholImage: 'https://via.placeholder.com/150',
//     price: 1200,
//     quantity: 1,
//   },
//   // Добавьте больше товаров в корзину, если нужно
// ];

// const ProfileBasket = () => {
//   const [items, setItems] = useState(basketItems);

//   const handleQuantityChange = (id: number, delta: number) => {
//     setItems((prevItems) =>
//       prevItems.map((item) =>
//         item.id === id
//           ? { ...item, quantity: Math.max(1, item.quantity + delta) } // Минимальное количество = 1
//           : item
//       )
//     );
//   };

//   const totalAmount = items.reduce((total, item) => total + item.price * item.quantity, 0);

//   return (
//     <div className={styles.basketContainer}>
//       <h1 className={styles.pageTitle}>Моя корзина</h1>

//       <div className={styles.basketItems}>
//         {items.map((item) => (
//           <div key={item.id} className={styles.basketItem}>
//             <div className={styles.alcoholInfo}>
//               <img src={item.alcoholImage} alt={item.alcoholName} className={styles.alcoholImage} />
//               <div className={styles.alcoholDetails}>
//                 <h2 className={styles.alcoholName}>{item.alcoholName}</h2>
//                 <div className={styles.quantity}>
//                   <button
//                     className={styles.quantityButton}
//                     onClick={() => handleQuantityChange(item.id, -1)}
//                   >
//                     -
//                   </button>
//                   <span className={styles.quantityValue}>{item.quantity}</span>
//                   <button
//                     className={styles.quantityButton}
//                     onClick={() => handleQuantityChange(item.id, 1)}
//                   >
//                     +
//                   </button>
//                 </div>
//                 <p className={styles.price}>{item.price} руб.</p>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className={styles.totalAmount}>
//         <h3>Всего к оплате: {totalAmount} руб.</h3>
//         <button className={styles.payButton}>Оплатить</button>
//       </div>
//     </div>
//   );
// };

// export default ProfileBasket;
