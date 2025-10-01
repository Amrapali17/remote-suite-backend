import { io } from "socket.io-client";


const socket = io("http://localhost:5000");


const workspaceId = "198cba0b-d81d-4265-8218-1f99e2ea3c27";
const userId = "a45e663b-d669-4444-bef6-550a79c04394";


socket.on("connect", () => {
  console.log("Connected as", socket.id);


  socket.emit("joinWorkspace", workspaceId, userId);


  socket.on("workspaceUsers", (users) => {
    console.log("Online users:", users);
  });


  socket.on("chatMessage", (msg) => {
    console.log("Chat message received:", msg);
  });

 
  socket.on("notification", (notif) => {
    console.log("Notification received:", notif);
  });

  
  socket.emit("chatMessage", {
    workspaceId,
    senderId: userId,
    content: "Hello from test client!"
  });


  socket.emit("sendNotification", {
    workspaceId,
    userId,
    type: "info",
    message: "This is a test notification",
    link: ""
  });

  const roomId = "test-video-room";
  socket.emit("joinRoom", { roomId, userId });

  socket.on("userJoined", (data) => {
    console.log("User joined room:", data);
  });

  socket.on("signal", (data) => {
    console.log("Received signal:", data);
  });
});
