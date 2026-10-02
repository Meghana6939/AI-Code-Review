import { useState } from 'react';
import { Loader2, AlertCircle, FileText, Bug, Shield, Zap, Download, FileJson, Sparkles, GitBranch, ExternalLink, Copy, ChevronDown, ChevronUp, Filter, Cpu, ArrowRight, BarChart3 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../context/AuthContext';

const Review = () => {
  const { user } = useAuth();
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [jiraIssueKey, setJiraIssueKey] = useState('');
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
        body: JSON.stringify({
          repo_url: repoUrl,
          branch,
          jira_issue_key: jiraIssueKey.trim() || undefined,
        }),
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
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    const background: [number, number, number] = [7, 13, 25];
    const panel: [number, number, number] = [15, 27, 43];
    const foreground: [number, number, number] = [230, 239, 248];
    const muted: [number, number, number] = [145, 163, 184];
    const accent: [number, number, number] = [59, 211, 220];
    let y = 18;

    const paintPage = () => {
      doc.setFillColor(...background);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
    };

    const ensureRoom = (needed: number) => {
      if (y + needed > pageHeight - 18) {
        doc.addPage();
        paintPage();
        y = 18;
      }
    };

    const sectionTitle = (title: string) => {
      ensureRoom(13);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...accent);
      doc.text(title.toUpperCase(), margin, y);
      y += 3;
      doc.setDrawColor(35, 67, 87);
      doc.line(margin, y, pageWidth - margin, y);
      y += 7;
    };

    const paragraph = (value: string) => {
      const lines: string[] = doc.splitTextToSize(value || 'Not available.', contentWidth);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...foreground);
      for (const line of lines) {
        ensureRoom(5);
        doc.text(line, margin, y);
        y += 4.5;
      }
      y += 3;
    };

    const darkTable = (head: string[][], body: string[][], columnStyles?: Record<number, object>) => {
      const firstTablePage = doc.getNumberOfPages();
      autoTable(doc, {
        startY: y,
        head,
        body,
        theme: 'grid',
        margin: { left: margin, right: margin, top: 16, bottom: 16 },
        styles: {
          fillColor: panel,
          textColor: foreground,
          lineColor: [37, 53, 72],
          lineWidth: 0.15,
          fontSize: 8,
          cellPadding: 3,
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: [11, 104, 131],
          textColor: [239, 252, 255],
          fontStyle: 'bold',
        },
        alternateRowStyles: { fillColor: [19, 35, 53] },
        columnStyles,
        willDrawPage: (hookData) => {
          if (hookData.pageNumber > firstTablePage) {
            paintPage();
            doc.setFontSize(7);
            doc.setTextColor(...muted);
            doc.text('LOCAL LLM CODE REVIEW  /  ANALYSIS REPORT', margin, 10);
          }
        },
      });
      y = ((doc as any).lastAutoTable.finalY || y) + 9;
    };

    paintPage();
    doc.setFillColor(...accent);
    doc.roundedRect(margin, y, 2, 22, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...accent);
    doc.text('LOCAL MODEL  /  CODE INTELLIGENCE', margin + 7, y + 4);
    doc.setFontSize(22);
    doc.setTextColor(...foreground);
    doc.text('Repository review', margin + 7, y + 13);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...muted);
    doc.text(`${results.repo}  ·  ${results.branch}`, margin + 7, y + 20);
    y += 31;

    const metrics = [
      ['HEALTH', `${calculateHealthScore()}/100`],
      ['FINDINGS', String(results.summary.totalIssues)],
      ['FILES', String(results.summary.filesAnalyzed)],
      ['TECHNOLOGIES', String(results.technologies?.length || 0)],
    ];
    const cardGap = 3;
    const cardWidth = (contentWidth - cardGap * 3) / 4;
    metrics.forEach(([label, value], index) => {
      const x = margin + index * (cardWidth + cardGap);
      doc.setFillColor(...panel);
      doc.setDrawColor(35, 53, 73);
      doc.roundedRect(x, y, cardWidth, 18, 2, 2, 'FD');
      doc.setFontSize(7);
      doc.setTextColor(...muted);
      doc.text(label, x + 3, y + 6);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...foreground);
      doc.text(value, x + 3, y + 13.5);
    });
    y += 26;

    sectionTitle('Report details');
    darkTable(
      [['Repository', 'Branch', 'Generated', 'Inference']],
      [[results.repo, results.branch, new Date().toLocaleString(), 'Ollama · llama3.2']],
    );

    sectionTitle('Executive summary');
    paragraph(results.repository_overview || 'Repository overview not available.');
    paragraph(results.review_summary || 'Review summary not available.');

    sectionTitle('Jira requirements');
    const jiraIssue = results.jira_issue;
    if (jiraIssue?.status === 'found') {
      darkTable(
        [['Issue', 'Title', 'Description', 'Jira link']],
        [[jiraIssue.key || '—', jiraIssue.title || '—', jiraIssue.description || 'No description provided.', jiraIssue.url || '—']],
        { 0: { cellWidth: 20 }, 1: { cellWidth: 38 }, 2: { cellWidth: 82 }, 3: { cellWidth: 40 } },
      );
    } else {
      const jiraStatus = jiraIssue?.key
        ? `${jiraIssue.key} · ${jiraIssue.message || jiraIssue.status}`
        : 'No Jira issue was associated with this review.';
      paragraph(jiraStatus);
    }

    sectionTitle('Severity analytics');
    ensureRoom(57);
    const chartY = y;
    doc.setFillColor(...panel);
    doc.setDrawColor(35, 53, 73);
    doc.roundedRect(margin, chartY, contentWidth, 53, 2, 2, 'FD');
    const severityRows = [
      ['Critical', results.summary.critical, [251, 113, 133] as [number, number, number]],
      ['High', results.summary.high, [251, 146, 60] as [number, number, number]],
      ['Medium', results.summary.medium, [250, 204, 21] as [number, number, number]],
      ['Low', results.summary.low, [56, 189, 248] as [number, number, number]],
    ];
    const maxSeverityCount = Math.max(1, ...severityRows.map(([, count]) => Number(count)));
    severityRows.forEach(([label, count, color], index) => {
      const rowY = chartY + 11 + index * 10;
      const barX = margin + 34;
      const barWidth = contentWidth - 48;
      doc.setFontSize(8);
      doc.setTextColor(...muted);
      doc.text(String(label), margin + 4, rowY + 2);
      doc.setFillColor(34, 49, 67);
      doc.roundedRect(barX, rowY - 1, barWidth, 4, 1.5, 1.5, 'F');
      if (Number(count) > 0) {
        doc.setFillColor(...color);
        doc.roundedRect(barX, rowY - 1, Math.max(2, (Number(count) / maxSeverityCount) * barWidth), 4, 1.5, 1.5, 'F');
      }
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...foreground);
      doc.text(String(count), pageWidth - margin - 5, rowY + 2, { align: 'right' });
    });
    y += 61;

    sectionTitle('Analysis flow');
    ensureRoom(30);
    const flowNodes = [
      ['Repository', 'GitHub source'],
      ['Code context', `${results.summary.filesAnalyzed} files`],
      ['Jira context', jiraIssue?.status === 'found' ? jiraIssue.key : 'Optional'],
      ['Local model', 'Ollama'],
      ['Report', `${results.summary.totalIssues} findings`],
    ];
    const nodeGap = 5;
    const nodeWidth = (contentWidth - nodeGap * (flowNodes.length - 1)) / flowNodes.length;
    flowNodes.forEach(([title, detail], index) => {
      const x = margin + index * (nodeWidth + nodeGap);
      doc.setFillColor(...panel);
      doc.setDrawColor(40, 92, 111);
      doc.roundedRect(x, y, nodeWidth, 19, 2, 2, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...foreground);
      doc.text(String(title), x + nodeWidth / 2, y + 7, { align: 'center', maxWidth: nodeWidth - 3 });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(...muted);
      doc.text(String(detail), x + nodeWidth / 2, y + 13, { align: 'center', maxWidth: nodeWidth - 3 });
      if (index < flowNodes.length - 1) {
        const arrowStart = x + nodeWidth + 0.5;
        const arrowEnd = arrowStart + nodeGap - 1;
        doc.setDrawColor(...accent);
        doc.line(arrowStart, y + 9.5, arrowEnd, y + 9.5);
        doc.line(arrowEnd - 1.2, y + 8.3, arrowEnd, y + 9.5);
        doc.line(arrowEnd - 1.2, y + 10.7, arrowEnd, y + 9.5);
      }
    });
    y += 27;

    if (results.technologies?.length) {
      sectionTitle('Detected technologies');
      darkTable([['Technologies']], [[results.technologies.join('  ·  ')] ]);
    }

    sectionTitle('Findings register');
    if (!results.issues.length) {
      paragraph('No issues were reported by the model for this analysis.');
    } else {
      darkTable(
        [['Severity', 'Category', 'Finding', 'Recommendation']],
        results.issues.map((issue: any) => [
          String(issue.severity || '—').toUpperCase(),
          issue.category || 'General',
          issue.message || 'No finding details provided.',
          issue.suggestion || 'No recommendation provided.',
        ]),
        { 0: { cellWidth: 22 }, 1: { cellWidth: 30 }, 2: { cellWidth: 62 }, 3: { cellWidth: 66 } },
      );
    }

    const pageCount = doc.getNumberOfPages();
    for (let page = 1; page <= pageCount; page += 1) {
      doc.setPage(page);
      doc.setDrawColor(35, 53, 73);
      doc.line(margin, pageHeight - 13, pageWidth - margin, pageHeight - 13);
      doc.setFontSize(7);
      doc.setTextColor(...muted);
      doc.text('PRIVATE LOCAL ANALYSIS  ·  VERIFY FINDINGS BEFORE ACTION', margin, pageHeight - 8);
      doc.text(`${page} / ${pageCount}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
    }

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
  const severityRows = results ? [
    { label: 'Critical', count: results.summary.critical, bar: 'bg-rose-400', text: 'text-rose-300' },
    { label: 'High', count: results.summary.high, bar: 'bg-orange-400', text: 'text-orange-300' },
    { label: 'Medium', count: results.summary.medium, bar: 'bg-amber-300', text: 'text-amber-200' },
    { label: 'Low', count: results.summary.low, bar: 'bg-sky-400', text: 'text-sky-300' },
  ] : [];
  const maxSeverityCount = Math.max(1, ...severityRows.map((row: any) => row.count));
  const workflowSteps = results ? [
    { title: 'Repository', detail: 'GitHub source' },
    { title: 'Code context', detail: `${results.summary.filesAnalyzed} files analyzed` },
    { title: 'Jira context', detail: results.jira_issue?.status === 'found' ? results.jira_issue.key : 'Optional requirement link' },
    { title: 'Local model', detail: 'Ollama · llama3.2' },
    { title: 'Review report', detail: `${results.summary.totalIssues} findings` },
  ] : [];

  return (
    <div className="min-h-screen px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="section-label mb-4"><Sparkles className="h-3.5 w-3.5" /> Repository intelligence</div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Repository Review</h1>
          <p className="mt-3 max-w-2xl text-slate-400">Connect a GitHub repository and turn raw code into structured findings your team can actually use.</p>
        </div>

        <div className="glass-card rounded-3xl p-5 sm:p-7">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_180px_190px]">
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
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Jira issue <span className="text-slate-500">(optional)</span></label>
              <input
                className="input-field"
                placeholder="PROJ-123"
                value={jiraIssueKey}
                onChange={(e) => setJiraIssueKey(e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">Leave blank to detect an issue key from the branch name. Jira credentials stay on the API server.</p>

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
            {results.jira_issue && results.jira_issue.status !== 'not_detected' && (
              <section className="glass-card rounded-3xl p-5 sm:p-7">
                <div className="mb-4 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-300/[0.08] text-cyan-300"><FileText className="h-5 w-5" /></div>
                  <div>
                    <h2 className="text-xl font-bold">Jira requirements</h2>
                    <p className="text-sm text-slate-500">Issue context supplied to the local model</p>
                  </div>
                </div>
                {results.jira_issue.status === 'found' ? (
                  <div>
                    <a href={results.jira_issue.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-semibold text-cyan-200 hover:text-cyan-100">
                      {results.jira_issue.key}: {results.jira_issue.title}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    {results.jira_issue.description && (
                      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-300">{results.jira_issue.description}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-amber-200">{results.jira_issue.message || `Jira issue ${results.jira_issue.key} could not be loaded.`}</p>
                )}
              </section>
            )}

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

            <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
              <div className="glass-card rounded-3xl p-5 sm:p-7">
                <div className="mb-6 flex items-center justify-between gap-3">
                  <div>
                    <div className="section-label mb-3"><BarChart3 className="h-3.5 w-3.5" /> Findings profile</div>
                    <h2 className="text-xl font-bold">Severity analytics</h2>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{results.summary.totalIssues}</div>
                    <div className="text-xs text-slate-500">total findings</div>
                  </div>
                </div>
                <div className="space-y-5" role="img" aria-label="Horizontal bar chart of findings by severity">
                  {severityRows.map((row: any) => (
                    <div key={row.label}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className={row.text}>{row.label}</span>
                        <span className="font-semibold text-slate-200">{row.count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
                        <div
                          className={`h-full rounded-full ${row.bar} transition-[width] duration-700`}
                          style={{ width: `${(row.count / maxSeverityCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-5 border-t border-white/[0.07] pt-4 text-xs leading-5 text-slate-500">
                  Counts are model-generated review findings, grouped by reported severity.
                </p>
              </div>

              <div className="glass-card rounded-3xl p-5 sm:p-7">
                <div className="mb-6">
                  <div className="section-label mb-3"><GitBranch className="h-3.5 w-3.5" /> Analysis path</div>
                  <h2 className="text-xl font-bold">From code to report</h2>
                  <p className="mt-1 text-sm text-slate-500">The context used to produce these findings</p>
                </div>
                <div className="flex flex-col gap-2 md:flex-row md:items-stretch">
                  {workflowSteps.map((step: any, index: number) => (
                    <div key={step.title} className="flex min-w-0 flex-1 flex-col items-stretch gap-2 md:flex-row md:items-center">
                      <div className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-slate-950/50 p-3">
                        <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-cyan-300">Step {String(index + 1).padStart(2, '0')}</div>
                        <div className="truncate text-sm font-semibold text-white">{step.title}</div>
                        <div className="mt-1 truncate text-xs text-slate-500" title={step.detail}>{step.detail}</div>
                      </div>
                      {index < workflowSteps.length - 1 && (
                        <ArrowRight aria-hidden="true" className="mx-auto h-4 w-4 shrink-0 rotate-90 text-cyan-300/70 md:rotate-0" />
                      )}
                    </div>
                  ))}
                </div>
                {results.jira_issue?.status === 'found' && (
                  <div className="mt-5 flex items-start gap-3 rounded-xl border border-cyan-300/15 bg-cyan-300/[0.045] p-3">
                    <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold uppercase tracking-wider text-cyan-200">Requirements context attached</div>
                      <div className="mt-1 truncate text-sm text-slate-300">{results.jira_issue.key}: {results.jira_issue.title}</div>
                    </div>
                  </div>
                )}
              </div>
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
