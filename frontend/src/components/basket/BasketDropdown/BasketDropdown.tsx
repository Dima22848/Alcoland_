import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../redux/store";
import {
  increaseQty,
  decreaseQty,
  removeItemLocal,
  clearBasket,
} from "../../../redux/slices/main/basketSlice";
import { checkoutOrderThunk } from "../../../redux/slices/main/basketSlice";
import styles from "./BasketDropdown.module.scss";

interface BasketDropdownProps {
  onShowFullBasket?: () => void;
}

const BasketDropdown: React.FC<BasketDropdownProps> = ({ onShowFullBasket }) => {
  // Обращаемся к basket.items!
  const items = useSelector((state: RootState) => state.basket.items);
  const dispatch = useDispatch<AppDispatch>();
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckout, setIsCheckout] = useState(false);

  const total = items.reduce(
    (sum, item) => sum + (item.alcohol.price * item.quantity),
    0
  );

  const previewItems = items.slice(0, 2);

  const getImg = (src: string) =>
    src ? src : "https://via.placeholder.com/60x80?text=Нет+фото";

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setIsCheckout(true);
    const orderItems = items.map(item => ({
      content_type: item.content_type,
      object_id: item.object_id,
      quantity: item.quantity,
      price: item.alcohol.price,
    }));
    await dispatch(checkoutOrderThunk(orderItems));
    setIsCheckout(false);
    setIsOpen(false);
  };

  return (
    <div
      className={styles.dropdown}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className={styles.basketButton}>Корзина</button>
      {isOpen && (
        <div className={styles.dropdownContent}>
          <h3 className={styles.title}>Корзина</h3>
          {items.length === 0 ? (
            <div className={styles.empty}>Ваша корзина пуста</div>
          ) : (
            <>
              <div className={styles.items}>
                {previewItems.map(item => (
                  <div key={item.id} className={styles.item}>
                    <img
                      src={getImg(item.alcohol.image)}
                      alt={item.alcohol.name}
                      className={styles.img}
                      style={{ objectFit: "cover", width: 60, height: 80, borderRadius: 8 }}
                    />
                    <div className={styles.info}>
                      <div className={styles.name}>{item.alcohol.name}</div>
                      <div className={styles.controls}>
                        <button
                          className={styles.qtyBtn}
                          onClick={() => dispatch(decreaseQty(item.id))}
                          disabled={item.quantity <= 1}
                          title="Уменьшить"
                        >–</button>
                        <span className={styles.qty}>{item.quantity}</span>
                        <button
                          className={styles.qtyBtn}
                          onClick={() => dispatch(increaseQty(item.id))}
                          title="Увеличить"
                        >+</button>
                        <button
                          className={styles.removeBtn}
                          onClick={() => dispatch(removeItemLocal(item.id))}
                          title="Удалить товар"
                        >×</button>
                      </div>
                      <div className={styles.price}>
                        {item.alcohol.price * item.quantity} грн
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {items.length > 2 && (
                <button className={styles.showAll} onClick={onShowFullBasket}>
                  Посмотреть все товары
                </button>
              )}
              <div className={styles.total}>
                <span>Всего к оплате: </span>
                <b>{total} грн</b>
              </div>
              <button
                className={styles.clearAllBtn}
                onClick={() => dispatch(clearBasket())}
                style={{ background: "#f33", color: "#fff", margin: "12px 0" }}
              >
                Удалить все товары
              </button>
              <button
                className={styles.payBtn}
                onClick={handleCheckout}
                disabled={isCheckout}
                style={{ background: "#1f6feb" }}
              >
                {isCheckout ? "Оформляем..." : "Подтвердить заказ"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BasketDropdown;










// import React, { useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { RootState, AppDispatch } from "../../../redux/store";
// import {
//   increaseQty,
//   decreaseQty,
//   removeItemLocal,
//   clearBasket,
// } from "../../../redux/slices/main/basketSlice";
// import { checkoutOrderThunk } from "../../../redux/slices/main/basketSlice";
// import styles from "./BasketDropdown.module.scss";

// interface BasketDropdownProps {
//   onShowFullBasket?: () => void;
// }

// const BasketDropdown: React.FC<BasketDropdownProps> = ({ onShowFullBasket }) => {
//   const items = useSelector((state: RootState) => state.basket);
//   const dispatch = useDispatch<AppDispatch>();
//   const [isOpen, setIsOpen] = useState(false);
//   const [isCheckout, setIsCheckout] = useState(false);

//   const total = items.reduce(
//     (sum, item) => sum + (item.alcohol.price * item.quantity),
//     0
//   );

//   const previewItems = items.slice(0, 2);

//   const getImg = (src: string) =>
//     src ? src : "https://via.placeholder.com/60x80?text=Нет+фото";

//   const handleCheckout = async () => {
//     if (items.length === 0) return;
//     setIsCheckout(true);
//     const orderItems = items.map(item => ({
//       content_type: item.content_type,
//       object_id: item.object_id,
//       quantity: item.quantity,
//       price: item.alcohol.price,
//     }));
//     await dispatch(checkoutOrderThunk(orderItems));
//     setIsCheckout(false);
//     setIsOpen(false);
//   };

//   return (
//     <div
//       className={styles.dropdown}
//       onMouseEnter={() => setIsOpen(true)}
//       onMouseLeave={() => setIsOpen(false)}
//     >
//       <button className={styles.basketButton}>Корзина</button>
//       {isOpen && (
//         <div className={styles.dropdownContent}>
//           <h3 className={styles.title}>Корзина</h3>
//           {items.length === 0 ? (
//             <div className={styles.empty}>Ваша корзина пуста</div>
//           ) : (
//             <>
//               <div className={styles.items}>
//                 {previewItems.map(item => (
//                   <div key={item.id} className={styles.item}>
//                     <img
//                       src={getImg(item.alcohol.image)}
//                       alt={item.alcohol.name}
//                       className={styles.img}
//                       style={{ objectFit: "cover", width: 60, height: 80, borderRadius: 8 }}
//                     />
//                     <div className={styles.info}>
//                       <div className={styles.name}>{item.alcohol.name}</div>
//                       <div className={styles.controls}>
//                         <button
//                           className={styles.qtyBtn}
//                           onClick={() => dispatch(decreaseQty(item.id))}
//                           disabled={item.quantity <= 1}
//                           title="Уменьшить"
//                         >–</button>
//                         <span className={styles.qty}>{item.quantity}</span>
//                         <button
//                           className={styles.qtyBtn}
//                           onClick={() => dispatch(increaseQty(item.id))}
//                           title="Увеличить"
//                         >+</button>
//                         <button
//                           className={styles.removeBtn}
//                           onClick={() => dispatch(removeItemLocal(item.id))}
//                           title="Удалить товар"
//                         >×</button>
//                       </div>
//                       <div className={styles.price}>
//                         {item.alcohol.price * item.quantity} грн
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//               {items.length > 2 && (
//                 <button className={styles.showAll} onClick={onShowFullBasket}>
//                   Посмотреть все товары
//                 </button>
//               )}
//               <div className={styles.total}>
//                 <span>Всего к оплате: </span>
//                 <b>{total} грн</b>
//               </div>
//               <button
//                 className={styles.clearAllBtn}
//                 onClick={() => dispatch(clearBasket())}
//                 style={{ background: "#f33", color: "#fff", margin: "12px 0" }}
//               >
//                 Удалить все товары
//               </button>
//               <button
//                 className={styles.payBtn}
//                 onClick={handleCheckout}
//                 disabled={isCheckout}
//                 style={{ background: "#1f6feb" }}
//               >
//                 {isCheckout ? "Оформляем..." : "Подтвердить заказ"}
//               </button>
//             </>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default BasketDropdown;





















