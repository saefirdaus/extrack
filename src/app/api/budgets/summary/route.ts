import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getMonthlyBudgetSummary } from '@/actions/budget-summary';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json(
      { success: false, message: 'Sesi tidak valid atau telah berakhir.' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const rawMonth = searchParams.get('month');
  const rawYear = searchParams.get('year');

  const parsedMonth = rawMonth ? parseInt(rawMonth, 10) : undefined;
  const parsedYear = rawYear ? parseInt(rawYear, 10) : undefined;

  const summary = await getMonthlyBudgetSummary(
    user.id,
    parsedMonth && !isNaN(parsedMonth) ? parsedMonth : undefined,
    parsedYear && !isNaN(parsedYear) ? parsedYear : undefined
  );

  return Response.json({
    success: true,
    data: {
      month: summary.month,
      year: summary.year,
      budgetAmount: summary.budgetAmount,
      totalExpense: summary.totalExpense,
      remainingBudget: summary.remainingBudget,
      usagePercentage: summary.usagePercentage,
      status: summary.status,
      hasBudget: summary.hasBudget,
    },
  });
}
