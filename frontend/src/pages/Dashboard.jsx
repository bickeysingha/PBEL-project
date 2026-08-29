import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import { getDashboardData } from "../services/dashboardService";
import { getBudgetSummary } from "../services/budgetService";
function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [budgetSummaries, setBudgetSummaries] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [data, budgetData] = await Promise.all([
  getDashboardData(),
  getBudgetSummary(),
]);

setDashboardData(data);
setBudgetSummaries(
  Array.isArray(budgetData) ? budgetData : []
);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main>
          <h2>Loading dashboard...</h2>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />

      <main>
        <h1>Dashboard</h1>

        {/* Statistics Cards */}
        <div className="stats-container">
          <StatCard
            title="Total Income"
            amount={dashboardData?.totalIncome || 0}
          />

          <StatCard
            title="Total Expense"
            amount={dashboardData?.totalExpense || 0}
          />

          <StatCard
            title="Current Balance"
            amount={dashboardData?.balance || 0}
          />
        </div>

        <div className="budget-overview">
  <h2>Budget Overview</h2>

  {budgetSummaries.length === 0 ? (
    <p>No budgets found.</p>
  ) : (
    <div className="budget-list">
      {budgetSummaries.map((budget) => (
        <div className="budget-card" key={budget._id}>
          <h3>{budget.category?.name || "Budget"}</h3>

          <p>
            <strong>Budget:</strong>{" "}
            ₹{Number(budget.amount).toLocaleString("en-IN")}
          </p>

          <p>
            <strong>Spent:</strong>{" "}
            ₹{Number(budget.spent).toLocaleString("en-IN")}
          </p>

          <p>
            <strong>Remaining:</strong>{" "}
            ₹{Number(budget.remaining).toLocaleString("en-IN")}
          </p>

          <p>
            <strong>Progress:</strong>{" "}
            {budget.percentage}%
          </p>

          <div className="budget-progress">
            <div
              className="budget-progress-bar"
              style={{
                width: `${Math.min(budget.percentage, 100)}%`,
              }}
            />
          </div>

          <p>
            <strong>Status:</strong>{" "}
            {budget.status}
          </p>
        </div>
      ))}
    </div>
  )}
</div>

        {/* Recent Transactions */}
        <div className="recent-transactions">
          <h2>Recent Transactions</h2>

          {dashboardData?.recentTransactions?.length === 0 ? (
            <p>No transactions found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {dashboardData?.recentTransactions?.map((transaction) => (
                  <tr key={transaction._id}>
                    <td>{transaction.description || "No description"}</td>

                    <td>{transaction.type}</td>

                    <td>₹{transaction.amount}</td>

                    <td>
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;