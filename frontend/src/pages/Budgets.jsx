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
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    month: "",
    year: new Date().getFullYear(),
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadBudgets = async () => {
      try {
        const data = await getBudgets();

        if (!cancelled) {
          setBudgets(Array.isArray(data) ? data : data?.budgets || []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(
            "Error fetching budgets:",
            err?.response?.data || err?.message
          );

          setError(
            err?.response?.data?.message ||
              "Failed to load budgets."
          );

          setLoading(false);
        }
      }
    };

    loadBudgets();

    return () => {
      cancelled = true;
    };
  }, []);

  const loadBudgets = async () => {
    try {
      setError("");

      const data = await getBudgets();

      setBudgets(
        Array.isArray(data)
          ? data
          : data?.budgets || []
      );
    } catch (err) {
      console.error(
        "Error fetching budgets:",
        err?.response?.data || err?.message
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load budgets."
      );
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!formData.category.trim()) {
      setError("Category is required.");
      return;
    }

    if (Number(formData.amount) <= 0) {
      setError("Budget amount must be greater than 0.");
      return;
    }

    if (
      Number(formData.month) < 1 ||
      Number(formData.month) > 12
    ) {
      setError("Month must be between 1 and 12.");
      return;
    }

    try {
      const budgetData = {
        category: formData.category.trim(),
        amount: Number(formData.amount),
        month: Number(formData.month),
        year: Number(formData.year),
      };

      if (editingId) {
        await updateBudget(editingId, budgetData);
        setMessage("Budget updated successfully.");
      } else {
        await createBudget(budgetData);
        setMessage("Budget added successfully.");
      }

      resetForm();
      await loadBudgets();
    } catch (err) {
      console.error(
        "Error saving budget:",
        err?.response?.data || err?.message
      );

      setError(
        err?.response?.data?.message ||
          "Failed to save budget."
      );
    }
  };

  const handleEdit = (budget) => {
    setFormData({
      category:
        budget.category?._id ||
        budget.category ||
        "",
      amount: budget.amount || "",
      month: budget.month || "",
      year:
        budget.year ||
        new Date().getFullYear(),
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

    if (!confirmDelete) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await deleteBudget(id);

      setMessage("Budget deleted successfully.");

      await loadBudgets();
    } catch (err) {
      console.error(
        "Error deleting budget:",
        err?.response?.data || err?.message
      );

      setError(
        err?.response?.data?.message ||
          "Failed to delete budget."
      );
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <main>
        <div className="page-header">
          <div>
            <h1>Budgets</h1>
            <p className="muted">
              Create and manage your monthly budgets.
            </p>
          </div>
        </div>

        {error && (
          <div className="alert error">
            {error}
          </div>
        )}

        {message && (
          <div className="alert success">
            {message}
          </div>
        )}

        <section className="panel">
          <h2>
            {editingId ? "Edit Budget" : "Add Budget"}
          </h2>

          <form
            className="form-grid"
            onSubmit={handleSubmit}
          >
            <label>
              Category

              <input
                type="text"
                name="category"
                placeholder="Category ID"
                value={formData.category}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Budget Amount

              <input
                type="number"
                name="amount"
                placeholder="Budget Amount"
                min="0.01"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Month

              <select
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
            </label>

            <label>
              Year

              <input
                type="number"
                name="year"
                placeholder="Year"
                min="2020"
                value={formData.year}
                onChange={handleChange}
                required
              />
            </label>

            <div className="form-actions full-width">
              <button
                className="primary-btn"
                type="submit"
              >
                {editingId
                  ? "Update Budget"
                  : "Add Budget"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="secondary-btn"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="panel">
          <div className="section-heading">
            <h2>Your Budgets</h2>

            <span className="count-badge">
              {budgets.length}
            </span>
          </div>

          {loading ? (
            <p className="state-message">
              Loading budgets...
            </p>
          ) : budgets.length === 0 ? (
            <p className="state-message">
              No budgets found.
            </p>
          ) : (
            <div className="budget-list">
              {budgets.map((budget) => (
                <div
                  className="budget-card"
                  key={budget._id}
                >
                  <h3>
                    {budget.category?.name ||
                      budget.category ||
                      "Budget"}
                  </h3>

                  <p>
                    <strong>Amount:</strong>{" "}
                    ₹
                    {Number(
                      budget.amount
                    ).toLocaleString("en-IN")}
                  </p>

                  <p>
                    <strong>Month:</strong>{" "}
                    {budget.month}
                  </p>

                  <p>
                    <strong>Year:</strong>{" "}
                    {budget.year}
                  </p>

                  <div className="budget-actions">
                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(budget)
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() =>
                        handleDelete(
                          budget._id
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Budgets;