import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ShieldAlert, LogOut } from 'lucide-react';

export function AdminImpersonationBanner() {
    const [isImpersonating, setIsImpersonating] = useState(false);

    useEffect(() => {
        // Verifica se existe token de backup (significa que está impersonando)
        const backupToken = localStorage.getItem('admin_token_backup');
        setIsImpersonating(!!backupToken);
    }, []);

    const handleReturnToAdmin = () => {
        const backupToken = localStorage.getItem('admin_token_backup');

        if (backupToken) {
            // Restaura o token admin
            apiClient.setToken(backupToken);

            // Remove o backup
            localStorage.removeItem('admin_token_backup');

            // Redireciona para o painel admin
            window.location.href = '/admin';
        }
    };

    if (!isImpersonating) {
        return null;
    }

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500/95 backdrop-blur-sm border-b-2 border-yellow-600 shadow-lg">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ShieldAlert className="h-5 w-5 text-yellow-900" />
                        <div>
                            <p className="font-semibold text-yellow-900 text-sm sm:text-base">
                                Modo Admin - Visualizando como Cliente
                            </p>
                            <p className="text-xs text-yellow-800 hidden sm:block">
                                Você está logado como outro usuário para fins de teste
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={handleReturnToAdmin}
                        variant="outline"
                        size="sm"
                        className="bg-white hover:bg-yellow-50 text-yellow-900 border-yellow-600 font-medium gap-2"
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="hidden sm:inline">Voltar para Admin</span>
                        <span className="sm:hidden">Voltar</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
