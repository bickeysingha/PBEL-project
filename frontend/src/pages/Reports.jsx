import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getReportsData } from "../services/reportService";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

function Reports() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getReportsData();
        setReportData(data);
      } catch (error) {
        console.error(
          "Error fetching reports:",
          error.response?.data || error.message
        );

        setError("Failed to load reports.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;;

  const formatMonth = (month, year) => {
    if (!month || !year) return "Unknown";

    const date = new Date(year, month - 1);

    return date.toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />

        <main className="reports-page">
          <div className="reports-loading">
            <div className="reports-loading-spinner"></div>
            <h2>Loading reports...</h2>
            <p>Preparing your financial insights.</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-layout">
        <Sidebar />

        <main className="reports-page">
          <div className="reports-error">
            <div className="reports-error-icon">!</div>

            <h2>Unable to load reports</h2>

            <p>{error}</p>
          </div>
        </main>
      </div>
    );
  }

  /* =========================================
     CATEGORY DATA
  ========================================= */

  const categoryData =
    reportData?.categoryWiseExpenses?.map((item) => ({
      name: item._id || "Unknown",
      value: item.total || 0,
    })) || [];

  /* =========================================
     MONTHLY DATA
  ========================================= */

  const monthlyData = {};

  reportData?.monthlySummary?.forEach((item) => {
    if (!item._id) return;

    const { year, month, type } = item._id;

    const key = `${year}-${month}`;

    if (!monthlyData[key]) {
      monthlyData[key] = {
        month: formatMonth(month, year),
        income: 0,
        expense: 0,
      };
    }

    if (type === "income") {
      monthlyData[key].income = item.total || 0;
    }

    if (type === "expense") {
      monthlyData[key].expense = item.total || 0;
    }
  });

  const monthlyChartData = Object.values(monthlyData);

  /* =========================================
     SPENDING TREND
  ========================================= */

  const spendingTrendData =
    reportData?.spendingTrend?.map((item) => ({
      month: formatMonth(
        item._id?.month,
        item._id?.year
      ),
      expense: item.total || 0,
    })) || [];

  /* =========================================
     SUMMARY VALUES
  ========================================= */

  const totalExpenses = categoryData.reduce(
    (sum, item) => sum + Number(item.value || 0),
    0
  );

  const totalIncome = monthlyChartData.reduce(
    (sum, item) => sum + Number(item.income || 0),
    0
  );

  const balance = totalIncome - totalExpenses;

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="reports-page">

        {/* =====================================
            PAGE HEADER
        ===================================== */}

        <div className="reports-page-header">
          <div>
            <h1>Reports</h1>

            <p>
              Understand your spending patterns and
              financial performance.
            </p>
          </div>
        </div>


        {/* =====================================
            SUMMARY CARDS
        ===================================== */}

        <div className="reports-summary-grid">

          <div className="reports-summary-card">

            <div className="reports-summary-icon income-icon">
              ↑
            </div>

            <div>
              <span>Total Income</span>

              <strong>
                {formatCurrency(totalIncome)}
              </strong>
            </div>

          </div>


          <div className="reports-summary-card">

            <div className="reports-summary-icon expense-icon">
              ↓
            </div>

            <div>
              <span>Total Expenses</span>

              <strong>
                {formatCurrency(totalExpenses)}
              </strong>
            </div>

          </div>


          <div className="reports-summary-card">

            <div className="reports-summary-icon balance-icon">
              ₹
            </div>

            <div>
              <span>Net Balance</span>

              <strong>
                {formatCurrency(balance)}
              </strong>
            </div>

          </div>

        </div>


        {/* =====================================
            CATEGORY EXPENSES
        ===================================== */}

        <section className="report-chart-card">

          <div className="report-chart-header">

            <div>
              <h2>Category-wise Expenses</h2>

              <p>
                See where your money is being spent.
              </p>
            </div>

            <span className="report-chart-badge">
              {categoryData.length}{" "}
              {categoryData.length === 1
                ? "Category"
                : "Categories"}
            </span>

          </div>


          {categoryData.length === 0 ? (

            <div className="report-empty-state">
              <div className="report-empty-icon">
                ₹
              </div>

              <h3>
                No expense data available
              </h3>

              <p>
                Add some expense transactions to see
                your category breakdown.
              </p>
            </div>

          ) : (

            <div className="report-chart">

              <ResponsiveContainer
                width="100%"
                height={400}
              >
                <PieChart>

                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={135}
                    innerRadius={65}
                    paddingAngle={3}
                    label
                  >
                    {categoryData.map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(value)
                    }
                  />

                  <Legend />

                </PieChart>
              </ResponsiveContainer>

            </div>

          )}

        </section>


        {/* =====================================
            MONTHLY INCOME VS EXPENSE
        ===================================== */}

        <section className="report-chart-card">

          <div className="report-chart-header">

            <div>
              <h2>
                Monthly Income vs Expense
              </h2>

              <p>
                Compare your income and expenses
                month by month.
              </p>
            </div>

          </div>


          {monthlyChartData.length === 0 ? (

            <div className="report-empty-state">
              <div className="report-empty-icon">
                ₹
              </div>

              <h3>
                No monthly data available
              </h3>

              <p>
                Your monthly financial comparison
                will appear here.
              </p>
            </div>

          ) : (

            <div className="report-chart">

              <ResponsiveContainer
                width="100%"
                height={400}
              >
                <BarChart
                  data={monthlyChartData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 10,
                    bottom: 10,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="month"
                  />

                  <YAxis />

                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(value)
                    }
                  />

                  <Legend />

                  <Bar
                    dataKey="income"
                    name="Income"
                    radius={[6, 6, 0, 0]}
                  />

                  <Bar
                    dataKey="expense"
                    name="Expense"
                    radius={[6, 6, 0, 0]}
                  />

                </BarChart>
              </ResponsiveContainer>

            </div>

          )}

        </section>


        {/* =====================================
            SPENDING TREND
        ===================================== */}

        <section className="report-chart-card">

          <div className="report-chart-header">

            <div>
              <h2>
                Monthly Spending Trend
              </h2>

              <p>
                Track how your expenses change over time.
              </p>
            </div>

          </div>


          {spendingTrendData.length === 0 ? (

            <div className="report-empty-state">

              <div className="report-empty-icon">
                ↗
              </div>

              <h3>
                No spending trend data available
              </h3>

              <p>
                Add expense transactions to start
                building your spending trend.
              </p>

            </div>

          ) : (

            <div className="report-chart">

              <ResponsiveContainer
                width="100%"
                height={400}
              >
                <LineChart
                  data={spendingTrendData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 10,
                    bottom: 10,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="month"
                  />

                  <YAxis />

                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(value)
                    }
                  />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="expense"
                    name="Expenses"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />

                </LineChart>
              </ResponsiveContainer>

            </div>

          )}

        </section>

      </main>
    </div>
  );
}

export default Reports;