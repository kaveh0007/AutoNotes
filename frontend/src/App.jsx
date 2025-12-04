import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import "./App.css"
import Navigation from "./components/Navigation"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Recent from "./pages/Recent"

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recent" element={<Recent />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
