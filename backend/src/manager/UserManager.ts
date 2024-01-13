import { Socket } from "socket.io";
import { RoomManager } from "./RoomManager";
import { User } from "./User";


export class UserManager {
    private users: User[];
    private queue: string[];
    private roomManager: RoomManager;
    
    constructor() {
        this.users = [];
        this.queue = [];
        this.roomManager = new RoomManager();
    }

    addUser(name: string, socket: Socket) {
        this.users.push({name, socket});
        this.queue.push(socket.id);

        socket.send("lobby");
        this.clearQueue();
        this.initHandlers(socket);
    }

    removeUser(socketId: string) {
        const user = this.users.find(x => x.socket.id === socketId);
        if(!user) {}
        this.users = this.users.filter(x => x.socket.id !== socketId);
        this.queue = this.queue.filter(x => x !== socketId);
    }

    clearQueue() {
        console.log("inside clearQueue");
        console.log( this.queue.length );
        
        if (this.queue.length < 2) return;

        const id1 = this.queue.pop();
        const id2 = this.queue.pop();

        const user1 = this.users.find(x => x.socket.id === id1);
        const user2 = this.users.find(x => x.socket.id === id2);
        if (!user2 || !user1) return; 
        
        console.log("creating room");
        
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