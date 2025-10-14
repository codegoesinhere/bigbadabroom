// ========================= Utilities =========================
function hmsToSeconds(hms) {
  if (!hms) return null;
  const [h, m, s] = String(hms).split(':');
  if (s === undefined) return null;
  return (+h) * 3600 + (+m) * 60 + parseFloat(s);
}
function formatHMS(totalSeconds) {
  if (totalSeconds == null || isNaN(totalSeconds)) return '—';
  const sign = totalSeconds < 0 ? '-' : '';
  let s = Math.abs(totalSeconds);
  const h = Math.floor(s / 3600); s -= h * 3600;
  const m = Math.floor(s / 60);   s -= m * 60;
  return `${sign}${h}:${String(m).padStart(2,'0')}:${s.toFixed(2).padStart(5,'0')}`;
}

// ========================= Constants =========================
const BRAND = {
  Ford: '#1C3F95',
  Holden: '#C8102E',
  Chevrolet: '#FFB612',
  Nissan: '#FFE01A',
  Mercedes: '#C0C0C0',
  Volvo: '#00B7EB'
};
const LETTER_TO_BRAND = { H: 'Holden', F: 'Ford', N: 'Nissan', C: 'Chevrolet' };

const categories = [
  '1995','1996','1997','1998','1999','2000','2001','2002','2003','2004',
  '2005','2006','2007','2008','2009','2010','2011','2012','2013','2014',
  '2015','2016','2017','2018','2019','2020','2021','2022','2023','2024', '2025'
];
const idxOf = y => categories.indexOf(String(y));

// Base Ford (negative/left) and GM (positive/right)
const fordVals = [
  -8,-12,-6,-11,-12,-23,-21,-21,-19,-16,-16,-15,-16,-13,-13,-11,-11,-11,-6,-7,
  -6,-6,-6,-7,-6,-8,-8,-9,-13,-10, -11
];
const gmVals = [
  24,24,9,16,16,33,20,19,21,19,18,16,15,16,19,20,18,18,16,11,13,14,16,15,16,17,17,19,15,16,16
];

// Extra makes on Ford side (negative)
const nissanVals      = Array(categories.length).fill(0);
const mercedesVals    = Array(categories.length).fill(0);
const volvoVals       = Array(categories.length).fill(0);
const fordNonSCVals   = Array(categories.length).fill(0);
const holdenNonSCVals = Array(categories.length).fill(0);

// Nissan (2013–2019), Mercedes (2013–2015), Volvo (2014–2016)
[2013,2014,2015,2016,2017,2018,2019].forEach((y, i) => {
  nissanVals[idxOf(y)] = [-4,-4,-4,-5,-4,-4,-4][i];
});
[2013,2014,2015].forEach((y, i) => { mercedesVals[idxOf(y)] = [-3,-2,-2][i]; });
[2014,2015,2016].forEach((y, i) => { volvoVals[idxOf(y)]    = [-2,-2,-2][i]; });

// Privateer 1998–1999
fordNonSCVals[idxOf(1998)]   = -4;
fordNonSCVals[idxOf(1999)]   = -8;
holdenNonSCVals[idxOf(1998)] = 14;
holdenNonSCVals[idxOf(1999)] = 21;

// 1997 special classes
const fordSL1_1997   = Array(categories.length).fill(0);
const fordL2_1997    = Array(categories.length).fill(0);
const holdenSL1_1997 = Array(categories.length).fill(0);
const holdenL2_1997  = Array(categories.length).fill(0);
fordSL1_1997[idxOf(1997)]   =  0;
fordL2_1997[idxOf(1997)]    = -3;
holdenSL1_1997[idxOf(1997)] =  6;
holdenL2_1997[idxOf(1997)]  = 17;

const pin = arr => arr.map((y, i) => ({ x: i, y }));

