import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Socket, io } from "socket.io-client"

const URL = "http://localhost:3000"

export const Room = (
    {
        name,
        localAudioTrack,
        localVideoTrack
    }:{
        name:String,
        localAudioTrack:MediaStreamTrack | null,
        localVideoTrack:MediaStreamTrack | null
    }) => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [lobby, setLobby] = useState(true);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [sendingPc, setSendingPc] = useState<RTCPeerConnection | null>(null);
    const [receivingingPc, setReceivingPc] = useState<RTCPeerConnection | null>(null);
    const [remoteVideoTrack, setRemoteVideoTrack] = useState<MediaStreamTrack | null>(null);
    const [remoteAudioTrack, setRemoteAudioTrack] = useState<MediaStreamTrack | null>(null);
    const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const socket = io(URL);
        socket.on("send-offer", async ({ roomId }) => {
            setLobby(false);
            const pc = new RTCPeerConnection();
            setSendingPc(pc);
            if(localAudioTrack){
                pc.addTrack(localAudioTrack);
            }
            if(localVideoTrack){
                pc.addTrack(localVideoTrack);
            }

            pc.onicecandidate = async (e)=>{
                console.log("receiving ice candidate locally");
                if(e.candidate){
                    socket.emit("add-ice-candidate",{candidate:e.candidate, type: "sender"})
                }
            }

            pc.onnegotiationneeded = async ()=>{
                console.log("on negotiation needed, sending offer");
                const sdp = await pc.createOffer()
                pc.setLocalDescription(sdp)
                socket.emit("offer",{sdp,roomId})
            }
        })

        socket.on("offer", async ({ roomId, sdp:remoteSdp }) => {
            console.log("received offer");
            setLobby(false);
            const pc = new RTCPeerConnection()
            pc.setRemoteDescription(remoteSdp);
            const sdp = await pc.createAnswer();
            pc.setLocalDescription(sdp);
            const stream = new MediaStream();
            if(!remoteVideoRef.current)return;
            remoteVideoRef.current.srcObject = stream
            setRemoteMediaStream(stream)

            setReceivingPc(pc);
            pc.onicecandidate = async (e)=>{
                console.log('on ice candidate on receiving seide');
                if(e.candidate){
                    socket.emit("add-ice-candidate",{candidate: e.candidate, type: "receiver"})
                }
            }
            pc.ontrack = (({ track, type }) => {
                if (type == "audio") {
                    // setRemoteAudioTrack(track);
                    //@ts-ignore
                    remoteVideoRef.current?.srcObject.addTrack(track);
                } else {
                    // setRemoteVideoTrack(track);
                    //@ts-ignore
                    remoteVideoRef.current?.srcObject.addTrack(track);
                }
            })

            socket.emit("answer", { roomId, sdp:sdp });
        })

        socket.on("answer", ({ roomId, sdp:remoteSdp }) => {
            setLobby(false)
            setSendingPc(pc => {
                pc?.setRemoteDescription(remoteSdp);
                return pc;
            });
            console.log("loop closed");
        })

        socket.on("lobby", () => {
            setLobby(true);
        })

        socket.on("add-ice-candidate", ({candidate,type})=>{
            console.log("add ice candidate from remote");
            console.log({candidate,type});
            if(type == "sender"){
                setReceivingPc(pc =>{
                    pc?.addIceCandidate(candidate);
                    return pc;
                });
            }else{
                setReceivingPc(pc => {
                    pc?.addIceCandidate(candidate);
                    return pc;
                })
            }
            
        })
        setSocket(socket)
    }, [name])

    useEffect(()=>{
        if(localVideoRef.current){
            if(localVideoTrack){
                localVideoRef.current.srcObject = new MediaStream([localVideoTrack])
                localVideoRef.current.play();
            }

        }
    },[localVideoRef])

    return (
        <div>
            Hi {name}
            <video autoPlay width={400} height={400} ref={localVideoRef} />
            {lobby ? "Waiting to connect you to someone": null}
            <video autoPlay width={400} height={400} ref={remoteVideoRef}/>
        </div>
    )
}
