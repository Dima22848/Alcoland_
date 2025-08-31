import { Outlet } from "react-router-dom";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Home.module.scss";

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


const Home = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.categorySelector}>
          <span className={styles.catalogLabel}>Каталог товаров:</span>
          {Object.keys(categoryNames).map((key) => (
            <button
              key={key}
              onClick={() => navigate(`/${key}`)}
              className={`${styles.categoryButton}`}
            >
              {categoryNames[key]}
            </button>
          ))}
        </div>
       
    )
}

export default Home;









// import { Outlet } from "react-router-dom";
// import { Link } from "react-router-dom";

// const Home = () => {
    
//     return (
//         <div>
//             <h1><Link to="/pivo" style={{color: "red", textDecoration: "none"}}>Пиво</Link></h1>
//             <h1><Link to="/vino" style={{color: "red", textDecoration: "none"}}>Вино</Link></h1>
//             <h1><Link to="/vodka" style={{color: "red", textDecoration: "none"}}>Водка</Link></h1>
//             <h1><Link to="/cognak" style={{color: "red", textDecoration: "none"}}>Коньяк</Link></h1> 
//         </div>
       
//     )
// }

// export default Home;