// Totals (purely from the arrays above)
const leftExtrasAbsAt = i =>
  Math.abs(nissanVals[i]) + Math.abs(mercedesVals[i]) + Math.abs(volvoVals[i]) +
  Math.abs(fordNonSCVals[i]) + Math.abs(fordSL1_1997[i]) + Math.abs(fordL2_1997[i]);
const rightExtrasAt = i => holdenNonSCVals[i] + holdenSL1_1997[i] + holdenL2_1997[i];
const totals = fordVals.map((f, i) =>
  Math.abs(f) + gmVals[i] + leftExtrasAbsAt(i) + rightExtrasAt(i)
);

// ========================= Charts (Entrants) =========================
function renderEntrantsCharts() {
  // Totals column
  Highcharts.chart('totals-container', {
    chart: { type: 'column' },
    title: { text: 'Chart 1: Bathurst Supercar Entrants — Total per Year' },
    xAxis: { categories, tickmarkPlacement: 'on' },
    yAxis: { title: { text: 'Entrants' }, allowDecimals: false },
    tooltip: { pointFormat: '<b>{point.y}</b> entrants' },
    plotOptions: { column: { borderWidth: 0, pointPadding: 0.1, groupPadding: 0.05 }},
    legend: { enabled: false },
    series: [{
      name: 'Total',
      data: totals,
      color: '#6e7a8a',
      dataLabels: { enabled: true, formatter() { return Highcharts.numberFormat(this.y, 0); } }
    }]
  });

  // Split bar (left/right)
  Highcharts.chart('container', {
    chart: { type: 'bar' },
    title: { text: 'Chart 2: Bathurst Supercar Entrants: Makes and Classes' },
    xAxis: [{
      categories, reversed: true, labels: { step: 1 }, tickmarkPlacement: 'between'
    }, {
      categories, reversed: true, opposite: true, linkedTo: 0, labels: { step: 1 },
      tickmarkPlacement: 'between'
    }],
    yAxis: {
      title: { text: null },
      labels: { formatter() { return Math.abs(this.value); } },
      reversedStacks: false
    },
    plotOptions: {
      series: { stacking: 'normal', borderWidth: 0, groupPadding: 0, pointPadding: 0, pointWidth: 8, animation: false }
    },
    tooltip: {
      formatter: function () {
        const year = categories[this.point.x];
        const isHoldenChevy = this.series.name === 'Holden → Chevrolet';
        const label = isHoldenChevy ? (parseInt(year, 10) >= 2023 ? 'Chevrolet' : 'Holden') : this.series.name;
        return `<b>${label}, ${year}</b><br/>Entrants: ${Math.abs(this.point.y)}`;
      }
    },
    series: [
      { name: 'Ford', data: pin(fordVals), color: '#1C3F95', legendIndex: 0 },
      { name: 'Ford — Special Level 1', data: pin(fordSL1_1997), color: '#4C7BEA', legendIndex: 5 },
      { name: 'Ford — Level 2',        data: pin(fordL2_1997),  color: '#9BB4F6', legendIndex: 7 },
      { name: 'Ford (Privateer)',      data: pin(fordNonSCVals), color: '#3d6ada', legendIndex: 9 },
      { name: 'Nissan',   data: pin(nissanVals),   color: '#FFE01A', legendIndex: 2 },
      { name: 'Mercedes', data: pin(mercedesVals), color: '#C0C0C0', legendIndex: 3 },
      { name: 'Volvo',    data: pin(volvoVals),    color: '#00B7EB', legendIndex: 4 },
      {
        name: 'Holden → Chevrolet',
        data: pin(gmVals),
        color: { linearGradient: { x1: 0, y1: 0, x2: 1, y2: 0 }, stops: [[0,'#C8102E'],[0.5,'#C8102E'],[0.5,'#FFB612'],[1,'#FFB612']] },
        legendIndex: 1,
        zoneAxis: 'x',
        zones: [{ value: 28, color: '#C8102E' }, { color: '#FFB612' }]
      },
      { name: 'Holden — Special Level 1', data: pin(holdenSL1_1997), color: '#E04557', legendIndex: 6 },
      { name: 'Holden — Level 2',        data: pin(holdenL2_1997),  color: '#F59AAA', legendIndex: 8 },
      { name: 'Holden (Privateer)',      data: pin(holdenNonSCVals), color: '#e55864', legendIndex: 10 }
    ]
  });
}

