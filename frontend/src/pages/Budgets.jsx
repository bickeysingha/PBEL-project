import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from "../services/budgetService";

import { getCategories } from "../services/categoryService";

function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    month: "",
    year: new Date().getFullYear(),
  });

  const [editingId, setEditingId] = useState(null);

  // Fetch budgets
  const fetchBudgets = async () => {
    try {
      const data = await getBudgets();
      setBudgets(data);
    } catch (error) {
      console.error(
        "Error fetching budgets:",
        error.response?.data || error.message
      );

      setMessage(
        error.response?.data?.message || "Failed to fetch budgets"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
const fetchCategories = async () => {
  try {
    const data = await getCategories();

    console.log("Categories data:", data);

    // Handle different backend response formats
    if (Array.isArray(data)) {
      setCategories(data);
    } else if (Array.isArray(data.categories)) {
      setCategories(data.categories);
    } else {
      setCategories([]);
      console.error("Categories is not an array:", data);
    }
  } catch (error) {
    console.error(
      "Error fetching categories:",
      error.response?.data || error.message
    );

    setCategories([]);
    setMessage(
      error.response?.data?.message || "Failed to fetch categories"
    );
  }
};
  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      category: "",
      amount: "",
      month: "",
      year: new Date().getFullYear(),
    });

    setEditingId(null);
  };

  // Add or update budget
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    try {
      const budgetData = {
        category: formData.category,
        amount: Number(formData.amount),
        month: Number(formData.month),
        year: Number(formData.year),
      };

      if (editingId) {
        await updateBudget(editingId, budgetData);
        setMessage("Budget updated successfully!");
      } else {
        await createBudget(budgetData);
        setMessage("Budget added successfully!");
      }

      resetForm();
      await fetchBudgets();
    } catch (error) {
      console.error(
        "Error saving budget:",
        error.response?.data || error.message
      );

      setMessage(
        error.response?.data?.message || "Failed to save budget"
      );
    }
  };

  // Edit budget
  const handleEdit = (budget) => {
    setFormData({
      category: budget.category?._id || budget.category || "",
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

  // Delete budget
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this budget?"
    );

    if (!confirmDelete) return;

    try {
      await deleteBudget(id);

      setMessage("Budget deleted successfully!");

      await fetchBudgets();
    } catch (error) {
      console.error(
        "Error deleting budget:",
        error.response?.data || error.message
      );

      setMessage(
        error.response?.data?.message || "Failed to delete budget"
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

          {message && <p>{message}</p>}

          <form onSubmit={handleSubmit}>
            {/* CATEGORY DROPDOWN */}
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>

              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* AMOUNT */}
            <input
              type="number"
              name="amount"
              placeholder="Budget Amount"
              value={formData.amount}
              onChange={handleChange}
              min="1"
              required
            />

            {/* MONTH */}
            <select
              name="month"
              value={formData.month}
              onChange={handleChange}
              required
            >
              <option value="">Select Month</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>

            {/* YEAR */}
            <input
              type="number"
              name="year"
              placeholder="Year"
              min="2020"
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
                <h3>
                  {budget.category?.name || "Unknown Category"}
                </h3>

                <p>
                  <strong>Amount:</strong> ₹{budget.amount}
                </p>

                <p>
                  <strong>Month:</strong> {budget.month}
                </p>

                <p>
                  <strong>Year:</strong> {budget.year}
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