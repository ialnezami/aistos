'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const sessionIdParam = searchParams.get('session_id');
    setSessionId(sessionIdParam);
    
    // Show success toast
    toast({
      title: 'Paiement réussi !',
      description: 'Votre paiement a été traité avec succès.',
      variant: 'success',
    });
  }, [searchParams, toast]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto space-y-4">
        <Card className="border-green-500">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-green-600">
              Paiement réussi !
            </CardTitle>
            <CardDescription className="text-lg">
              Votre paiement a été traité avec succès
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {sessionId && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  ID de session Stripe:
                </p>
                <p className="font-mono text-sm break-all">{sessionId}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Badge variant="success" className="text-sm px-4 py-2">
                  Paiement confirmé
                </Badge>
              </div>

              <p className="text-center text-muted-foreground">
                Vous recevrez un email de confirmation sous peu. Votre dette a
                été marquée comme payée dans notre système.
              </p>
            </div>

            <div className="pt-4 space-y-2">
              <Button
                onClick={() => router.push('/debtor')}
                className="w-full"
                size="lg"
              >
                Retour à la recherche
              </Button>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full"
              >
                Accueil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

