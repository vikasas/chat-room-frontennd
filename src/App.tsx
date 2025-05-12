
import { useState, useRef } from "react";

interface ChatMessage {
  sender: string;
  text: string;
}

function App() {
  const roomInputRef = useRef<HTMLInputElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const generateRoomId = () => {
    const newId = Math.random().toString(36).substring(2, 6);
    if (roomInputRef.current) roomInputRef.current.value = newId;
  };

  const joinRoom = () => {
    const roomId = roomInputRef.current?.value;
    const username = usernameInputRef.current?.value;

    if (!roomId || !username) {
      alert("Enter both room ID and your name");
      return;
    }
   

    socketRef.current = new WebSocket("wss://chat-room-backend-klyn.onrender.com");

    socketRef.current.onopen = () => {
      socketRef.current?.send(
        JSON.stringify({
          type: "join",
          payload: { roomId, username },
        })
      );
      setConnected(true);
      setCurrentRoom(roomId);
      setCurrentUser(username);
      setMessages([]);
    };

    socketRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === "chat" || data.type === "info") {
        const text = data.payload.message;
        const sender = data.payload.sender || "System";

        setMessages((prev) => [...prev, { sender, text }]);
      }
    };

    socketRef.current.onclose = () => {
      setConnected(false);
      setCurrentRoom(null);
      setCurrentUser(null);
    };
  };

  const sendMessage = () => {
    const msg = messageInputRef.current?.value;
    if (!msg || msg.trim() === "") return;
    socketRef.current?.send(
      JSON.stringify({
        type: "chat",
        payload: { message: msg },
      })
    );
    messageInputRef.current!.value = "";
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md flex flex-col shadow-lg">
        {!connected ? (
          <div className="bg-white w-full p-6 rounded-lg">
  <h2 className="text-xl font-bold mb-4 text-center text-black">Chat Room</h2>
  
  <input
    ref={usernameInputRef}
    type="text"
    placeholder="Enter Your Name"
    className="w-full px-3 py-2 border rounded-md mb-3"
  />
  
  <div className="flex flex-col sm:flex-row gap-2 mb-4">
    <input
      ref={roomInputRef}
      type="text"
      placeholder="Enter Room ID"
      className="w-full sm:flex-1 px-3 py-2 border rounded-md"
    />
    <button
      onClick={generateRoomId}
      className="w-full sm:w-auto bg-black hover:bg-gray-400 hover:text-black text-white px-4 py-2 rounded-md"
    >
      Generate ID
    </button>
  </div>
  
  <button
    onClick={joinRoom}
    className="w-full bg-black hover:bg-gray-400 hover:text-black text-white py-2 rounded-md"
  >
    Join Room
  </button>
</div>

        ) : (
          <div className="w-full min-h-screen flex flex-col px-4 py-6">
            <div className="text-white text-center text-xl mb-4">
              Hello <span className="font-bold">{currentUser}</span>, you’re in{" "}
              <span className="font-bold">{currentRoom}</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 p-2 bg-black">
              {messages.map((msg, i) => {
                const isMine = msg.sender === currentUser;
                return (
                  <div key={i} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`px-4 py-2 rounded-md max-w-[80%] ${
                        isMine ? "bg-white text-black" : "bg-white text-black"
                      }`}
                    >
                      {!isMine && (
                        <div className="text-xs font-semibold mb-1">{msg.sender}</div>
                      )}
                      <div className="text-sm font-semibold">{msg.text}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex gap-2">
              <input
                ref={messageInputRef}
                type="text"
                placeholder="Type a message..."
                className="flex-1 text-white bg-black px-3 py-2 border rounded-md"
              />
              <button
                onClick={sendMessage}
                className="bg-white font-semibold text-black px-4 py-2 rounded-md"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
