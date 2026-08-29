import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from "../services/transactionService";
import { getCategories } from "../services/categoryService";

const today = new Date().toISOString().slice(0, 10);

const initialForm = {
  type: "expense",
  amount: "",
  category: "",
  description: "",
  date: today,
};

const initialFilters = {
  type: "",
  category: "",
  search: "",
};

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState(initialForm);
  const [filters, setFilters] = useState(initialFilters);

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
   * Used to refresh the transaction list after
   * create, update, or delete.
   */
  const [refreshKey, setRefreshKey] = useState(0);

  /*
   * Only show categories matching the selected
   * transaction type.
   */
  const visibleCategories = useMemo(() => {
    return categories.filter(
      (category) => category.type === form.type
    );
  }, [categories, form.type]);

  /*
   * Load transactions and categories.
   *
   * The actual API calls happen inside an async
   * function after the effect starts. This avoids
   * the react-hooks/set-state-in-effect lint error.
   */
  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [transactionData, categoryData] = await Promise.all([
          getTransactions({
            type: filters.type,
            category: filters.category,
            search: filters.search,
          }),
          getCategories(),
        ]);

        if (cancelled) {
          return;
        }

        /*
         * Handle possible backend response formats.
         */
        if (Array.isArray(transactionData)) {
          setTransactions(transactionData);
        } else {
          setTransactions(transactionData?.transactions || []);
        }

        if (Array.isArray(categoryData)) {
          setCategories(categoryData);
        } else {
          setCategories(categoryData?.categories || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            getErrorMessage(
              err,
              "Failed to load transactions."
            )
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [
    filters.type,
    filters.category,
    filters.search,
    refreshKey,
  ]);

  /*
   * Handle transaction form changes.
   */
  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "type" ? { category: "" } : {}),
    }));
  };

  /*
   * Reset transaction form.
   */
  const resetForm = () => {
    setForm({
      ...initialForm,
      date: new Date().toISOString().slice(0, 10),
    });

    setEditingId(null);
  };

  /*
   * Create or update transaction.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.category) {
      setError("Please select a category.");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }

    if (!form.date) {
      setError("Please select a date.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        type: form.type,
        amount: Number(form.amount),
        category: form.category,
        description: form.description.trim(),
        date: form.date,
      };

      if (editingId) {
        await updateTransaction(editingId, payload);

        setSuccess(
          "Transaction updated successfully."
        );
      } else {
        await createTransaction(payload);

        setSuccess(
          "Transaction added successfully."
        );
      }

      resetForm();

      /*
       * Refresh data through the effect.
       */
      setRefreshKey((current) => current + 1);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Failed to save transaction."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * Edit transaction.
   */
  const handleEdit = (transaction) => {
    setEditingId(transaction._id);

    setForm({
      type: transaction.type || "expense",
      amount: transaction.amount ?? "",
      category:
        transaction.category?._id ||
        transaction.category ||
        "",
      description: transaction.description || "",
      date: transaction.date
        ? new Date(transaction.date)
            .toISOString()
            .slice(0, 10)
        : today,
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * Delete transaction.
   */
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await deleteTransaction(id);

      setSuccess(
        "Transaction deleted successfully."
      );

      /*
       * Refresh data through the effect.
       */
      setRefreshKey((current) => current + 1);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Failed to delete transaction."
        )
      );
    }
  };

  /*
   * Handle filter changes.
   */
  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  /*
   * Clear filters.
   */
  const clearFilters = () => {
    setFilters(initialFilters);
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <main>
        <div className="page-header">
          <div>
            <h1>Transactions</h1>

            <p className="muted">
              Record and manage your income and expenses.
            </p>
          </div>
        </div>

        {error && (
          <div className="alert error">
            {error}
          </div>
        )}

        {success && (
          <div className="alert success">
            {success}
          </div>
        )}

        {/* ADD / EDIT TRANSACTION */}
        <section className="panel">
          <h2>
            {editingId
              ? "Edit Transaction"
              : "Add Transaction"}
          </h2>

          <form
            className="form-grid"
            onSubmit={handleSubmit}
          >
            {/* TYPE */}
            <label>
              Type

              <select
                name="type"
                value={form.type}
                onChange={handleFormChange}
                required
              >
                <option value="expense">
                  Expense
                </option>

                <option value="income">
                  Income
                </option>
              </select>
            </label>

            {/* AMOUNT */}
            <label>
              Amount (₹)

              <input
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={handleFormChange}
                placeholder="0.00"
                required
              />
            </label>

            {/* CATEGORY */}
            <label>
              Category

              <select
                name="category"
                value={form.category}
                onChange={handleFormChange}
                required
              >
                <option value="">
                  Select category
                </option>

                {visibleCategories.map(
                  (category) => (
                    <option
                      key={category._id}
                      value={category._id}
                    >
                      {category.name}
                    </option>
                  )
                )}
              </select>
            </label>

            {/* DATE */}
            <label>
              Date

              <input
                name="date"
                type="date"
                value={form.date}
                onChange={handleFormChange}
                required
              />
            </label>

            {/* DESCRIPTION */}
            <label className="full-width">
              Description

              <input
                name="description"
                type="text"
                value={form.description}
                onChange={handleFormChange}
                maxLength="200"
                placeholder="e.g. Grocery shopping"
              />
            </label>

            {/* BUTTONS */}
            <div className="form-actions full-width">
              <button
                className="primary-btn"
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Transaction"
                    : "Add Transaction"}
              </button>

              {editingId && (
                <button
                  className="secondary-btn"
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {categories.length === 0 && (
            <p className="form-hint">
              No categories found. Create an income
              or expense category first.
            </p>
          )}

          {categories.length > 0 &&
            visibleCategories.length === 0 && (
              <p className="form-hint">
                No {form.type} categories found.
                Create a {form.type} category first.
              </p>
            )}
        </section>

        {/* TRANSACTION HISTORY */}
        <section className="panel">
          <div className="section-heading">
            <h2>Transaction History</h2>

            <span className="count-badge">
              {transactions.length}
            </span>
          </div>

          {/* FILTERS */}
          <div className="filters">
            <input
              name="search"
              type="text"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search description..."
            />

            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
            >
              <option value="">
                All types
              </option>

              <option value="expense">
                Expenses
              </option>

              <option value="income">
                Income
              </option>
            </select>

            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
            >
              <option value="">
                All categories
              </option>

              {categories.map((category) => (
                <option
                  key={category._id}
                  value={category._id}
                >
                  {category.name} ({category.type})
                </option>
              ))}
            </select>

            {(filters.type ||
              filters.category ||
              filters.search) && (
              <button
                type="button"
                className="secondary-btn"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* LOADING */}
          {loading ? (
            <p className="state-message">
              Loading transactions...
            </p>
          ) : transactions.length === 0 ? (
            <p className="state-message">
              No transactions found.
            </p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map(
                    (transaction) => (
                      <tr
                        key={transaction._id}
                      >
                        {/* DATE */}
                        <td>
                          {transaction.date
                            ? new Date(
                                transaction.date
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "—"}
                        </td>

                        {/* DESCRIPTION */}
                        <td>
                          {transaction.description ||
                            "—"}
                        </td>

                        {/* CATEGORY */}
                        <td>
                          {transaction.category
                            ?.name ||
                            "—"}
                        </td>

                        {/* TYPE */}
                        <td>
                          <span
                            className={`type-badge ${transaction.type}`}
                          >
                            {transaction.type}
                          </span>
                        </td>

                        {/* AMOUNT */}
                        <td
                          className={
                            transaction.type ===
                            "income"
                              ? "income-text"
                              : "expense-text"
                          }
                        >
                          {transaction.type ===
                          "income"
                            ? "+"
                            : "-"}
                          ₹
                          {Number(
                            transaction.amount
                          ).toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </td>

                        {/* ACTIONS */}
                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="small-btn"
                              onClick={() =>
                                handleEdit(
                                  transaction
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="small-btn danger"
                              onClick={() =>
                                handleDelete(
                                  transaction._id
                                )
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Transactions;