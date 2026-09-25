interface SummaryCardsProps {
  currentBalance: number;
  totalIncome: number;
  totalExpense: number;
}

export function formatRupiah(amount: number): string {
  const isNegative = amount < 0;
  const absFormatted = Math.abs(amount).toLocaleString('id-ID');
  return isNegative ? `- Rp ${absFormatted}` : `Rp ${absFormatted}`;
}

export function SummaryCards({
  currentBalance,
  totalIncome,
  totalExpense,
}: SummaryCardsProps) {
  const isDeficit = currentBalance < 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Kartu Saldo Saat Ini */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col justify-between transition-colors">
        <div>
          <span className="text-sm font-medium text-gray-500 dark:text-slate-400">Saldo Saat Ini</span>
          <p
            className={`text-2xl font-bold mt-2 ${
              isDeficit ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
            }`}
          >
            {formatRupiah(currentBalance)}
          </p>
        </div>
        {isDeficit && (
          <span className="inline-block mt-3 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-2 py-1 rounded">
            Defisit (Pengeluaran melebihi pemasukan)
          </span>
        )}
      </div>

      {/* Kartu Total Pemasukan */}
      <div className="bg-green-50/50 dark:bg-green-950/20 rounded-xl p-6 shadow-sm border border-green-100 dark:border-green-900/60 text-green-700 dark:text-green-400 flex flex-col justify-between transition-colors">
        <div>
          <span className="text-sm font-medium text-green-700 dark:text-green-400">Total Pemasukan</span>
          <p className="text-2xl font-bold text-green-700 dark:text-green-400 mt-2">
            + Rp {Math.abs(totalIncome).toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* Kartu Total Pengeluaran */}
      <div className="bg-red-50/50 dark:bg-red-950/20 rounded-xl p-6 shadow-sm border border-red-100 dark:border-red-900/60 text-red-700 dark:text-red-400 flex flex-col justify-between transition-colors">
        <div>
          <span className="text-sm font-medium text-red-700 dark:text-red-400">Total Pengeluaran</span>
          <p className="text-2xl font-bold text-red-700 dark:text-red-400 mt-2">
            - Rp {Math.abs(totalExpense).toLocaleString('id-ID')}
          </p>
        </div>
      </div>
    </div>
  );
}
