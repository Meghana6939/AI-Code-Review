import { TrendingUp, CheckCircle2, AlertTriangle, FileText, GitBranch, ArrowUpRight, Activity, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

const Dashboard = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    reposReviewed: 0,
    issuesFound: 0,
    reportsGenerated: 0,
  });

  useEffect(() => {
    if (user) {
      const reviewHistoryKey = `review_history_${user.email}`;
      const savedHistory = JSON.parse(localStorage.getItem(reviewHistoryKey) || '[]');
      setReviews(savedHistory.slice(0, 3)); // Show last 3 reviews

      // Calculate stats
      const uniqueRepos = new Set(savedHistory.map((r: any) => r.repo));
      const totalIssues = savedHistory.reduce((sum: number, r: any) => sum + r.issues, 0);
      
      setStats({
        totalReviews: savedHistory.length,
        reposReviewed: uniqueRepos.size,
        issuesFound: totalIssues,
        reportsGenerated: savedHistory.length,
      });
    }
  }, [user]);

  const activities = [
    { action: 'Reviewed facebook/react', time: '2 hours ago', icon: FileText, color: 'text-cyan-300' },
    { action: 'Generated PDF report', time: '2 hours ago', icon: Download, color: 'text-emerald-300' },
    { action: 'Reviewed vercel/next.js', time: 'Yesterday', icon: FileText, color: 'text-cyan-300' },
    { action: 'Downloaded report', time: 'Yesterday', icon: Download, color: 'text-emerald-300' },
    { action: 'Reviewed tailwindlabs/tailwindcss', time: '3 days ago', icon: FileText, color: 'text-cyan-300' },
  ];

  return (
    <div className="min-h-screen px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="section-label mb-4"><Activity className="h-3.5 w-3.5" /> Workspace overview</div>
            <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
            <p className="mt-2 text-slate-400">A concise view of repository review activity and issue trends.</p>
          </div>
          <Link to="/review" className="primary-btn w-fit"><FileText className="h-4 w-4" /> New review</Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <FileText className="h-5 w-5 text-cyan-300" />
              <TrendingUp className="h-4 w-4 text-slate-600" />
            </div>
            <div className="mt-5 text-3xl font-bold">{stats.totalReviews}</div>
            <div className="mt-1 text-sm text-slate-400">Total reviews</div>
            <div className="mt-3 text-xs text-slate-600">All time</div>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <GitBranch className="h-5 w-5 text-violet-300" />
              <TrendingUp className="h-4 w-4 text-slate-600" />
            </div>
            <div className="mt-5 text-3xl font-bold">{stats.reposReviewed}</div>
            <div className="mt-1 text-sm text-slate-400">Repositories reviewed</div>
            <div className="mt-3 text-xs text-slate-600">Unique repositories</div>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <AlertTriangle className="h-5 w-5 text-orange-300" />
              <TrendingUp className="h-4 w-4 text-slate-600" />
            </div>
            <div className="mt-5 text-3xl font-bold">{stats.issuesFound}</div>
            <div className="mt-1 text-sm text-slate-400">Issues found</div>
            <div className="mt-3 text-xs text-slate-600">Across all reviews</div>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <Download className="h-5 w-5 text-emerald-300" />
              <TrendingUp className="h-4 w-4 text-slate-600" />
            </div>
            <div className="mt-5 text-3xl font-bold">{stats.reportsGenerated}</div>
            <div className="mt-1 text-sm text-slate-400">Reports generated</div>
            <div className="mt-3 text-xs text-slate-600">PDF + JSON</div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_.9fr]">
          <section className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div><h2 className="text-xl font-bold">Recent reviews</h2><p className="mt-1 text-sm text-slate-500">Latest repository activity</p></div>
              <Link to="/analytics" className="text-sm text-cyan-300 hover:text-cyan-200">Analytics</Link>
            </div>
            <div className="mt-6 space-y-3">
              {reviews.map((review) => (
                <div key={review.repo} className="flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-300/[0.07] text-cyan-300"><GitBranch className="h-5 w-5" /></div>
                    <div>
                      <div className="font-semibold">{review.repo}</div>
                      <div className="mt-1 text-xs text-slate-500">{review.branch} · {review.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-5 sm:justify-end">
                    <div className="text-right"><div className="font-semibold">{review.issues}</div><div className="text-xs text-slate-500">issues</div></div>
                    <span className="rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-2.5 py-1 text-xs font-medium text-emerald-300">Completed</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-card rounded-3xl p-6">
            <h2 className="text-xl font-bold">Issue categories</h2>
            <p className="mt-1 text-sm text-slate-500">Current distribution</p>
            <div className="mt-6 space-y-5">
              {[
                ['Code quality', 67, 29],
                ['Maintainability', 52, 22],
                ['Security', 45, 19],
                ['Performance', 38, 16],
                ['Best practices', 32, 14],
              ].map(([name, count, percentage]) => (
                <div key={name}>
                  <div className="mb-2 flex justify-between text-sm"><span className="text-slate-300">{name}</span><span className="text-slate-500">{count}</span></div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400" style={{ width: `${percentage}%` }} /></div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-6 glass-card rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div><h2 className="text-xl font-bold">Quick actions</h2><p className="mt-1 text-sm text-slate-500">Common workflow shortcuts</p></div>
            <ArrowUpRight className="h-5 w-5 text-slate-600" />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Link to="/review" className="secondary-btn justify-start"><FileText className="h-4 w-4 text-cyan-300" /> New repository review</Link>
            <Link to="/analytics" className="secondary-btn justify-start"><Activity className="h-4 w-4 text-violet-300" /> View analytics</Link>
            <button className="secondary-btn justify-start"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Export reports</button>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="mt-6 glass-card rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div><h2 className="text-xl font-bold">Recent Activity</h2><p className="mt-1 text-sm text-slate-500">Your latest actions</p></div>
            <Link to="/history" className="text-sm text-cyan-300 hover:text-cyan-200">View all</Link>
          </div>
          <div className="mt-6 space-y-4">
            {activities.map((activity, idx) => (
              <div key={idx} className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.05] ${activity.color}`}>
                  <activity.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">{activity.action}</div>
                  <div className="mt-1 text-xs text-slate-500">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
