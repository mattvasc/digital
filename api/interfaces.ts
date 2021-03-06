export interface User {
    id?: number;
    name: string;
    email: string;
    phone?: string;
    created_at?: Date;
    created_by_user_id?: number;
}

export interface UserFingers extends User {
    finger?: number[];
}

export interface Fingerprint {
    id?: number;
    user_id: number;
    finger: number;
    recorded_at?: Date;
}

export interface Log {
    id: number;
    date: Date;
    fingerprint_id: number;
    fingerprint?: Fingerprint;
    user?: User;
}
