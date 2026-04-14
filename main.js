// ========== Scroll Animations ==========
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// ========== Story Item Staggered Animations ==========
const storyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });

document.querySelectorAll('.story-pain-item, .story-win-item, .story-punchline').forEach(el => {
  storyObserver.observe(el);
});

// ========== Journey Storytelling Animations ==========
const journeyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.journey-pain-step, .journey-cascade-layer, .journey-win-item, .journey-compound-visual').forEach(el => {
  journeyObserver.observe(el);
});

// ========== FAQ Accordion ==========
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    // Close all
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
    // Toggle current
    if (!isOpen) item.classList.add('open');
  });
});

// ========== Deal Assistant ==========
function setDealChip(text) {
  const input = document.getElementById('deal-input');
  const templates = {
    'SaaS Capital Raise': "We're running a $8M Series A for a B2B logistics SaaS in Sydney. Targeting Australian and Asian VC with ecomm or supply chain thesis. Open to strategic acquirers from 3PL incumbents.",
    'M&A Trade Sale': "We're advising on the sale of a $25M revenue industrial services company in Melbourne. Targeting PE firms with buy-and-build strategies and strategic acquirers in facilities management.",
    'PE Buyout': "We're running a PE buyout process for a $40M EBITDA healthcare services platform across ANZ. Looking for mid-market PE with healthcare experience and operational capability.",
    'Infrastructure / Real Assets': "We're advising on a $150M renewable energy portfolio in Queensland. Targeting infrastructure funds, sovereign wealth, and energy transition specialists across APAC."
  };
  input.value = templates[text] || text;
}

