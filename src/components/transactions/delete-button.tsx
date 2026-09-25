'use client';

import { deleteTransactionAction } from '@/src/actions/transactions';
import { useTransition } from 'react';

interface DeleteButtonProps {
  id: number;
}

export function DeleteButton({ id }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const confirmed = window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?');
    if (confirmed) {
      const formData = new FormData();
      formData.append('id', id.toString());
      startTransition(async () => {
        await deleteTransactionAction(formData);
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="inline">
      <button
        type="submit"
        disabled={isPending}
        className="text-rose-400 hover:text-rose-300 font-semibold text-xs ml-3 disabled:opacity-50 cursor-pointer transition-colors duration-150"
      >
        {isPending ? 'Menghapus...' : 'Hapus'}
      </button>
    </form>
  );
}
