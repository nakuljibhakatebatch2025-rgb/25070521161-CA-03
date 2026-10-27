import { formatCurrency, formatDate } from '../format.js';

export default function ExpenseList({ expenses, deletingId, onEdit, onDelete }) {
  if (expenses.length === 0) {
    return (
      <div className="empty-state">
        <h3>No expenses yet</h3>
        <p>Add your first expense to start tracking your spending.</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="expense-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Title</th>
            <th>Category</th>
            <th className="align-right">Amount</th>
            <th className="align-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense._id}>
              <td className="nowrap">{formatDate(expense.date)}</td>
              <td>
                <span className="expense-title">{expense.title}</span>
                {expense.note && <span className="expense-note">{expense.note}</span>}
              </td>
              <td>
                <span className="badge">{expense.category}</span>
              </td>
              <td className="align-right nowrap amount">{formatCurrency(expense.amount)}</td>
              <td className="align-right nowrap">
                <button
                  type="button"
                  className="btn btn-small"
                  onClick={() => onEdit(expense)}
                  disabled={deletingId === expense._id}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-small btn-danger"
                  onClick={() => onDelete(expense)}
                  disabled={deletingId === expense._id}
                >
                  {deletingId === expense._id ? 'Deleting...' : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
