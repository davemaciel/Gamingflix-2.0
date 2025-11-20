import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { transactionsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, ExternalLink, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface Invoice {
    id: string;
    amount: number;
    status: 'paid' | 'pending' | 'failed' | 'refunded';
    created_at: string;
    products: Array<{ name: string }>;
    checkout_url?: string;
}

const Invoices = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);

    const [invoices, setInvoices] = useState<Invoice[]>([]);

    const fetchInvoices = async () => {
        try {
            const response = await transactionsApi.getMyTransactions();
            // @ts-ignore
            setInvoices(response.transactions);
        } catch (error) {
            console.error('Error fetching invoices:', error);
            toast({
                title: 'Erro',
                description: 'Não foi possível carregar suas faturas.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchInvoices();
        }
    }, [user]);



    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Pago</Badge>;
            case 'pending':
                return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" /> Pendente</Badge>;
            case 'failed':
                return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> Falhou</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-background">
            <Header onSearch={() => { }} />

            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <FileText className="h-8 w-8" />
                            Minhas Faturas
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Histórico de pagamentos e faturas pendentes
                        </p>
                    </div>


                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Histórico</CardTitle>
                        <CardDescription>
                            Visualize todas as suas transações
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : invoices.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>Nenhuma fatura encontrada.</p>
                                <p className="text-sm mt-2">
                                    As faturas são geradas automaticamente quando você inicia um pagamento.
                                </p>
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Data</TableHead>
                                            <TableHead>Descrição</TableHead>
                                            <TableHead>Valor</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invoices.map((invoice) => (
                                            <TableRow key={invoice.id}>
                                                <TableCell>{formatDate(invoice.created_at)}</TableCell>
                                                <TableCell>
                                                    {invoice.products && invoice.products.length > 0
                                                        ? invoice.products[0].name
                                                        : 'Assinatura GamingFlix'}
                                                </TableCell>
                                                <TableCell>
                                                    {new Intl.NumberFormat('pt-BR', {
                                                        style: 'currency',
                                                        currency: 'BRL'
                                                    }).format(invoice.amount)}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                                                <TableCell className="text-right">
                                                    {invoice.status === 'pending' && (
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            onClick={() => window.open('https://www.ggcheckout.com/checkout/v2/Et6D7G1DJX9xxt6mCOcA', '_blank')}
                                                        >
                                                            <ExternalLink className="mr-2 h-4 w-4" />
                                                            Pagar Agora
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Invoices;
