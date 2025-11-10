import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import "./Components/Dashboard/Dashboard";
import { Dashboard } from "./Components/Dashboard/Dashboard";
import { SearchBar } from "./Components/SearchBar/SearchBar";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Dashboard />
    </>
  );
}

export default App;
