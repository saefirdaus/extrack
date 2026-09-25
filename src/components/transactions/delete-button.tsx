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
        className="text-red-600 hover:text-red-800 font-medium text-xs ml-3 disabled:opacity-50 cursor-pointer"
      >
        {isPending ? 'Menghapus...' : 'Hapus'}
      </button>
    </form>
  );
}
