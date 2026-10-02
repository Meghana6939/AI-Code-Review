import { ArrowUpRight, Code2, Cpu, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const pageLinks = [
  { label: 'Home', to: '/' },
  { label: 'Review', to: '/review' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Analytics', to: '/analytics' },
  { label: 'History', to: '/history' },
];

const Footer = () => (
  <footer className="border-t border-white/[0.08] bg-slate-950/90">
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_auto] lg:px-8">
      <div className="max-w-xs">
        <Link to="/" className="inline-flex items-center gap-3 text-white">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-300/[0.08]">
            <Code2 className="h-5 w-5 text-cyan-300" />
          </span>
          <span className="font-semibold">AI Code Reviewer</span>
        </Link>
        <p className="mt-4 text-sm leading-6 text-slate-400">
          Local-model code insights, organized for your next great commit.
        </p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-3 py-1.5 text-xs text-emerald-200">
          <Cpu className="h-3.5 w-3.5" />
          Built for local inference
        </div>
      </div>

      <nav aria-label="Footer pages">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Explore</h2>
        <ul className="space-y-3">
          {pageLinks.map((page) => (
            <li key={page.to}>
              <Link to={page.to} className="text-sm text-slate-300 transition hover:text-cyan-200">
                {page.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <nav aria-label="Account pages">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Account</h2>
        <ul className="space-y-3">
          <li><Link to="/login" className="text-sm text-slate-300 transition hover:text-cyan-200">Sign in</Link></li>
          <li><Link to="/signup" className="text-sm text-slate-300 transition hover:text-cyan-200">Create account</Link></li>
        </ul>
      </nav>

      <div className="md:justify-self-end">
        <button
          type="button"
          disabled
          className="flex min-w-52 cursor-not-allowed items-center gap-3 rounded-xl border border-cyan-300/20 bg-cyan-300/[0.06] px-4 py-3 text-left opacity-80"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-cyan-300/10 text-cyan-200">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-medium text-white">Model controls</span>
            <span className="mt-0.5 block text-xs text-slate-400">Coming soon</span>
          </span>
          <ArrowUpRight className="h-4 w-4 text-cyan-200/70" />
        </button>
        <p className="mt-3 text-xs text-slate-500">Choose a model and tune review settings.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
