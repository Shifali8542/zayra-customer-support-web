// src/pages/dashboard/KnowledgeBase.tsx
// Full Knowledge Base page — search, category filter, article list + detail panel.
// All data from /api/v1/support/kb/articles/ — no hardcoded content.

import React, { useState, useEffect, useRef } from 'react';
import { kbApi } from '../../services/api';
import type { KBArticle } from '../../schema';
import Card from '../../components/ui/Card';

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  device: 'Device', billing: 'Billing', clinical: 'Clinical', app: 'App', other: 'Other',
};

const CATEGORY_BADGE: Record<string, string> = {
  device:   'bg-[#E6F1FB] text-[#185FA5]',
  billing:  'bg-[#FAEEDA] text-[#633806]',
  clinical: 'bg-[#FCEBEB] text-[#A32D2D]',
  app:      'bg-[#E1F5EE] text-[#0F6E56]',
  other:    'bg-[var(--surface2)] text-[var(--text3)]',
};

const CATEGORIES = ['', 'device', 'billing', 'clinical', 'app', 'other'];

// ── Sub-components ────────────────────────────────────────────────────────────

const CategoryPill = ({ cat, active, onClick }: { cat: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`
      text-[11px] px-3 py-[3px] rounded-full border font-sans cursor-pointer transition-all
      ${active
        ? 'bg-[#E1F5EE] text-[#0F6E56] border-[#9FE1CB] font-medium'
        : 'bg-transparent text-[var(--text2)] border-[var(--z-border)] hover:border-[#9FE1CB]'
      }
    `}
  >
    {cat === '' ? 'All' : CATEGORY_LABELS[cat] ?? cat}
  </button>
);

const ArticleSkeleton = () => (
  <div className="animate-pulse bg-[var(--surface)] border border-[var(--z-border)] rounded-[10px] p-[12px_14px]">
    <div className="h-[10px] w-16 bg-[var(--surface2)] rounded mb-2" />
    <div className="h-[13px] w-3/4 bg-[var(--surface2)] rounded mb-2" />
    <div className="h-[11px] w-full bg-[var(--surface2)] rounded" />
  </div>
);

const ArticleCard = ({
  article, isSelected, onClick,
}: { article: KBArticle; isSelected: boolean; onClick: () => void }) => (
  <div
    onClick={onClick}
    className={`
      p-[12px_14px] rounded-[10px] border cursor-pointer transition-all
      ${isSelected
        ? 'border-[#1D9E75] bg-[#E1F5EE]'
        : 'border-[var(--z-border)] bg-[var(--surface)] hover:border-[#9FE1CB]'
      }
    `}
  >
    <div className="flex items-center gap-2 mb-1">
      <span className={`text-[10px] px-[6px] py-[2px] rounded-full font-medium ${CATEGORY_BADGE[article.category] ?? CATEGORY_BADGE.other}`}>
        {CATEGORY_LABELS[article.category] ?? article.category}
      </span>
      <span className="text-[10px] text-[var(--text3)]">{article.read_time_minutes} min read</span>
      <span className="text-[10px] text-[var(--text3)] ml-auto">{article.view_count} views</span>
    </div>
    <div className="text-[13px] font-medium text-[var(--text1)] mb-1">{article.title}</div>
    <div className="text-[11px] text-[var(--text2)] leading-relaxed line-clamp-2">{article.summary}</div>
  </div>
);

// Minimal markdown renderer — covers headers, lists, tables, paragraphs
const renderMarkdown = (md: string): React.ReactNode[] => {
  return md.split('\n').map((line, i) => {
    if (line.startsWith('## '))  return <h3 key={i} className="text-[13px] font-medium text-[var(--text1)] mt-3 mb-1">{line.slice(3)}</h3>;
    if (line.startsWith('### ')) return <h4 key={i} className="text-[12px] font-medium text-[var(--text2)] mt-2 mb-[2px]">{line.slice(4)}</h4>;
    if (line.startsWith('| '))   return <div key={i} className="text-[11px] text-[var(--text2)] font-mono py-[2px] border-b border-[var(--z-border)]">{line}</div>;
    if (line.startsWith('- '))   return <li key={i} className="text-[12px] text-[var(--text2)] ml-4 list-disc leading-relaxed">{line.slice(2)}</li>;
    if (/^\d+\. /.test(line))    return <li key={i} className="text-[12px] text-[var(--text2)] ml-4 list-decimal leading-relaxed">{line.replace(/^\d+\. /, '')}</li>;
    if (line.trim() === '')      return <div key={i} className="h-2" />;
    return <p key={i} className="text-[12px] text-[var(--text2)] leading-relaxed">{line}</p>;
  });
};

