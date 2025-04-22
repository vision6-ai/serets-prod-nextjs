import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserX } from 'lucide-react';

export default function ProfileNotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[60vh] py-16 text-center">
      <UserX className="w-20 h-20 text-muted-foreground mb-6" />
      <h1 className="text-4xl font-bold mb-4">פרופיל לא נמצא</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        המשתמש שאתה מחפש לא קיים או שהפרופיל הוסר.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/">חזרה לעמוד הראשי</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/auth">התחברות</Link>
        </Button>
      </div>
    </div>
  );
} 