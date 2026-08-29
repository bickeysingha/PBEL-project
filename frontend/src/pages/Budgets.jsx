import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetSummary,
} from "../services/budgetService";
import { getCategories } from "../services/categoryService";

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

const getInitialForm = () => ({
  category: "",
  amount: "",
  month: "",
  year: new Date().getFullYear(),
});

function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState(getInitialForm);

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [budgetSummaries, setBudgetSummaries] = useState([]);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadInitialData = async () => {
      try {
       const [budgetData, categoryData, summaryData] =
            await Promise.all([
              getBudgets(),
              getCategories(),
              getBudgetSummary(),
            ]);

        if (cancelled) {
          return;
        }

        setBudgets(
          Array.isArray(budgetData)
            ? budgetData
            : budgetData?.budgets || []
        );
        console.log("CATEGORIES FROM API:", categoryData);

        setCategories(
          Array.isArray(categoryData)
            ? categoryData
            : categoryData?.categories || []
        );
        setBudgetSummaries(
           Array.isArray(summaryData) ? summaryData : []
        );
      } catch (err) {
        if (!cancelled) {
          console.error(
            "Error loading budgets:",
            err?.response?.data || err?.message
          );

          setError(
            getErrorMessage(err, "Failed to load budgets.")
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  const loadBudgets = async () => {
    try {
      setError("");

     const [budgetData, categoryData, summaryData] =
            await Promise.all([
              getBudgets(),
              getCategories(),
              getBudgetSummary(),
            ]);

      setBudgets(
        Array.isArray(budgetData)
          ? budgetData
          : budgetData?.budgets || []
      );

      setCategories(
        Array.isArray(categoryData)
          ? categoryData
          : categoryData?.categories || []
      );
      setBudgetSummaries(
         Array.isArray(summaryData) ? summaryData : []
      );
    } catch (err) {
      console.error(
        "Error loading budgets:",
        err?.response?.data || err?.message
      );

      setError(
        getErrorMessage(err, "Failed to load budgets.")
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
    setFormData(getInitialForm());
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!formData.category) {
      setError("Please select a category.");
      return;
    }

    if (Number(formData.amount) <= 0) {
      setError("Budget amount must be greater than 0.");
      return;
    }

    const month = Number(formData.month);
    const year = Number(formData.year);

    if (month < 1 || month > 12) {
      setError("Please select a valid month.");
      return;
    }

    if (!year || year < 2020) {
      setError("Please enter a valid year.");
      return;
    }

    try {
      setSaving(true);

      const budgetData = {
        category: formData.category,
        amount: Number(formData.amount),
        month,
        year,
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
        getErrorMessage(err, "Failed to save budget.")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (budget) => {
    setFormData({
      category: budget.category?._id || budget.category || "",
      amount: budget.amount ?? "",
      month: budget.month ?? "",
      year: budget.year || new Date().getFullYear(),
    });

    setEditingId(budget._id);
    setError("");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this budget?"
    );

    if (!confirmed) {
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
        getErrorMessage(err, "Failed to delete budget.")
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

  const getSummaryForBudget = (budgetId) => {
     return budgetSummaries.find(
       (summary) => summary._id === budgetId
     );
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

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select category
                </option>

                {categories.map((category) => (
                  <option
                    key={category._id}
                    value={category._id}
                  >
                    {category.name}
                    {category.type
                      ? ` (${category.type})`
                      : ""}
                  </option>
                ))}
              </select>
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
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Budget"
                    : "Add Budget"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="secondary-btn"
                  disabled={saving}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {categories.length === 0 && (
            <p className="form-hint">
              No categories found. Create a category
              first from the Categories page.
            </p>
          )}
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
              {budgets.map((budget) => {
             const summary = getSummaryForBudget(budget._id);

              return (
                
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
                    {getMonthName(budget.month)}
                  </p>

                  <p>
                    <strong>Year:</strong>{" "}
                    {budget.year}
                  </p>

                  {summary && (
                    <div className="budget-summary">
                     <p>
                       <strong>Spent:</strong>{" "}
                       ₹{Number(summary.spent).toLocaleString("en-IN")}
                    </p>

                     <p>
                       <strong>Remaining:</strong>{" "}
                       ₹{Number(summary.remaining).toLocaleString("en-IN")}
                     </p>

                     <p>
                       <strong>Progress:</strong>{" "}
                       {summary.percentage}%
                     </p>

                    <div className="budget-progress">
                     <div
                      className="budget-progress-bar"
                      style={{
                       width: `${Math.min(summary.percentage, 100)}%`,
                      }}
                    />
                 </div>

                <p>
                 <strong>Status:</strong>{" "}
                  {summary.status}
                </p>
              </div>
           )}

                  <div className="budget-actions">
                    <button
                      type="button"
                      onClick={() => handleEdit(budget)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() =>
                        handleDelete(budget._id)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
          })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Budgets;