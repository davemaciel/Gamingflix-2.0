import { useState, useEffect } from 'react';
import { usersApi, subscriptionsApi, type User, type SubscriptionPlan } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, UserCog, Calendar, Shield, XCircle, CheckCircle } from 'lucide-react';
import { LoadingOverlay } from '@/components/LoadingOverlay';

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const [editForm, setEditForm] = useState({
    email: '',
    full_name: '',
    whatsapp: '',
    is_founder: false,
  });

  const [subscriptionForm, setSubscriptionForm] = useState({
    plan_id: '',
    duration_months: 1,
  });

  useEffect(() => {
    fetchUsers();
    fetchPlans();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar usuários',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const data = await subscriptionsApi.getPlans();
      setPlans(data);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditForm({
      email: user.email,
      full_name: user.full_name,
      whatsapp: user.whatsapp,
      is_founder: user.is_founder,
    });
    setShowEditDialog(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    try {
      await usersApi.update(editingUser.id, editForm);
      toast({
        title: 'Sucesso!',
        description: 'Usuário atualizado com sucesso',
      });
      setShowEditDialog(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar usuário',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'admin' | 'client') => {
    try {
      await usersApi.updateRole(userId, newRole);
      toast({
        title: 'Sucesso!',
        description: `Role atualizada para ${newRole}`,
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar role',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Tem certeza que deseja deletar o usuário ${userEmail}?`)) return;

    try {
      await usersApi.delete(userId);
      toast({
        title: 'Sucesso!',
        description: 'Usuário deletado com sucesso',
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao deletar usuário',
        variant: 'destructive',
      });
    }
  };

  const handleOpenSubscriptionDialog = (user: User) => {
    setSelectedUser(user);
    setSubscriptionForm({
      plan_id: plans[0]?.id || '',
      duration_months: 1,
    });
    setShowSubscriptionDialog(true);
  };

  const handleCreateSubscription = async () => {
    if (!selectedUser) return;

    try {
      await usersApi.createSubscription(
        selectedUser.id,
        subscriptionForm.plan_id,
        subscriptionForm.duration_months
      );
      toast({
        title: 'Sucesso!',
        description: 'Assinatura criada com sucesso',
      });
      setShowSubscriptionDialog(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar assinatura',
        variant: 'destructive',
      });
    }
  };

  const handleCancelSubscription = async (userId: string) => {
    if (!confirm('Tem certeza que deseja cancelar a assinatura?')) return;

    try {
      await usersApi.cancelSubscription(userId);
      toast({
        title: 'Sucesso!',
        description: 'Assinatura cancelada',
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao cancelar assinatura',
        variant: 'destructive',
      });
    }
  };

  const handleRenewSubscription = async (userId: string) => {
    const months = prompt('Quantos meses deseja renovar?', '1');
    if (!months) return;

    try {
      await usersApi.renewSubscription(userId, parseInt(months));
      toast({
        title: 'Sucesso!',
        description: `Assinatura renovada por ${months} mês(es)`,
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao renovar assinatura',
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>
          <p className="text-muted-foreground">Total: {users.length} usuários</p>
        </div>
        <Input
          placeholder="Buscar por email ou nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{user.full_name || 'Sem nome'}</CardTitle>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-sm text-muted-foreground">{user.whatsapp}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role === 'admin' ? 'Admin' : 'Cliente'}
                  </Badge>
                  {user.is_founder && (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                      Founder
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  {user.has_active_subscription ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Assinatura ativa até {formatDate(user.subscription_expires_at || null)}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>Sem assinatura ativa</span>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditUser(user)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Editar
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateRole(user.id, user.role === 'admin' ? 'client' : 'admin')}
                  >
                    <Shield className="h-4 w-4 mr-1" />
                    {user.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
                  </Button>

                  {user.has_active_subscription ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRenewSubscription(user.id)}
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Renovar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelSubscription(user.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancelar Assinatura
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenSubscriptionDialog(user)}
                    >
                      <UserCog className="h-4 w-4 mr-1" />
                      Criar Assinatura
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteUser(user.id, user.email)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Deletar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de Edição */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input
                id="full_name"
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={editForm.whatsapp}
                onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_founder"
                checked={editForm.is_founder}
                onChange={(e) => setEditForm({ ...editForm, is_founder: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="is_founder">Founder (Acesso Vitalício)</Label>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveUser}>Salvar</Button>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Assinatura */}
      <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Assinatura</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="plan">Plano</Label>
              <Select
                value={subscriptionForm.plan_id}
                onValueChange={(value) => setSubscriptionForm({ ...subscriptionForm, plan_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um plano" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - R$ {plan.price}/mês
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="duration">Duração (meses)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={subscriptionForm.duration_months}
                onChange={(e) => setSubscriptionForm({ ...subscriptionForm, duration_months: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateSubscription}>Criar Assinatura</Button>
              <Button variant="outline" onClick={() => setShowSubscriptionDialog(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
