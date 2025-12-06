import { Link, useLocation } from "react-router-dom"

const Navigation = () => {
  const location = useLocation()

  return (
    <nav className="nav-container">
      <div className="nav-content">
        <div className="nav-left">
          <Link to="/" className="logo">
            <img src="/icon.png" alt="AutoNotes" className="logo-image" />
            <span className="logo-text">AutoNotes</span>
          </Link>

          <div className="nav-links">
            <Link
              to="/"
              className={`nav-link ${
                location.pathname === "/" ? "active" : ""
              }`}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`nav-link ${
                location.pathname === "/about" ? "active" : ""
              }`}
            >
              About
            </Link>
            <Link
              to="/recent"
              className={`nav-link ${
                location.pathname === "/recent" ? "active" : ""
              }`}
            >
              Recent
            </Link>
          </div>
        </div>

        <div className="nav-right">
          <Link to="/signup" className="btn btn-secondary btn-sm">
            <i className="fas fa-user-plus"></i>
            Sign Up
          </Link>
          <Link to="/login" className="btn btn-primary btn-sm">
            <i className="fas fa-sign-in-alt"></i>
            Login
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
