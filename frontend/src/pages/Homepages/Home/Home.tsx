import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";

const Home = () => {
    
    return (
        <div>
            <h1><Link to="/pivo" style={{color: "red", textDecoration: "none"}}>Пиво</Link></h1>
            <h1><Link to="/vino" style={{color: "red", textDecoration: "none"}}>Вино</Link></h1>
            <h1><Link to="/vodka" style={{color: "red", textDecoration: "none"}}>Водка</Link></h1>
            <h1><Link to="/cognak" style={{color: "red", textDecoration: "none"}}>Коньяк</Link></h1> 
        </div>
       
    )
}

export default Home;