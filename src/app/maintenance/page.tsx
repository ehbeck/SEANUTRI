'use client';

import { Wrench } from 'lucide-react';
import { GraduationCap } from '@/components/icons';

export default function MaintenancePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4 text-center">
      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        <div className="flex justify-center mb-4">
            <GraduationCap className="size-14 text-primary" />
        </div>
        <Wrench className="w-16 h-16 text-muted-foreground animate-pulse" />
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-headline">Em Manutenção</h1>
          <p className="text-muted-foreground">
            A plataforma está passando por uma manutenção programada. Estaremos de volta em breve.
          </p>
          <p className="text-muted-foreground">Agradecemos a sua paciência.</p>
        </div>
      </div>
    </div>
  );
}
