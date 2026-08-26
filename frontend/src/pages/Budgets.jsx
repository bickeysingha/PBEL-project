import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from "../services/budgetService";

function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    user: "",
    category: "",
    amount: "",
    month: "",
    year: new Date().getFullYear(),
  });

  const [editingId, setEditingId] = useState(null);

  const fetchBudgets = async () => {
    try {
      const data = await getBudgets();
      setBudgets(data);
    } catch (error) {
      console.error("Error fetching budgets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData({
      user: "",
      category: "",
      amount: "",
      month: "",
      year: new Date().getFullYear(),
    });

    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const budgetData = {
        ...formData,
        amount: Number(formData.amount),
        month: Number(formData.month),
        year: Number(formData.year),
      };

      if (editingId) {
        await updateBudget(editingId, budgetData);
      } else {
        await createBudget(budgetData);
      }

      resetForm();
      await fetchBudgets();
    } catch (error) {
      console.error("Error saving budget:", error);
    }
  };

  const handleEdit = (budget) => {
    setFormData({
      user: budget.user,
      category: budget.category,
      amount: budget.amount,
      month: budget.month,
      year: budget.year,
    });

    setEditingId(budget._id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this budget?"
    );

    if (!confirmDelete) return;

    try {
      await deleteBudget(id);
      await fetchBudgets();
    } catch (error) {
      console.error(
         "Error saving budget:",
         error.response?.data || error.message
         );
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <main>
        <h1>Budgets</h1>

        <div className="budget-form-container">
          <h2>{editingId ? "Edit Budget" : "Add Budget"}</h2>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="user"
              placeholder="User ID"
              value={formData.user}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="category"
              placeholder="Category ID"
              value={formData.category}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="amount"
              placeholder="Budget Amount"
              value={formData.amount}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="month"
              placeholder="Month (1-12)"
              min="1"
              max="12"
              value={formData.month}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="year"
              placeholder="Year"
              value={formData.year}
              onChange={handleChange}
              required
            />

            <button type="submit">
              {editingId ? "Update Budget" : "Add Budget"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="cancel-btn"
              >
                Cancel
              </button>
            )}
          </form>
        </div>

        <h2 className="budget-list-title">Your Budgets</h2>

        {loading ? (
          <p>Loading budgets...</p>
        ) : budgets.length === 0 ? (
          <p>No budgets found.</p>
        ) : (
          <div className="budget-list">
            {budgets.map((budget) => (
              <div className="budget-card" key={budget._id}>
                <h3>Budget</h3>

                <p>
                  <strong>Amount:</strong> ₹{budget.amount}
                </p>

                <p>
                  <strong>Period:</strong> {budget.month}/{budget.year}
                </p>

                <div className="budget-actions">
                  <button onClick={() => handleEdit(budget)}>
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(budget._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Budgets;