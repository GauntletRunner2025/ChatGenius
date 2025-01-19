create table if not exists joined_channel (
  user_id uuid references auth.users not null,
  channel_id bigint references channel(id) not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, channel_id)
);

-- Add indexes for better query performance
create index if not exists idx_joined_channel_user_id on joined_channel(user_id);
create index if not exists idx_joined_channel_channel_id on joined_channel(channel_id); 