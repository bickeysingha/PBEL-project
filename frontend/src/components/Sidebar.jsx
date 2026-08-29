import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/dashboard");
  };

  return (
    <aside className="sidebar">
      <h2>Expense Tracker</h2>

      <nav>
        <NavLink to="/dashboard">Dashboard</NavLink>

        <NavLink to="/budgets">Budgets</NavLink>

        <NavLink to="/categories">Categories</NavLink>

        <NavLink to="/transactions">Transactions</NavLink>

        <NavLink to="/reports">Reports</NavLink>
      </nav>

      <button
        type="button"
        className="logout-button"
        onClick={handleLogout}
      >
        Logout
      </button>
    </aside>
  );
}

export default Sidebar;