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

        console.log("Reports data:", data);

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

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main>
          <h2>Loading reports...</h2>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main>
          <h2>{error}</h2>
        </main>
      </div>
    );
  }

  // Pie Chart Data
  const categoryData =
    reportData?.categoryWiseExpenses?.map((item) => ({
      name: item._id || "Unknown",
      value: item.total || 0,
    })) || [];

  // Bar Chart Data
  const monthlyData = {};

  reportData?.monthlySummary?.forEach((item) => {
    if (!item._id) return;

    const { year, month, type } = item._id;

    const key = `${year}-${month}`;

    if (!monthlyData[key]) {
      monthlyData[key] = {
        month: `${month}/${year}`,
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

  // Line Chart Data
  const spendingTrendData =
    reportData?.spendingTrend?.map((item) => ({
      month:
        item._id?.month && item._id?.year
          ? `${item._id.month}/${item._id.year}`
          : "Unknown",
      expense: item.total || 0,
    })) || [];

  return (
    <div className="app-layout">
      <Sidebar />

      <main>
        <h1>Reports</h1>

        {/* Pie Chart */}
        <div className="chart-container">
          <h2>Category-wise Expenses</h2>

          {categoryData.length === 0 ? (
            <p>No expense data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={130}
                  label
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} />
                  ))}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bar Chart */}
        <div className="chart-container">
          <h2>Monthly Income vs Expense</h2>

          {monthlyChartData.length === 0 ? (
            <p>No monthly data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />

                <Bar dataKey="income" name="Income" />

                <Bar dataKey="expense" name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Line Chart */}
        <div className="chart-container">
          <h2>Monthly Spending Trend</h2>

          {spendingTrendData.length === 0 ? (
            <p>No spending trend data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={spendingTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />

                <Line
                  type="monotone"
                  dataKey="expense"
                  name="Expenses"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </main>
    </div>
  );
}

export default Reports;