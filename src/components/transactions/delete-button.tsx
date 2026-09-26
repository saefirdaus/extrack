import { deleteTransactionAction } from '@/actions/transactions';
import { useTransition } from 'react';

interface DeleteButtonProps {
  id: number;
}

export function DeleteButton({ id }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const confirmed = window.confirm('Hapus transaksi ini?');
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
        className="text-xs font-mono text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-40 cursor-pointer transition-colors"
      >
        {isPending ? 'Menghapus...' : 'Hapus'}
      </button>
    </form>
  );
}