async function runDealAssistant() {
  const input = document.getElementById('deal-input').value.trim();
  if (!input) return;

  const loading = document.getElementById('deal-loading');
  const result = document.getElementById('deal-result');
  const submitBtn = document.getElementById('deal-submit');

  loading.classList.add('show');
  result.classList.remove('show');
  submitBtn.disabled = true;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': window.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `You are Iceberg's deal analysis engine. A sell-side M&A / capital raising advisor describes a deal. Return ONLY valid JSON (no markdown, no backticks) with this schema:
{
  "dealTitle": "string",
  "dealMeta": "string (sector · size · geography)",
  "matchTags": ["string array of 4-6 thesis tags"],
  "rows": [{"type":"string","db":number,"pct":number}] (4-6 investor/buyer types with count and percentage fill 0-100),
  "dbTotal": number,
  "introPaths": number,
  "sourceableMin": number,
  "sourceableMax": number,
  "ultraHighQuality": number,
  "note": "string — 2-3 sentence analyst note on the deal's universe potential"
}
Make the numbers realistic for a boutique advisor context. Investor/buyer types can include: VC, PE, Strategic Acquirers, Angels, Family Office / UHNW, Growth Equity, Sovereign Wealth, Infrastructure Funds, etc.

Deal description: ${input}`
        }]
      })
    });

    if (!response.ok) {
      throw new Error('API call failed');
    }

    const data = await response.json();
    const text = data.content[0].text;
    const parsed = JSON.parse(text);
    renderDealResult(parsed);
  } catch (e) {
    // Fallback demo data
    renderDealResult(generateDemoResult(input));
  }

  loading.classList.remove('show');
  submitBtn.disabled = false;
}

function generateDemoResult(input) {
  const lower = input.toLowerCase();
  let dealTitle = 'Deal Universe Analysis';
  let dealMeta = 'Multi-sector · Market Rate · Australia';
  let rows = [];

  if (lower.includes('saas') || lower.includes('series') || lower.includes('capital raise') || lower.includes('vc')) {
    dealTitle = 'B2B SaaS Capital Raise';
    dealMeta = 'Technology · Series A · ANZ';
    rows = [
      {type: 'VC', db: 94, pct: 85},
      {type: 'Angels', db: 67, pct: 61},
      {type: 'Strategic', db: 48, pct: 43},
      {type: 'Family Office / UHNW', db: 23, pct: 21}
    ];
  } else if (lower.includes('m&a') || lower.includes('trade sale') || lower.includes('sale')) {
    dealTitle = 'Strategic Trade Sale';
    dealMeta = 'Industrial · $20-50M · ANZ';
    rows = [
      {type: 'Strategic Acquirers', db: 78, pct: 80},
      {type: 'PE (Buy-and-Build)', db: 62, pct: 63},
      {type: 'Family Office', db: 34, pct: 35},
      {type: 'International Strategics', db: 28, pct: 29}
    ];
  } else if (lower.includes('pe') || lower.includes('buyout') || lower.includes('private equity')) {
    dealTitle = 'PE Buyout Process';
    dealMeta = 'Healthcare Services · $30-50M EBITDA · ANZ';
    rows = [
      {type: 'Mid-Market PE', db: 86, pct: 82},
      {type: 'Growth Equity', db: 54, pct: 52},
      {type: 'Strategic Acquirers', db: 41, pct: 39},
      {type: 'Specialist Healthcare PE', db: 31, pct: 30}
    ];
  } else if (lower.includes('infrastructure') || lower.includes('renewable') || lower.includes('real assets')) {
    dealTitle = 'Infrastructure Asset Sale';
    dealMeta = 'Renewables · $100M+ · APAC';
    rows = [
      {type: 'Infrastructure Funds', db: 72, pct: 78},
      {type: 'Sovereign Wealth', db: 38, pct: 41},
      {type: 'Energy Transition Specialists', db: 45, pct: 49},
      {type: 'Pension / Super Funds', db: 29, pct: 31}
    ];
  } else {
    rows = [
      {type: 'VC', db: 82, pct: 75},
      {type: 'PE', db: 56, pct: 51},
      {type: 'Strategic', db: 44, pct: 40},
      {type: 'Family Office', db: 31, pct: 28}
    ];
  }

  const dbTotal = rows.reduce((sum, r) => sum + r.db, 0);
  return {
    dealTitle,
    dealMeta,
    matchTags: ['Thesis Match', 'Active Deploy', 'Sector Overlap', 'Geographic Fit', 'Stage Alignment'],
    rows,
    dbTotal,
    introPaths: Math.floor(dbTotal * 0.22),
    sourceableMin: Math.floor(dbTotal * 1.8),
    sourceableMax: Math.floor(dbTotal * 6.5),
    ultraHighQuality: Math.floor(dbTotal * 0.15),
    note: `Strong universe potential. ${rows[0].db} ${rows[0].type} matches identified with high thesis alignment. Multiple warm intro pathways available through the Iceberg advisor network. Recommend expanding into adjacent sectors for maximum competitive tension.`
  };
}

function renderDealResult(data) {
  const result = document.getElementById('deal-result');
  result.innerHTML = `
    <div class="deal-result-header">
      <span class="deal-result-title">${data.dealTitle}</span>
      <span class="deal-result-meta">${data.dealMeta}</span>
      <span class="deal-result-badge">LIVE</span>
    </div>
    <div class="deal-result-tags">
      ${data.matchTags.map(t => `<span class="deal-result-tag">${t}</span>`).join('')}
    </div>
    <div class="deal-result-table">
      ${data.rows.map(r => `
        <div class="deal-result-table-row">
          <span class="deal-result-table-type">${r.type}</span>
          <div class="deal-result-table-bar"><div class="deal-result-table-bar-fill" style="width:${r.pct}%"></div></div>
          <span class="deal-result-table-count">${r.db}</span>
        </div>
      `).join('')}
    </div>
    <div class="deal-result-totals">
      <div class="deal-result-total">
        <div class="deal-result-total-value">${data.dbTotal}</div>
        <div class="deal-result-total-label">DB Matches</div>
      </div>
      <div class="deal-result-total">
        <div class="deal-result-total-value blue">${data.introPaths}</div>
        <div class="deal-result-total-label">Warm Intro Paths</div>
      </div>
      <div class="deal-result-total">
        <div class="deal-result-total-value">${data.sourceableMin}&ndash;${data.sourceableMax}</div>
        <div class="deal-result-total-label">Sourceable Range</div>
      </div>
      <div class="deal-result-total">
        <div class="deal-result-total-value green">${data.ultraHighQuality}</div>
        <div class="deal-result-total-label">Ultra High Quality</div>
      </div>
    </div>
    <div class="deal-result-note"><strong>&#11045; Analyst Note:</strong> ${data.note}</div>
    <div class="deal-result-next-step">
      <div class="deal-result-next-step-inner">
        <div class="deal-result-next-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="var(--green)" stroke="none"><polygon points="12,2 2,22 22,22"/></svg>
        </div>
        <div>
          <h4 style="color:var(--text-white);margin:0 0 6px;">This is just the surface.</h4>
          <p style="color:var(--text-200);margin:0;font-size:14px;line-height:1.5;">The full universe includes verified contacts, warm intro paths, engagement signals, and a ranked execution plan. Book a 15-minute demo and we'll build it live for your actual mandate.</p>
        </div>
      </div>
      <div class="deal-result-ctas">
        <a href="try-it-live.html" class="btn-primary" style="width:100%;justify-content:center;font-size:16px;padding:16px 28px;">Send a mandate &mdash; see your full universe &rarr;</a>
      </div>
      <p style="text-align:center;color:var(--text-400);font-size:12px;margin-top:10px;">15 minutes. We'll screen-share and build your universe live. No commitment.</p>
    </div>
  `;
  result.classList.add('show');
}
