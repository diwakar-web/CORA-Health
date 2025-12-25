import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import About from "./Pages/About"
import DocMap from "./Pages/DocMap"
import MediBot from "./Pages/MediBot"
import Team from "./Pages/Team"
import FAQ from "./Pages/FAQ"
import Contact from "./Pages/Contact"
import MyAccount from "./Pages/MyAccount";
import AddMember from "./Pages/AddMember";
import Login from "./Pages/Login";


function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/dm" element={<DocMap />} />
          <Route path="/mb" element={<MediBot />} />
          <Route path="/Team" element={< Team />} />
          <Route path="/FAQ" element={< FAQ />} />
          <Route path="/contact" element={< Contact />} />
          <Route path="/team" element={< Team />} />
          <Route path="/my-account" element={<MyAccount />} />
          <Route path="/add-member" element={<AddMember />} />
          <Route path="/add-member/:id" element={<AddMember />} />
          <Route path="/login" element={<Login />} />


        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
