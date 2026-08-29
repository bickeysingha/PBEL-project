import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="sidebar">
      <h2>Expense Tracker</h2>

      <nav>
        <NavLink to="/dashboard">Dashboard</NavLink>

        <NavLink to="/budgets">Budgets</NavLink>

        <NavLink to="/reports">Reports</NavLink>

        <NavLink to="/profile">Profile</NavLink>

        <button
          type="button"
          className="sidebar-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </nav>
    </div>
  );
}

export default Sidebar;
