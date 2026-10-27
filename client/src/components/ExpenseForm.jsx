import { useEffect, useState } from 'react';
import { CATEGORIES } from '../constants.js';
import { toDateInput } from '../format.js';

const emptyForm = {
  title: '',
  amount: '',
  category: 'Food',
  date: toDateInput(),
  note: ''
};

export default function ExpenseForm({ initial, submitting, onSubmit, onCancel }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title || '',
        amount: initial.amount ?? '',
        category: initial.category || 'Other',
        date: toDateInput(initial.date),
        note: initial.note || ''
      });
    } else {
      setForm(emptyForm);
    }

    setError('');
  }, [initial]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }

    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (!form.date) {
      setError('Date is required');
      return;
    }

    try {
      await onSubmit({
        title: form.title.trim(),
        amount,
        category: form.category,
        date: form.date,
        note: form.note.trim()
      });
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  return (
    <form className="expense-form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <div className="form-group form-group-wide">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="e.g. Groceries"
            value={form.title}
            onChange={handleChange}
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount</label>
          <input
            id="amount"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select id="category" name="category" value={form.category} onChange={handleChange}>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            id="date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
          />
        </div>

        <div className="form-group form-group-wide">
          <label htmlFor="note">Note (optional)</label>
          <input
            id="note"
            name="note"
            type="text"
            placeholder="Add a short note"
            value={form.note}
            onChange={handleChange}
            maxLength={300}
          />
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : initial ? 'Save changes' : 'Add expense'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
      </div>
    </form>
  );
}
