/**
 * RangeKeeper Audit File Generator
 * Implements Step 9 of the Audit Spec
 */

async function generateAuditHTML(auditData) {
  console.log('[Audit] 📄 Generating high-fidelity audit HTML...');
  
  // Fetch the template (baked into the extension or fetched from storage)
  // For now, we'll assume the template is a string or reachable via chrome.runtime.getURL
  let template = '';
  try {
    const response = await fetch(chrome.runtime.getURL('audit-template.html'));
    template = await response.text();
  } catch (err) {
    console.error('[Audit] Template fetch failed:', err);
    // Fallback simple template
    template = '<html><body><h1>Audit failed to load template</h1><pre>[JSON_DATA]</pre></body></html>';
  }

  // 1. Prepare Data
  const dateStr = new Date().toLocaleDateString();
  const timestamp = new Date().toLocaleString();
  
  // 2. Perform Replacements
  let html = template
    .replace('[DATE]', dateStr)
    .replace('[TIMESTAMP]', timestamp)
    .replace('[JSON_DATA]', JSON.stringify(auditData));

  // 3. Trigger Download (Step 574)
  const blob = new Blob([html], {type: 'text/html'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const filename = `rangekeeper-massimo-grade-audit-${new Date().toISOString().slice(0,10)}.html`;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log(`[Audit] ✅ Final audit generated: ${filename}`);
  return filename;
}

if (typeof window !== 'undefined') {
  window.generateAuditHTML = generateAuditHTML;
}
