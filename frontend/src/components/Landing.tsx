import { useState , useEffect, useRef} from "react"
import { Link } from "react-router-dom"
import { Room } from "./Room";


export default function Landing() {
    const [name, setName] = useState("");
    const [joind , setJoined] = useState(false);
    const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack | null>(null);
    const [localVideoTrack, setLocalVideoTrack] = useState<MediaStreamTrack | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const getCam =async () => {
        const streams = await window.navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        })
        // Media stream
        const videoTrack = streams.getVideoTracks()[0];
        const audioTrack = streams.getAudioTracks()[0];
        setLocalAudioTrack(audioTrack);
        setLocalVideoTrack(videoTrack);
        if(!videoRef.current)return;
        videoRef.current.srcObject = new MediaStream([videoTrack]);

    }
    
    useEffect(()=>{
        if(videoRef && videoRef.current){
            getCam();
        }
    },[videoRef])
    // cosnt history = useHi
    if(!joind){
        return (
            <div>
                <video autoPlay ref={videoRef}></video>
                <input type="text" onChange={(e) => setName(e.target.value)} />
                <button onClick={()=>{setJoined(true)}} >Join</button>
            </div>
        )
    }
    return <Room name={name} localAudioTrack={localAudioTrack} localVideoTrack={localVideoTrack}/>
} 