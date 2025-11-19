'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';

enum DebtStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
}

interface DebtData {
  id: number;
  name: string;
  email: string;
  debtSubject: string;
  debtAmount: string;
  status: DebtStatus;
  stripePaymentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function DebtorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [debt, setDebt] = useState<DebtData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const email = params.email as string;
  const canceled = searchParams?.get('canceled') === 'true';

  useEffect(() => {
    const fetchDebt = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/debts/${encodeURIComponent(email)}`);
        const result = await response.json();

        if (!result.success) {
          setError(result.error || 'Failed to fetch debt information');
          return;
        }

        setDebt(result.data);
      } catch (err) {
        setError('An error occurred while fetching debt information');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (email) {
      fetchDebt();
    }
  }, [email]);

  const formatCurrency = (amount: string): string => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  };

  const formatDate = (dateString: string): string => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">Chargement...</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !debt) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-destructive">
                Erreur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {error || 'Dette introuvable pour cette adresse email'}
              </p>
              <Button onClick={() => router.push('/debtor')} variant="outline">
                Retour à la recherche
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto space-y-4">
        {canceled && (
          <Card className="border-yellow-500 mb-4">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-yellow-600">
                Paiement annulé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Le paiement a été annulé. Vous pouvez réessayer ci-dessous.
              </p>
            </CardContent>
          </Card>
        )}

        <Button
          onClick={() => router.push('/debtor')}
          variant="outline"
          className="mb-4"
        >
          ← Retour
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">
                Informations de la dette
              </CardTitle>
              <Badge
                variant={debt.status === DebtStatus.PAID ? 'success' : 'secondary'}
              >
                {debt.status === DebtStatus.PAID ? 'Payé' : 'En attente'}
              </Badge>
            </div>
            <CardDescription>
              Détails de la dette pour {debt.email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Nom
                </label>
                <p className="text-lg font-semibold">{debt.name}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <p className="text-lg">{debt.email}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Intitulé de la dette
                </label>
                <p className="text-lg">{debt.debtSubject}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Montant
                </label>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(debt.debtAmount)}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Statut
                </label>
                <div>
                  <Badge
                    variant={debt.status === DebtStatus.PAID ? 'success' : 'secondary'}
                    className="text-sm px-3 py-1"
                  >
                    {debt.status === DebtStatus.PAID ? 'Payé' : 'En attente'}
                  </Badge>
                </div>
              </div>

              {debt.stripePaymentId && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    ID de paiement Stripe
                  </label>
                  <p className="text-sm font-mono">{debt.stripePaymentId}</p>
                </div>
              )}

              <div className="pt-4 border-t space-y-2">
                <p className="text-xs text-muted-foreground">
                  Créé le: {formatDate(debt.createdAt)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Dernière mise à jour: {formatDate(debt.updatedAt)}
                </p>
              </div>
            </div>

            {debt.status === DebtStatus.PENDING && (
              <div className="pt-4">
                <Button
                  onClick={async () => {
                    setIsPaying(true);
                    try {
                      // Create payment session
                      const response = await fetch('/api/payments/create', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          email: debt.email,
                          debtId: debt.id,
                        }),
                      });

                      const result = await response.json();

                      if (!result.success || !result.url) {
                        throw new Error(result.error || 'Failed to create payment session');
                      }

                      // Redirect to Stripe Checkout
                      window.location.href = result.url;
                    } catch (err) {
                      console.error('Payment error:', err);
                      alert(
                        err instanceof Error
                          ? err.message
                          : 'Une erreur est survenue lors de la création de la session de paiement'
                      );
                      setIsPaying(false);
                    }
                  }}
                  className="w-full"
                  size="lg"
                  disabled={isPaying}
                >
                  {isPaying ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner size="sm" />
                      Redirection vers le paiement...
                    </span>
                  ) : (
                    'Payer maintenant'
                  )}
                </Button>
              </div>
            )}

            {debt.status === DebtStatus.PAID && (
              <div className="pt-4">
                <Button
                  className="w-full"
                  size="lg"
                  disabled
                  variant="outline"
                >
                  Déjà payé
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

