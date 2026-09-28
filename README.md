# Pelada App

Projeto Next.js completo (App Router + TypeScript + Tailwind + shadcn/ui + Supabase).

## Como rodar

```bash
npm install
cp .env.local.example .env.local   # preencha com as chaves do seu projeto Supabase
npm run dev
```

## Antes de usar

1. Crie um projeto no [supabase.com](https://supabase.com).
2. No SQL Editor do Supabase, rode o conteúdo de `supabase/schema.sql`.
3. Em Project Settings → API, copie a "Project URL" e a "anon public key" para `.env.local`.
4. Para virar super admin, rode no SQL Editor:
   ```sql
   update profiles set is_super_admin = true where id = '<seu-uuid-de-auth.users>';
   ```

## Deploy na Vercel

1. Suba esta pasta para um repositório no GitHub.
2. Importe o repositório na Vercel.
3. Em Environment Variables, adicione `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Deploy.
