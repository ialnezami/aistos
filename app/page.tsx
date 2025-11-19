import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Search, CreditCard } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">Aistos Debt Payment</h1>
          <p className="text-lg text-muted-foreground">
            Application de paiement de dettes
          </p>
        </div>

        {/* Tasks Menu */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Task 1: Import des dettes */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl">1. Import des dettes</CardTitle>
              </div>
              <CardDescription>
                Importer le CSV et créer les enregistrements correspondants dans une base de données.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/import">
                <Button className="w-full" size="lg">
                  Importer CSV
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Task 2: Page débiteur */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Search className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-xl">2. Page débiteur</CardTitle>
              </div>
              <CardDescription>
                Consulter les informations de la dette : identité, intitulé, montant, statut.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/debtor">
                <Button className="w-full" size="lg" variant="default">
                  Rechercher une dette
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Task 3: Paiement Stripe */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-xl">3. Paiement Stripe</CardTitle>
              </div>
              <CardDescription>
                Payer une dette via Stripe (environnement test). Le paiement est accessible depuis la page débiteur.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/debtor">
                <Button className="w-full" size="lg" variant="outline">
                  Accéder au paiement
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="text-center text-sm text-muted-foreground mt-8">
          <p>
            Utilisez le menu ci-dessus pour accéder aux différentes fonctionnalités de l'application.
          </p>
        </div>
      </div>
    </main>
  );
}
