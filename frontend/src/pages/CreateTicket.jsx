import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";
import { Icon, PageHeader } from "../components/Ui";

export default function CreateTicket() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: "",
    categoryId: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCatLoading(true);
        setError("");

        const response = await api.get("/categories");

        const data = response?.data || {};

        if (Array.isArray(data)) {
          setCategories(data);
        } else if (Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else {
          setCategories([]);
        }
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "Unable to load ticket categories."
        );
      } finally {
        setCatLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();

    setError("");

    if (!form.title.trim()) {
      setError("Please enter a ticket title.");
      return;
    }

    if (!form.categoryId) {
      setError("Please select a category.");
      return;
    }

    if (!form.description.trim()) {
      setError("Please describe the issue.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/tickets", {
        title: form.title.trim(),
        categoryId: Number(form.categoryId),
        description: form.description.trim(),
      });

      const data = response?.data || {};
      const ticket = data.ticket;

      if (ticket?.id) {
        navigate(`/customer/tickets/${ticket.id}`, {
          replace: true,
        });
      } else {
        navigate("/customer/tickets", {
          replace: true,
        });
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to create ticket. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="dashboard narrow-page">

        <PageHeader
          eyebrow="NEW REQUEST"
          title="Create a support ticket"
          description="Give the support team enough context to understand and resolve the issue quickly."
          action={
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
          }
        />

        <form className="form-panel" onSubmit={submit}>

          <div className="form-section">

            <div className="form-section-title">
              <span>01</span>

              <div>
                <strong>Ticket details</strong>
                <small>
                  Describe what you need help with.
                </small>
              </div>
            </div>

            {error && (
              <div className="form-error">
                <Icon name="alert" size={17} />
                <span>{error}</span>
              </div>
            )}

            <label>
              Title

              <input
                type="text"
                name="title"
                maxLength={150}
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Unable to access my account"
                required
              />

              <small className="field-help">
                Use a short, specific title.
              </small>
            </label>

            <label>
              Category

              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                required
                disabled={catLoading}
              >
                <option value="">
                  {catLoading
                    ? "Loading categories..."
                    : categories.length === 0
                    ? "No categories available"
                    : "Select a category"}
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Description

              <textarea
                name="description"
                rows="8"
                value={form.description}
                onChange={handleChange}
                placeholder="Tell us what happened, what you expected, and any useful steps to reproduce the issue."
                required
              />
            </label>

          </div>

          <div className="form-footer">

            <span>
              <Icon name="help" size={16} />
              Your request will be visible to the support team.
            </span>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || catLoading}
            >
              {loading ? "Submitting..." : "Submit ticket"}

              {!loading && (
                <Icon name="arrow" size={17} />
              )}
            </button>

          </div>

        </form>
      </div>
    </DashboardLayout>
  );
}