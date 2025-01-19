// Database entity types
export type Channel = {
    id: number;
    inserted_at: string;
    slug: string;
    created_by: string;
};

export type User = {
    id: string;
    email: string;
    // ...other user fields...
}; 