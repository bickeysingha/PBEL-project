import { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from "../services/transactionService";
import { getCategories } from "../services/categoryService";

const today = new Date().toISOString().slice(0, 10);

const emptyForm = {
  type: "expense",
  amount: "",
  category: "",
  description: "",
  date: today,
};

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    search: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const visibleCategories = useMemo(
    () => categories.filter((category) => category.type === form.type),
    [categories, form.type]
  );

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [transactionData, categoryData] = await Promise.all([
        getTransactions(filters),
        getCategories(),
      ]);

      setTransactions(transactionData.transactions || []);
      setCategories(categoryData.categories || []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load transactions."));
    } finally {
      setLoading(false);
    }
  }, [filters.type, filters.category, filters.search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "type" ? { category: "" } : {}),
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.category) {
      setError("Please select a category.");
      return;
    }

    if (Number(form.amount) <= 0) {
      setError("Amount must be greater than 0.");
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
        setSuccess("Transaction updated successfully.");
      } else {
        await createTransaction(payload);
        setSuccess("Transaction added successfully.");
      }

      resetForm();
      await fetchData();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save transaction."));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (transaction) => {
    setEditingId(transaction._id);
    setForm({
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category?._id || transaction.category,
      description: transaction.description || "",
      date: new Date(transaction.date).toISOString().slice(0, 10),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;

    try {
      setError("");
      setSuccess("");
      await deleteTransaction(id);
      setSuccess("Transaction deleted successfully.");
      await fetchData();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete transaction."));
    }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <main>
        <div className="page-header">
          <div>
            <h1>Transactions</h1>
            <p className="muted">Record and manage your income and expenses.</p>
          </div>
        </div>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        <section className="panel">
          <h2>{editingId ? "Edit Transaction" : "Add Transaction"}</h2>

          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Type
              <select name="type" value={form.type} onChange={handleFormChange}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </label>

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

            <label>
              Category
              <select
                name="category"
                value={form.category}
                onChange={handleFormChange}
                required
              >
                <option value="">Select category</option>
                {visibleCategories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

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

            <label className="full-width">
              Description
              <input
                name="description"
                value={form.description}
                onChange={handleFormChange}
                maxLength="200"
                placeholder="e.g. Grocery shopping"
              />
            </label>

            <div className="form-actions full-width">
              <button className="primary-btn" type="submit" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Transaction"
                    : "Add Transaction"}
              </button>

              {editingId && (
                <button className="secondary-btn" type="button" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          {categories.length === 0 && (
            <p className="form-hint">
              No categories found. Create an income or expense category first.
            </p>
          )}
        </section>

        <section className="panel">
          <div className="section-heading">
            <h2>Transaction History</h2>
            <span className="count-badge">{transactions.length}</span>
          </div>

          <div className="filters">
            <input
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search description..."
            />

            <select name="type" value={filters.type} onChange={handleFilterChange}>
              <option value="">All types</option>
              <option value="expense">Expenses</option>
              <option value="income">Income</option>
            </select>

            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name} ({category.type})
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="state-message">Loading transactions...</p>
          ) : transactions.length === 0 ? (
            <p className="state-message">No transactions found.</p>
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
                  {transactions.map((transaction) => (
                    <tr key={transaction._id}>
                      <td>{new Date(transaction.date).toLocaleDateString()}</td>
                      <td>{transaction.description || "—"}</td>
                      <td>{transaction.category?.name || "—"}</td>
                      <td>
                        <span className={`type-badge ${transaction.type}`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className={transaction.type === "income" ? "income-text" : "expense-text"}>
                        {transaction.type === "income" ? "+" : "-"}₹
                        {Number(transaction.amount).toLocaleString("en-IN")}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="small-btn"
                            onClick={() => handleEdit(transaction)}
                          >
                            Edit
                          </button>
                          <button
                            className="small-btn danger"
                            onClick={() => handleDelete(transaction._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
