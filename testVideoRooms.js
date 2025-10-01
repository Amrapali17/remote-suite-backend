import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";


const user1 = { userId: "user1" };
const user2 = { userId: "user2" };
const roomId = "test-video-room";


const socket1 = io(SOCKET_URL);
socket1.on("connect", () => {
  console.log("User1 connected:", socket1.id);
  socket1.emit("joinRoom", { roomId, userId: user1.userId });
});

socket1.on("userJoined", ({ userId }) => {
  console.log("User1 sees user joined:", userId);
});

socket1.on("signal", ({ signalData, fromUserId }) => {
  console.log("User1 received signal from:", fromUserId, signalData);
});

const socket2 = io(SOCKET_URL);
socket2.on("connect", () => {
  console.log("User2 connected:", socket2.id);
  socket2.emit("joinRoom", { roomId, userId: user2.userId });
});

socket2.on("userJoined", ({ userId }) => {
  console.log("User2 sees user joined:", userId);
  
  socket2.emit("signal", { roomId, signalData: "Hello from User2", toUserId: socket1.id });
});

socket2.on("signal", ({ signalData, fromUserId }) => {
  console.log("User2 received signal from:", fromUserId, signalData);
});
