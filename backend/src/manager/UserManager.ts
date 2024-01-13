import { Socket } from "socket.io";
import { RoomManager } from "./RoomManager";

export interface User {
    socket: Socket;
    name: string;
}


export class UserManager {
    private users: User[];
    private quueue: string[];
    private roomManager: RoomManager;
    
    constructor() {
        this.users = [];
        this.quueue = [];
        this.roomManager = new RoomManager();
    }

    addUser(name: string, socket: Socket) {
        this.users.push({
            name, socket
        })
        this.quueue.push(socket.id);
        this.clearQueue()
        this.initHandlers(socket);
    }
    removeUser(socketId: string) {
        this.users = this.users.filter(x => x.socket.id === socketId);
        this.quueue = this.quueue.filter(x => x === socketId);
    }

    clearQueue() {
        if (this.quueue.length < 2) {
            return;
        }
        const user1 = this.users.find(x => x.socket.id === this.quueue.pop());
        const user2 = this.users.find(x => x.socket.id === this.quueue.pop());
        if (!user2 || !user1) { return; }
        const room = this.roomManager.createRoom(user1, user2);
    }

    initHandlers(socket: Socket) {
        socket.on("offer", ({ sdp, roomId }: { sdp: string, roomId: string }) => {
            this.roomManager.onOffer(roomId, sdp)
        })
        socket.on("answer", ({ sdp, roomId }: { sdp: string, roomId: string }) => {
            this.roomManager.onAnswer(roomId, sdp)
        })

    }

}