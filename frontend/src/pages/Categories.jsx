import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  getCategories,
  createCategory,
} from "../services/categoryService";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("expense");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        const data = await getCategories();

        if (cancelled) {
          return;
        }

        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          setCategories(data?.categories || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              "Failed to load categories."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Category name is required.");
      return;
    }

    try {
      setSaving(true);

      await createCategory({
        name: trimmedName,
        type,
      });

      setName("");
      setSuccess("Category created successfully.");

      const data = await getCategories();

      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        setCategories(data?.categories || []);
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to create category."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <main>
        <div className="page-header">
          <div>
            <h1>Categories</h1>

            <p className="muted">
              Create and manage your income and expense
              categories.
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

        <section className="panel">
          <h2>Add Category</h2>

          <form
            className="form-grid"
            onSubmit={handleSubmit}
          >
            <label>
              Category Name

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="e.g. Food"
                maxLength="100"
                required
              />
            </label>

            <label>
              Type

              <select
                value={type}
                onChange={(event) =>
                  setType(event.target.value)
                }
              >
                <option value="expense">
                  Expense
                </option>

                <option value="income">
                  Income
                </option>
              </select>
            </label>

            <div className="form-actions full-width">
              <button
                className="primary-btn"
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Add Category"}
              </button>
            </div>
          </form>
        </section>

        <section className="panel">
          <div className="section-heading">
            <h2>Your Categories</h2>

            <span className="count-badge">
              {categories.length}
            </span>
          </div>

          {loading ? (
            <p className="state-message">
              Loading categories...
            </p>
          ) : categories.length === 0 ? (
            <p className="state-message">
              No categories found.
            </p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map((category) => (
                    <tr key={category._id}>
                      <td>{category.name}</td>

                      <td>
                        <span
                          className={`type-badge ${category.type}`}
                        >
                          {category.type}
                        </span>
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

export default Categories;