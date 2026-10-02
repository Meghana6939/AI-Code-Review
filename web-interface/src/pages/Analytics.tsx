import { BarChart3, LineChart, PieChart, TrendingUp, TrendingDown, Activity } from 'lucide-react';

const Analytics = () => {
  const weeklyData = [
    ['Mon', 8], ['Tue', 12], ['Wed', 15], ['Thu', 10], ['Fri', 18], ['Sat', 6], ['Sun', 4],
  ];
  const severity = [
    ['Critical', 23, 'bg-rose-400'], ['High', 45, 'bg-orange-400'], ['Medium', 67, 'bg-amber-300'], ['Low', 99, 'bg-sky-400'],
  ];
  const repos = [
    ['facebook/react', 12, 89, 'up'], ['vercel/next.js', 10, 67, 'up'],
    ['tailwindlabs/tailwindcss', 8, 45, 'down'], ['microsoft/typescript', 7, 34, 'up'], ['nodejs/node', 6, 28, 'down'],
  ];

  return (
    <div className="min-h-screen px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="section-label mb-4"><Activity className="h-3.5 w-3.5" /> Review intelligence</div>
          <h1 className="text-4xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-2 text-slate-400">Understand review volume, issue severity, and repository activity at a glance.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['73', 'Reviews this week', '+12%', BarChart3, 'text-cyan-300'],
            ['416', 'Issues found', '-5%', LineChart, 'text-violet-300'],
            ['5.7', 'Issues per review', '+8%', PieChart, 'text-amber-300'],
          ].map(([value, label, trend, Icon, color]) => (
            <div key={label} className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between"><Icon className={`h-6 w-6 ${color}`} /><span className="flex items-center gap-1 text-xs text-slate-500">{trend === '-5%' ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}{trend}</span></div>
              <div className="mt-6 text-3xl font-bold">{value}</div>
              <div className="mt-1 text-sm text-slate-500">{label}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="glass-card rounded-3xl p-6">
            <h2 className="text-xl font-bold">Weekly activity</h2>
            <p className="mt-1 text-sm text-slate-500">Reviews completed per day</p>
            <div className="mt-8 flex h-56 items-end justify-between gap-3">
              {weeklyData.map(([day, value]) => (
                <div key={day as string} className="flex h-full flex-1 flex-col items-center justify-end gap-3">
                  <span className="text-xs text-slate-500">{value}</span>
                  <div className="w-full max-w-9 rounded-t-lg bg-gradient-to-t from-cyan-500/60 to-indigo-400" style={{ height: `${(Number(value) / 18) * 80}%` }} />
                  <span className="text-xs text-slate-600">{day as string}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-card rounded-3xl p-6">
            <h2 className="text-xl font-bold">Severity distribution</h2>
            <p className="mt-1 text-sm text-slate-500">Issue volume by severity</p>
            <div className="mt-7 space-y-5">
              {severity.map(([name, count, color]) => (
                <div key={name as string}>
                  <div className="mb-2 flex justify-between text-sm"><span className="text-slate-300">{name as string}</span><span>{count}</span></div>
                  <div className="h-2 rounded-full bg-white/[0.06]"><div className={`h-full rounded-full ${color}`} style={{ width: `${(Number(count) / 99) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-6 glass-card overflow-hidden rounded-3xl">
          <div className="border-b border-white/[0.07] p-6"><h2 className="text-xl font-bold">Top repositories</h2><p className="mt-1 text-sm text-slate-500">Repositories generating the most review activity</p></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead><tr className="border-b border-white/[0.06] text-xs uppercase tracking-wider text-slate-600"><th className="px-6 py-4">Repository</th><th>Reviews</th><th>Issues</th><th>Trend</th></tr></thead>
              <tbody>
                {repos.map(([repo, reviews, issues, trend]) => (
                  <tr key={repo as string} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-medium text-white">{repo as string}</td>
                    <td className="text-slate-400">{reviews}</td><td className="text-slate-400">{issues}</td>
                    <td className="py-4"><span className={`inline-flex items-center gap-1 text-sm ${trend === 'up' ? 'text-emerald-300' : 'text-rose-300'}`}>{trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}{trend === 'up' ? 'Increasing' : 'Decreasing'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Analytics;
