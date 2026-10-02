import { Link } from 'react-router-dom';

import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Code2,
  FileCode2,
  GitBranch,
  LockKeyhole,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

import image from '../assets/image.png';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    icon: Zap,
    title: 'Fast analysis',
    text: 'Parallelized AI processing turns large repository reviews into a focused, readable report.',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy first',
    text: 'Connect the model provider you choose, including local Ollama processing.',
  },
  {
    icon: Search,
    title: 'Deep detection',
    text: 'Surface security, performance, quality, maintainability, and best-practice issues.',
  },
  {
    icon: GitBranch,
    title: 'Git-aware',
    text: 'Review repositories, branches, and recent changes without losing context.',
  },
];

const capabilities = [
  [
    'Multi-language',
    'Python, JavaScript, TypeScript, Java, Go, Rust and more',
    FileCode2,
  ],
  [
    'Branch analysis',
    'Review a specific branch or compare changes between commits',
    GitBranch,
  ],
  [
    'Actionable reports',
    'Export clean PDF and JSON reports for your team',
    BarChart3,
  ],
  [
    'Recent changes',
    'Focus analysis on the latest commits when speed matters',
    Clock3,
  ],
  [
    'Severity levels',
    'Critical, High, Medium and Low issue classification',
    CheckCircle2,
  ],
  [
    'Local processing',
    'Run Ollama locally for control over your code',
    LockKeyhole,
  ],
];

const announcementItems = [
  '🚀 Jira integration coming soon',
  'Connect code reviews directly to your Jira workflow',
  'Turn AI findings into actionable issues',
  'Stay tuned for more powerful issue tracking',
];

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* =========================================
          Scrolling Jira Announcement Banner
          ========================================= */}

      <div className="overflow-hidden border-b border-cyan-300/20 bg-cyan-300/[0.05]">
        <div className="flex min-h-10 items-center overflow-hidden">
          <div className="animate-marquee flex items-center whitespace-nowrap">
            {/* First set */}
            <div className="flex items-center gap-10 px-5">
              {announcementItems.map((item, index) => (
                <div
                  key={`announcement-1-${index}`}
                  className="flex items-center gap-10"
                >
                  <span className="text-sm font-medium text-cyan-300">
                    {item}
                  </span>

                  <span className="text-cyan-300/30">•</span>
                </div>
              ))}
            </div>

            {/* Duplicate set for seamless infinite scrolling */}
            <div
              className="flex items-center gap-10 px-5"
              aria-hidden="true"
            >
              {announcementItems.map((item, index) => (
                <div
                  key={`announcement-2-${index}`}
                  className="flex items-center gap-10"
                >
                  <span className="text-sm font-medium text-cyan-300">
                    {item}
                  </span>

                  <span className="text-cyan-300/30">•</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          Main Home Page
          ========================================= */}

      <div className="overflow-hidden">
        {/* Hero Section */}
        <section className="relative px-4 pb-20 pt-32 sm:px-6 lg:px-8">
          {/* Background Effects */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[8%] top-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-[100px]" />

            <div className="absolute right-[5%] top-32 h-96 w-96 rounded-full bg-indigo-500/10 blur-[120px]" />

            <div className="absolute inset-x-0 top-0 mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent" />
          </div>

          <div className="relative mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              {/* Hero Content */}
              <div>
                {/* Logo Icon */}
                <div className="mb-8 grid h-20 w-20 place-items-center rounded-3xl border border-cyan-300/20 bg-white/[0.04] shadow-2xl shadow-cyan-500/10">
                  <Code2 className="h-10 w-10 text-cyan-300" />
                </div>

                {/* Section Label */}
                <div className="section-label mb-6">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI-powered repository intelligence
                </div>

                {/* Heading */}
                <h1 className="text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                  Code review that finds
                  <span className="text-gradient">
                    {' '}
                    what humans miss.
                  </span>
                </h1>

                {/* Description */}
                <p className="mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
                  Analyze GitHub repositories with structured AI insights,
                  severity-aware findings, and practical recommendations your
                  team can act on.
                </p>

                {/* CTA Buttons */}
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Link to="/review" className="primary-btn">
                    Start a repository review
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link to="/dashboard" className="secondary-btn">
                    View dashboard
                  </Link>

                  {!isAuthenticated && (
                    <Link to="/login" className="secondary-btn">
                      Sign in
                    </Link>
                  )}
                </div>

                {/* Product Stats */}
                <div className="mt-14 grid max-w-4xl grid-cols-2 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] sm:grid-cols-4">
                  {[
                    ['10+', 'Languages'],
                    ['5s', 'Avg. response'],
                    ['100%', 'Private option'],
                    ['PDF + JSON', 'Reports'],
                  ].map(([value, label], index) => (
                    <div
                      key={label}
                      className={`px-5 py-6 ${
                        index
                          ? 'border-l border-white/[0.07]'
                          : ''
                      }`}
                    >
                      <div className="text-2xl font-bold text-white">
                        {value}
                      </div>

                      <div className="mt-1 text-xs uppercase tracking-wider text-slate-500">
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative">
                <div className="absolute -inset-4 rounded-[2rem] bg-cyan-500/5 blur-3xl" />

                <img
                  src={image}
                  alt="AI Code Reviewer dashboard"
                  className="relative w-full rounded-3xl border border-white/[0.08] shadow-2xl shadow-cyan-500/10"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-2xl">
              <div className="section-label mb-4">
                Built for real repositories
              </div>

              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                A cleaner review workflow.
              </h2>

              <p className="mt-3 text-slate-400">
                Less dashboard decoration, more signal. Humanity has suffered
                enough from glowing cards.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {features.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="glass-card glass-card-hover rounded-2xl p-6"
                >
                  <div className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-cyan-300/[0.08] text-cyan-300 ring-1 ring-cyan-300/10">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="font-semibold">{title}</h3>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Capabilities Section */}
        <section className="border-y border-white/[0.06] bg-white/[0.015] px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <div className="section-label mb-4">
                  Everything in one place
                </div>

                <h2 className="text-3xl font-bold sm:text-4xl">
                  From repository URL to useful findings.
                </h2>

                <p className="mt-4 leading-7 text-slate-400">
                  The product already exposes the right building blocks. This
                  redesign simply makes them look like they belong together.
                </p>

                <Link
                  to="/review"
                  className="mt-7 inline-flex items-center gap-2 font-semibold text-cyan-300 transition-colors hover:text-cyan-200"
                >
                  Open reviewer
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {capabilities.map(([title, text, Icon]) => {
                  const CapabilityIcon = Icon as typeof FileCode2;

                  return (
                    <div
                      key={title as string}
                      className="rounded-2xl border border-white/[0.07] bg-slate-900/50 p-5 transition-all duration-300 hover:border-cyan-300/15 hover:bg-slate-900/70"
                    >
                      <CapabilityIcon className="h-5 w-5 text-cyan-300" />

                      <h3 className="mt-4 font-semibold">
                        {title as string}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {text as string}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-cyan-300/10 bg-gradient-to-br from-cyan-400/[0.08] via-white/[0.03] to-indigo-500/[0.08] p-8 text-center sm:p-14">
            <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-cyan-400/10 blur-3xl" />

            <Rocket className="mx-auto h-9 w-9 text-cyan-300" />

            <h2 className="mt-5 text-3xl font-bold sm:text-4xl">
              Make every review more deliberate.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-slate-400">
              Connect a repository, choose a branch, and let the analysis
              surface the details worth your attention.
            </p>

            <Link to="/review" className="primary-btn mt-8">
              Start analysis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;