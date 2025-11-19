'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { FileText, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ImportPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [filePath, setFilePath] = useState('./file.csv');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    summary?: {
      totalRows: number;
      validRows: number;
      invalidRows: number;
      created: number;
      updated: number;
    };
    errors?: string[];
  } | null>(null);

  const handleImport = async () => {
    setIsImporting(true);
    setImportResult(null);

    try {
      const response = await fetch('/api/debts/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filePath: filePath || './file.csv',
        }),
      });

      const result = await response.json();

      if (result.success) {
        setImportResult({
          success: true,
          summary: result.summary,
          errors: result.importErrors || result.parseErrors,
        });

        toast({
          title: 'Import réussi !',
          description: `${result.summary.created} dettes créées, ${result.summary.updated} mises à jour.`,
          variant: 'success',
        });
      } else {
        setImportResult({
          success: false,
          errors: result.errors || [result.error || 'Erreur inconnue'],
        });

        toast({
          title: 'Erreur lors de l\'import',
          description: result.error || 'Une erreur est survenue',
          variant: 'destructive',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      setImportResult({
        success: false,
        errors: [errorMessage],
      });

      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              ← Retour à l'accueil
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-2xl">Import des dettes</CardTitle>
                <CardDescription>
                  Importer le CSV et créer les enregistrements correspondants dans la base de données
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Path Input */}
            <div className="space-y-2">
              <label htmlFor="filePath" className="text-sm font-medium">
                Chemin du fichier CSV
              </label>
              <div className="flex gap-2">
                <Input
                  id="filePath"
                  value={filePath}
                  onChange={(e) => setFilePath(e.target.value)}
                  placeholder="./file.csv"
                  disabled={isImporting}
                />
                <Button
                  onClick={handleImport}
                  disabled={isImporting || !filePath}
                  size="default"
                >
                  {isImporting ? (
                    <span className="flex items-center gap-2">
                      <Spinner size="sm" />
                      Import...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Importer
                    </span>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Par défaut, le fichier <code className="bg-muted px-1 rounded">file.csv</code> à la racine du projet sera utilisé.
              </p>
            </div>

            {/* Import Result */}
            {importResult && (
              <div className="space-y-4">
                {importResult.success ? (
                  <Alert variant="success">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Import réussi !</AlertTitle>
                    <AlertDescription>
                      {importResult.summary && (
                        <div className="mt-2 space-y-1">
                          <p>• Total de lignes: {importResult.summary.totalRows}</p>
                          <p>• Lignes valides: {importResult.summary.validRows}</p>
                          <p>• Lignes invalides: {importResult.summary.invalidRows}</p>
                          <p>• Dettes créées: {importResult.summary.created}</p>
                          <p>• Dettes mises à jour: {importResult.summary.updated}</p>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erreur lors de l'import</AlertTitle>
                    <AlertDescription>
                      {importResult.errors && importResult.errors.length > 0 && (
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          {importResult.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {importResult.errors && importResult.errors.length > 0 && importResult.success && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Avertissements</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        {importResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Instructions */}
            <div className="pt-4 border-t space-y-2">
              <h3 className="font-semibold text-sm">Instructions :</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Le fichier CSV doit contenir les colonnes : name, email, debtSubject, debtAmount</li>
                <li>Le fichier par défaut est <code className="bg-muted px-1 rounded">file.csv</code> à la racine du projet</li>
                <li>Les dettes existantes seront mises à jour si l'email correspond</li>
                <li>Les dettes déjà payées ne seront pas modifiées</li>
              </ul>
            </div>

            {/* Navigation */}
            <div className="pt-4 border-t flex gap-2">
              <Link href="/debtor" className="flex-1">
                <Button variant="outline" className="w-full">
                  Rechercher une dette
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  Retour à l'accueil
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

