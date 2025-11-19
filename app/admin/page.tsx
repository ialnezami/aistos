'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Search, Filter, Download, RefreshCw } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

interface Debt {
  id: number;
  name: string;
  email: string;
  debtSubject: string;
  debtAmount: string;
  status: 'PENDING' | 'PAID';
  stripePaymentId: string | null;
  createdAt: string;
  updatedAt: string;
  paymentHistory: Payment[];
}

interface Payment {
  id: number;
  amount: string;
  stripePaymentId: string;
  status: string;
  paidAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const fetchDebts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      const response = await fetch(`/api/admin/debts?${params}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch debts');
      }

      setDebts(result.data);
      setTotalPages(result.pagination.totalPages);
      setTotal(result.pagination.total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const result = await response.json();
        
        if (!result.success) {
          router.push('/admin/login');
          return;
        }
        
        setIsAuthenticated(true);
      } catch (err) {
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDebts();
    }
  }, [page, statusFilter, isAuthenticated]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center items-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDebts();
  };

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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Nom', 'Email', 'Sujet', 'Montant', 'Statut', 'Date de création'];
    const rows = debts.map((debt) => [
      debt.id,
      debt.name,
      debt.email,
      debt.debtSubject,
      debt.debtAmount,
      debt.status,
      debt.createdAt,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `debts_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Administration - Gestion des dettes</h1>
            <p className="text-muted-foreground mt-2">
              Total: {total} dette{total > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
            <Button onClick={fetchDebts} variant="outline" size="sm" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm">
              Déconnexion
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Recherche et filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Rechercher par nom, email ou sujet..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-48">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="PENDING">En attente</option>
                    <option value="PAID">Payé</option>
                  </select>
                </div>
                <Button type="submit" disabled={isLoading}>
                  Rechercher
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Debts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des dettes</CardTitle>
            <CardDescription>
              Page {page} sur {totalPages}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Spinner size="lg" />
              </div>
            ) : debts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Aucune dette trouvée
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">ID</th>
                      <th className="text-left p-4 font-medium">Nom</th>
                      <th className="text-left p-4 font-medium">Email</th>
                      <th className="text-left p-4 font-medium">Sujet</th>
                      <th className="text-left p-4 font-medium">Montant</th>
                      <th className="text-left p-4 font-medium">Statut</th>
                      <th className="text-left p-4 font-medium">Date création</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {debts.map((debt) => (
                      <tr key={debt.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">{debt.id}</td>
                        <td className="p-4 font-medium">{debt.name}</td>
                        <td className="p-4">{debt.email}</td>
                        <td className="p-4">{debt.debtSubject}</td>
                        <td className="p-4 font-semibold">{formatCurrency(debt.debtAmount)}</td>
                        <td className="p-4">
                          <Badge
                            variant={debt.status === 'PAID' ? 'success' : 'secondary'}
                          >
                            {debt.status === 'PAID' ? 'Payé' : 'En attente'}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {formatDate(debt.createdAt)}
                        </td>
                        <td className="p-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/debtor/${encodeURIComponent(debt.email)}`)}
                          >
                            Voir
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                >
                  Précédent
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} sur {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || isLoading}
                >
                  Suivant
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

