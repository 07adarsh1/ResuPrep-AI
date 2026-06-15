import React from 'react';
import { 
  FileText, 
  Video, 
  BookOpen, 
  ArrowUpRight, 
  Award, 
  Flame, 
  Clock, 
  Layers,
  Zap,
  Activity
} from 'lucide-react';
import TiltCard from './TiltCard';

interface DashboardProps {
  interviewAttempts: { id: string; role: string; type: string; score: number; date: string }[];
  resumeScore: number;
  targetRole: string;
  onNavigate: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  interviewAttempts, 
  resumeScore, 
  targetRole, 
  onNavigate 
}) => {
  // Calculations
  const avgInterviewScore = interviewAttempts.length > 0 
    ? Math.round(interviewAttempts.reduce((sum, item) => sum + item.score, 0) / interviewAttempts.length)
    : 0;

  const technicalAttempts = interviewAttempts.filter(item => item.type === 'Technical');
  const systemAttempts = interviewAttempts.filter(item => item.type === 'System Design');
  const behavioralAttempts = interviewAttempts.filter(item => item.type === 'Behavioral');

  const getAvg = (attempts: typeof interviewAttempts, fallback: number) => {
    if (attempts.length === 0) return fallback;
    return Math.round(attempts.reduce((sum, item) => sum + item.score, 0) / attempts.length);
  };

  const codingSkill = getAvg(technicalAttempts, 78);
  const systemSkill = getAvg(systemAttempts, 65);
  const communicationSkill = getAvg(behavioralAttempts, 82);
  const starSkill = resumeScore;
  const readinessSkill = Math.round((resumeScore + (avgInterviewScore || 60)) / 2);

  // Mapped skills for Radar Chart
  const skillsData = [
    { name: 'Technical', score: codingSkill },
    { name: 'System Design', score: systemSkill },
    { name: 'Readiness', score: readinessSkill },
    { name: 'Communication', score: communicationSkill },
    { name: 'STAR Impact', score: starSkill }
  ];

  // Circular progress parameters for Resume Score
  const radius = 45;
  const stroke = 6;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (resumeScore / 100) * circumference;

  // Generate SVG Line Chart Coordinates
  const getTrendLineData = () => {
    if (interviewAttempts.length === 0) return { points: '', dots: [], areaPoints: '' };
    
    const sorted = [...interviewAttempts].reverse();
    const width = 500;
    const height = 140;
    const paddingX = 40;
    const paddingY = 25;
    
    const xStep = sorted.length > 1 ? (width - paddingX * 2) / (sorted.length - 1) : 0;
    const usableHeight = height - paddingY * 2;
    
    const dots: { cx: number; cy: number; score: number; date: string }[] = [];
    const pointsList = sorted.map((attempt, idx) => {
      const cx = paddingX + idx * xStep;
      const cy = height - paddingY - ((attempt.score / 100) * usableHeight);
      dots.push({ cx, cy, score: attempt.score, date: attempt.date });
      return `${cx},${cy}`;
    });

    const points = pointsList.join(' ');
    const baselineY = height - paddingY;
    const areaPoints = `${paddingX},${baselineY} ${points} ${paddingX + (sorted.length - 1) * xStep},${baselineY}`;

    return { points, dots, areaPoints };
  };

  const { points: trendPoints, dots: trendDots, areaPoints: trendAreaPoints } = getTrendLineData();

  // Radar Chart coordinate generators
  const cx = 130;
  const cy = 125;
  const radarRadius = 75;
  
  const getRadarCoordinates = (index: number, score: number, maxRadius = 75) => {
    const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
    const r = (score / 100) * maxRadius;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle)
    };
  };

  // Generate concentric polygon grid points
  const getConcentricGridPoints = (percentage: number) => {
    const pointsList = [];
    for (let i = 0; i < 5; i++) {
      const coord = getRadarCoordinates(i, percentage, radarRadius);
      pointsList.push(`${coord.x},${coord.y}`);
    }
    return pointsList.join(' ');
  };

  const getMappedAreaPoints = () => {
    return skillsData.map((d, i) => {
      const coord = getRadarCoordinates(i, d.score, radarRadius);
      return `${coord.x},${coord.y}`;
    }).join(' ');
  };

  // Recommendations Engine
  const getRecommendations = () => {
    const recs = [];
    if (starSkill < 80) {
      recs.push({
        title: 'Review Resume ATS Alignment',
        desc: 'Your resume alignment score is under 80%. Add missing keywords to climb rankings.',
        tab: 'resume',
        icon: <FileText size={14} />
      });
    }
    if (systemSkill < 75) {
      recs.push({
        title: 'Study System Design Cards',
        desc: 'Review scalable microservices architectures and CDN caching in our study sheets.',
        tab: 'prep-sheets',
        icon: <BookOpen size={14} />
      });
    }
    if (communicationSkill < 80) {
      recs.push({
        title: 'Build STAR Stories',
        desc: 'Use the STAR Story Architect to format behavioral stories and practice voice answers.',
        tab: 'star-builder',
        icon: <Award size={14} />
      });
    }
    if (recs.length === 0) {
      recs.push({
        title: 'Conduct a Live Coding Interview',
        desc: 'Excellent readiness. Take a Technical mock interview to finalize your practice.',
        tab: 'mock-interview',
        icon: <Video size={14} />
      });
    }
    return recs;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Workspace Banner - Figma Clean Style wrapped in TiltCard */}
      <TiltCard className="glass-panel" style={{
        padding: '20px 24px',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ maxWidth: '650px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span style={{ 
                fontSize: '10px', 
                textTransform: 'uppercase', 
                letterSpacing: '1px', 
                fontWeight: 700, 
                color: 'hsl(var(--primary))',
                background: 'rgba(16, 185, 129, 0.08)',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                WORKSPACE ENGAGED
              </span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'white', letterSpacing: '-0.3px' }}>
              AI-Driven Placement Sandbox
            </h2>
            <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '12.5px', marginTop: '4px', lineHeight: '1.4' }}>
              A dense engineering tool that optimizes resumes for ATS scanners and triggers live, native mock interviews to accelerate engineering hires.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }} className="hide-on-mobile">
            <button onClick={() => onNavigate('mock-interview')} className="btn-primary" style={{ padding: '8px 14px' }}>
              <Video size={14} />
              Start Interview
            </button>
            <button onClick={() => onNavigate('builder')} className="btn-secondary" style={{ padding: '8px 14px' }}>
              <Layers size={14} />
              Build Resume
            </button>
          </div>
        </div>
      </TiltCard>

      {/* Primary Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        
        {/* Metric 1: Resume Alignment */}
        <TiltCard className="glass-panel" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div>
              <span style={{ color: 'hsl(var(--text-muted))', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Resume Fit Index</span>
              <h3 style={{ fontSize: '26px', fontWeight: 800, marginTop: '4px', marginBottom: '2px', color: 'white' }}>{resumeScore}%</h3>
              <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Flame size={12} style={{ color: 'hsl(var(--accent-amber))' }} />
                Role: {targetRole}
              </p>
            </div>
            <div style={{ position: 'relative', width: '80px', height: '80px' }}>
              <svg height="80" width="80">
                <circle
                  stroke="rgba(255,255,255,0.03)"
                  fill="transparent"
                  strokeWidth={stroke}
                  r={normalizedRadius}
                  cx="40"
                  cy="40"
                />
                <circle
                  stroke="hsl(var(--primary))"
                  fill="transparent"
                  strokeDasharray={circumference + ' ' + circumference}
                  style={{ strokeDashoffset }}
                  strokeWidth={stroke}
                  r={normalizedRadius}
                  cx="40"
                  cy="40"
                  className="progress-ring-circle"
                  strokeLinecap="round"
                />
              </svg>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'hsl(var(--primary))'
              }}>
                <FileText size={16} />
              </div>
            </div>
          </div>
        </TiltCard>

        {/* Metric 2: Interview Performance */}
        <TiltCard className="glass-panel" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
              <div>
                <span style={{ color: 'hsl(var(--text-muted))', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mock Interview Avg</span>
                <h3 style={{ fontSize: '26px', fontWeight: 800, marginTop: '4px', color: 'white' }}>
                  {avgInterviewScore > 0 ? `${avgInterviewScore}%` : 'N/A'}
                </h3>
              </div>
              <div style={{ 
                background: 'rgba(16, 185, 129, 0.06)', 
                color: 'hsl(var(--accent-green))', 
                padding: '6px', 
                borderRadius: '4px',
                border: '1px solid rgba(16, 185, 129, 0.12)'
              }}>
                <Award size={16} />
              </div>
            </div>
            <div style={{ marginTop: '10px' }}>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '2px', overflow: 'hidden', marginBottom: '6px' }}>
                <div style={{ 
                  width: `${avgInterviewScore || 0}%`, 
                  height: '100%', 
                  background: 'hsl(var(--primary))',
                  borderRadius: '2px',
                  transition: 'width 1s ease-in-out'
                }}></div>
              </div>
              <p style={{ color: 'hsl(var(--text-muted))', fontSize: '10.5px' }}>
                Based on {interviewAttempts.length} mock sessions
              </p>
            </div>
          </div>
        </TiltCard>

        {/* Metric 3: Readiness Score */}
        <TiltCard className="glass-panel" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
              <div>
                <span style={{ color: 'hsl(var(--text-muted))', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Overall Readiness</span>
                <h3 style={{ fontSize: '26px', fontWeight: 800, marginTop: '4px', color: 'white' }}>
                  {readinessSkill}%
                </h3>
              </div>
              <div style={{ 
                background: 'rgba(6, 182, 212, 0.06)', 
                color: 'hsl(var(--secondary))', 
                padding: '6px', 
                borderRadius: '4px',
                border: '1px solid rgba(6, 182, 212, 0.12)'
              }}>
                <Activity size={16} />
              </div>
            </div>
            <div style={{ marginTop: '10px' }}>
              <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '11px', lineHeight: '1.4' }}>
                {readinessSkill >= 80 
                  ? '⭐ Competitive: Highly prepared for top tech companies.'
                  : '📈 Aligning: Boost resume keywords to reach 80% fitness.'}
              </p>
            </div>
          </div>
        </TiltCard>

      </div>

      {/* Analytics Grid: SVG Line Chart & SVG Radar Skill Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '16px' }} className="responsive-grid">
        
        {/* Graph: Score Trend Over Time */}
        <TiltCard className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: 'white', letterSpacing: '0.5px' }}>
                Interview Trend Metrics
              </h3>
              <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>Score % over chronological attempts</span>
            </div>
            
            {interviewAttempts.length > 0 ? (
              <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', minHeight: '200px' }}>
                <svg viewBox="0 0 500 140" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="area-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--primary) / 0.08)" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>

                  {/* Y-axis precise grid guidelines */}
                  <line x1="40" y1="25" x2="470" y2="25" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="40" y1="65" x2="470" y2="65" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="40" y1="115" x2="470" y2="115" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

                  <text x="25" y="28" fill="hsl(var(--text-muted))" fontSize="8" fontWeight="bold" textAnchor="end">100%</text>
                  <text x="25" y="68" fill="hsl(var(--text-muted))" fontSize="8" fontWeight="bold" textAnchor="end">50%</text>
                  <text x="25" y="118" fill="hsl(var(--text-muted))" fontSize="8" fontWeight="bold" textAnchor="end">0%</text>

                  {/* Grid baseline area polygon */}
                  {trendAreaPoints && (
                    <polygon 
                      points={trendAreaPoints} 
                      fill="url(#area-grad)" 
                    />
                  )}

                  {/* High-precision line stroke */}
                  {trendPoints && (
                    <polyline 
                      points={trendPoints} 
                      fill="none" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth="1.5" 
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Minimal coordinate markers */}
                  {trendDots.map((dot, idx) => (
                    <g key={idx}>
                      <circle 
                        cx={dot.cx} 
                        cy={dot.cy} 
                        r="3.5" 
                        fill="hsl(var(--bg-card))" 
                        stroke="hsl(var(--secondary))" 
                        strokeWidth="1.5"
                      />
                      <text 
                        x={dot.cx} 
                        y={dot.cy - 8} 
                        fill="white" 
                        fontSize="9" 
                        fontWeight="700" 
                        textAnchor="middle"
                      >
                        {dot.score}%
                      </text>
                      <text 
                        x={dot.cx} 
                        y="130" 
                        fill="hsl(var(--text-muted))" 
                        fontSize="8" 
                        fontWeight="500"
                        textAnchor="middle"
                      >
                        {dot.date.substring(5)}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--text-muted))', border: '1px dashed hsl(var(--border-color))', borderRadius: '6px', minHeight: '180px', fontSize: '12.5px', width: '100%' }}>
                Take a mock interview to chart historical placement progress.
              </div>
            )}
          </div>
        </TiltCard>

        {/* Mapped SVG Radar Matrix */}
        <TiltCard className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', width: '100%' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: 'white', letterSpacing: '0.5px' }}>
                Skill Footprint
              </h3>
              <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>5-Axis Matrix</span>
            </div>

            <div style={{ width: '100%', height: '230px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <svg width="260" height="250" style={{ overflow: 'visible' }}>
                <defs>
                  <linearGradient id="radar-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary) / 0.18)" />
                    <stop offset="100%" stopColor="hsl(var(--secondary) / 0.18)" />
                  </linearGradient>
                </defs>

                {/* Concentric grid rings */}
                {[25, 50, 75, 100].map((level) => (
                  <polygon
                    key={level}
                    points={getConcentricGridPoints(level)}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.03)"
                    strokeWidth="1"
                  />
                ))}

                {/* Mapped Axis Lines */}
                {[0, 1, 2, 3, 4].map((i) => {
                  const coord = getRadarCoordinates(i, 100, radarRadius);
                  return (
                    <line
                      key={i}
                      x1={cx}
                      y1={cy}
                      x2={coord.x}
                      y2={coord.y}
                      stroke="rgba(255, 255, 255, 0.03)"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Filled Radar Area */}
                <polygon
                  points={getMappedAreaPoints()}
                  fill="url(#radar-grad)"
                  stroke="hsl(var(--primary))"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />

                {/* Grid Label Vertex Markers */}
                {skillsData.map((d, i) => {
                  const coord = getRadarCoordinates(i, d.score, radarRadius);
                  return (
                    <circle
                      key={i}
                      cx={coord.x}
                      cy={coord.y}
                      r="2.5"
                      fill="hsl(var(--secondary))"
                    />
                  );
                })}

                {/* Outer Text Labels */}
                {skillsData.map((d, i) => {
                  const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                  const offsetRadius = radarRadius + 15;
                  const x = cx + offsetRadius * Math.cos(angle);
                  const y = cy + offsetRadius * Math.sin(angle);
                  
                  let textAnchor: "inherit" | "end" | "start" | "middle" = "middle";
                  if (Math.cos(angle) > 0.2) textAnchor = "start";
                  else if (Math.cos(angle) < -0.2) textAnchor = "end";

                  return (
                    <text
                      key={i}
                      x={x}
                      y={y}
                      fill="hsl(var(--text-secondary))"
                      fontSize="9.5"
                      fontWeight="700"
                      textAnchor={textAnchor}
                      alignmentBaseline="middle"
                    >
                      {d.name.toUpperCase()} ({d.score}%)
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>
        </TiltCard>

      </div>

      {/* Main Grid: Past Attempts & AI Action Plan */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px' }} className="responsive-grid">
        
        {/* Left Side: Recent Interview Attempts */}
        <TiltCard className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: 'white', letterSpacing: '0.5px' }}>
                Interview Records
              </h3>
              <button 
                onClick={() => onNavigate('mock-interview')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'hsl(var(--primary))',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                Start New <ArrowUpRight size={12} />
              </button>
            </div>

            {interviewAttempts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {interviewAttempts.slice(0, 4).map((attempt) => (
                  <div 
                    key={attempt.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      background: 'rgba(255,255,255,0.01)',
                      border: '1px solid hsl(var(--border-color))',
                      borderRadius: '6px',
                      transition: 'all var(--transition-fast)'
                    }}
                    className="hover-card-row"
                  >
                    <div>
                      <h4 style={{ fontWeight: 600, fontSize: '13px', color: 'white' }}>{attempt.role}</h4>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '3px', fontSize: '11px', color: 'hsl(var(--text-muted))' }}>
                        <span>{attempt.type}</span>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Clock size={11} />
                          {attempt.date}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ 
                        fontWeight: 700, 
                        color: attempt.score >= 80 ? 'hsl(var(--accent-green))' : attempt.score >= 60 ? 'hsl(var(--accent-amber))' : 'hsl(var(--accent-rose))',
                        fontSize: '13px',
                        background: 'rgba(255,255,255,0.02)',
                        padding: '3px 6px',
                        borderRadius: '4px',
                        border: '1px solid hsl(var(--border-color))'
                      }}>
                        {attempt.score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '30px 10px',
                border: '1px dashed hsl(var(--border-color))',
                borderRadius: '6px',
                color: 'hsl(var(--text-muted))',
                width: '100%'
              }}>
                <Video size={24} style={{ marginBottom: '8px', strokeWidth: '1.5', color: 'hsl(var(--text-muted))' }} />
                <p style={{ fontSize: '12px', marginBottom: '8px' }}>No mock interviews recorded yet.</p>
                <button onClick={() => onNavigate('mock-interview')} className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                  Take First Interview
                </button>
              </div>
            )}
          </div>
        </TiltCard>

        {/* Right Side: AI Recommended Action Items */}
        <TiltCard className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', width: '100%' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: 'white', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={14} style={{ color: 'hsl(var(--primary))' }} /> AI Recommendation Engine
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {getRecommendations().map((rec, idx) => (
                <div 
                  key={idx}
                  onClick={() => onNavigate(rec.tab)}
                  style={{
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid hsl(var(--border-color))',
                    borderRadius: '6px',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-start',
                    transition: 'all var(--transition-fast)'
                  }}
                  className="hover-card-row"
                >
                  <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    color: 'hsl(var(--primary))',
                    padding: '6px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    {rec.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '12.5px', fontWeight: 700, color: 'white' }}>{rec.title}</h4>
                    <p style={{ fontSize: '11px', color: 'hsl(var(--text-secondary))', marginTop: '2px', lineHeight: '1.3' }}>
                      {rec.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TiltCard>

      </div>

      <style>{`
        .hover-card-row:hover {
          background: rgba(255,255,255,0.03) !important;
          border-color: hsl(var(--primary) / 0.3) !important;
        }
        @media (max-width: 968px) {
          .responsive-grid {
            grid-template-columns: 1fr !important;
          }
          .hide-on-mobile {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
