create table if not exists joined_channel (
    id bigint generated always as identity primary key,
    user_id uuid references auth.users(id) not null,
    channel_id bigint references channels(id) not null,
    joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, channel_id)
);

-- Add indexes for better query performance
create index if not exists idx_joined_channel_user_id on joined_channel(user_id);
create index if not exists idx_joined_channel_channel_id on joined_channel(channel_id); 