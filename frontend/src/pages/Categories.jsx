import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  getCategories,
  createCategory,
  deleteCategory,
} from "../services/categoryService";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCategories();

      setCategories(
        Array.isArray(data) ? data : data?.categories || []
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to load categories."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
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
      });

      setName("");
      setSuccess("Category created successfully.");

      await loadCategories();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to create category."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, categoryName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${categoryName}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");
      setSuccess("");

      await deleteCategory(id);

      setSuccess("Category deleted successfully.");

      await loadCategories();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to delete category."
      );
    } finally {
      setDeletingId(null);
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

        {/* ADD CATEGORY */}
        <section className="panel">
          <h2>Add Category</h2>

          <form
            className="form-grid"
            onSubmit={handleSubmit}
          >
            <label className="full-width">
              Category Name

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="e.g. Food"
                maxLength="50"
                required
              />
            </label>

            <div className="form-actions full-width">
              <button
                className="primary-btn"
                type="submit"
                disabled={saving}
              >
                {saving ? "Saving..." : "Add Category"}
              </button>
            </div>
          </form>
        </section>

        {/* CATEGORY LIST */}
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
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map((category) => (
                    <tr key={category._id}>
                      <td>{category.name}</td>

                      <td>
                        <button
                          type="button"
                          className="small-btn danger"
                          onClick={() =>
                            handleDelete(
                              category._id,
                              category.name
                            )
                          }
                          disabled={
                            deletingId === category._id
                          }
                        >
                          {deletingId === category._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
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