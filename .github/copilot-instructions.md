The supabase file is at src/supabase.ts
This a react app.
Supabase backend.
Project goal is a slack clone with Zen-desk style features.
You have the power and information to create new files. If you can imagine the path, you're probably right, so believe in yourself and go ahead and create the file.
Since this is a TypeScript project, should use tsx and replace jsx
There is an environment file with keys, even if you can't see it.
When using TypeScript with React, always include the React import in files that use JSX/TSX syntax or React types: `import React from 'react'`
When solving bugs, append a line to .github/copilot-instructions.md which contains prompt information so the bug is pre-empted next time. In other words, you are free to add to your own context.

When using Supabase authentication methods, ensure return types match Supabase's actual return types. For example, signOut returns Promise<{ error: AuthError | null }> not Promise<void>.

## Database Schema Requirements
- The public.channel table must exist with columns:
  - id: bigint (identity, primary key)
  - inserted_at: timestamp with time zone (default: current UTC time)
  - slug: text (unique)
  - created_by: uuid (references auth.users)
- Row Level Security (RLS) must be enabled on the channel table
- Authenticated users should have read access to all channels
- Authenticated users should be able to create new channels

## Routing Setup
- Ensure React Router is properly configured in App.tsx
- All route components should be placed in the src/pages directory
- The root route ("/") should always render the Home component
- Ensure the Channels list is included in the Sidebar layout.

- When adding new features, ensure the database schema, Supabase functions, React components, and routing are updated accordingly.
- When adding direct messages, ensure they are displayed on the Profile page.
- ProfilePage.tsx: Ensure Supabase client is imported and used in the handleSendMessage function to avoid ReferenceError.

