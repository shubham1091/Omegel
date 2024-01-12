import { useState } from "react"
import { Link } from "react-router-dom"


export default function Landing() {
    const [name, setName] = useState("")
    // cosnt history = useHi
    return (
        <div>
            <input type="text" onChange={(e) => setName(e.target.value)} />
            <Link to={`/room/?name=${name}`} >Join</Link>
        </div>
    )
}