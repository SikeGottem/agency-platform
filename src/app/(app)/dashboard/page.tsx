import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: boards } = await supabase
    .from('boards')
    .select('*')
    .order('updated_at', { ascending: false }) as { data: Array<{ id: string; title: string; updated_at: string }> | null };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your Boards</h1>
          <p className="text-text-secondary text-sm mt-1">
            Create and manage your moodboards
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Board
        </Button>
      </div>

      {boards && boards.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {boards.map((board) => (
            <Card
              key={board.id}
              className="cursor-pointer hover:border-border-hover transition-colors"
            >
              <div className="aspect-[4/3] bg-bg-tertiary rounded-lg mb-3" />
              <h3 className="font-medium truncate">{board.title}</h3>
              <p className="text-xs text-text-tertiary mt-1">
                {new Date(board.updated_at).toLocaleDateString()}
              </p>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-bg-tertiary flex items-center justify-center mb-4">
            <Plus className="h-8 w-8 text-text-tertiary" />
          </div>
          <h3 className="font-medium mb-1">No boards yet</h3>
          <p className="text-sm text-text-secondary mb-4">
            Create your first moodboard to get started
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Board
          </Button>
        </Card>
      )}
    </div>
  );
}
