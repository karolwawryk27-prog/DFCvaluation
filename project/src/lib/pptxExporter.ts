import pptxgenjs from 'pptxgenjs';
import type { FinancialData, DCFResult } from '@/types';
import { formatCurrency, formatPercent, formatPrice, formatRaw } from '@/lib/dcfEngine';

type TableRow = pptxgenjs.TableRow;

export async function exportToPowerPoint(
  data: FinancialData,
  dcf: DCFResult,
): Promise<void> {
  const pptx = new pptxgenjs();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.defineSlideMaster({
    title: 'DCF_MASTER',
    background: { color: '0F172A' },
  });

  const slide = pptx.addSlide({ masterName: 'DCF_MASTER' });

  const accent = '2563EB';
  const lightText = 'E2E8F0';
  const dimText = '94A3B8';
  const cardBg = '1E293B';

  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 1.1,
    fill: { color: '0B1120' },
  });

  slide.addText('DISCOUNTED CASH FLOW VALUATION', {
    x: 0.5, y: 0.2, w: 8, h: 0.45,
    fontFace: 'Arial', fontSize: 22, bold: true,
    color: lightText, align: 'left',
  });

  slide.addText('Financial Analysis Summary', {
    x: 0.5, y: 0.65, w: 8, h: 0.3,
    fontFace: 'Arial', fontSize: 12,
    color: dimText, align: 'left',
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 10.5, y: 0.25, w: 2.3, h: 0.6,
    fill: { color: accent },
    rectRadius: 0.05,
  });
  slide.addText(data.profile.symbol, {
    x: 10.5, y: 0.25, w: 2.3, h: 0.6,
    fontFace: 'Arial', fontSize: 18, bold: true,
    color: 'FFFFFF', align: 'center', valign: 'middle',
  });

  slide.addText(data.profile.companyName, {
    x: 0.5, y: 1.3, w: 12.3, h: 0.4,
    fontFace: 'Arial', fontSize: 16, bold: true,
    color: lightText,
  });

  slide.addText(
    `${data.profile.sector} • ${data.profile.industry} • ${data.profile.exchange}`,
    {
      x: 0.5, y: 1.7, w: 12.3, h: 0.3,
      fontFace: 'Arial', fontSize: 11,
      color: dimText,
    },
  );

  const cards = [
    { label: 'WACC', value: formatPercent(dcf.wacc) },
    { label: 'Terminal Value', value: formatCurrency(dcf.terminalValue) },
    { label: 'Enterprise Value', value: formatCurrency(dcf.enterpriseValue) },
    { label: 'Equity Value', value: formatCurrency(dcf.equityValue) },
    { label: 'DCF Implied Price', value: formatPrice(dcf.impliedSharePrice) },
    { label: 'Current Price', value: formatPrice(dcf.currentPrice) },
  ];

  const cardW = 2.0;
  const cardH = 1.2;
  const gap = 0.15;
  const startX = 0.5;
  const startY = 2.25;

  cards.forEach((card, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = startX + col * (cardW + gap);
    const y = startY + row * (cardH + gap);

    slide.addShape(pptx.ShapeType.roundRect, {
      x, y, w: cardW, h: cardH,
      fill: { color: cardBg },
      rectRadius: 0.06,
      line: { color: '334155', width: 1 },
    });

    slide.addText(card.label, {
      x: x + 0.15, y: y + 0.15, w: cardW - 0.3, h: 0.3,
      fontFace: 'Arial', fontSize: 10,
      color: dimText,
    });

    const isImplied = card.label === 'DCF Implied Price';
    slide.addText(card.value, {
      x: x + 0.15, y: y + 0.5, w: cardW - 0.3, h: 0.5,
      fontFace: 'Arial', fontSize: 20, bold: true,
      color: isImplied ? 'FBBF24' : lightText,
    });
  });

  slide.addText('KEY ASSUMPTIONS', {
    x: 0.5, y: 5.1, w: 12.3, h: 0.3,
    fontFace: 'Arial', fontSize: 11, bold: true,
    color: accent,
  });

  const assumptions = [
    ['Revenue Growth Rate', formatPercent(dcf.assumptions.revenueGrowthRate)],
    ['Terminal Growth Rate', formatPercent(dcf.assumptions.terminalGrowthRate)],
    ['Tax Rate', formatPercent(dcf.assumptions.taxRate)],
    ['Risk-Free Rate', formatPercent(dcf.assumptions.riskFreeRate)],
    ['Market Risk Premium', formatPercent(dcf.assumptions.marketRiskPremium)],
    ['Beta', formatRaw(dcf.assumptions.beta)],
    ['Cost of Equity', formatPercent(dcf.costOfEquity)],
    ['Cost of Debt', formatPercent(dcf.costOfDebt)],
  ];

  const assumpRows: TableRow[] = [
    [
      { text: 'Assumption', options: { bold: true, color: lightText, fill: { color: '1E293B' }, fontSize: 9, align: 'left' } },
      { text: 'Value', options: { bold: true, color: lightText, fill: { color: '1E293B' }, fontSize: 9, align: 'center' } },
    ],
    ...assumptions.map(([label, val]) => [
      { text: label, options: { color: dimText, fontSize: 9, align: 'left' as const } },
      { text: val, options: { color: lightText, fontSize: 9, align: 'center' as const, bold: true } },
    ]),
  ];

  slide.addTable(assumpRows, {
    x: 0.5, y: 5.45, w: 6.0,
    border: { type: 'solid', color: '334155', pt: 0.5 },
    colW: [4.0, 2.0],
    rowH: 0.3,
    fontFace: 'Arial',
  });

  slide.addText('PROJECTED FREE CASH FLOWS (5Y)', {
    x: 7.0, y: 5.1, w: 5.8, h: 0.3,
    fontFace: 'Arial', fontSize: 11, bold: true,
    color: accent,
  });

  const fcfRows: TableRow[] = [
    [
      { text: 'Year', options: { bold: true, color: lightText, fill: { color: '1E293B' }, fontSize: 9, align: 'center' } },
      { text: 'FCF', options: { bold: true, color: lightText, fill: { color: '1E293B' }, fontSize: 9, align: 'center' } },
      { text: 'PV', options: { bold: true, color: lightText, fill: { color: '1E293B' }, fontSize: 9, align: 'center' } },
    ],
    ...dcf.projectedFcf.map((p) => [
      { text: `Y${p.year}`, options: { color: dimText, fontSize: 9, align: 'center' as const } },
      { text: formatCurrency(p.fcf), options: { color: lightText, fontSize: 9, align: 'center' as const } },
      { text: formatCurrency(p.presentValue), options: { color: lightText, fontSize: 9, align: 'center' as const } },
    ]),
  ];

  slide.addTable(fcfRows, {
    x: 7.0, y: 5.45, w: 5.8,
    border: { type: 'solid', color: '334155', pt: 0.5 },
    colW: [1.2, 2.3, 2.3],
    rowH: 0.3,
    fontFace: 'Arial',
  });

  const verdictColor = dcf.upsideDownside > 0 ? '22C55E' : 'EF4444';
  const verdictText = dcf.upsideDownside > 0
    ? `Undervalued — ${formatPercent(Math.abs(dcf.upsideDownside))} upside`
    : `Overvalued — ${formatPercent(Math.abs(dcf.upsideDownside))} downside`;

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 7.0, w: 12.3, h: 0.45,
    fill: { color: verdictColor },
    rectRadius: 0.05,
  });
  slide.addText(verdictText, {
    x: 0.5, y: 7.0, w: 12.3, h: 0.45,
    fontFace: 'Arial', fontSize: 12, bold: true,
    color: 'FFFFFF', align: 'center', valign: 'middle',
  });

  slide.addText('Generated by FinAnalytics Dashboard', {
    x: 0.5, y: 7.5, w: 12.3, h: 0.2,
    fontFace: 'Arial', fontSize: 8,
    color: '475569', align: 'center',
  });

  await pptx.writeFile({ fileName: `DCF_${data.profile.symbol}_Valuation.pptx` });
}
