import { useState , useEffect} from "react"
import { Link } from "react-router-dom"


export default function Landing() {
    const [name, setName] = useState("");
    const [joind , setJoined] = useState(false);
    
    useEffect(()=>{

    },[])
    // cosnt history = useHi
    return (
        <div>
            <input type="text" onChange={(e) => setName(e.target.value)} />
            <Link to={`/room/?name=${name}`} >Join</Link>
        </div>
    )
}