import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import "./App.css"
import Navigation from "./components/Navigation"
import About from "./pages/About"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Recent from "./pages/Recent"
import Signup from "./pages/Signup"

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recent" element={<Recent />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
