import NavBar from "./components/NavBar";
import Home from "./pages/Home"
import Select from "./pages/Select"
import Login from "./pages/Login"
import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <>
      <NavBar />
      <div className="container">
        <Routes>
          <Route path="/home" element={<Home />}></Route>
          <Route path="/select" element={<Select />}></Route>
          <Route path="/login" element={<Login />}></Route>
        </Routes>
      </div>
    </>
  );
}

export default App;
