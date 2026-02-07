import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import SignInPage from "./components/Login";
import AboutUs from "./components/Aboutus";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Homepage from "./components/Homepage";
import Navbar from "./components/Navbar";
function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Navbar />
      <BrowserRouter>
        <Routes>
          <Route Component={Homepage} path="/"></Route>
          <Route Component={SignInPage} path="/signin"></Route>
          <Route Component={AboutUs} path="/aboutus"></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
