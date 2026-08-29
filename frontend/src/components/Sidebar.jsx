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
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>Expense Tracker</h2>
        <p>Personal Finance</p>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          Transactions
        </NavLink>

        <NavLink
          to="/categories"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          Categories
        </NavLink>

        <NavLink
          to="/budgets"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          Budgets
        </NavLink>

        <NavLink
          to="/reports"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          Reports
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          Profile
        </NavLink>

        <button
          type="button"
          className="sidebar-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;