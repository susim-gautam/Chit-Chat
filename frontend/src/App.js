import "./App.css";
import { Route, Router, Routes } from "react-router-dom";
import Homepage from "../src/pages/Homepage";
import ChatPage from "./pages/ChatPage";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Homepage/>} exact/>
        <Route path="/chats" element={<ChatPage/>}/>
      </Routes>      
    </div>
  );
}

export default App;
