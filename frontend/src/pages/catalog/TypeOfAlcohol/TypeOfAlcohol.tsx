import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
import { loadAlcoholItems } from "../../../redux/slices/main/alcoholSlice";
import { addItemToBasket } from "../../../redux/slices/main/basketSlice";
import { RootState, useAppDispatch } from "../../../redux/store";
import styles from "./TypeOfAlcohol.module.scss";

export interface AlcoholItem {
  id: number;
  name: string;
  image: string;
  price: number;
  type: string;
  slug: string;
  created_at?: string;
  reviews_count?: number;
  reviews?: any[];
}

const ITEMS_PER_PAGE = 12;

const categoryNames: Record<string, string> = {
  pivo: "Пиво",
  vino: "Вино",
  vodka: "Водка",
  cognak: "Коньяк",
};

const contentTypeMapping: Record<string, number> = {
  pivo: 13,
  cognak: 14,
  vino: 17,
  vodka: 18,
};

const TypeOfAlcohol = () => {
  const { type } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");

  useEffect(() => {
    if (type) {
      dispatch(loadAlcoholItems(type));
      setCurrentPage(1);
      setSearch("");
      setSort("");
    }
  }, [type, dispatch]);

  const { items } = useSelector((state: RootState) => state.alcohol);

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "popularity") {
      const aCount = a.reviews_count || 0;
      const bCount = b.reviews_count || 0;
      return bCount - aCount;
    } else if (sort === "newness") {
      return new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime();
    } else if (sort === "price_desc") {
      return b.price - a.price;
    } else if (sort === "price_asc") {
      return a.price - b.price;
    }
    return 0;
  });

  const lastIndex = currentPage * ITEMS_PER_PAGE;
  const firstIndex = lastIndex - ITEMS_PER_PAGE;
  const currentItems = sorted.slice(firstIndex, lastIndex);
  const pageCount = Math.ceil(sorted.length / ITEMS_PER_PAGE);

    // --- Только redux/localStorage! ---
    const handleAddToBasket = (e: React.MouseEvent, item: AlcoholItem) => {
      e.preventDefault();
      if (!type) return;
      dispatch(addItemToBasket({
        content_type: contentTypeMapping[type],
        object_id: item.id,
        quantity: 1,
        alcohol: {
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
        },
      }));
    };



  return (
    <div className={styles.content}>
      <div className={styles.topControls}>
        <div className={styles.categorySelector}>
          <span className={styles.catalogLabel}>Каталог товаров:</span>
          {Object.keys(categoryNames).map((key) => (
            <button
              key={key}
              onClick={() => navigate(`/${key}`)}
              className={`${styles.categoryButton} ${type === key ? styles.activeCategory : ""}`}
            >
              {categoryNames[key]}
            </button>
          ))}
        </div>
        <div className={styles.searchSort}>
          <input
            type="text"
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <select value={sort} onChange={(e) => setSort(e.target.value)} className={styles.sortSelect}>
            <option value="">По умолчанию</option>
            <option value="popularity">По популярности</option>
            <option value="newness">По новизне</option>
            <option value="price_desc">По убыванию цены</option>
            <option value="price_asc">По возрастанию цены</option>
          </select>
        </div>
      </div>
      <div className={styles.alcoholItems}>
        {currentItems.map((item: AlcoholItem) => (
          <div key={item.id} className={styles.alcoholItem}>
            <Link to={`/${type}/${item.slug}`}>
              <img style={{ width: "200px", height: "300px" }} src={item.image} alt={item.name} />
              <p>{item.name}</p>
              <p>{item.price} грн</p>
            </Link>
            <button
              className={styles.addToCart}
              onClick={(e) => handleAddToBasket(e, item)}
            >
              Добавить в корзину
            </button>
          </div>
        ))}
      </div>
      <div className={styles.pagination}>
        {Array.from({ length: pageCount }).map((_, idx) => (
          <button
            key={idx}
            className={currentPage === idx + 1 ? styles.activePage : ""}
            onClick={() => setCurrentPage(idx + 1)}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TypeOfAlcohol;








// import { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import { useParams, Link, useNavigate } from "react-router-dom";
// import { loadAlcoholItems } from "../../../redux/slices/main/alcoholSlice";
// import { addItemToBasket } from "../../../redux/slices/main/basketSlice";
// import { RootState, useAppDispatch } from "../../../redux/store";
// import styles from "./TypeOfAlcohol.module.scss";

// export interface AlcoholItem {
//   id: number;
//   name: string;
//   image: string;
//   price: number;
//   type: string;
//   slug: string;
//   created_at?: string;
//   reviews_count?: number;
//   reviews?: any[];
// }

// const ITEMS_PER_PAGE = 12;

// const categoryNames: Record<string, string> = {
//   pivo: "Пиво",
//   vino: "Вино",
//   vodka: "Водка",
//   cognak: "Коньяк",
// };

// // Маппинг типа алкоголя на content_type
// const contentTypeMapping: Record<string, number> = {
//   pivo: 13,
//   cognak: 14,
//   vino: 17,
//   vodka: 18,
// };

// const TypeOfAlcohol = () => {
//   const { type } = useParams();
//   const dispatch = useAppDispatch();
//   const navigate = useNavigate();
//   const [currentPage, setCurrentPage] = useState(1);
//   const [search, setSearch] = useState("");
//   const [sort, setSort] = useState("");

//   useEffect(() => {
//     if (type) {
//       dispatch(loadAlcoholItems(type));
//       setCurrentPage(1);
//       setSearch("");
//       setSort("");
//     }
//   }, [type, dispatch]);

//   const { items } = useSelector((state: RootState) => state.alcohol);

//   const filtered = items.filter((item) =>
//     item.name.toLowerCase().includes(search.toLowerCase())
//   );

//   const sorted = [...filtered].sort((a, b) => {
//     if (sort === "popularity") {
//       const aCount = a.reviews_count || 0;
//       const bCount = b.reviews_count || 0;
//       return bCount - aCount;
//     } else if (sort === "newness") {
//       return new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime();
//     } else if (sort === "price_desc") {
//       return b.price - a.price;
//     } else if (sort === "price_asc") {
//       return a.price - b.price;
//     }
//     return 0;
//   });

//   const lastIndex = currentPage * ITEMS_PER_PAGE;
//   const firstIndex = lastIndex - ITEMS_PER_PAGE;
//   const currentItems = sorted.slice(firstIndex, lastIndex);
//   const pageCount = Math.ceil(sorted.length / ITEMS_PER_PAGE);

//   // --- Новый обработчик для добавления в корзину ---
//   const handleAddToBasket = (e: React.MouseEvent, item: AlcoholItem) => {
//     e.preventDefault();
//     if (!type) return;
//     const content_type = contentTypeMapping[type];
//     dispatch(addItemToBasket({
//       content_type,
//       object_id: item.id,
//       quantity: 1,
//     }));
//   };

//   return (
//     <div className={styles.content}>
//       <div className={styles.topControls}>
//         <div className={styles.categorySelector}>
//           <span className={styles.catalogLabel}>Каталог товаров:</span>
//           {Object.keys(categoryNames).map((key) => (
//             <button
//               key={key}
//               onClick={() => navigate(`/${key}`)}
//               className={`${styles.categoryButton} ${type === key ? styles.activeCategory : ""}`}
//             >
//               {categoryNames[key]}
//             </button>
//           ))}
//         </div>

//         <div className={styles.searchSort}>
//           <input
//             type="text"
//             placeholder="Поиск..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className={styles.searchInput}
//           />
//           <select value={sort} onChange={(e) => setSort(e.target.value)} className={styles.sortSelect}>
//             <option value="">По умолчанию</option>
//             <option value="popularity">По популярности</option>
//             <option value="newness">По новизне</option>
//             <option value="price_desc">По убыванию цены</option>
//             <option value="price_asc">По возрастанию цены</option>
//           </select>
//         </div>
//       </div>

//       <div className={styles.alcoholItems}>
//         {currentItems.map((item: AlcoholItem) => (
//           <div key={item.id} className={styles.alcoholItem}>
//             <Link to={`/${type}/${item.slug}`}>
//               <img style={{ width: "200px", height: "300px" }} src={item.image} alt={item.name} />
//               <p>{item.name}</p>
//               <p>{item.price} грн</p>
//             </Link>
//             <button
//               className={styles.addToCart}
//               onClick={(e) => handleAddToBasket(e, item)}
//             >
//               Добавить в корзину
//             </button>
//           </div>
//         ))}
//       </div>

//       <div className={styles.pagination}>
//         {Array.from({ length: pageCount }).map((_, idx) => (
//           <button
//             key={idx}
//             className={currentPage === idx + 1 ? styles.activePage : ""}
//             onClick={() => setCurrentPage(idx + 1)}
//           >
//             {idx + 1}
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default TypeOfAlcohol;












