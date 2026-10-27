import { Router } from 'express';
import {
  createExpense,
  deleteExpense,
  listExpenses,
  updateExpense
} from '../controllers/expenseController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.route('/').get(listExpenses).post(createExpense);
router.route('/:id').put(updateExpense).delete(deleteExpense);

export default router;