const ArticleDetail = ({ article, onClose }: { article: KBArticle; onClose: () => void }) => {
  const [copied, setCopied] = useState(false);

  const copySummary = () => {
    navigator.clipboard.writeText(article.summary).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Card className="flex flex-col" padding="p-0">
      {/* Header */}
      <div className="flex items-start gap-2 p-[14px_16px] border-b border-[var(--z-border)]">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] px-[6px] py-[2px] rounded-full font-medium flex-shrink-0 ${CATEGORY_BADGE[article.category] ?? CATEGORY_BADGE.other}`}>
              {CATEGORY_LABELS[article.category] ?? article.category}
            </span>
            <span className="text-[10px] text-[var(--text3)]">{article.read_time_minutes} min · {article.view_count} views</span>
          </div>
          <div className="text-[14px] font-medium text-[var(--text1)]">{article.title}</div>
          <div className="text-[11px] text-[var(--text2)] mt-1 leading-relaxed">{article.summary}</div>
        </div>
        <button
          onClick={onClose}
          className="w-[24px] h-[24px] flex-shrink-0 flex items-center justify-center rounded-[6px] text-[var(--text3)] hover:text-[var(--text1)] hover:bg-[var(--surface2)] cursor-pointer bg-transparent border-none text-[14px] transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-[14px_16px] max-h-[420px]">
        {article.body
          ? <div>{renderMarkdown(article.body)}</div>
          : <p className="text-[12px] text-[var(--text3)]">No content available.</p>
        }
      </div>

      {/* Footer action */}
      <div className="p-[10px_16px] border-t border-[var(--z-border)]">
        <button
          onClick={copySummary}
          className="w-full px-3 py-[7px] text-[12px] font-sans border border-[#9FE1CB] text-[#0F6E56] bg-[#E1F5EE] rounded-[8px] cursor-pointer hover:bg-[#c8f0e4] transition-colors"
        >
          {copied ? 'Copied!' : 'Copy summary to clipboard'}
        </button>
      </div>
    </Card>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const KnowledgeBase: React.FC = () => {
  const [articles,  setArticles]  = useState<KBArticle[]>([]);
  const [selected,  setSelected]  = useState<KBArticle | null>(null);
  const [search,    setSearch]    = useState('');
  const [category,  setCategory]  = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [count,     setCount]     = useState(0);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchArticles = (q: string, cat: string) => {
    setIsLoading(true);
    kbApi.getArticles({ search: q || undefined, category: cat || undefined })
      .then(data => { setArticles(data.results); setCount(data.count); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchArticles('', ''); }, []);

  const handleSearch = (val: string) => {
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchArticles(val, category), 300);
  };

  const handleCategory = (cat: string) => {
    setCategory(cat);
    setSelected(null);
    fetchArticles(search, cat);
  };

  const openArticle = (article: KBArticle) => {
    // Always fetch full detail to get body + increment view_count
    kbApi.getArticle(article.slug)
      .then(full => setSelected(full))
      .catch(() => setSelected(article));
  };

  return (
    <div className="flex gap-4 p-[16px_20px]">

      {/* Left — search + list */}
      <div className="w-full lg:w-[55%] flex flex-col gap-3 min-w-0">

        {/* Search + filter bar */}
        <Card padding="p-[12px_14px]">
          <input
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search articles…"
            className="w-full text-[13px] px-[10px] py-[8px] mb-3 border border-[var(--z-border)] rounded-[8px] bg-[var(--surface2)] text-[var(--text1)] outline-none focus:border-[#9FE1CB] font-sans transition-colors"
          />
          <div className="flex gap-[6px] flex-wrap">
            {CATEGORIES.map(cat => (
              <CategoryPill
                key={cat}
                cat={cat}
                active={category === cat}
                onClick={() => handleCategory(cat)}
              />
            ))}
          </div>
        </Card>

        {/* Article count */}
        {!isLoading && (
          <div className="text-[11px] text-[var(--text3)] px-1">
            {count} article{count !== 1 ? 's' : ''}{search ? ` for "${search}"` : ''}
          </div>
        )}

        {/* List */}
        {isLoading ? (
          <div className="flex flex-col gap-2">
            <ArticleSkeleton /><ArticleSkeleton /><ArticleSkeleton />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-8 text-[13px] text-[var(--text3)]">
            No articles found{search ? ` for "${search}"` : ''}.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {articles.map(a => (
              <ArticleCard
                key={a.slug}
                article={a}
                isSelected={selected?.slug === a.slug}
                onClick={() => openArticle(a)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Right — article detail */}
      <div className="hidden lg:block lg:w-[45%] flex-shrink-0">
        {selected ? (
          <div className="sticky top-0">
            <ArticleDetail article={selected} onClose={() => setSelected(null)} />
          </div>
        ) : (
          <Card className="flex items-center justify-center" padding="p-6">
            <div className="text-center">
              <div className="text-[13px] text-[var(--text3)] mb-1">Select an article to read</div>
              <div className="text-[11px] text-[var(--text3)]">Use the search or category filters on the left</div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBase;