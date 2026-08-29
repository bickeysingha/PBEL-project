import { useEffect, useState } from "react";

const MONTHS = [
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

const STORAGE_KEY = "expense_tracker_budgets";

function Budgets() {
  const currentYear = new Date().getFullYear();

  const [budgets, setBudgets] = useState([]);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [year, setYear] = useState(currentYear);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedBudgets = localStorage.getItem(STORAGE_KEY);

    if (savedBudgets) {
      try {
        setBudgets(JSON.parse(savedBudgets));
      } catch {
        setBudgets([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
  }, [budgets]);

  const resetForm = () => {
    setCategory("");
    setAmount("");
    setMonth(MONTHS[new Date().getMonth()]);
    setYear(currentYear);
    setEditingId(null);
    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    const cleanCategory = category.trim();
    const numericAmount = Number(amount);
    const numericYear = Number(year);

    if (!cleanCategory) {
      setError("Please enter a category.");
      return;
    }

    if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid budget amount greater than 0.");
      return;
    }

    if (
      !year ||
      Number.isNaN(numericYear) ||
      numericYear < 2000 ||
      numericYear > 2100
    ) {
      setError("Please enter a valid year.");
      return;
    }

    if (editingId !== null) {
      setBudgets((current) =>
        current.map((budget) =>
          budget.id === editingId
            ? {
                ...budget,
                category: cleanCategory,
                amount: numericAmount,
                month,
                year: numericYear,
              }
            : budget
        )
      );
    } else {
      const newBudget = {
        id: Date.now(),
        category: cleanCategory,
        amount: numericAmount,
        month,
        year: numericYear,
      };

      setBudgets((current) => [...current, newBudget]);
    }

    resetForm();
  };

  const handleEdit = (budget) => {
    setEditingId(budget.id);
    setCategory(budget.category);
    setAmount(String(budget.amount));
    setMonth(budget.month);
    setYear(budget.year);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this budget?"
    );

    if (!confirmed) {
      return;
    }

    setBudgets((current) =>
      current.filter((budget) => budget.id !== id)
    );

    if (editingId === id) {
      resetForm();
    }
  };

  const totalBudget = budgets.reduce(
    (total, budget) => total + Number(budget.amount),
    0
  );

  return (
    <div className="page">
      <h1>Budgets</h1>

      <p>Create and manage your monthly budgets.</p>

      <section>
        <h2>{editingId !== null ? "Edit Budget" : "Add Budget"}</h2>

        {error && (
          <p
            style={{
              color: "#dc2626",
              fontWeight: "600",
              marginBottom: "12px",
            }}
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="budget-category">Category</label>

            <input
              id="budget-category"
              type="text"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="e.g. Food"
            />
          </div>

          <div>
            <label htmlFor="budget-amount">Budget Amount</label>

            <input
              id="budget-amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="e.g. 5000"
            />
          </div>

          <div>
            <label htmlFor="budget-month">Month</label>

            <select
              id="budget-month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
            >
              {MONTHS.map((monthName) => (
                <option key={monthName} value={monthName}>
                  {monthName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="budget-year">Year</label>

            <input
              id="budget-year"
              type="number"
              min="2000"
              max="2100"
              value={year}
              onChange={(event) => setYear(event.target.value)}
            />
          </div>

          <button type="submit">
            {editingId !== null ? "Update Budget" : "Add Budget"}
          </button>

          {editingId !== null && (
            <button type="button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </form>
      </section>

      <section>
        <h2>Your Budgets</h2>

        <p>{budgets.length}</p>

        {budgets.length === 0 ? (
          <p>No budgets found.</p>
        ) : (
          <>
            <p>
              <strong>Total Budget: </strong>
              ₹{totalBudget.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>

            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Month</th>
                  <th>Year</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {budgets.map((budget) => (
                  <tr key={budget.id}>
                    <td>{budget.category}</td>

                    <td>
                      ₹
                      {Number(budget.amount).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    <td>{budget.month}</td>

                    <td>{budget.year}</td>

                    <td>
                      <button
                        type="button"
                        onClick={() => handleEdit(budget)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(budget.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>
    </div>
  );
}

export default Budgets;