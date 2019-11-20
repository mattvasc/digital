export interface User {
    id?: number;
    name: string;
    email: string;
    phone?: string;
    created_at?: Date;
    created_by_user_id?: number;
}

export interface Fingerprint {
    id?: number;
    user_id: number;
    finger: number;
    recorded_at?: Date;
}
