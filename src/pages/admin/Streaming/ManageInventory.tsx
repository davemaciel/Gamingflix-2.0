import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { streamingApi } from '@/lib/api';
import { StreamingAccount, StreamingProfile, StreamingService } from '@/types/streaming';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, CheckCircle, XCircle } from 'lucide-react';

export const ManageInventory = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { toast } = useToast();
    const [service, setService] = useState<StreamingService | null>(null);
    const [accounts, setAccounts] = useState<StreamingAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddAccount, setShowAddAccount] = useState(false);
    const [accountForm, setAccountForm] = useState({
        email: '',
        password: '',
        profiles: [{ name: '', pin: '' }],
    });

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const [serviceData, accountsData] = await Promise.all([
                streamingApi.getServiceById(id!),
                streamingApi.getAccountsByService(id!),
            ]);
            setService(serviceData);
            setAccounts(accountsData);
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Falha ao carregar dados',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddProfile = () => {
        setAccountForm({
            ...accountForm,
            profiles: [...accountForm.profiles, { name: '', pin: '' }],
        });
    };

    const handleRemoveProfile = (index: number) => {
        const newProfiles = accountForm.profiles.filter((_, i) => i !== index);
        setAccountForm({ ...accountForm, profiles: newProfiles });
    };

    const handleSubmitAccount = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await streamingApi.createAccount({
                service_id: id!,
                email: accountForm.email,
                password: accountForm.password,
                profiles: accountForm.profiles,
            } as any);

            toast({ title: 'Sucesso', description: 'Conta adicionada' });
            setShowAddAccount(false);
            setAccountForm({ email: '', password: '', profiles: [{ name: '', pin: '' }] });
            loadData();
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Falha ao adicionar conta',
                variant: 'destructive',
            });
        }
    };

    const getTotalProfiles = () => {
        return accounts.reduce((sum, acc) => sum + (acc.profiles?.length || 0), 0);
    };

    const getAvailableProfiles = () => {
        return accounts.reduce(
            (sum, acc) => sum + (acc.profiles?.filter((p) => p.status === 'available').length || 0),
            0
        );
    };

    if (loading) return <div>Carregando...</div>;

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => navigate('/admin/streaming')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>

            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{service?.name}</h2>
                    <p className="text-muted-foreground">
                        {getAvailableProfiles()} perfis disponíveis de {getTotalProfiles()} totais
                    </p>
                </div>
                <Button onClick={() => setShowAddAccount(!showAddAccount)}>
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Conta
                </Button>
            </div>

            {showAddAccount && (
                <Card>
                    <CardHeader>
                        <CardTitle>Nova Conta</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmitAccount} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Email da Conta</Label>
                                    <Input
                                        placeholder="email@exemplo.com"
                                        value={accountForm.email}
                                        onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Senha</Label>
                                    <Input
                                        type="password"
                                        placeholder="••••••"
                                        value={accountForm.password}
                                        onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label>Perfis</Label>
                                    <Button type="button" size="sm" variant="outline" onClick={handleAddProfile}>
                                        <Plus className="h-4 w-4 mr-1" /> Perfil
                                    </Button>
                                </div>
                                {accountForm.profiles.map((profile, index) => (
                                    <div key={index} className="grid grid-cols-2 gap-2">
                                        <Input
                                            placeholder="Nome do Perfil"
                                            value={profile.name}
                                            onChange={(e) => {
                                                const newProfiles = [...accountForm.profiles];
                                                newProfiles[index].name = e.target.value;
                                                setAccountForm({ ...accountForm, profiles: newProfiles });
                                            }}
                                            required
                                        />
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="PIN"
                                                value={profile.pin}
                                                onChange={(e) => {
                                                    const newProfiles = [...accountForm.profiles];
                                                    newProfiles[index].pin = e.target.value;
                                                    setAccountForm({ ...accountForm, profiles: newProfiles });
                                                }}
                                                required
                                            />
                                            {accountForm.profiles.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemoveProfile(index)}
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit">Salvar Conta</Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowAddAccount(false)}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-4">
                {accounts.map((account) => (
                    <Card key={account.id}>
                        <CardHeader>
                            <CardTitle className="text-lg">{account.email}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {account.profiles?.map((profile) => (
                                    <div
                                        key={profile.id}
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            {profile.status === 'available' ? (
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-red-500" />
                                            )}
                                            <div>
                                                <p className="font-medium">{profile.name}</p>
                                                <p className="text-sm text-muted-foreground">PIN: {profile.pin}</p>
                                            </div>
                                        </div>
                                        <Badge variant={profile.status === 'available' ? 'default' : 'secondary'}>
                                            {profile.status === 'available' ? 'Disponível' : 'Atribuído'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};
