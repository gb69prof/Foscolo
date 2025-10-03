
// ── Fix “testo.html”: ricomposizione paragrafi da estrazione PDF ─────────────
function isLikelyHeading(line) {
  const t = line.trim();
  if (t.length < 3 || t.length > 90) return false;
  const letters = t.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ]/g, '');
  const upperRatio = letters ? (letters === letters.toUpperCase() ? 1 : 0) : 0;
  const endsPunct = /[.:;!?]$/.test(t);
  return upperRatio === 1 && !endsPunct;
}

function tidyQuotes(s) {
  return s
    .replace(/(\w)'(\w)/g, '$1’$2')
    .replace(/\.{3}/g, '…');
}

function rebuildParagraphs(section) {
  const lines = Array.from(section.querySelectorAll('p')).map(p => p.textContent.trim());
  const out = [];
  let buf = '';

  const flush = () => {
    const text = tidyQuotes(buf.trim());
    if (text) out.push(`<p>${text}</p>`);
    buf = '';
  };

  for (let i = 0; i < lines.length; i++) {
    const L = lines[i];
    if (!L) { flush(); continue; }
    if (isLikelyHeading(L)) {
      flush();
      out.push(`<h3>${L}</h3>`);
      continue;
    }
    if (buf.endsWith('-')) {
      buf = buf.replace(/-\s*$/, '') + L;
    } else if (buf) {
      buf += ' ' + L;
    } else {
      buf = L;
    }
  }
  flush();
  const title = section.querySelector('h2')?.outerHTML || '';
  section.innerHTML = title + out.join('\n');
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('section.page').forEach(rebuildParagraphs);
  console.log('Fix PDF lines: paragraphs rebuilt.');
});
