export interface StreamingService {
    id: string;
    name: string;
    logo_url?: string;
    cover_url?: string;
    description?: string;
    checkout_url?: string;
    ggcheckout_product_id?: string; // ID do produto no GGCheckout para vinculação direta
    created_at?: string;
    updated_at?: string;
}

export interface StreamingAccount {
    id: string;
    service_id: string;
    email: string;
    password?: string;
    profiles?: StreamingProfile[];
    created_at?: string;
}

export interface StreamingProfile {
    id: string;
    account_id: string;
    service_id: string;
    name?: string; // Alias para compatibilidade
    profile_name?: string; // Nome real no banco de dados
    email?: string; // Email da conta (denormalizado)
    password?: string; // Senha da conta (denormalizado)
    pin: string;
    status: 'available' | 'assigned';
    assigned_to?: string | null;
    assigned_at?: string | null;
    created_at?: string;
}

export interface UserProfileResponse {
    profile: StreamingProfile;
    account: {
        email: string;
        password: string;
    };
}
