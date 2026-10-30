/* Fold Supply · Tidy layout
   Fixes the layout left by the first version of the Fold Supply design-file plugin:
   frames that should hug their content were stuck at a fixed height, so text and
   components spilled out and overlapped. Safe to run more than once. */
const depth = n => { let d = 0; while (n.parent) { d++; n = n.parent; } return d; };
// components that are meant to keep a fixed height: buttons (48 px), the band (84 / 112 px), the closed mobile tab (40 px)
const keepFixed = f => f.type === 'COMPONENT' && (f.name.indexOf('Type=') === 0 || f.name.indexOf('Size=') === 0 || f.name.indexOf('State=Closed') === 0);
const report = [];
async function tidyPage(page) {
  await page.loadAsync();
  // 1. load every font used on the page, so text can be resized
  const texts = page.findAllWithCriteria({ types: ['TEXT'] });
  const seen = new Set(), missing = new Set();
  for (const t of texts) {
    const fonts = t.characters.length ? t.getRangeAllFontNames(0, t.characters.length) : [t.fontName];
    for (const f of fonts) { const k = f.family + '|' + f.style; if (seen.has(k)) continue; seen.add(k); try { await figma.loadFontAsync(f); } catch (e) { missing.add(f.family + ' ' + f.style); } }
  }
  // 2. text grows downwards instead of overflowing
  let t1 = 0;
  for (const t of texts) {
    if (t.hasMissingFont) continue;
    if (t.textAutoResize === 'NONE') { t.textAutoResize = 'HEIGHT'; t1++; }
  }
  // 3. every auto-layout frame hugs its content (deepest first, so parents grow around fixed children)
  const frames = page.findAllWithCriteria({ types: ['FRAME', 'COMPONENT', 'COMPONENT_SET'] });
  frames.sort((a, b) => depth(b) - depth(a));
  let f1 = 0;
  for (const f of frames) {
    if (f.layoutMode === 'NONE' || f.layoutMode === 'GRID') continue;
    if (keepFixed(f)) { // fixed height is right, but the width should hug the label
      if (f.layoutMode === 'HORIZONTAL' && f.name.indexOf('Size=') !== 0 && f.primaryAxisSizingMode !== 'AUTO') { f.primaryAxisSizingMode = 'AUTO'; f1++; }
      continue;
    }
    if (f.layoutMode === 'VERTICAL') { if (f.primaryAxisSizingMode !== 'AUTO') { f.primaryAxisSizingMode = 'AUTO'; f1++; } }
    else if (f.counterAxisSizingMode !== 'AUTO') { f.counterAxisSizingMode = 'AUTO'; f1++; }
    for (const c of f.children) {
      if (c.layoutPositioning === 'ABSOLUTE') continue;
      try {
        if (c.type === 'TEXT' && !c.hasMissingFont && c.layoutSizingVertical === 'FIXED') c.layoutSizingVertical = 'HUG';
        if ((c.type === 'FRAME' || c.type === 'COMPONENT_SET') && c.layoutMode !== 'NONE' && c.layoutSizingVertical === 'FIXED') c.layoutSizingVertical = 'HUG';
      } catch (e) {}
    }
  }
  // 4. variant sets: variants in wrapping rows, wide enough for the widest variant (the desktop band is 1440)
  for (const s of page.findAllWithCriteria({ types: ['COMPONENT_SET'] })) {
    const widest = Math.max(0, ...s.children.map(c => c.width));
    s.layoutMode = 'HORIZONTAL'; s.layoutWrap = 'WRAP'; s.itemSpacing = 32; s.counterAxisSpacing = 32;
    s.paddingTop = s.paddingBottom = s.paddingLeft = s.paddingRight = 32;
    s.resize(Math.max(1296, widest + 64), Math.max(1, s.height));
    s.primaryAxisSizingMode = 'FIXED'; s.counterAxisSizingMode = 'AUTO';
  }
  // 5. stack the top-level boards with clear space between them (the cover keeps its layout)
  if (page.name.indexOf('00') !== 0) {
    const tops = [...page.children].sort((a, b) => a.y - b.y);
    let y = 0; for (const n of tops) { n.x = 0; n.y = y; y += n.height + 160; }
  }
  report.push(page.name + ': ' + f1 + ' frames, ' + t1 + ' texts' + (missing.size ? ' (missing font: ' + [...missing].join(', ') + ')' : ''));
}
(async () => {
  try {
    for (const page of figma.root.children) { figma.notify('Tidying ' + page.name + '…', { timeout: 900 }); await tidyPage(page); }
    console.log(report.join('\n'));
    figma.closePlugin('Tidy done: ' + figma.root.children.length + ' pages');
  } catch (e) { figma.closePlugin('Stopped: ' + (e && e.message ? e.message : e)); }
})();
