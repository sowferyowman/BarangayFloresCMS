import { useState, useRef, useMemo } from 'react';
import type { Case } from '../types';
import { age } from '../types';
import { caseNatures, monthKey, monthLabel } from '../lib/case-utils';
import { Stat } from '../components/common';

// ============================================
// FIXED MONTH LABEL FUNCTION
// ============================================
function getMonthLabel(monthKey: string): string {
  // Expects format: "MM-YYYY" e.g., "08-2024"
  const parts = monthKey.split('-');
  if (parts.length !== 2) return monthKey;
  
  const month = parseInt(parts[0]);
  const year = parseInt(parts[1]);
  
  if (isNaN(month) || isNaN(year)) return monthKey;
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = monthNames[month - 1] || month;
  const yearShort = String(year).slice(2);
  
  return `${monthName} ${yearShort}`;
}

// ============================================
// HORIZONTAL BARS
// ============================================
function HorizontalBars({ title, data, color = 'teal' }: { 
  title: string; 
  data: { label: string; value: number }[]; 
  color?: string;
}) {
  const max = Math.max(...data.map(item => item.value), 1);
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <section className="card chart-card">
      <div className="chart-header">
        <h2>{title}</h2>
        <span className="chart-total">{total} total</span>
      </div>
      <div className="horizontal-bars">
        {data.map(item => (
          <div className="bar-row" key={item.label}>
            <span title={item.label}>{item.label}</span>
            <div className="bar-track">
              <i className={color} style={{ width: `${(item.value / max) * 100}%` }} />
            </div>
            <b>{item.value}</b>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================================
// ENHANCED CASES OVER TIME CHART WITH YEAR SELECTOR
// ============================================
function CasesOverTimeChart({ cases }: { cases: Case[] }) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [tooltipData, setTooltipData] = useState<{ x: number; y: number; label: string; value: number } | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    const currentYear = new Date().getFullYear();
    const years = new Set<number>();
    cases.forEach(c => {
      if (c.date_of_incident) {
        const year = new Date(c.date_of_incident).getFullYear();
        if (!isNaN(year)) years.add(year);
      }
    });
    const sortedYears = [...years].sort();
    return sortedYears.length > 0 ? sortedYears[sortedYears.length - 1] : currentYear;
  });
  
  const chartRef = useRef<SVGSVGElement>(null);

  // Get all available years
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    cases.forEach(c => {
      if (c.date_of_incident) {
        const year = new Date(c.date_of_incident).getFullYear();
        if (!isNaN(year)) years.add(year);
      }
    });
    return [...years].sort();
  }, [cases]);

  // Calculate data - group by month for selected year
  const points = useMemo(() => {
    const counts = new Map<string, { key: string; label: string; value: number }>();
    
    cases.forEach(caseItem => {
      if (!caseItem.date_of_incident) return;
      
      const date = new Date(caseItem.date_of_incident);
      const year = date.getFullYear();
      
      // Filter by selected year
      if (year !== selectedYear) return;
      
      const month = date.getMonth() + 1;
      const key = `${String(month).padStart(2, '0')}-${year}`;
      const label = getMonthLabel(key);
      
      if (counts.has(key)) {
        counts.get(key)!.value += 1;
      } else {
        counts.set(key, {
          key,
          label: label,
          value: 1
        });
      }
    });
    
    // Sort by month (Jan to Dec)
    return [...counts.values()].sort((a, b) => {
      const [monthA, yearA] = a.key.split('-');
      const [monthB, yearB] = b.key.split('-');
      if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
      return parseInt(monthA) - parseInt(monthB);
    });
  }, [cases, selectedYear]);

  // Calculate trend
  const trend = useMemo(() => {
    if (points.length < 2) return null;
    const first = points[0].value;
    const last = points[points.length - 1].value;
    const change = last - first;
    const percent = first > 0 ? (change / first) * 100 : 0;
    return {
      direction: change >= 0 ? 'up' : 'down',
      percent: Math.abs(percent).toFixed(1),
      change: change
    };
  }, [points]);

  // Calculate summary stats
  const totalCases = points.reduce((s, p) => s + p.value, 0);
  const avgMonthly = points.length > 0 ? (totalCases / points.length).toFixed(1) : '0';
  const peakMonth = points.length > 0 ? points.reduce((max, p) => p.value > max.value ? p : max, points[0]) : null;

  // Handle year change
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    setHoveredPoint(null);
    setTooltipData(null);
  };

  // No data for selected year
  if (!points.length) {
    return (
      <section className="card chart-card">
        <div className="chart-header">
          <h2>Cases by Month</h2>
          <div className="chart-controls">
            {availableYears.length > 0 && (
              <div className="year-selector">
                <select 
                  value={selectedYear} 
                  onChange={(e) => handleYearChange(parseInt(e.target.value))}
                  className="year-select"
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
        <div className="empty-chart-state">
          <p>No cases recorded for {selectedYear} yet.</p>
        </div>
      </section>
    );
  }

  // If only one data point
  if (points.length === 1) {
    return (
      <section className="card chart-card">
        <div className="chart-header">
          <h2>Cases Over Time</h2>
          <div className="chart-controls">
            {availableYears.length > 0 && (
              <div className="year-selector">
                <select 
                  value={selectedYear} 
                  onChange={(e) => handleYearChange(parseInt(e.target.value))}
                  className="year-select"
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}
            <span className="chart-total">{totalCases} total</span>
          </div>
        </div>
        <div className="single-point-chart">
          <div className="single-point-value">{points[0].value}</div>
          <div className="single-point-label">case{points[0].value > 1 ? 's' : ''} in {points[0].label}</div>
        </div>
      </section>
    );
  }

  // Chart dimensions
  const w = 600, h = 240, padL = 50, padR = 30, padT = 30, padB = 40;
  const max = Math.max(...points.map(point => point.value), 1);
  const min = Math.min(...points.map(point => point.value), 0);
  const range = max - min || 1;
  
  const step = points.length > 1 ? (w - padL - padR) / (points.length - 1) : 0;
  const x = (index: number) => padL + index * step;
  const y = (value: number) => padT + (h - padT - padB) * (1 - (value - min) / range);
  
  // Path for line
  const path = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${x(index)} ${y(point.value)}`
  ).join(' ');
  
  // Path for area
  const area = `${path} L ${x(points.length - 1)} ${h - padB} L ${x(0)} ${h - padB} Z`;

  // Calculate y-axis ticks
  const yTicks = 5;
  const yMax = Math.ceil(max / 5) * 5 || 5;
  const yMin = Math.floor(min / 5) * 5 || 0;
  const yStep = (yMax - yMin) / yTicks;

  // Handle mouse events for tooltips
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const svgX = (mouseX / rect.width) * w;
    const svgY = (mouseY / rect.height) * h;
    
    let nearest = -1;
    let minDist = 50;
    points.forEach((point, index) => {
      const dx = svgX - x(index);
      const dy = svgY - y(point.value);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        nearest = index;
      }
    });
    
    if (nearest >= 0 && nearest < points.length) {
      setHoveredPoint(nearest);
      setTooltipData({
        x: x(nearest),
        y: y(points[nearest].value),
        label: points[nearest].label,
        value: points[nearest].value
      });
    } else {
      setHoveredPoint(null);
      setTooltipData(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
    setTooltipData(null);
  };

  return (
    <section className="card chart-card">
      <div className="chart-header">
        <h2>Cases Over Time</h2>
        <div className="chart-controls">
          {availableYears.length > 0 && (
            <div className="year-selector">
              <select 
                value={selectedYear} 
                onChange={(e) => handleYearChange(parseInt(e.target.value))}
                className="year-select"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}
          <div className="chart-trend">
            {trend && (
              <span className={`trend-badge ${trend.direction}`}>
                {trend.direction === 'up' ? '↑' : '↓'} {trend.percent}%
              </span>
            )}
            <span className="chart-total">{totalCases} total</span>
          </div>
        </div>
      </div>
      
      <div className="chart-container">
        <svg 
          className="line-chart" 
          viewBox={`0 0 ${w} ${h}`} 
          preserveAspectRatio="xMidYMid meet"
          ref={chartRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          role="img"
          aria-label="Cases over time line chart"
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(f => (
            <line 
              key={f} 
              x1={padL} x2={w - padR} 
              y1={padT + (h - padT - padB) * f} 
              y2={padT + (h - padT - padB) * f} 
              className="grid-line" 
            />
          ))}
          
          {/* Y-Axis Labels */}
          {Array.from({ length: yTicks + 1 }, (_, i) => {
            const value = yMax - (i * yStep);
            const yPos = padT + (h - padT - padB) * (i / yTicks);
            return (
              <text 
                key={`y-${i}`} 
                x={padL - 10} 
                y={yPos} 
                textAnchor="end" 
                alignmentBaseline="middle"
                className="axis-label y-axis-label"
              >
                {Math.round(value)}
              </text>
            );
          })}

          {/* Y-Axis Line */}
          <line x1={padL} y1={padT} x2={padL} y2={h - padB} className="axis-line" />

          {/* Area fill with gradient */}
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d8878" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#0d8878" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#0d8878" stopOpacity="0.01" />
            </linearGradient>
          </defs>
          
          <path d={area} className="line-area" />
          
          {/* Main line */}
          <path d={path} className="line-stroke" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Data points with hover effect */}
          {points.map((point, index) => {
            const isHovered = hoveredPoint === index;
            return (
              <g key={point.key}>
                <circle 
                  cx={x(index)} 
                  cy={y(point.value)} 
                  r={isHovered ? 7 : 4.5} 
                  className={`line-dot ${isHovered ? 'hover' : ''}`}
                />
                {isHovered && (
                  <circle 
                    cx={x(index)} 
                    cy={y(point.value)} 
                    r={12} 
                    fill="none" 
                    stroke="#0d8878" 
                    strokeWidth="2" 
                    opacity="0.2"
                  />
                )}
              </g>
            );
          })}
          
          {/* X-Axis Labels - Shows Jan, Feb, Mar... */}
          {points.map((point, index) => (
            <text 
              key={point.key} 
              x={x(index)} 
              y={h - padB + 18} 
              textAnchor="middle" 
              className={`axis-label x-axis-label ${index % 2 === 0 ? 'even' : 'odd'}`}
            >
              {point.label}
            </text>
          ))}
          
          {/* X-Axis Line */}
          <line x1={padL} y1={h - padB} x2={w - padR} y2={h - padB} className="axis-line" />

          {/* Custom Tooltip */}
          {tooltipData && (
            <g className="chart-tooltip">
              {/* Tooltip line */}
              <line 
                x1={tooltipData.x} 
                y1={padT} 
                x2={tooltipData.x} 
                y2={h - padB} 
                className="tooltip-line" 
              />
              {/* Tooltip box */}
              <rect 
                x={tooltipData.x - 35} 
                y={tooltipData.y - 40} 
                width="70" 
                height="32" 
                rx="6" 
                className="tooltip-box"
              />
              <text 
                x={tooltipData.x} 
                y={tooltipData.y - 20} 
                textAnchor="middle" 
                className="tooltip-value"
              >
                {tooltipData.value}
              </text>
              <text 
                x={tooltipData.x} 
                y={tooltipData.y - 32} 
                textAnchor="middle" 
                className="tooltip-label"
              >
                {tooltipData.label}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Annotations / Summary Stats */}
      <div className="chart-annotations">
        <div className="annotation-item">
          <span className="annotation-label">Total Cases</span>
          <span className="annotation-value">{totalCases}</span>
        </div>
        <div className="annotation-item">
          <span className="annotation-label">Monthly Avg</span>
          <span className="annotation-value">{avgMonthly}</span>
        </div>
        {peakMonth && (
          <div className="annotation-item">
            <span className="annotation-label">Peak Month</span>
            <span className="annotation-value">{peakMonth.label}</span>
          </div>
        )}
        {trend && (
          <div className={`annotation-item trend-annotation ${trend.direction}`}>
            <span className="annotation-label">Trend</span>
            <span className="annotation-value">
              {trend.direction === 'up' ? '↑' : '↓'} {trend.percent}%
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================
// STATUS DONUT CHART
// ============================================
function StatusDonut({ cases }: { cases: Case[] }) {
  const statuses = ['Active', 'Settled', 'Unsettled'] as const;
  const colors: Record<string, string> = {
    Active: '#0d8878',
    Settled: '#6cae4b',
    Unsettled: '#e08a3c'
  };
  
  const counts = statuses.map(label => ({
    label,
    value: cases.filter(caseItem => caseItem.status === label).length
  }));
  
  const total = counts.reduce((sum, item) => sum + item.value, 0);
  const settled = counts.find(c => c.label === 'Settled')?.value || 0;
  const settlementRate = total > 0 ? (settled / total) * 100 : 0;
  
  const size = 160, stroke = 22;
  const r = (size - stroke) / 2;
  const cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <section className="card chart-card">
      <div className="chart-header">
        <h2>Case Status</h2>
        <span className="chart-total">
          {settlementRate.toFixed(1)}% settled
        </span>
      </div>
      {total ? (
        <div className="donut-wrap">
          <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e8f1ef" strokeWidth={stroke} />
            {counts.map(item => {
              if (!item.value) return null;
              const dash = (item.value / total) * circumference;
              const circle = (
                <circle 
                  key={item.label} 
                  cx={cx} cy={cy} r={r} 
                  fill="none" 
                  stroke={colors[item.label]} 
                  strokeWidth={stroke} 
                  strokeDasharray={`${dash} ${circumference - dash}`} 
                  strokeDashoffset={-offset} 
                  transform={`rotate(-90 ${cx} ${cy})`} 
                />
              );
              offset += dash;
              return circle;
            })}
            <text x={cx} y={cy - 4} textAnchor="middle" className="donut-total">{total}</text>
            <text x={cx} y={cy + 14} textAnchor="middle" className="donut-total-label">Cases</text>
          </svg>
          <ul className="donut-legend">
            {counts.map(item => (
              <li key={item.label}>
                <i style={{ background: colors[item.label] }} />
                {item.label} <b>{item.value}</b>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="muted">No cases yet.</p>
      )}
    </section>
  );
}

// ============================================
// MOST COMMON NATURE (Helper)
// ============================================
function getMostCommonNature(cases: Case[]) {
  const counts = new Map<string, number>();
  cases.forEach(c => {
    const nature = c.nature_of_case || 'Uncategorized';
    counts.set(nature, (counts.get(nature) || 0) + 1);
  });
  
  let maxCount = 0;
  let maxNature = 'No cases yet';
  
  for (const [nature, count] of counts) {
    if (count > maxCount) {
      maxCount = count;
      maxNature = nature;
    }
  }
  
  return { nature: maxNature, count: maxCount };
}

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================
export function Dashboard({ cases }: { cases: Case[] }) {
  const people = cases.flatMap(item => [item.complainant, item.respondent]);
  
  // Calculate metrics
  const totalCases = cases.length;
  const settledCases = cases.filter(c => c.status === 'Settled').length;
  const settlementRate = totalCases > 0 ? (settledCases / totalCases) * 100 : 0;
  const mostCommon = getMostCommonNature(cases);
  
  // Prepare chart data
  const nature = caseNatures.map(label => ({
    label,
    value: cases.filter(item => item.nature_of_case === label).length
  }));
  
  const genders = ['Female', 'Male', 'Prefer not to say', 'Unspecified'].map(label => ({
    label,
    value: people.filter(person => (person.gender || 'Unspecified') === label).length
  }));
  
  const ranges = [
    ['Under 18', 0, 17],
    ['18–29', 18, 29],
    ['30–44', 30, 44],
    ['45–59', 45, 59],
    ['60+', 60, Infinity]
  ] as const;
  
  const ages = ranges.map(([label, min, max]) => ({
    label,
    value: people.filter(person => {
      const value = Number(age(person.date_of_birth));
      return Number.isFinite(value) && value >= min && value <= max;
    }).length
  }));

  return (
    <>
      {/* KPI Cards */}
      <div className="stats">
        <Stat 
          label="Total Cases" 
          value={totalCases}
          subtitle={`${settledCases} settled`}
        />
        <Stat 
          label="Most Common Case" 
          value={mostCommon.nature}
          subtitle={`${mostCommon.count} cases`}
        />
        <Stat 
          label="Settlement Rate" 
          value={`${settlementRate.toFixed(1)}%`}
          subtitle={`${settledCases} of ${totalCases} cases settled`}
        />
      </div>

      {/* Charts */}
      <div className="dashboard-charts">
        <div className="dashboard-top-row">
          <div className="nature-cell">
            <HorizontalBars title="Cases by Nature" data={nature} />
          </div>
          <div className="line-donut-stack">
            <div className="line-cell">
              <CasesOverTimeChart cases={cases} />
            </div>
            <div className="donut-cell">
              <StatusDonut cases={cases} />
            </div>
          </div>
        </div>
        <div className="dashboard-bottom-row">
          <div className="age-cell">
            <HorizontalBars title="Age Distribution" data={ages} color="green" />
          </div>
          <div className="gender-cell">
            <HorizontalBars title="Cases by Gender" data={genders} color="blue" />
          </div>
        </div>
      </div>
    </>
  );
}