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

  const fetchCategories = async () => {
    try {
      const data = await getCategories();

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
  const loadBudgetPage = async () => {
    await Promise.all([
      fetchBudgets(),
      fetchCategories(),
    ]);
  };

  loadBudgetPage();
}, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData({
      category: "",
      amount: "",
      month: "",
      year: new Date().getFullYear(),
    });

    setEditingId(null);
  };

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

  const getMonthName = (month) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return months[Number(month) - 1] || month;
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="budget-page">

        {/* Page Header */}
        <div className="budget-page-header">
          <div>
            <h1>Budgets</h1>
            <p>
              Set and manage your monthly spending limits.
            </p>
          </div>
        </div>

        {/* Add / Edit Budget */}
        <section className="budget-form-container">

          <div className="budget-section-header">
            <div>
              <h2>
                {editingId ? "Edit Budget" : "Add New Budget"}
              </h2>

              <p>
                {editingId
                  ? "Update your existing budget."
                  : "Create a spending limit for a category."}
              </p>
            </div>
          </div>

          {message && (
            <div className="budget-message">
              {message}
            </div>
          )}

          <form
            className="budget-form"
            onSubmit={handleSubmit}
          >

            {/* Category */}
            <div className="budget-field">
              <label htmlFor="category">
                Category
              </label>

              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select Category
                </option>

                {categories.map((category) => (
                  <option
                    key={category._id}
                    value={category._id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>


            {/* Amount */}
            <div className="budget-field">
              <label htmlFor="amount">
                Budget Amount
              </label>

              <div className="budget-input-wrapper">
                <span>₹</span>

                <input
                  id="amount"
                  type="number"
                  name="amount"
                  placeholder="10,000"
                  value={formData.amount}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
            </div>


            {/* Month */}
            <div className="budget-field">
              <label htmlFor="month">
                Month
              </label>

              <select
                id="month"
                name="month"
                value={formData.month}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select Month
                </option>

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
            </div>


            {/* Year */}
            <div className="budget-field">
              <label htmlFor="year">
                Year
              </label>

              <input
                id="year"
                type="number"
                name="year"
                placeholder="2026"
                min="2020"
                value={formData.year}
                onChange={handleChange}
                required
              />
            </div>


            {/* Buttons */}
            <div className="budget-form-actions">

              <button
                type="submit"
                className="budget-primary-button"
              >
                {editingId
                  ? "Update Budget"
                  : "Add Budget"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="budget-cancel-button"
                >
                  Cancel
                </button>
              )}

            </div>

          </form>

        </section>


        {/* Budget List */}
        <section className="budget-list-section">

          <div className="budget-list-header">
            <div>
              <h2>Your Budgets</h2>

              <p>
                Track the spending limits you've created.
              </p>
            </div>

            <span className="budget-count">
              {budgets.length}{" "}
              {budgets.length === 1
                ? "Budget"
                : "Budgets"}
            </span>
          </div>


          {loading ? (

            <div className="budget-empty-state">
              <div className="budget-loading-spinner"></div>

              <p>
                Loading budgets...
              </p>
            </div>

          ) : budgets.length === 0 ? (

            <div className="budget-empty-state">

              <div className="budget-empty-icon">
                ₹
              </div>

              <h3>
                No budgets yet
              </h3>

              <p>
                Create your first budget above to start
                controlling your monthly spending.
              </p>

            </div>

          ) : (

            <div className="budget-list">

              {budgets.map((budget) => (

                <article
                  className="budget-card"
                  key={budget._id}
                >

                  <div className="budget-card-top">

                    <div className="budget-category-icon">
                      ₹
                    </div>

                    <div className="budget-card-title">

                      <h3>
                        {budget.category?.name ||
                          "Unknown Category"}
                      </h3>

                      <span>
                        {getMonthName(budget.month)}{" "}
                        {budget.year}
                      </span>

                    </div>

                  </div>


                  <div className="budget-amount">

                    <span>
                      Monthly Limit
                    </span>

                    <strong>
                      ₹{Number(budget.amount).toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                  </div>


                  <div className="budget-card-details">

                    <div>
                      <span>Month</span>
                      <strong>
                        {getMonthName(budget.month)}
                      </strong>
                    </div>

                    <div>
                      <span>Year</span>
                      <strong>
                        {budget.year}
                      </strong>
                    </div>

                  </div>


                  <div className="budget-actions">

                    <button
                      type="button"
                      className="budget-edit-button"
                      onClick={() =>
                        handleEdit(budget)
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="budget-delete-button"
                      onClick={() =>
                        handleDelete(budget._id)
                      }
                    >
                      Delete
                    </button>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

      </main>
    </div>
  );
}

export default Budgets;