import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import {
  increaseQty,
  decreaseQty,
  removeItemLocal,
  clearBasket,
} from "../../../redux/slices/main/basketSlice";
import { checkoutOrderThunk } from "../../../redux/slices/main/basketSlice";
import styles from "./BasketFullView.module.scss";

interface BasketFullViewProps {
  onClose?: () => void;
  asModal?: boolean; // <--- новый проп
}

const ITEMS_PER_PAGE = 3;

const BasketFullView: React.FC<BasketFullViewProps> = ({ onClose, asModal = true }) => {
  const items = useSelector((state: RootState) => state.basket.items);
  const dispatch = useDispatch<AppDispatch>();
  const [page, setPage] = useState(1);
  const [isCheckout, setIsCheckout] = useState(false);
  const pageCount = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [items.length, page, pageCount]);

  const pageItems = items.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const total = items.reduce(
    (sum, item) => sum + (item.alcohol.price * item.quantity),
    0
  );

  const getImg = (src: string) =>
    src ? src : "https://via.placeholder.com/60x80?text=Нет+фото";

  useEffect(() => {
    if (items.length === 0 && isCheckout && onClose) {
      setTimeout(() => {
        onClose();
        setIsCheckout(false);
      }, 350);
    }
  }, [items.length, isCheckout, onClose]);

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
  };

  // --- определяем нужные классы в зависимости от asModal
  const wrapperClass = asModal ? styles.fullBasketWrapper : styles.pageBasketWrapper;
  const basketClass = asModal ? styles.fullBasket : styles.pageBasket;

  return (
    <div className={wrapperClass}>
      <div className={basketClass}>
        <h2 className={styles.title}>Моя корзина</h2>
        {asModal && onClose && (
          <button className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        )}
        {items.length === 0 ? (
          <div className={styles.empty}>Корзина пуста</div>
        ) : (
          <>
            <div className={styles.itemsList}>
              {pageItems.map(item => (
                <div key={item.id} className={styles.item}>
                  <img
                    src={getImg(item.alcohol.image)}
                    alt={item.alcohol.name}
                    className={styles.img}
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
                    <div className={styles.priceRow}>
                      <span className={styles.priceLabel}>Цена за шт: </span>
                      <span className={styles.price}>{item.alcohol.price} грн</span>
                    </div>
                    <div className={styles.sumRow}>
                      <span>Сумма:</span>
                      <b>{item.alcohol.price * item.quantity} грн</b>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {pageCount > 1 && (
              <div className={styles.pagination}>
                {Array.from({ length: pageCount }).map((_, i) => (
                  <button
                    key={i}
                    className={page === i + 1 ? styles.activePage : ""}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
            <button
              className={styles.clearAllBtn}
              onClick={() => dispatch(clearBasket())}
              style={{ margin: "16px 0", background: "#f33", color: "#fff" }}
            >
              Удалить все товары
            </button>
          </>
        )}
        {items.length > 0 && (
          <>
            <div className={styles.totalRow}>
              <span>Всего к оплате:</span>
              <b>{total} грн</b>
            </div>
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
    </div>
  );
};

export default BasketFullView;










// import React, { useState, useEffect } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { AppDispatch, RootState } from "../../../redux/store";
// import {
//   increaseQty,
//   decreaseQty,
//   removeItemLocal,
//   clearBasket,
// } from "../../../redux/slices/main/basketSlice";
// import { checkoutOrderThunk } from "../../../redux/slices/main/basketSlice";
// import styles from "./BasketFullView.module.scss";

// interface BasketFullViewProps {
//   onClose?: () => void;
// }

// const ITEMS_PER_PAGE = 3;

// const BasketFullView: React.FC<BasketFullViewProps> = ({ onClose }) => {
//   // Берём товары из basket.items!
//   const items = useSelector((state: RootState) => state.basket.items);
//   const dispatch = useDispatch<AppDispatch>();
//   const [page, setPage] = useState(1);
//   const [isCheckout, setIsCheckout] = useState(false);
//   const pageCount = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));

//   useEffect(() => {
//     if (page > pageCount) setPage(pageCount);
//   }, [items.length, page, pageCount]);

//   const pageItems = items.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

//   const total = items.reduce(
//     (sum, item) => sum + (item.alcohol.price * item.quantity),
//     0
//   );

//   const getImg = (src: string) =>
//     src ? src : "https://via.placeholder.com/60x80?text=Нет+фото";

//   // --- 1. После оформления заказа корзина очищается и модалка закрывается
//   useEffect(() => {
//     if (items.length === 0 && isCheckout && onClose) {
//       setTimeout(() => {
//         onClose();
//         setIsCheckout(false);
//       }, 350); // Даем чуть времени, чтобы пользователь увидел обновление
//     }
//   }, [items.length, isCheckout, onClose]);

//   // Оформить заказ
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
//   };

//   return (
//     <div className={styles.fullBasketWrapper}>
//       <div className={styles.fullBasket}>
//         <h2 className={styles.title}>Моя корзина</h2>
//         {onClose && (
//           <button className={styles.closeBtn} onClick={onClose}>
//             ×
//           </button>
//         )}
//         {items.length === 0 ? (
//           <div className={styles.empty}>Корзина пуста</div>
//         ) : (
//           <>
//             <div className={styles.itemsList}>
//               {pageItems.map(item => (
//                 <div key={item.id} className={styles.item}>
//                   <img
//                     src={getImg(item.alcohol.image)}
//                     alt={item.alcohol.name}
//                     className={styles.img}
//                   />
//                   <div className={styles.info}>
//                     <div className={styles.name}>{item.alcohol.name}</div>
//                     <div className={styles.controls}>
//                       <button
//                         className={styles.qtyBtn}
//                         onClick={() => dispatch(decreaseQty(item.id))}
//                         disabled={item.quantity <= 1}
//                         title="Уменьшить"
//                       >–</button>
//                       <span className={styles.qty}>{item.quantity}</span>
//                       <button
//                         className={styles.qtyBtn}
//                         onClick={() => dispatch(increaseQty(item.id))}
//                         title="Увеличить"
//                       >+</button>
//                       <button
//                         className={styles.removeBtn}
//                         onClick={() => dispatch(removeItemLocal(item.id))}
//                         title="Удалить товар"
//                       >×</button>
//                     </div>
//                     <div className={styles.priceRow}>
//                       <span className={styles.priceLabel}>Цена за шт: </span>
//                       <span className={styles.price}>{item.alcohol.price} грн</span>
//                     </div>
//                     <div className={styles.sumRow}>
//                       <span>Сумма:</span>
//                       <b>{item.alcohol.price * item.quantity} грн</b>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//             {/* Пагинация */}
//             {pageCount > 1 && (
//               <div className={styles.pagination}>
//                 {Array.from({ length: pageCount }).map((_, i) => (
//                   <button
//                     key={i}
//                     className={page === i + 1 ? styles.activePage : ""}
//                     onClick={() => setPage(i + 1)}
//                   >
//                     {i + 1}
//                   </button>
//                 ))}
//               </div>
//             )}
//             <button
//               className={styles.clearAllBtn}
//               onClick={() => dispatch(clearBasket())}
//               style={{ margin: "16px 0", background: "#f33", color: "#fff" }}
//             >
//               Удалить все товары
//             </button>
//           </>
//         )}
//         {items.length > 0 && (
//           <>
//             <div className={styles.totalRow}>
//               <span>Всего к оплате:</span>
//               <b>{total} грн</b>
//             </div>
//             <button
//               className={styles.payBtn}
//               onClick={handleCheckout}
//               disabled={isCheckout}
//               style={{ background: "#1f6feb" }}
//             >
//               {isCheckout ? "Оформляем..." : "Подтвердить заказ"}
//             </button>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default BasketFullView;


















