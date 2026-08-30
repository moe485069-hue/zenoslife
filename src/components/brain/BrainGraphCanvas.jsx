import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Eye, Link as LinkIcon, Filter, Layers, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import useAppStore from '../../store/appStore';
import haptics from '../../utils/haptics';

const DOMAIN_COLORS = {
  selfDiscovery: { bg: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)', labelFa: 'خودشناسی', labelEn: 'Self-Discovery', icon: '🪞' },
  wealth: { bg: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', labelFa: 'درآمد و ثروت', labelEn: 'Wealth & Goals', icon: '💰' },
  learning: { bg: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)', labelFa: 'یادگیری و خرد', labelEn: 'Learning & Wisdom', icon: '📚' },
  mindfulness: { bg: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)', labelFa: 'مراقبه و تندرستی', labelEn: 'Mindfulness', icon: '🧘' },
  health: { bg: '#14b8a6', glow: 'rgba(20, 184, 166, 0.4)', labelFa: 'بهداشت و نشاط', labelEn: 'Health & Care', icon: '🧼' },
  cosmic: { bg: '#ec4899', glow: 'rgba(236, 72, 153, 0.4)', labelFa: 'وحدت کیهانی', labelEn: 'Cosmic Oneness', icon: '🌌' },
  integrity: { bg: '#eab308', glow: 'rgba(234, 179, 8, 0.4)', labelFa: 'درستی و اخلاق', labelEn: 'Integrity', icon: '💎' },
  default: { bg: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)', labelFa: 'ایده متفرقه', labelEn: 'General Thought', icon: '💡' }
};

export default function BrainGraphCanvas({ nodes, links, onSelectNode, selectedNodeId }) {
  const { language } = useAppStore();
  const isRtl = language === 'fa';

  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [zoomLevel, setZoomLevel] = useState(1);

  // Position nodes in a harmonic organic circular/organic galaxy layout
  const positionedNodes = useMemo(() => {
    const width = 800;
    const height = 550;
    const centerX = width / 2;
    const centerY = height / 2;

    return nodes.map((node, index) => {
      // Golden angle spiral distribution
      const phi = (1 + Math.sqrt(5)) / 2;
      const angle = index * 2 * Math.PI * phi;
      const radius = Math.min(260, 60 + Math.sqrt(index + 1) * 65);
      
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      return {
        ...node,
        x,
        y,
        domainConfig: DOMAIN_COLORS[node.domain] || DOMAIN_COLORS.default
      };
    });
  }, [nodes]);

  // Filter visible nodes
  const filteredNodes = useMemo(() => {
    if (activeFilter === 'all') return positionedNodes;
    return positionedNodes.filter(n => n.domain === activeFilter);
  }, [positionedNodes, activeFilter]);

  const visibleNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);

  // Edges mapping
  const visibleLinks = useMemo(() => {
    return links.filter(l => {
      const sourceExists = visibleNodeIds.has(String(l.sourceId)) || positionedNodes.some(n => n.id === String(l.sourceId));
      const targetExists = visibleNodeIds.has(String(l.targetId)) || positionedNodes.some(n => n.id === String(l.targetId));
      return sourceExists && targetExists;
    }).map(l => {
      const sourceNode = positionedNodes.find(n => n.id === String(l.sourceId)) || positionedNodes[0];
      const targetNode = positionedNodes.find(n => n.id === String(l.targetId)) || positionedNodes[positionedNodes.length - 1];
      return {
        ...l,
        sourceNode,
        targetNode
      };
    });
  }, [links, visibleNodeIds, positionedNodes]);

  const handleNodeClick = (node) => {
    haptics.tap();
    onSelectNode(node);
  };

  const isConnected = (sourceId, targetId) => {
    return links.some(
      l => (String(l.sourceId) === String(sourceId) && String(l.targetId) === String(targetId)) ||
           (String(l.sourceId) === String(targetId) && String(l.targetId) === String(sourceId))
    );
  };

  return (
    <div className="relative w-full h-[520px] sm:h-[600px] rounded-3xl glass-card border border-[var(--border)] overflow-hidden bg-[#030014] select-none">
      
      {/* Background Starfield / Grid */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(168, 85, 247, 0.2) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Top Overlay Controls: Domain Filter Pills */}
      <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between gap-2 pointer-events-auto">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10">
          <button
            onClick={() => { setActiveFilter('all'); haptics.tap(); }}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeFilter === 'all' ? 'bg-[var(--accent)] text-white shadow-xs' : 'text-white/60 hover:text-white'
            }`}
          >
            {isRtl ? '🌐 تمام شبکه' : '🌐 All Nodes'}
          </button>

          {Object.entries(DOMAIN_COLORS).filter(([k]) => k !== 'default').map(([key, info]) => (
            <button
              key={key}
              onClick={() => { setActiveFilter(key); haptics.tap(); }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                activeFilter === key ? 'bg-white/20 text-white border border-white/30' : 'text-white/60 hover:text-white'
              }`}
            >
              <span>{info.icon}</span>
              <span className="hidden sm:inline">{isRtl ? info.labelFa : info.labelEn}</span>
            </button>
          ))}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 text-white/70">
          <button
            onClick={() => setZoomLevel(z => Math.min(1.4, z + 0.1))}
            className="p-1.5 hover:text-white rounded-lg active:scale-95"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="text-[10px] px-1 font-mono hover:text-white"
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          <button
            onClick={() => setZoomLevel(z => Math.max(0.7, z - 0.1))}
            className="p-1.5 hover:text-white rounded-lg active:scale-95"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
        </div>
      </div>

      {/* Main SVG Graph Surface */}
      <svg
        viewBox="0 0 800 550"
        className="w-full h-full cursor-grab active:cursor-grabbing transition-transform duration-300"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        <defs>
          {/* Glowing node gradients */}
          {Object.entries(DOMAIN_COLORS).map(([key, info]) => (
            <radialGradient key={key} id={`glow-${key}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={info.bg} stopOpacity="1" />
              <stop offset="100%" stopColor={info.bg} stopOpacity="0.1" />
            </radialGradient>
          ))}

          {/* Animated Edge Marker */}
          <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(168, 85, 247, 0.6)" />
          </marker>
        </defs>

        {/* 1. EDGES / CONNECTING SYNAPSES */}
        <g className="links">
          {visibleLinks.map((link, idx) => {
            if (!link.sourceNode || !link.targetNode) return null;
            
            const isHighlighted = 
              hoveredNodeId === String(link.sourceId) || 
              hoveredNodeId === String(link.targetId) ||
              selectedNodeId === String(link.sourceId) ||
              selectedNodeId === String(link.targetId);

            return (
              <g key={idx}>
                {/* Curved Connection Path */}
                <path
                  d={`M ${link.sourceNode.x} ${link.sourceNode.y} Q ${(link.sourceNode.x + link.targetNode.x) / 2} ${(link.sourceNode.y + link.targetNode.y) / 2 - 20} ${link.targetNode.x} ${link.targetNode.y}`}
                  fill="none"
                  stroke={isHighlighted ? '#c084fc' : 'rgba(255, 255, 255, 0.15)'}
                  strokeWidth={isHighlighted ? 2.5 : 1.2}
                  strokeDasharray={isHighlighted ? 'none' : '4 4'}
                  className="transition-all duration-300"
                />

                {/* Animated Flowing Particle through connection */}
                {isHighlighted && (
                  <circle r="3" fill="#ec4899">
                    <animateMotion
                      path={`M ${link.sourceNode.x} ${link.sourceNode.y} Q ${(link.sourceNode.x + link.targetNode.x) / 2} ${(link.sourceNode.y + link.targetNode.y) / 2 - 20} ${link.targetNode.x} ${link.targetNode.y}`}
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
              </g>
            );
          })}
        </g>

        {/* 2. NODES */}
        <g className="nodes">
          {filteredNodes.map((node) => {
            const isHovered = hoveredNodeId === node.id;
            const isSelected = selectedNodeId === node.id;
            const isNeighbor = hoveredNodeId && isConnected(hoveredNodeId, node.id);

            const isDimmed = (hoveredNodeId && !isHovered && !isNeighbor) || 
                             (selectedNodeId && !isSelected && !isConnected(selectedNodeId, node.id));

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => handleNodeClick(node)}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                className="cursor-pointer transition-opacity duration-300"
                opacity={isDimmed ? 0.35 : 1}
              >
                {/* Outer Glow Halo */}
                {(isHovered || isSelected) && (
                  <circle
                    r="32"
                    fill={node.domainConfig.bg}
                    opacity="0.25"
                    className="animate-ping"
                  />
                )}

                <circle
                  r={isSelected ? 20 : (isHovered ? 18 : 14)}
                  fill={`url(#glow-${node.domain || 'default'})`}
                  stroke={isSelected ? '#ffffff' : node.domainConfig.bg}
                  strokeWidth={isSelected ? 3 : 2}
                  filter="drop-shadow(0 0 10px rgba(168, 85, 247, 0.5))"
                  className="transition-all duration-200"
                />

                {/* Node Icon */}
                <text
                  textAnchor="middle"
                  dy="4"
                  fontSize={isSelected ? "13" : "11"}
                  className="pointer-events-none select-none"
                >
                  {node.domainConfig.icon}
                </text>

                {/* Node Label Text */}
                <text
                  textAnchor="middle"
                  dy="28"
                  fill="#f1f5f9"
                  fontSize="9.5"
                  fontWeight="bold"
                  className="pointer-events-none select-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                  dir={isRtl ? 'rtl' : 'ltr'}
                >
                  {node.title.length > 20 ? `${node.title.slice(0, 20)}...` : node.title}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Bottom Network Stats Ribbon */}
      <div className="absolute bottom-3 inset-x-4 z-20 flex items-center justify-between text-[11px] text-white/60 pointer-events-none">
        <div className="flex items-center gap-2 p-1.5 px-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
          <Sparkles size={13} className="text-[var(--accent)]" />
          <span>{filteredNodes.length} {isRtl ? 'گره ذهنی' : 'Thought Nodes'}</span>
          <span>•</span>
          <span>{visibleLinks.length} {isRtl ? 'پیوند عصبی' : 'Synaptic Links'}</span>
        </div>

        <span className="hidden sm:block text-[10px] text-white/40">
          {isRtl ? 'روی هر گره کلیک کنید تا جزئیات و ارتباطات آن باز شود' : 'Click on any node to view connections'}
        </span>
      </div>
    </div>
  );
}
