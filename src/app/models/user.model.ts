export enum BasicStatus {
    Active = 'Active',
    Inactive = 'Inactive',
}

export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN = 'ADMIN',
    USER = 'USER',
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: string;
    img?: string;
    phoneNumber?: string;
    signature?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedUsers {
    users: User[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
