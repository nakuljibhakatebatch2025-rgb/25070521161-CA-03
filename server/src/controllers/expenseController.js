import Expense from '../models/Expense.js';

function pickExpenseFields(body = {}) {
  const { title, amount, category, date, note } = body;

  return {
    title: typeof title === 'string' ? title.trim() : title,
    amount,
    category,
    date,
    note: typeof note === 'string' ? note.trim() : note
  };
}

export async function listExpenses(req, res, next) {
  try {
    const expenses = await Expense.find({ user: req.userId }).sort({
      date: -1,
      createdAt: -1
    });

    return res.json(expenses);
  } catch (error) {
    return next(error);
  }
}

export async function createExpense(req, res, next) {
  try {
    const expense = await Expense.create({
      ...pickExpenseFields(req.body),
      user: req.userId
    });

    return res.status(201).json(expense);
  } catch (error) {
    return next(error);
  }
}

export async function updateExpense(req, res, next) {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      pickExpenseFields(req.body),
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    return res.json(expense);
  } catch (error) {
    return next(error);
  }
}

export async function deleteExpense(req, res, next) {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    return res.json({ message: 'Expense deleted' });
  } catch (error) {
    return next(error);
  }
}
