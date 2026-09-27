import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { Footprints, Flame, Trophy, Activity, Calendar, Zap, CheckCircle2 } from 'lucide-react';
import { DayActivityPoint } from '../../utils/historyData';
import { useApp } from '../../context/AppContext';

interface D3ActivityTrendsChartProps {
  data: DayActivityPoint[];
  stepGoal?: number;
}

export const D3ActivityTrendsChart: React.FC<D3ActivityTrendsChartProps> = ({
  data,
  stepGoal = 10000,
}) => {
  const { isDarkMode } = useApp();
  const [metricMode, setMetricMode] = useState<'steps' | 'calories'>('steps');
  const [hoveredPoint, setHoveredPoint] = useState<DayActivityPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Compute 30-day summary stats
  const totalSteps = data.reduce((sum, d) => sum + d.steps, 0);
  const avgSteps = Math.round(totalSteps / (data.length || 1));
  const daysMetGoal = data.filter(d => d.goalMet).length;
  const consistencyRate = Math.round((daysMetGoal / (data.length || 1)) * 100);
  const totalCalories = data.reduce((sum, d) => sum + d.caloriesBurned, 0);
  const avgCalories = Math.round(totalCalories / (data.length || 1));
  const totalDistance = Number(data.reduce((sum, d) => sum + d.distanceKm, 0).toFixed(1));

  // D3 Rendering Effect
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous elements

    const width = 500;
    const height = 230;
    const margin = { top: 25, right: 20, bottom: 35, left: 45 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const defs = svg.append('defs');

    // Gradient for steps bars
    const barGradientMet = defs
      .append('linearGradient')
      .attr('id', 'step-bar-met')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    barGradientMet.append('stop').attr('offset', '0%').attr('stop-color', '#10B981').attr('stop-opacity', 0.95);
    barGradientMet.append('stop').attr('offset', '100%').attr('stop-color', '#047857').attr('stop-opacity', 0.5);

    const barGradientPending = defs
      .append('linearGradient')
      .attr('id', 'step-bar-pending')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    barGradientPending.append('stop').attr('offset', '0%').attr('stop-color', '#06B6D4').attr('stop-opacity', 0.8);
    barGradientPending.append('stop').attr('offset', '100%').attr('stop-color', '#0E7490').attr('stop-opacity', 0.4);

    // Gradient for calorie area
    const calorieGradient = defs
      .append('linearGradient')
      .attr('id', 'calorie-area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    calorieGradient.append('stop').attr('offset', '0%').attr('stop-color', '#F59E0B').attr('stop-opacity', 0.35);
    calorieGradient.append('stop').attr('offset', '100%').attr('stop-color', '#F59E0B').attr('stop-opacity', 0.0);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale: band scale for bars or point scale for lines
    const xScaleBand = d3
      .scaleBand<string>()
      .domain(data.map(d => d.date))
      .range([0, innerWidth])
      .padding(0.24);

    const xScalePoint = d3
      .scalePoint<string>()
      .domain(data.map(d => d.date))
      .range([0, innerWidth])
      .padding(0.1);

    // Y Scale depending on metric
    const maxVal = metricMode === 'steps' 
      ? Math.max(stepGoal * 1.3, ...data.map(d => d.steps))
      : Math.max(650, ...data.map(d => d.caloriesBurned)) * 1.25;

    const yScale = d3
      .scaleLinear()
      .domain([0, maxVal])
      .range([innerHeight, 0])
      .nice();

    // Grid lines
    const yTicks = yScale.ticks(5);
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', isDarkMode ? '#1E293B' : '#E2E8F0')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3');

    // Y Axis text
    g.append('g')
      .selectAll('text')
      .data(yTicks)
      .enter()
      .append('text')
      .attr('x', -8)
      .attr('y', d => yScale(d) + 3)
      .attr('text-anchor', 'end')
      .attr('fill', isDarkMode ? '#64748B' : '#475569')
      .attr('font-size', '9px')
      .attr('font-family', 'ui-monospace, monospace')
      .text(d => (metricMode === 'steps' ? `${(d / 1000).toFixed(0)}k` : `${d}`));

    // X Axis text (show every 5th day and today)
    const xLabels = data.filter((_, idx) => idx % 5 === 0 || idx === data.length - 1);
    g.append('g')
      .selectAll('text')
      .data(xLabels)
      .enter()
      .append('text')
      .attr('x', d => (xScaleBand(d.date) || 0) + (xScaleBand.bandwidth() / 2))
      .attr('y', innerHeight + 20)
      .attr('text-anchor', 'middle')
      .attr('fill', isDarkMode ? '#64748B' : '#475569')
      .attr('font-size', '9px')
      .attr('font-family', 'ui-monospace, monospace')
      .text(d => d.displayDate);

    if (metricMode === 'steps') {
      // 10,000 Step Goal Reference Line
      const goalY = yScale(stepGoal);
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', goalY)
        .attr('y2', goalY)
        .attr('stroke', '#10B981')
        .attr('stroke-width', 1.2)
        .attr('stroke-dasharray', '4,4');

      // Step Goal badge
      g.append('rect')
        .attr('x', innerWidth - 82)
        .attr('y', goalY - 14)
        .attr('width', 82)
        .attr('height', 13)
        .attr('rx', 4)
        .attr('fill', '#064E3B')
        .attr('stroke', '#10B981')
        .attr('stroke-width', 0.8);

      g.append('text')
        .attr('x', innerWidth - 41)
        .attr('y', goalY - 4)
        .attr('text-anchor', 'middle')
        .attr('fill', '#A7F3D0')
        .attr('font-size', '8px')
        .attr('font-weight', 'bold')
        .attr('font-family', 'ui-monospace, monospace')
        .text(`Goal: ${stepGoal.toLocaleString()}`);

      // Average Line
      const avgY = yScale(avgSteps);
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', avgY)
        .attr('y2', avgY)
        .attr('stroke', '#38BDF8')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '2,2');

      // Bars with rounded top corners
      g.selectAll('.step-bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'step-bar')
        .attr('x', d => xScaleBand(d.date) || 0)
        .attr('y', d => yScale(d.steps))
        .attr('width', xScaleBand.bandwidth())
        .attr('height', d => Math.max(2, innerHeight - yScale(d.steps)))
        .attr('rx', 2.5)
        .attr('fill', d => (d.goalMet ? 'url(#step-bar-met)' : 'url(#step-bar-pending)'))
        .attr('opacity', d => (d.isToday ? 1 : 0.85));

    } else {
      // Calorie Mode: Area & Line Chart
      const avgCalY = yScale(avgCalories);
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', avgCalY)
        .attr('y2', avgCalY)
        .attr('stroke', '#F59E0B')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3');

      g.append('text')
        .attr('x', innerWidth - 6)
        .attr('y', avgCalY - 4)
        .attr('text-anchor', 'end')
        .attr('fill', '#FCD34D')
        .attr('font-size', '8px')
        .attr('font-family', 'ui-monospace, monospace')
        .text(`30D Avg: ${avgCalories} kcal`);

      const areaGen = d3
        .area<DayActivityPoint>()
        .x(d => xScalePoint(d.date) || 0)
        .y0(innerHeight)
        .y1(d => yScale(d.caloriesBurned))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(data)
        .attr('fill', 'url(#calorie-area-gradient)')
        .attr('d', areaGen);

      const lineGen = d3
        .line<DayActivityPoint>()
        .x(d => xScalePoint(d.date) || 0)
        .y(d => yScale(d.caloriesBurned))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#F59E0B')
        .attr('stroke-width', 2.2)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('d', lineGen);

      // Points for high calorie workout days
      g.selectAll('.cal-dot')
        .data(data.filter(d => d.caloriesBurned >= 500 || d.isToday))
        .enter()
        .append('circle')
        .attr('cx', d => xScalePoint(d.date) || 0)
        .attr('cy', d => yScale(d.caloriesBurned))
        .attr('r', 3.5)
        .attr('fill', '#F59E0B')
        .attr('stroke', '#0F172A')
        .attr('stroke-width', 1.5);
    }

    // Crosshair & Interaction Overlay
    const crosshair = g.append('line')
      .attr('stroke', '#94A3B8')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2')
      .style('opacity', 0);

    const hoverDot = g.append('circle')
      .attr('r', 4.5)
      .attr('fill', metricMode === 'steps' ? '#10B981' : '#F59E0B')
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 2)
      .style('opacity', 0);

    const overlay = g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair');

    overlay
      .on('mousemove touchmove', function (event) {
        const [mouseX] = d3.pointer(event);
        
        let closest = data[0];
        let minDist = Infinity;
        data.forEach(d => {
          const cx = metricMode === 'steps' 
            ? (xScaleBand(d.date) || 0) + xScaleBand.bandwidth() / 2
            : xScalePoint(d.date) || 0;
          const diff = Math.abs(cx - mouseX);
          if (diff < minDist) {
            minDist = diff;
            closest = d;
          }
        });

        const cx = metricMode === 'steps'
          ? (xScaleBand(closest.date) || 0) + xScaleBand.bandwidth() / 2
          : xScalePoint(closest.date) || 0;
        const cy = metricMode === 'steps' ? yScale(closest.steps) : yScale(closest.caloriesBurned);

        crosshair
          .attr('x1', cx)
          .attr('x2', cx)
          .attr('y1', 0)
          .attr('y2', innerHeight)
          .style('opacity', 0.8);

        hoverDot
          .attr('cx', cx)
          .attr('cy', cy)
          .style('opacity', 1);

        setHoveredPoint(closest);
        setTooltipPos({
          x: cx + margin.left,
          y: cy + margin.top,
        });
      })
      .on('mouseleave touchend', function () {
        crosshair.style('opacity', 0);
        hoverDot.style('opacity', 0);
        setHoveredPoint(null);
        setTooltipPos(null);
      });

  }, [data, metricMode, stepGoal, avgSteps, avgCalories, isDarkMode]);

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-850 border border-slate-800 shadow-xl space-y-3.5">
      {/* Header & Metric Mode Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-white tracking-tight">30-Day Activity Levels</h2>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-400 uppercase tracking-wider">
                D3 Chart
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Step Consistency & Calorie Expenditure</p>
          </div>
        </div>

        {/* Metric Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setMetricMode('steps')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              metricMode === 'steps'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Footprints className="w-3 h-3" />
            <span>Steps</span>
          </button>

          <button
            onClick={() => setMetricMode('calories')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              metricMode === 'calories'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>Calories</span>
          </button>
        </div>
      </div>

      {/* 30-Day Key Performance Indicators */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Daily Average</span>
          <span className="text-xs font-bold text-slate-200 font-mono mt-0.5 block">
            {metricMode === 'steps' ? `${avgSteps.toLocaleString()}` : `${avgCalories} kcal`}
          </span>
        </div>

        <div className="p-2 rounded-xl bg-slate-950/70 border border-emerald-500/30">
          <span className="text-[10px] text-emerald-400 font-semibold block">Goal Hit Rate</span>
          <span className="text-xs font-bold text-white font-mono mt-0.5 block">
            {daysMetGoal}/30 ({consistencyRate}%)
          </span>
        </div>

        <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
          <span className="text-[10px] text-slate-400 block">30D Total</span>
          <span className="text-xs font-bold text-cyan-300 font-mono mt-0.5 block">
            {metricMode === 'steps' ? `${(totalSteps / 1000).toFixed(0)}k steps` : `${(totalCalories / 1000).toFixed(1)}k kcal`}
          </span>
        </div>

        <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
          <span className="text-[10px] text-slate-400 block">30D Distance</span>
          <span className="text-xs font-bold text-slate-300 font-mono mt-0.5 block">
            {totalDistance} km
          </span>
        </div>
      </div>

      {/* D3 Chart Area */}
      <div ref={containerRef} className="relative w-full bg-slate-950/80 p-2 rounded-xl border border-slate-850 overflow-hidden">
        <svg
          ref={svgRef}
          viewBox="0 0 500 230"
          className="w-full h-auto max-h-56 overflow-visible select-none"
        />

        {/* Floating Tooltip */}
        {hoveredPoint && tooltipPos && (
          <div
            className="pointer-events-none absolute z-20 px-3 py-2 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-md text-xs space-y-1 transform -translate-x-1/2 -translate-y-full transition-all duration-75"
            style={{
              left: `${Math.min(Math.max(tooltipPos.x, 80), 420)}px`,
              top: `${Math.max(tooltipPos.y - 12, 10)}px`,
            }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1">
              <span className="text-[10px] font-mono text-slate-400 font-medium">
                {hoveredPoint.displayDate} ({hoveredPoint.dayOfWeek})
              </span>
              <span className={`px-1.5 py-0.2 rounded text-[8px] font-semibold ${
                hoveredPoint.goalMet 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-cyan-500/20 text-cyan-400'
              }`}>
                {hoveredPoint.goalMet ? 'Goal Met' : 'Active'}
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-4 font-mono">
              <span className="text-slate-400 text-[10px]">Steps:</span>
              <span className="font-bold text-white text-sm">{hoveredPoint.steps.toLocaleString()}</span>
            </div>

            <div className="flex items-baseline justify-between gap-4 font-mono text-[10px]">
              <span className="text-slate-400">Calories Burned:</span>
              <span className="text-amber-400 font-semibold">{hoveredPoint.caloriesBurned} kcal</span>
            </div>

            <div className="flex items-baseline justify-between gap-4 font-mono text-[10px]">
              <span className="text-slate-400">Est. Distance:</span>
              <span className="text-slate-300 font-semibold">{hoveredPoint.distanceKm} km</span>
            </div>
          </div>
        )}
      </div>

      {/* Legend & Summary Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-[11px]">
        {metricMode === 'steps' ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" />
              <span className="text-slate-300">&ge; 10k Target Met</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-cyan-500 rounded-sm" />
              <span className="text-slate-400">&lt; 10k In Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-b border-dashed border-emerald-400" />
              <span className="text-emerald-300 font-mono text-[10px]">Goal Line</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-amber-400 rounded-full" />
              <span className="text-amber-300">Daily Active Burn</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-b border-dashed border-amber-300" />
              <span className="text-slate-400 font-mono text-[10px]">30D Average Line</span>
            </div>
          </div>
        )}

        <div className="text-[10px] text-slate-400 font-mono">
          Consistency: <span className="text-emerald-400 font-bold">{consistencyRate}% target hit</span>
        </div>
      </div>
    </div>
  );
};
