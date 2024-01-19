import { Room } from "./Room";
import { User } from "./User";

let GLOBAL_ROOM_ID = 1;
export class RoomManager {
    private rooms: Map<string, Room>;
    constructor() {
        this.rooms = new Map<string, Room>();
    }

    createRoom(user1: User, user2: User) {
        const roomId = this.generate().toString();
        this.rooms.set(roomId, { user1, user2 })

        user1.socket.emit("send-offer", { roomId })
        user2.socket.emit("send-offer", { roomId })
    }

    onOffer(roomId: string, sdp: string, senderSockedId: string) {
        const room = this.rooms.get(roomId);
        if (!room) return;
        const receivingUser = room.user1.socket.id === senderSockedId ? room.user2 : room.user1;
        receivingUser.socket.emit("offer", { sdp, roomId })
    }

    onAnswer(roomId: string, sdp: string, senderSockedId: string) {
        const room = this.rooms.get(roomId);
        if (!room) return;
        const receivingUser = room.user1.socket.id === senderSockedId ? room.user2 : room.user1;
        receivingUser.socket.emit("answer", { sdp, roomId })
    }

    onIceCandidates(roomId: string, senderSockedId: string, candidate: any, type: "sender" | "receiver") {
        const room = this.rooms.get(roomId);
        if (!room) return;
        const receivingUser = room.user1.socket.id === senderSockedId ? room.user2 : room.user1;
        receivingUser.socket.emit("add-ice-candidate", { candidate, type })
    }
    private generate() {
        return GLOBAL_ROOM_ID++;
    }
}