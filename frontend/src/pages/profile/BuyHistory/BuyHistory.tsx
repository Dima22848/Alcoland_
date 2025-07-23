import React, { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrdersPaginatedThunk, resetOrders } from "../../../redux/slices/main/basketSlice";
import { RootState, AppDispatch } from "../../../redux/store";
import styles from "./BuyHistory.module.scss";
import OrderCard from "../../../components/basket/OrderCard/OrderCard";

const ITEMS_PER_ORDER = 4;  // сколько товаров отображать в одной карточке заказа

const BuyHistory = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loadingOrders, errorOrders, ordersPage, ordersHasMore } = useSelector(
    (state: RootState) => state.basket
  );

  // Первый запрос — сброс + получение первой страницы
  useEffect(() => {
    dispatch(resetOrders());
    dispatch(fetchOrdersPaginatedThunk({ page: 1 }));
    // eslint-disable-next-line
  }, [dispatch]);

  // Подгрузить следующую страницу
  const loadNextPage = useCallback(() => {
    if (!loadingOrders && ordersHasMore) {
      dispatch(fetchOrdersPaginatedThunk({ page: ordersPage + 1 }));
    }
  }, [dispatch, ordersPage, loadingOrders, ordersHasMore]);

  if (loadingOrders && orders.length === 0)
    return <div className={styles.historyContainer}>Загрузка истории заказов...</div>;

  if (errorOrders)
    return <div className={styles.historyContainer} style={{ color: "red" }}>Ошибка: {errorOrders}</div>;

  if (!orders.length)
    return <div className={styles.historyContainer}>У вас ещё нет заказов.</div>;

  return (
    <div className={styles.historyContainer}>
      <h2 className={styles.pageTitle}>Моя история покупок</h2>
      {orders.map((order: any) => (
        <OrderCard order={order} key={order.id} itemsPerPage={ITEMS_PER_ORDER} />
      ))}
      {ordersHasMore && (
        <div className={styles.loadMoreWrapper}>
          <button
            className={styles.loadMoreBtn}
            onClick={loadNextPage}
            disabled={loadingOrders}
          >
            {loadingOrders ? "Загрузка..." : "Показать ещё"}
          </button>
        </div>
      )}
    </div>
  );
};

export default BuyHistory;










// import React, { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchOrdersThunk } from "../../../redux/slices/main/basketSlice";
// import { RootState, AppDispatch } from "../../../redux/store";
// import styles from "./BuyHistory.module.scss";
// import OrderCard from "../../../components/basket/OrderCard/OrderCard"; // импортируем компонент выше

// const BuyHistory = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const orders = useSelector((state: RootState) => state.basket.orders);
//   const loading = useSelector((state: RootState) => state.basket.loadingOrders);
//   const error = useSelector((state: RootState) => state.basket.errorOrders);

//   useEffect(() => {
//     dispatch(fetchOrdersThunk());
//   }, [dispatch]);

//   if (loading) return <div className={styles.historyContainer}>Загрузка истории заказов...</div>;
//   if (error) return <div className={styles.historyContainer} style={{ color: "red" }}>Ошибка: {error}</div>;
//   if (!orders.length) return <div className={styles.historyContainer}>У вас ещё нет заказов.</div>;

//   // обычная пагинация по заказам через backend
//   return (
//     <div className={styles.historyContainer}>
//       <h2 className={styles.pageTitle}>Моя история покупок</h2>
//       {orders.map((order: any) => (
//         <OrderCard order={order} key={order.id} itemsPerPage={4} />
//       ))}
//     </div>
//   );
// };
// export default BuyHistory;