// ========================= Charts (Data-driven) =========================
function renderDataCharts(rows) {
  const byYear = Object.fromEntries(rows.map(r => [String(r.Year), r]));
  const years = categories;

  // 1) Finishes by Year
  const finishKeys = ['Finished','DNS','DSQ','DNF','NC','WD','Retired','DNQ','DNPQ'];
  const finishColors = {
    'Finished':'#2E7D32', 'DNS':'#FB8C00', 'DSQ':'#000000', 'DNF':'#D32F2F',
    'NC':'#9E9E9E', 'WD':'#6A1B9A', 'Retired':'#616161', 'DNQ':'#455A64', 'DNPQ':'#B71C1C'
  };
  const finishSeries = finishKeys.map(k => ({
    name: k,
    data: years.map(y => (byYear[y] && Number.isFinite(+byYear[y][k])) ? +byYear[y][k] : 0),
    color: finishColors[k] || undefined
  }));
  Highcharts.chart('finishes-by-year', {
    chart: { type: 'column' },
    title: { text: 'Chart 4: Result Types per Year' },
    xAxis: { categories: years, tickmarkPlacement: 'on' },
    yAxis: { title: { text: 'Count' }, allowDecimals: false, stackLabels: { enabled: true } },
    legend: { itemDistance: 12 },
    plotOptions: { column: { stacking: 'normal', borderWidth: 0, groupPadding: 0.08, pointPadding: 0.04 } },
    tooltip: { shared: true },
    series: finishSeries
  });

  // 2) Race Time (Total)
  const totalSecs = years.map(y => byYear[y] ? hmsToSeconds(byYear[y].Time) : null);
  Highcharts.chart('race-time-total', {
    chart: { type: 'line' },
    title: { text: 'Chart 6: Winners Race Time' },
    xAxis: { categories: years },
    yAxis: {
      title: { text: 'Time (hh:mm:ss)' },
      labels: { formatter() { return formatHMS(this.value); } }
    },
    tooltip: {
      formatter() { return `<b>${years[this.point.index]}</b><br/>Total time: <b>${formatHMS(this.y)}</b>`; },
      useHTML: true
    },
    plotOptions: { series: { marker: { enabled: true, radius: 3 } } },
    legend: false,
    series: [{ name: 'Total Time', data: totalSecs }]
  });

  // 3) Podium heatmap (1st at top)
  const yCats = ['1st','2nd','3rd'];
  const posToRow = { 1:0, 2:1, 3:2 };
  const heatData = [];
  years.forEach((y, x) => {
    const r = byYear[y] || {};
    [1,2,3].forEach(p => {
      const letter = String(r[String(p)] || '').trim();
      if (!letter) return;
      const make = LETTER_TO_BRAND[letter] || null;
      const isYellow = make === 'Chevrolet' || make === 'Nissan';
      heatData.push({
        x, y: posToRow[p], value: 1,
        color: make ? BRAND[make] : '#ccc',
        custom: { year: y, pos: p, letter, make },
        // Only override label style for yellow backgrounds
        dataLabels: isYellow ? {
          style: {
            color: '#000000',
            fontWeight: '700',
            textOutline: '1px rgba(255,255,255,0.6)'
          }
        } : undefined
      });
    });
  });
  const sweepStars = years.map((y, x) => {
    const r = byYear[y] || {};
    const a = r['1'], b = r['2'], c = r['3'];
    if (a && a === b && b === c) {
      const make = LETTER_TO_BRAND[a];
      return { x, y: 1, marker: { symbol: 'star', radius: 7 }, color: BRAND[make], custom: { year: y, make } };
    }
    return null;
  }).filter(Boolean);

  Highcharts.chart('podium-by-make', {
    title: { text: 'Chart 5: Podium by Manufacturer (1st/2nd/3rd)' },
    chart: { type: 'heatmap' },
    xAxis: { categories: years, title: { text: 'Year' } },
    yAxis: { categories: yCats, title: null, reversed: true, gridLineWidth: 0 },
    legend: { enabled: false },
    colorAxis: { min: 0, minColor: '#ffffff', maxColor: '#ffffff' },
    tooltip: {
      useHTML: true,
      formatter() {
        const p = this.point.custom || {};
        const who = p.make ? `${p.make} (${p.letter})` : p.letter || '—';
        return `<b>${p.year}</b><br/>${p.pos === 1 ? '1st' : p.pos === 2 ? '2nd' : '3rd'}: <b>${who}</b>`;
      }
    },
    plotOptions: { series: { borderWidth: 1, borderColor: '#e0e0e0' } },
    series: [
      {
        name: 'Podium',
        data: heatData,
        nullColor: 'rgba(0,0,0,0)',
        dataLabels: {
          enabled: true,
          formatter() { return this.point.custom?.letter || ''; },
          // default for non-yellow brands
          style: {
            color: '#ffffff',
            fontWeight: '700',
            textOutline: '0px rgba(0,0,0,0.75)'
          }
        }
      },
      {
        type: 'scatter',
        name: 'Sweep',
        data: sweepStars,
        tooltip: { pointFormat: '<b>★ {point.custom.make} sweep</b>' }
      }
    ]
  });

  // 4) Model usage heatmap
  const ORDERED_MODELS = {
    Holden:  ['VL','VP','VR','VS','VT','VX','VY','VZ','VE','VF','ZB'],
    Chevrolet:['Mk6','ZL1'],
    Ford:    ['EB','EF','EL','AU','BA','BF','FG','FG X','GT','S550','S650'],
    Nissan:  ['L33'],
    Mercedes:['E63'],
    Volvo:   ['S60']
  };
  const presentModels = [];
  Object.entries(ORDERED_MODELS).forEach(([make, list]) => {
    list.forEach(model => {
      const used = years.some(y => byYear[y] && (byYear[y][model] || 0) > 0);
      if (used) presentModels.push({ make, model });
    });
  });
  const heatmapPoints = [];
  presentModels.forEach((m, rowIndex) => {
    years.forEach((y, xIndex) => {
      const count = byYear[y] ? (byYear[y][m.model] || 0) : 0;
      if (count > 0) {
        heatmapPoints.push({
          x: xIndex, y: rowIndex, value: count, color: BRAND[m.make],
          custom: { make: m.make, model: m.model, year: y, count }
        });
      }
    });
  });
  Highcharts.chart('makes-over-years', {
    chart: { type: 'heatmap' },
    title: { text: 'Chart 3: Models Used by Year' },
    xAxis: { categories: years, title: { text: 'Year' } },
    yAxis: { categories: presentModels.map(m => `${m.model} (${m.make})`), title: { text: 'Model' }, reversed: true },
    colorAxis: { min: 0, minColor: '#ffffff', maxColor: '#ffffff' },
    legend: { enabled: false },
    tooltip: {
      useHTML: true,
      formatter() {
        const p = this.point.custom;
        return `<b>${p.model}</b> (${p.make})<br/>${p.year}: <b>${p.count}</b>`;
      }
    },
    plotOptions: { series: { borderWidth: 1 } },
    series: [{ name: 'Usage', data: heatmapPoints, nullColor: 'rgba(0,0,0,0)' }]
  });
}

// ========================= Bootstrap =========================
function init() {
  const rows = Array.isArray(window.BATHURST_ROWS) ? window.BATHURST_ROWS : null;
  if (!rows) {
    console.error('No data found. Ensure bathurst_data.js defines window.BATHURST_ROWS = [...];');
    return;
  }
  renderEntrantsCharts();
  renderDataCharts(rows);
}
init();
