import { ExternalLink } from 'lucide-react'

export function ConfigMissing() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/20 text-2xl font-bold text-accent">
        F
      </div>
      <div className="max-w-md space-y-2">
        <h1 className="text-2xl font-bold text-text-primary">Flowboard</h1>
        <p className="text-sm text-text-secondary">
          Supabase is not configured yet. Copy <code className="text-accent">.env.example</code> to{' '}
          <code className="text-accent">.env.local</code> and add your project URL and anon key.
        </p>
      </div>
      <ol className="max-w-md space-y-2 text-left text-sm text-text-secondary">
        <li>1. Create a free project at supabase.com</li>
        <li>2. Enable Anonymous sign-in under Authentication → Providers</li>
        <li>3. Run <code className="text-accent">supabase/schema.sql</code> in the SQL Editor</li>
        <li>4. Copy your URL and anon key into <code className="text-accent">.env.local</code></li>
        <li>5. Restart the dev server</li>
      </ol>
      <a
        href="https://supabase.com/dashboard"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
      >
        Open Supabase Dashboard
        <ExternalLink size={14} />
      </a>
    </div>
  )
}
