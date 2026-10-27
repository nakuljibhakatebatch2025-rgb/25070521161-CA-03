import { useEffect, useMemo, useRef, useState } from 'react';
import { apiRequest } from '../api.js';
import ExpenseForm from '../components/ExpenseForm.jsx';
import ExpenseList from '../components/ExpenseList.jsx';
import Navbar from '../components/Navbar.jsx';
import { CATEGORIES } from '../constants.js';
import { formatCurrency } from '../format.js';

function sortExpenses(list) {
  return [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
}

export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const formRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    apiRequest('/expenses')
      .then((data) => {
        if (!cancelled) {
          setExpenses(sortExpenses(data));
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (formOpen) {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [formOpen, editing]);

  const { total, monthTotal, count } = useMemo(() => {
    const now = new Date();
    let all = 0;
    let thisMonth = 0;

    for (const expense of expenses) {
      all += expense.amount;

      const date = new Date(expense.date);

      if (date.getUTCFullYear() === now.getFullYear() && date.getUTCMonth() === now.getMonth()) {
        thisMonth += expense.amount;
      }
    }

    return { total: all, monthTotal: thisMonth, count: expenses.length };
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    if (categoryFilter === 'All') {
      return expenses;
    }

    return expenses.filter((expense) => expense.category === categoryFilter);
  }, [expenses, categoryFilter]);

  function openAddForm() {
    setEditing(null);
    setFormOpen(true);
    setError('');
  }

  function openEditForm(expense) {
    setEditing(expense);
    setFormOpen(true);
    setError('');
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  async function handleSubmit(payload) {
    setSaving(true);

    try {
      if (editing) {
        const updated = await apiRequest(`/expenses/${editing._id}`, {
          method: 'PUT',
          body: payload
        });
        setExpenses((current) =>
          sortExpenses(current.map((item) => (item._id === updated._id ? updated : item)))
        );
      } else {
        const created = await apiRequest('/expenses', { method: 'POST', body: payload });
        setExpenses((current) => sortExpenses([created, ...current]));
      }

      closeForm();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(expense) {
    if (!window.confirm(`Delete "${expense.title}"?`)) {
      return;
    }

    setDeletingId(expense._id);
    setError('');

    try {
      await apiRequest(`/expenses/${expense._id}`, { method: 'DELETE' });
      setExpenses((current) => current.filter((item) => item._id !== expense._id));

      if (editing?._id === expense._id) {
        closeForm();
      }
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="app-shell">
      <Navbar />

      <main className="container">
        <div className="page-header">
          <div>
            <h1>Dashboard</h1>
            <p className="subtitle">Track where your money goes.</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={openAddForm}>
            + Add expense
          </button>
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            <span>{error}</span>
            <button
              type="button"
              className="alert-close"
              aria-label="Dismiss error"
              onClick={() => setError('')}
            >
              ×
            </button>
          </div>
        )}

        <section className="summary-grid" aria-label="Expense summary">
          <div className="summary-card">
            <span className="summary-label">Total spent</span>
            <span className="summary-value">{formatCurrency(total)}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">This month</span>
            <span className="summary-value">{formatCurrency(monthTotal)}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Expenses logged</span>
            <span className="summary-value">{count}</span>
          </div>
        </section>

        {formOpen && (
          <section className="panel" ref={formRef} aria-label="Expense form">
            <div className="panel-header">
              <h2>{editing ? 'Edit expense' : 'Add expense'}</h2>
            </div>
            <ExpenseForm
              initial={editing}
              submitting={saving}
              onSubmit={handleSubmit}
              onCancel={closeForm}
            />
          </section>
        )}

        <section className="panel" aria-label="Expense list">
          <div className="panel-header">
            <h2>Expenses</h2>
            <div className="filter">
              <label htmlFor="category-filter">Category</label>
              <select
                id="category-filter"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option value="All">All</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">Loading expenses...</div>
          ) : (
            <ExpenseList
              expenses={filteredExpenses}
              deletingId={deletingId}
              onEdit={openEditForm}
              onDelete={handleDelete}
            />
          )}
        </section>
      </main>
    </div>
  );
}
