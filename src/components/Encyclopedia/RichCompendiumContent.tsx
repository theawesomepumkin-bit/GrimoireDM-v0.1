import React from 'react';
import { LibraryEntry } from '../../types.ts';
import { CrossReferenceIndex } from '../../utils/importer.ts';
import { getSourcebookFullName } from '../../data/seedData.ts';

interface RichCompendiumContentProps {
  content: string;
  activeEntry?: LibraryEntry | null;
  crossRefIndex?: CrossReferenceIndex;
  onSelectEntry?: (entry: LibraryEntry) => void;
  className?: string;
}

/**
 * Renders inline markdown (**bold**, ***bold-italic***, *italic*) and
 * 5etools wiki-links [[Target|Source|Display]] as interactive buttons.
 */
export function renderInlineWithLinks(
  text: string,
  keyPrefix: string,
  activeEntry?: LibraryEntry | null,
  crossRefIndex?: CrossReferenceIndex,
  onSelectEntry?: (entry: LibraryEntry) => void
): React.ReactNode[] {
  if (!text) return [];

  // Tokenize [[target|source|display]], ***bolditalic***, **bold**, *italic*
  const tokenRegex = /(\[\[[^\]]+\]\]|\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*\n]+\*)/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    const tokenKey = `${keyPrefix}_${match.index}`;

    if (token.startsWith('[[') && token.endsWith(']]')) {
      const inner = token.slice(2, -2);
      const parts = inner.split('|');
      const rawTarget = (parts[0] || '').trim();
      const rawSource = (parts[1] || '').trim();
      const displayText = (parts[2] || rawTarget).trim();

      const resolved =
        crossRefIndex && rawTarget
          ? crossRefIndex.resolveLink(rawTarget, rawSource, activeEntry?.source)
          : undefined;

      if (resolved && onSelectEntry && (!activeEntry || resolved.id !== activeEntry.id)) {
        const srcTitle = resolved.source
          ? `${resolved.source} — ${getSourcebookFullName(resolved.source)}`
          : 'Compendium';
        nodes.push(
          <button
            key={tokenKey}
            type="button"
            onClick={e => {
              e.stopPropagation();
              onSelectEntry(resolved);
            }}
            title={`Open ${resolved.name} (${srcTitle})`}
            className="text-amber-400 hover:text-amber-300 underline decoration-amber-500/45 hover:decoration-amber-300 underline-offset-2 font-medium transition-colors inline cursor-pointer text-left"
          >
            {displayText}
          </button>
        );
      } else {
        nodes.push(
          <span key={tokenKey} className="text-amber-200/90 font-medium">
            {displayText}
          </span>
        );
      }
    } else if (token.startsWith('***') && token.endsWith('***')) {
      const inner = token.slice(3, -3);
      nodes.push(
        <strong key={tokenKey} className="font-bold italic text-amber-300">
          {renderInlineWithLinks(inner, `${tokenKey}_bi`, activeEntry, crossRefIndex, onSelectEntry)}
        </strong>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      const inner = token.slice(2, -2);
      nodes.push(
        <strong key={tokenKey} className="font-semibold text-slate-100">
          {renderInlineWithLinks(inner, `${tokenKey}_b`, activeEntry, crossRefIndex, onSelectEntry)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      const inner = token.slice(1, -1);
      nodes.push(
        <em key={tokenKey} className="italic text-slate-300">
          {renderInlineWithLinks(inner, `${tokenKey}_i`, activeEntry, crossRefIndex, onSelectEntry)}
        </em>
      );
    } else {
      nodes.push(token);
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

export const RichCompendiumContent: React.FC<RichCompendiumContentProps> = ({
  content,
  activeEntry,
  crossRefIndex,
  onSelectEntry,
  className = '',
}) => {
  if (!content) return null;

  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      blocks.push(<div key={`sp_${i}`} className="h-2" />);
      i++;
      continue;
    }

    // Check if start of a Markdown table
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 2) {
      const tableLines: string[] = [];
      const startIdx = i;
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      const parsedRows = tableLines
        .filter(tl => !/^\|[\s:|-]+\|$/.test(tl))
        .map(tl =>
          tl
            .replace(/^\||\|$/g, '')
            .split('|')
            .map(cell => cell.trim())
        );

      if (parsedRows.length > 0) {
        const headerRow = parsedRows[0];
        const bodyRows = parsedRows.slice(1);
        blocks.push(
          <div
            key={`tbl_${startIdx}`}
            className="my-3 overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/70"
          >
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/90 text-amber-400 font-semibold">
                  {headerRow.map((cell, cIdx) => (
                    <th key={cIdx} className="px-3 py-2 whitespace-nowrap">
                      {renderInlineWithLinks(
                        cell,
                        `th_${startIdx}_${cIdx}`,
                        activeEntry,
                        crossRefIndex,
                        onSelectEntry
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              {bodyRows.length > 0 && (
                <tbody className="divide-y divide-slate-800/60">
                  {bodyRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-900/40">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3 py-1.5 text-slate-300 align-top">
                          {renderInlineWithLinks(
                            cell,
                            `td_${startIdx}_${rIdx}_${cIdx}`,
                            activeEntry,
                            crossRefIndex,
                            onSelectEntry
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>
        );
      }
      continue;
    }

    // Check headings (#, ##, ###, ####)
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const hText = headingMatch[2].trim();
      blocks.push(
        <h3
          key={`hd_${i}`}
          className={
            level <= 2
              ? 'text-base font-bold text-amber-400 font-fantasy tracking-wide pt-3 pb-1 border-b border-slate-800/80'
              : 'text-sm font-bold text-amber-400/95 font-fantasy tracking-wide pt-2.5 pb-0.5'
          }
        >
          {renderInlineWithLinks(hText, `h_${i}`, activeEntry, crossRefIndex, onSelectEntry)}
        </h3>
      );
      i++;
      continue;
    }

    // Bullet item
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
      const bulletBody = trimmed.replace(/^[-•*]\s+/, '');
      blocks.push(
        <div key={`bl_${i}`} className="pl-3.5 py-0.5 text-slate-200 leading-relaxed flex items-start gap-2">
          <span className="text-amber-500/80 select-none mt-0.5">•</span>
          <div className="flex-1">
            {renderInlineWithLinks(bulletBody, `b_${i}`, activeEntry, crossRefIndex, onSelectEntry)}
          </div>
        </div>
      );
      i++;
      continue;
    }

    blocks.push(
      <p key={`p_${i}`} className="py-0.5 text-slate-300 leading-relaxed">
        {renderInlineWithLinks(trimmed, `p_${i}`, activeEntry, crossRefIndex, onSelectEntry)}
      </p>
    );
    i++;
  }

  return <div className={`space-y-1 ${className}`}>{blocks}</div>;
};
