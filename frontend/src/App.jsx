import { useState } from "react";
import Register from "./componands/Register";
import Login from "./componands/Login";
import Chat from "./componands/Chat";

function App() {
  const [page, setPage] = useState("login");
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  const handleLogin = () => {
    setIsLoggedIn(true);
    setPage("chat");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setPage("login");
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
      <nav style={{ marginBottom: 20 }}>
        {!isLoggedIn && (
          <>
            <button onClick={() => setPage("login")}>Login</button>
            <button onClick={() => setPage("register")}>Register</button>
          </>
        )}
        {isLoggedIn && (
          <>
            <button onClick={() => setPage("chat")}>Chat</button>
            <button onClick={handleLogout}>Logout</button>
          </>
        )}
      </nav>
      {page === "register" && <Register />}
      {page === "login" && <Login onLogin={handleLogin} />}
      {page === "chat" && isLoggedIn && <Chat />}
    </div>
  );
}

export default App;