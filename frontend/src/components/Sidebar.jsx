import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <div className="sidebar">
      <h2>Expense Tracker</h2>

      <nav>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/budgets">Budgets</NavLink>
        <NavLink to="/reports">Reports</NavLink>
      </nav>
    </div>
  );
}

export default Sidebar;