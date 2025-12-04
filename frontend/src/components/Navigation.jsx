import { Link } from "react-router-dom"

const Navigation = () => {
  return (
    <nav className="nav-container">
      <div className="logo">
        <img src="/icon.png" alt="AutoNotes" className="nav-icon" />
        <span className="logo-text">AutoNotes</span>
      </div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/recent">Recent</Link>
        <Link to="/login" className="cta-nav">
          Login
        </Link>
      </div>
    </nav>
  )
}

export default Navigation
