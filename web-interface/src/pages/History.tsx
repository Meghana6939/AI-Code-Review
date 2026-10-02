import { useState, useEffect } from 'react';
import { Search, Calendar, GitBranch, Download, FileText, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ReviewHistoryItem {
  id: number;
  repo: string;
  branch: string;
  date: string;
  issues: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  healthScore: number;
  status: 'completed' | 'in-progress' | 'failed';
  data?: any;
}

const History = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [history, setHistory] = useState<ReviewHistoryItem[]>([]);

  useEffect(() => {
    if (user) {
      const reviewHistoryKey = `review_history_${user.email}`;
      const savedHistory = JSON.parse(localStorage.getItem(reviewHistoryKey) || '[]');
      setHistory(savedHistory);
    }
  }, [user]);

  const filteredHistory = history.filter(item =>
    item.repo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-300';
    if (score >= 60) return 'text-amber-300';
    return 'text-rose-300';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-2.5 py-1 text-xs font-medium text-emerald-300">
            Completed
          </span>
        );
      case 'in-progress':
        return (
          <span className="rounded-full border border-amber-300/15 bg-amber-300/[0.06] px-2.5 py-1 text-xs font-medium text-amber-300">
            In Progress
          </span>
        );
      default:
        return (
          <span className="rounded-full border border-rose-300/15 bg-rose-300/[0.06] px-2.5 py-1 text-xs font-medium text-rose-300">
            Failed
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="section-label mb-4"><Clock className="h-3.5 w-3.5" /> Review history</div>
            <h1 className="text-4xl font-bold tracking-tight">Review History</h1>
            <p className="mt-2 text-slate-400">View and manage your past repository reviews.</p>
          </div>
          <Link to="/review" className="primary-btn w-fit"><FileText className="h-4 w-4" /> New review</Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search repositories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12"
            />
          </div>
        </div>

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center">
            <FileText className="mx-auto h-16 w-16 text-slate-600" />
            <h3 className="mt-4 text-xl font-semibold text-white">No reviews found</h3>
            <p className="mt-2 text-slate-400">
              {searchTerm ? 'Try a different search term.' : 'Start your first repository review to see your history here.'}
            </p>
            {!searchTerm && (
              <Link to="/review" className="primary-btn mt-6 inline-flex">
                <FileText className="h-4 w-4" /> Review Repository
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <article key={item.id} className="glass-card rounded-2xl p-6 transition hover:bg-white/[0.05]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-cyan-300/[0.08] text-cyan-300">
                      <GitBranch className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{item.repo}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <GitBranch className="h-3 w-3" /> {item.branch}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {item.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 lg:gap-8">
                    {/* Health Score */}
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getHealthScoreColor(item.healthScore)}`}>
                        {item.healthScore}
                      </div>
                      <div className="text-xs text-slate-500">Health Score</div>
                    </div>

                    {/* Issue Counts */}
                    <div className="flex gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-rose-300">{item.critical}</div>
                        <div className="text-xs text-slate-500">Critical</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-orange-300">{item.high}</div>
                        <div className="text-xs text-slate-500">High</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-amber-300">{item.medium}</div>
                        <div className="text-xs text-slate-500">Medium</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-sky-300">{item.low}</div>
                        <div className="text-xs text-slate-500">Low</div>
                      </div>
                    </div>

                    {/* Status */}
                    {getStatusBadge(item.status)}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center justify-end gap-2 border-t border-white/[0.07] pt-4">
                  <button className="secondary-btn px-3 py-2 text-sm">
                    <Download className="h-4 w-4" /> Report
                  </button>
                  <Link to="/review" className="secondary-btn px-3 py-2 text-sm">
                    <FileText className="h-4 w-4" /> View Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
