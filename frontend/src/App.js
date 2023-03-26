import NavBar from "./components/NavBar";
import Home from "./pages/Home"
import Select from "./pages/Select"
import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <>
      <NavBar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/select" element={<Select />}></Route>
        </Routes>
      </div>
    </>
  );
}

export default App;
