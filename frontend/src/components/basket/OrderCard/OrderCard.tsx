import React, { useState } from "react";
import styles from './OrderCard.module.scss';

interface OrderItem {
  id: number;
  product_name: string;
  product_image?: string;
  quantity: number;
  price: number;
  [key: string]: any; 
}

interface OrderCardProps {
  order: any;
  itemsPerPage?: number;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, itemsPerPage = 4 }) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(order.items.length / itemsPerPage);

  // товары для текущей страницы
  const pageItems = order.items.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // для визуального выравнивания, если товаров меньше чем на страницу — добавляем "пустышки"
  while (pageItems.length < itemsPerPage) {
    pageItems.push(null);
  }

  return (
    <div className={styles.purchaseBlock}>
      {/* шапка заказа */}
      <div className={styles.header}>
        <span className={styles.orderNum}>Заказ №{order.id}</span>
        <span className={styles.orderDate}>{new Date(order.created_at).toLocaleString()}</span>
      </div>
      <div className={styles.itemsBlock}>
        {pageItems.map((item: OrderItem | null, idx: number) =>
          item ? (
            <div key={item.id} className={styles.purchaseItem}>
              <img
                src={
                  item.product_image
                    ? item.product_image.startsWith("http")
                      ? item.product_image
                      : `http://localhost:8000${item.product_image}`
                    : "https://via.placeholder.com/80x80?text=Нет+фото"
                }
                alt={item.product_name || "Товар"}
                className={styles.alcoholImage}
              />
              <div className={styles.alcoholDetails}>
                <div className={styles.alcoholName}>
                  {item.product_name || "Товар"}
                </div>
                <div className={styles.quantity}>
                  Кол-во: <b>{item.quantity}</b>
                </div>
                <div className={styles.price}>
                  Цена за шт: <b>{item.price} грн</b>
                </div>
                <div className={styles.totalItemPrice}>
                  Сумма: <b>{item.price * item.quantity} грн</b>
                </div>
              </div>
            </div>
          ) : (
            // пустой блок-заглушка для выравнивания
            <div key={`empty-${idx}`} className={styles.purchaseItem} style={{ visibility: "hidden" }} />
          )
        )}
      </div>
      {/* пагинация по товарам внутри заказа */}
      {totalPages > 1 && (
        <div className={styles.innerPagination}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</button>
          <span>{page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>→</button>
        </div>
      )}
      <div className={styles.totalAmount}>
        Итого: {order.items.reduce((s: number, i: any) => s + i.price * i.quantity, 0)} грн
      </div>
    </div>
  );
};

export default OrderCard;










// import React, { useState } from "react";
// import styles from './OrderCard.module.scss'


// interface OrderItem {
//   id: number;
//   product_name: string;
//   product_image?: string;
//   quantity: number;
//   price: number;
//   [key: string]: any; 
// }


// interface OrderCardProps {
//   order: any;
//   itemsPerPage?: number;
// }

// const OrderCard: React.FC<OrderCardProps> = ({ order, itemsPerPage = 4 }) => {
//   const [page, setPage] = useState(1);
//   const totalPages = Math.ceil(order.items.length / itemsPerPage);

//   // товары для текущей страницы
//   const pageItems = order.items.slice((page - 1) * itemsPerPage, page * itemsPerPage);

//   // для визуального выравнивания, если товаров меньше 3 — добавляем "пустышки"
//   while (pageItems.length < itemsPerPage) {
//     pageItems.push(null);
//   }

//   return (
//     <div className={styles.purchaseBlock}>
//       {/* шапка заказа */}
//       <div className={styles.header}>
//         <span className={styles.orderNum}>Заказ №{order.id}</span>
//         <span className={styles.orderDate}>{new Date(order.created_at).toLocaleString()}</span>
//       </div>
//       <div className={styles.itemsBlock}>
//         {pageItems.map((item: OrderItem | null, idx: number) =>
//           item ? (
//             <div key={item.id} className={styles.purchaseItem}>
//               <img
//                 src={
//                   item.product_image
//                     ? item.product_image.startsWith("http")
//                       ? item.product_image
//                       : `http://localhost:8000${item.product_image}`
//                     : "https://via.placeholder.com/80x80?text=Нет+фото"
//                 }
//                 alt={item.product_name || "Товар"}
//                 className={styles.alcoholImage}
//               />
//               <div className={styles.alcoholDetails}>
//                 <div className={styles.alcoholName}>
//                   {item.product_name || "Товар"}
//                 </div>
//                 <div className={styles.quantity}>
//                   Кол-во: <b>{item.quantity}</b>
//                 </div>
//                 <div className={styles.price}>
//                   Цена за шт: <b>{item.price} грн</b>
//                 </div>
//                 <div className={styles.totalItemPrice}>
//                   Сумма: <b>{item.price * item.quantity} грн</b>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             // пустой блок-заглушка для выравнивания
//             <div key={`empty-${idx}`} className={styles.purchaseItem} style={{ visibility: "hidden" }} />
//           )
//         )}
//       </div>
//       {/* пагинация по товарам внутри заказа */}
//       {totalPages > 1 && (
//         <div className={styles.innerPagination}>
//           <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</button>
//           <span>{page} / {totalPages}</span>
//           <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>→</button>
//         </div>
//       )}
//       <div className={styles.totalAmount}>
//         Итого: {order.items.reduce((s: number, i: any) => s + i.price * i.quantity, 0)} грн
//       </div>
//     </div>
//   );
// };

// export default OrderCard;
