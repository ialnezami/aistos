'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebtorLookupPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email.trim()) {
      return;
    }

    setIsLoading(true);
    // Navigate to debtor detail page with email
    router.push(`/debtor/${encodeURIComponent(email.trim())}`);
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Rechercher une dette</CardTitle>
            <CardDescription>
              Entrez l'adresse email pour consulter les informations de la dette
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Adresse email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !email.trim()}
              >
                {isLoading ? 'Recherche...' : 'Rechercher'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

