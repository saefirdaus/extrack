import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { budgets } from '@/db/schema/budgets';
import { getCurrentUser } from '@/lib/auth/session';
import { setBudgetSchema, cleanRupiahAmount } from '@/lib/validation/budget';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Sesi tidak valid atau telah berakhir.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();

    const parsedAmount =
      typeof body.amount === 'string' ? cleanRupiahAmount(body.amount) : body.amount;

    const result = setBudgetSchema.safeParse({
      month: body.month,
      year: body.year,
      amount: parsedAmount,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validasi gagal.',
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { month, year, amount } = result.data;

    const [savedBudget] = await db
      .insert(budgets)
      .values({
        userId: user.id,
        month,
        year,
        amount,
      })
      .onConflictDoUpdate({
        target: [budgets.userId, budgets.month, budgets.year],
        set: {
          amount,
          updatedAt: new Date(),
        },
      })
      .returning();

    revalidatePath('/dashboard');

    return NextResponse.json(
      {
        success: true,
        message: 'Anggaran bulanan berhasil disimpan.',
        data: savedBudget,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('API Error in /api/budgets:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal memproses penetapan anggaran.',
      },
      { status: 500 }
    );
  }
}
