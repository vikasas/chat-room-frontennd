import { useState , useRef } from "react";

function App() {
  const roomInputRef = useRef<HTMLInputElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const [messages, setMessages] = useState<string[]>([]);
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
      alert('Enter both room ID and your name');
      return;
    }

    socketRef.current = new WebSocket('wss://chat-room-backend-klyn.onrender.com');
    

    socketRef.current.onopen = () => {
      socketRef.current?.send(
        JSON.stringify({
          type: 'join',
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
      setMessages((prev) => [...prev, data.payload.message]);
    };

    socketRef.current.onclose = () => {
      setConnected(false);
      setCurrentRoom(null);
      setCurrentUser(null);
    };
  };

  const sendMessage = () => {
    const msg = messageInputRef.current?.value;
    if (!msg || msg.trim() === '') return;
    socketRef.current?.send(
      JSON.stringify({
        type: 'chat',
        payload: { message: msg },
      })
    );
    messageInputRef.current!.value = '';
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full flex flex-col  justify-center items-center shadow-lg ">

        {!connected ? (
          <div className="bg-white w-full max-w-md p-6 rounded-lg">
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
        className="flex-1 px-3 py-2 border rounded-md"
      />
      <button
        onClick={generateRoomId}
        className="bg-black hover:bg-gray-400 hover:text-black text-white px-4 py-2 rounded-md"
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
          <>
            <div className="w-full min-h-screen flex flex-col px-4 py-6">
          <div className="text-white text-center text-xl mb-4">
            Hello <span className="font-bold">{currentUser}</span>, you’re in{' '}
          <span className="font-bold">{currentRoom}</span>
        </div>

    <div className="flex-1 overflow-y-auto space-y-2 p-4 bg-black">
      {messages.map((msg, i) => (
        <div
        key={i}
          className="bg-white text-black font-semibold px-4 py-2 rounded-md w-fit max-w-[80%]"
        >
          {msg}
        </div>
      ))}
    </div>

    <div className="mt-4 flex gap-2">
      <input
        ref={messageInputRef}
        type="text"
        placeholder="Type a message..."
        className="flex-1  text-white px-3 py-2 border rounded-md"
      />
      <button
        onClick={sendMessage}
        className="bg-white cursor-pointer font-semibold text-black px-4 py-2 rounded-md"
      >
        Send
      </button>
    </div>
  </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App
