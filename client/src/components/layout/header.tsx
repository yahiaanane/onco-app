import { Button } from "@/components/ui/button";
import { Plus, User } from "lucide-react";

interface HeaderProps {
  title: string;
  onQuickAdd?: () => void;
}

export default function Header({ title, onQuickAdd }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        <div className="flex items-center space-x-4">
          {onQuickAdd && (
            <Button onClick={onQuickAdd} data-testid="button-quick-add">
              <Plus className="h-4 w-4 mr-2" />
              Quick Add
            </Button>
          )}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">Dr. Sarah Johnson</span>
          </div>
        </div>
      </div>
    </header>
  );
}
