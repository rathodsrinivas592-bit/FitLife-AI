import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { TrendingDown, TrendingUp, Target, Calendar, Info, Sparkles } from 'lucide-react';
import { DayWeightPoint } from '../../utils/historyData';
import { useApp } from '../../context/AppContext';

interface D3WeightTrendChartProps {
  data: DayWeightPoint[];
  startWeight: number;
  currentWeight: number;
  targetWeight: number;
  goal: string;
}

export const D3WeightTrendChart: React.FC<D3WeightTrendChartProps> = ({
  data,
  startWeight,
  currentWeight,
  targetWeight,
  goal,
}) => {
  const { isDarkMode } = useApp();
  const [timeRange, setTimeRange] = useState<'7D' | '14D' | '30D'>('30D');
  const [showMovingAvg, setShowMovingAvg] = useState<boolean>(true);
  const [hoveredPoint, setHoveredPoint] = useState<DayWeightPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Filter data according to timeRange
  const filteredData = React.useMemo(() => {
    if (timeRange === '7D') return data.slice(-7);
    if (timeRange === '14D') return data.slice(-14);
    return data;
  }, [data, timeRange]);

  // Overall 30D stats
  const totalChange = Number((currentWeight - startWeight).toFixed(1));
  const remainingChange = Number((targetWeight - currentWeight).toFixed(1));
  const isLoss = goal === 'lose_weight' || totalChange < 0;

  // D3 Rendering Effect
  useEffect(() => {
    if (!svgRef.current || filteredData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const width = 500;
    const height = 230;
    const margin = { top: 25, right: 20, bottom: 35, left: 45 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Defs for gradients & filters
    const defs = svg.append('defs');

    // Area Gradient
    const areaGradient = defs
      .append('linearGradient')
      .attr('id', 'weight-area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    areaGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#10B981')
      .attr('stop-opacity', 0.35);

    areaGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#10B981')
      .attr('stop-opacity', 0.0);

    // Glow Filter
    const filter = defs.append('filter').attr('id', 'glow').attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%');
    filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'blur');
    filter.append('feMerge').selectAll('feMergeNode')
      .data(['blur', 'SourceGraphic'])
      .enter()
      .append('feMergeNode')
      .attr('in', d => d);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale
    const xScale = d3
      .scalePoint<string>()
      .domain(filteredData.map(d => d.date))
      .range([0, innerWidth])
      .padding(0.1);

    // Y Scale domain with padding
    const weights = filteredData.map(d => d.weight);
    if (showMovingAvg) {
      weights.push(...filteredData.map(d => d.movingAvg));
    }
    weights.push(targetWeight);

    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const yPad = Math.max(0.8, (maxWeight - minWeight) * 0.15);

    const yScale = d3
      .scaleLinear()
      .domain([minWeight - yPad, maxWeight + yPad])
      .range([innerHeight, 0])
      .nice();

    // Horizontal Grid Lines
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

    // Y Axis Labels
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
      .text(d => `${d.toFixed(1)}`);

    // X Axis Labels (selective subset so not crowded)
    const tickStep = filteredData.length <= 7 ? 1 : filteredData.length <= 14 ? 2 : 5;
    const xLabelsData = filteredData.filter((_, idx) => idx % tickStep === 0 || idx === filteredData.length - 1);

    g.append('g')
      .selectAll('text')
      .data(xLabelsData)
      .enter()
      .append('text')
      .attr('x', d => xScale(d.date) || 0)
      .attr('y', innerHeight + 20)
      .attr('text-anchor', 'middle')
      .attr('fill', isDarkMode ? '#64748B' : '#475569')
      .attr('font-size', '9px')
      .attr('font-family', 'ui-monospace, monospace')
      .text(d => d.displayDate);

    // Target Weight Reference Line
    const targetY = yScale(targetWeight);
    if (targetY >= 0 && targetY <= innerHeight) {
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', targetY)
        .attr('y2', targetY)
        .attr('stroke', '#06B6D4')
        .attr('stroke-width', 1.2)
        .attr('stroke-dasharray', '4,4');

      // Target pill label
      g.append('rect')
        .attr('x', innerWidth - 75)
        .attr('y', targetY - 14)
        .attr('width', 75)
        .attr('height', 13)
        .attr('rx', 4)
        .attr('fill', '#083344')
        .attr('stroke', '#06B6D4')
        .attr('stroke-width', 0.7);

      g.append('text')
        .attr('x', innerWidth - 37)
        .attr('y', targetY - 4)
        .attr('text-anchor', 'middle')
        .attr('fill', '#67E8F9')
        .attr('font-size', '8px')
        .attr('font-weight', 'bold')
        .attr('font-family', 'ui-monospace, monospace')
        .text(`Target: ${targetWeight}kg`);
    }

    // D3 Area Generator
    const areaGenerator = d3
      .area<DayWeightPoint>()
      .x(d => xScale(d.date) || 0)
      .y0(innerHeight)
      .y1(d => yScale(d.weight))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(filteredData)
      .attr('fill', 'url(#weight-area-gradient)')
      .attr('d', areaGenerator);

    // D3 Weight Trend Line
    const lineGenerator = d3
      .line<DayWeightPoint>()
      .x(d => xScale(d.date) || 0)
      .y(d => yScale(d.weight))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(filteredData)
      .attr('fill', 'none')
      .attr('stroke', '#10B981')
      .attr('stroke-width', 2.5)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('filter', 'url(#glow)')
      .attr('d', lineGenerator);

    // D3 Moving Average Line (if toggled)
    if (showMovingAvg && filteredData.length > 3) {
      const maLine = d3
        .line<DayWeightPoint>()
        .x(d => xScale(d.date) || 0)
        .y(d => yScale(d.movingAvg))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(filteredData)
        .attr('fill', 'none')
        .attr('stroke', '#F59E0B')
        .attr('stroke-width', 1.8)
        .attr('stroke-dasharray', '5,3')
        .attr('d', maLine);
    }

    // Circles for recorded weigh-ins and key endpoints
    const keyPoints = filteredData.filter((d, idx) => d.isRecorded || idx === 0 || idx === filteredData.length - 1);

    g.selectAll('.weight-circle')
      .data(keyPoints)
      .enter()
      .append('circle')
      .attr('class', 'weight-circle')
      .attr('cx', d => xScale(d.date) || 0)
      .attr('cy', d => yScale(d.weight))
      .attr('r', d => (d.isRecorded ? 4.5 : 3))
      .attr('fill', d => (d.isRecorded ? '#10B981' : '#059669'))
      .attr('stroke', '#0F172A')
      .attr('stroke-width', 2);

    // Invisible interactive hover overlay
    const bisectDate = (mouseX: number) => {
      let closestPoint = filteredData[0];
      let minDiff = Infinity;
      filteredData.forEach(d => {
        const x = xScale(d.date) || 0;
        const diff = Math.abs(x - mouseX);
        if (diff < minDiff) {
          minDiff = diff;
          closestPoint = d;
        }
      });
      return closestPoint;
    };

    const crosshair = g.append('line')
      .attr('stroke', '#94A3B8')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2')
      .style('opacity', 0);

    const hoverDot = g.append('circle')
      .attr('r', 5)
      .attr('fill', '#34D399')
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
        const point = bisectDate(mouseX);
        const px = xScale(point.date) || 0;
        const py = yScale(point.weight);

        crosshair
          .attr('x1', px)
          .attr('x2', px)
          .attr('y1', 0)
          .attr('y2', innerHeight)
          .style('opacity', 0.8);

        hoverDot
          .attr('cx', px)
          .attr('cy', py)
          .style('opacity', 1);

        setHoveredPoint(point);
        setTooltipPos({
          x: px + margin.left,
          y: py + margin.top,
        });
      })
      .on('mouseleave touchend', function () {
        crosshair.style('opacity', 0);
        hoverDot.style('opacity', 0);
        setHoveredPoint(null);
        setTooltipPos(null);
      });

  }, [filteredData, showMovingAvg, targetWeight, isDarkMode]);

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-850 border border-slate-800 shadow-xl space-y-3.5">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            {isLoss ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-white tracking-tight">Weight Loss Trend</h2>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 uppercase tracking-wider">
                D3 Interactive
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Last 30 Days Continuous Trajectory</p>
          </div>
        </div>

        {/* Time Range Pills */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {(['7D', '14D', '30D'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2 py-0.5 rounded-lg text-xs font-mono font-medium transition-all ${
                timeRange === range
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Metric High-Level Overview Grid */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 block">30D Start</span>
          <span className="text-xs font-bold text-slate-300 font-mono mt-0.5 block">{startWeight} kg</span>
        </div>

        <div className="p-2 rounded-xl bg-slate-950/70 border border-emerald-500/30">
          <span className="text-[10px] text-emerald-400 font-semibold block">Current</span>
          <span className="text-sm font-black text-white font-mono mt-0.5 block">{currentWeight} kg</span>
        </div>

        <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 block">Net 30D</span>
          <span className={`text-xs font-bold font-mono mt-0.5 block ${totalChange <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {totalChange > 0 ? `+${totalChange}` : totalChange} kg
          </span>
        </div>

        <div className="p-2 rounded-xl bg-slate-950/70 border border-cyan-500/30">
          <span className="text-[10px] text-cyan-400 font-semibold block">Target</span>
          <span className="text-xs font-bold text-cyan-300 font-mono mt-0.5 block">{targetWeight} kg</span>
        </div>
      </div>

      {/* SVG Chart Container */}
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
              <span className="text-[10px] font-mono text-slate-400 font-medium">{hoveredPoint.displayDate}</span>
              {hoveredPoint.isRecorded && (
                <span className="px-1 py-0.2 rounded text-[8px] bg-emerald-500/20 text-emerald-400 font-semibold">
                  Logged
                </span>
              )}
            </div>

            <div className="flex items-baseline justify-between gap-4 font-mono">
              <span className="text-slate-400 text-[10px]">Weight:</span>
              <span className="font-bold text-white text-sm">{hoveredPoint.weight} kg</span>
            </div>

            <div className="flex items-baseline justify-between gap-4 font-mono text-[10px]">
              <span className="text-slate-400">7D Moving Avg:</span>
              <span className="text-amber-400 font-semibold">{hoveredPoint.movingAvg} kg</span>
            </div>

            <div className="flex items-baseline justify-between gap-4 font-mono text-[10px]">
              <span className="text-slate-400">From 30D Start:</span>
              <span className={hoveredPoint.changeFromStart <= 0 ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                {hoveredPoint.changeFromStart > 0 ? `+${hoveredPoint.changeFromStart}` : hoveredPoint.changeFromStart} kg
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Legend & Options Toggle Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-[11px]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-400 rounded-full" />
            <span className="text-slate-300">Daily Trend</span>
          </div>

          <button
            onClick={() => setShowMovingAvg(!showMovingAvg)}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <span className={`w-3 h-0.5 rounded-full border-b border-dashed ${showMovingAvg ? 'border-amber-400' : 'border-slate-600'}`} />
            <span className={showMovingAvg ? 'text-amber-300 font-medium' : 'text-slate-500'}>
              7D Average {showMovingAvg ? 'ON' : 'OFF'}
            </span>
          </button>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-b border-dashed border-cyan-400" />
            <span className="text-cyan-300">Target</span>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 font-mono">
          Weekly Rate: <span className="text-emerald-400 font-bold font-mono">-0.48 kg/wk</span>
        </div>
      </div>
    </div>
  );
};
