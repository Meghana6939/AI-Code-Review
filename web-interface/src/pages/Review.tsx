import { useState } from 'react';
import { Loader2, AlertCircle, FileText, Bug, Shield, Zap, Download, FileJson, Sparkles, GitBranch, ExternalLink, Copy, ChevronDown, ChevronUp, Filter, Cpu } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../context/AuthContext';

const Review = () => {
  const { user } = useAuth();
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [expandedIssues, setExpandedIssues] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!repoUrl) {
      setError('Please enter a GitHub repository URL.');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch('http://localhost:8000/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: repoUrl, branch }),
      });

      const data = await response.json();
      if (data.success) {
        setResults(data.data);

        // Save to user's review history if authenticated
        if (user) {
          const reviewHistoryKey = `review_history_${user.email}`;
          const existingHistory = JSON.parse(localStorage.getItem(reviewHistoryKey) || '[]');
          const newReview = {
            id: Date.now(),
            repo: data.data.repo,
            branch: data.data.branch,
            date: new Date().toISOString().split('T')[0],
            issues: data.data.summary.totalIssues,
            critical: data.data.summary.critical,
            high: data.data.summary.high,
            medium: data.data.summary.medium,
            low: data.data.summary.low,
            healthScore: calculateHealthScoreFromData(data.data),
            status: 'completed' as const,
            data: data.data,
          };
          existingHistory.unshift(newReview);
          localStorage.setItem(reviewHistoryKey, JSON.stringify(existingHistory));
        }
      } else {
        setError(data.message || 'Failed to analyze repository.');
      }
    } catch (err) {
      setError('Failed to connect to the analysis server. Make sure the backend is running on port 8000.');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateHealthScoreFromData = (data: any) => {
    const { critical, high, medium, low } = data.summary;
    const total = data.summary.totalIssues;
    if (total === 0) return 100;
    const weightedScore = (critical * 10 + high * 5 + medium * 2 + low * 1);
    const maxPossible = total * 10;
    return Math.max(0, Math.round(100 - (weightedScore / maxPossible) * 100));
  };

  const severityStyle = (severity: string) => {
    const styles: Record<string, string> = {
      critical: 'text-rose-300 bg-rose-400/10 border-rose-300/20',
      high: 'text-orange-300 bg-orange-400/10 border-orange-300/20',
      medium: 'text-amber-300 bg-amber-400/10 border-amber-300/20',
      low: 'text-sky-300 bg-sky-400/10 border-sky-300/20',
    };
    return styles[severity?.toLowerCase()] || 'text-slate-300 bg-white/5 border-white/10';
  };

  const categoryIcon = (category: string) => {
    if (category === 'Security') return <Shield className="h-5 w-5" />;
    if (category === 'Performance') return <Zap className="h-5 w-5" />;
    if (category === 'Code Quality') return <FileText className="h-5 w-5" />;
    return <Bug className="h-5 w-5" />;
  };

  const calculateHealthScore = () => {
    if (!results) return 0;
    const { critical, high, medium, low } = results.summary;
    const total = results.summary.totalIssues;
    if (total === 0) return 100;
    const weightedScore = (critical * 10 + high * 5 + medium * 2 + low * 1);
    const maxPossible = total * 10;
    return Math.max(0, Math.round(100 - (weightedScore / maxPossible) * 100));
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard');
  };

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedIssues);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIssues(newExpanded);
  };

  const getFilteredIssues = () => {
    if (!results) return [];
    if (filter === 'all') return results.issues;
    return results.issues.filter((issue: any) => issue.severity === filter);
  };

  const generatePDF = () => {
    if (!results) return;
    const doc = new jsPDF();
    let y = 20;

    // Report Cover
    doc.setFontSize(24);
    doc.setTextColor(30, 120, 150);
    doc.text('AI Code Reviewer Report', 14, y);
    y += 15;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, y);
    y += 20;

    // Repository Info
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text('Repository Information', 14, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Repository: ${results.repo}`, 14, y);
    y += 7;
    doc.text(`Branch: ${results.branch}`, 14, y);
    y += 7;
    doc.text(`Health Score: ${calculateHealthScore()}/100`, 14, y);
    y += 15;

    // Repository Overview
    doc.setFontSize(14);
    doc.setTextColor(30, 120, 150);
    doc.text('Repository Overview', 14, y);
    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    const overviewLines = doc.splitTextToSize(results.repository_overview || 'Not available', 180);
    doc.text(overviewLines, 14, y);
    y += overviewLines.length * 7 + 10;

    // Review Summary
    doc.setFontSize(14);
    doc.setTextColor(30, 120, 150);
    doc.text('Review Summary', 14, y);
    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    const summaryLines = doc.splitTextToSize(results.review_summary || 'Not available', 180);
    doc.text(summaryLines, 14, y);
    y += summaryLines.length * 7 + 10;

    // Technologies
    if (results.technologies && results.technologies.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(30, 120, 150);
      doc.text('Technologies Detected', 14, y);
      y += 10;
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);
      doc.text(results.technologies.join(', '), 14, y);
      y += 15;
    }

    // Repository Statistics
    doc.setFontSize(14);
    doc.setTextColor(30, 120, 150);
    doc.text('Repository Statistics', 14, y);
    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(`Files Analyzed: ${results.summary.filesAnalyzed}`, 14, y);
    y += 7;
    doc.text(`Total Issues: ${results.summary.totalIssues}`, 14, y);
    y += 7;
    doc.text(`Critical: ${results.summary.critical}`, 14, y);
    y += 7;
    doc.text(`High: ${results.summary.high}`, 14, y);
    y += 7;
    doc.text(`Medium: ${results.summary.medium}`, 14, y);
    y += 7;
    doc.text(`Low: ${results.summary.low}`, 14, y);
    y += 15;

    // Severity Summary
    doc.setFontSize(14);
    doc.setTextColor(30, 120, 150);
    doc.text('Severity Summary', 14, y);
    y += 10;

    const severityData = [
      ['Critical', results.summary.critical.toString()],
      ['High', results.summary.high.toString()],
      ['Medium', results.summary.medium.toString()],
      ['Low', results.summary.low.toString()],
    ];
    autoTable(doc, {
      startY: y,
      head: [['Severity', 'Count']],
      body: severityData,
      theme: 'grid',
      headStyles: { fillColor: [30, 120, 150] },
      styles: { fontSize: 10, cellPadding: 3 },
    });
    y = (doc as any).lastAutoTable.finalY + 15;

    // Detailed Issues
    doc.setFontSize(14);
    doc.setTextColor(30, 120, 150);
    doc.text('Detailed Issues', 14, y);
    y += 10;

    const tableData = results.issues.map((issue: any) => [
      issue.category,
      issue.severity,
      issue.message.substring(0, 50) + (issue.message.length > 50 ? '...' : ''),
      issue.suggestion.substring(0, 50) + (issue.suggestion.length > 50 ? '...' : ''),
    ]);
    autoTable(doc, {
      startY: y,
      head: [['Category', 'Severity', 'Issue', 'Suggestion']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [30, 120, 150] },
      styles: { fontSize: 8, cellPadding: 3 },
    });

    doc.save(`${results.repo.replace('/', '-')}-review-report.pdf`);
    showToast('Report downloaded');
  };

  const generateJSON = () => {
    if (!results) return;
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${results.repo.replace('/', '-')}-review-report.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Report downloaded');
  };

  const filteredIssues = getFilteredIssues();

  return (
    <div className="min-h-screen px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="section-label mb-4"><Sparkles className="h-3.5 w-3.5" /> Repository intelligence</div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Repository Review</h1>
          <p className="mt-3 max-w-2xl text-slate-400">Connect a GitHub repository and turn raw code into structured findings your team can actually use.</p>
        </div>

        <div className="glass-card rounded-3xl p-5 sm:p-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_220px]">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">GitHub repository URL</label>
              <div className="relative">
                <GitBranch className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input className="input-field pl-12" placeholder="https://github.com/owner/repository" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Branch</label>
              <input className="input-field" placeholder="main" value={branch} onChange={(e) => setBranch(e.target.value)} />
            </div>
          </div>

          {error && (
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-rose-300/20 bg-rose-400/[0.06] p-3 text-sm text-rose-300">
              <AlertCircle className="h-5 w-5 shrink-0" /> {error}
            </div>
          )}

          <button onClick={handleAnalyze} disabled={isAnalyzing} className="primary-btn mt-5 w-full py-3.5">
            {isAnalyzing ? <><Loader2 className="h-5 w-5 animate-spin" /> Analyzing repository...</> : <><Zap className="h-5 w-5" /> Start analysis</>}
          </button>
        </div>

        {results && (
          <div className="mt-7 space-y-6">
            {/* Repository Overview */}
            <section className="glass-card rounded-3xl p-5 sm:p-7">
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-300/[0.08] text-cyan-300"><Cpu className="h-5 w-5" /></div>
                <div><h2 className="text-2xl font-bold">Repository Overview</h2><p className="text-sm text-slate-500">Understanding the codebase</p></div>
              </div>
              <p className="leading-6 text-slate-300">{results.repository_overview || 'Repository overview not available.'}</p>
            </section>

            {/* Review Summary */}
            <section className="glass-card rounded-3xl p-5 sm:p-7">
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-300/[0.08] text-cyan-300"><FileText className="h-5 w-5" /></div>
                <div><h2 className="text-2xl font-bold">Review Summary</h2><p className="text-sm text-slate-500">Analysis overview</p></div>
              </div>
              <p className="leading-6 text-slate-300">{results.review_summary || 'Review summary not available.'}</p>
            </section>

            {/* Repository Statistics */}
            <section className="glass-card rounded-3xl p-5 sm:p-7">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[.15em] text-cyan-300">Analysis complete</div>
                  <h2 className="mt-1 text-2xl font-bold">Repository Statistics</h2>
                </div>
                <div className="flex gap-2">
                  <button onClick={generatePDF} className="secondary-btn px-3 py-2 text-sm"><Download className="h-4 w-4" /> PDF</button>
                  <button onClick={generateJSON} className="secondary-btn px-3 py-2 text-sm"><FileJson className="h-4 w-4" /> JSON</button>
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {[
                  ['Repository', results.repo],
                  ['Branch', results.branch],
                  ['Files analyzed', results.summary.filesAnalyzed],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/[0.07] bg-slate-950/40 p-4">
                    <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
                    <div className="mt-2 truncate font-semibold text-white">{value}</div>
                  </div>
                ))}
              </div>

              {/* Health Score */}
              <div className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-slate-500">Repository Health Score</div>
                    <div className="mt-2 text-3xl font-bold text-cyan-300">{calculateHealthScore()}/100</div>
                  </div>
                  <div className="h-16 w-16 rounded-full border-4 border-cyan-300/20 flex items-center justify-center">
                    <span className="text-lg font-bold text-cyan-300">{calculateHealthScore()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
                {[
                  ['Total', results.summary.totalIssues, 'text-white'],
                  ['Critical', results.summary.critical, 'text-rose-300'],
                  ['High', results.summary.high, 'text-orange-300'],
                  ['Medium', results.summary.medium, 'text-amber-300'],
                  ['Low', results.summary.low, 'text-sky-300'],
                ].map(([label, value, color]) => (
                  <div key={label} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                    <div className={`text-2xl font-bold ${color}`}>{value}</div>
                    <div className="mt-1 text-xs text-slate-500">{label}</div>
                  </div>
                ))}
              </div>

              {/* Technologies */}
              {results.technologies && results.technologies.length > 0 && (
                <div className="mt-6">
                  <div className="text-xs uppercase tracking-wider text-slate-500 mb-3">Technologies Detected</div>
                  <div className="flex flex-wrap gap-2">
                    {results.technologies.map((tech: string, idx: number) => (
                      <span key={idx} className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.08] px-3 py-1 text-sm text-cyan-300">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Issues with Filtering */}
            <section className="glass-card rounded-3xl p-5 sm:p-7">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-300/[0.08] text-cyan-300"><Bug className="h-5 w-5" /></div>
                  <div><h2 className="text-2xl font-bold">Issues Found</h2><p className="text-sm text-slate-500">Prioritized findings from the analysis</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-500" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/40"
                  >
                    <option value="all">All Issues</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {filteredIssues.length === 0 ? (
                  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-8 text-center">
                    <p className="text-slate-400">No issues found for the selected filter.</p>
                  </div>
                ) : (
                  filteredIssues.map((issue: any) => (
                    <article key={issue.id} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 transition hover:bg-white/[0.04]">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex gap-3">
                          <div className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${severityStyle(issue.severity)}`}>
                            {categoryIcon(issue.category)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{issue.category}</h3>
                            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500"><ExternalLink className="h-3 w-3" /> {issue.file}:{issue.line}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`w-fit rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${severityStyle(issue.severity)}`}>{issue.severity}</span>
                          <button
                            onClick={() => toggleExpand(issue.id)}
                            className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-slate-400 hover:bg-white/[0.08] hover:text-white"
                          >
                            {expandedIssues.has(issue.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <p className="mt-4 leading-6 text-slate-300">{issue.message}</p>
                      {expandedIssues.has(issue.id) && (
                        <div className="mt-4 space-y-3">
                          <div className="rounded-xl border border-cyan-300/10 bg-cyan-300/[0.04] p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-xs font-semibold uppercase tracking-wider text-cyan-300">Recommendation</div>
                              <button
                                onClick={() => copyToClipboard(issue.suggestion)}
                                className="rounded border border-white/10 bg-white/[0.04] p-1.5 text-slate-400 hover:bg-white/[0.08] hover:text-white"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                            <p className="mt-1 text-sm leading-6 text-slate-300">{issue.suggestion}</p>
                          </div>
                        </div>
                      )}
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div className="fixed bottom-4 right-4 rounded-xl border border-cyan-300/20 bg-cyan-300/[0.08] px-4 py-3 text-sm text-cyan-300 shadow-lg">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
};

export default Review;
