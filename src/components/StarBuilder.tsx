import React, { useState } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Plus, 
  TrendingUp,
  Award,
  ChevronLeft,
  ChevronRight,
  Check,
  FileCode,
  Layout
} from 'lucide-react';
import { buildStarStory } from '../services/groqService';

interface StarBuilderProps {
  resumeText: string;
  setResumeText: (text: string) => void;
}

const StarBuilder: React.FC<StarBuilderProps> = ({ resumeText, setResumeText }) => {
  const [situation, setSituation] = useState<string>('');
  const [task, setTask] = useState<string>('');
  const [action, setAction] = useState<string>('');
  const [result, setResult] = useState<string>('');
  
  const [activeStep, setActiveStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [compiledBullet, setCompiledBullet] = useState<string>('');

  const steps = [
    { 
      key: 'S', 
      name: 'Situation', 
      label: 'S • Situation Context', 
      value: situation, 
      setValue: setSituation, 
      placeholder: 'e.g. In my previous role, our database query latency peaked at 1200ms during user spikes.', 
      tip: 'Set the context: What was the problem, project scale, or business challenge you faced?' 
    },
    { 
      key: 'T', 
      name: 'Task', 
      label: 'T • Task Objective', 
      value: task, 
      setValue: setTask, 
      placeholder: 'e.g. My mandate was to slash query lookup times to under 200ms without upgrading hosting.', 
      tip: 'Define the goal: What was your specific responsibility or target metric?' 
    },
    { 
      key: 'A', 
      name: 'Action', 
      label: 'A • Action Taken', 
      value: action, 
      setValue: setAction, 
      placeholder: 'e.g. Rebuilt nested SQL joints, created composite indexes in PostgreSQL, and configured Redis key cache.', 
      tip: 'Describe the work: What technical choices, tools, or process steps did you implement?' 
    },
    { 
      key: 'R', 
      name: 'Result', 
      label: 'R • Measurable Result', 
      value: result, 
      setValue: setResult, 
      placeholder: 'e.g. Slashed latency to 140ms (a 9x speedup) and decreased CPU load by 30%.', 
      tip: 'Quantify the outcome: What was the measurable impact, metric improvement, or key learning?' 
    }
  ];

  const handleCompile = async () => {
    if (!situation.trim() || !task.trim() || !action.trim() || !result.trim()) {
      alert('Please fill out all four STAR fields to construct your story.');
      return;
    }

    setLoading(true);
    setCompiledBullet('');

    try {
      const bullet = await buildStarStory(situation, task, action, result);
      setCompiledBullet(bullet);
    } catch (e) {
      console.error(e);
      alert('Failed to compile behavioral story.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(compiledBullet);
    alert('Compiled bullet point copied to clipboard!');
  };

  const injectIntoResume = () => {
    if (!compiledBullet) return;
    
    let updatedResume = resumeText;
    if (updatedResume.includes('EXPERIENCE')) {
      updatedResume = updatedResume.replace('EXPERIENCE\n', `EXPERIENCE\n- ${compiledBullet}\n`);
      alert('Successfully injected as a highlight under your Experience header!');
    } else {
      updatedResume += `\n\n- ${compiledBullet}`;
      alert('Experience header not found. Appended bullet point to the end of your resume!');
    }
    setResumeText(updatedResume);
  };

  const currentStep = steps[activeStep];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'white', letterSpacing: '-0.3px' }}>STAR Story Architect</h2>
          <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '12.5px', marginTop: '2px' }}>
            Deconstruct project accomplishments into Situation, Task, Action, and Result vectors for metric-driven bullets.
          </p>
        </div>
      </div>

      {/* Figma 3-Column Workspace Grid */}
      <div className="figma-workspace-grid">
        
        {/* Column 1: Left Inspector (Stepper Wizard) */}
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', minHeight: '440px' }}>
          <h3 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px', color: 'white' }}>
            <Award size={14} style={{ color: 'hsl(var(--primary))' }} />
            Inspector Settings
          </h3>

          {/* Mini Stepper Bubble Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', marginBottom: '10px' }}>
            <div style={{
              position: 'absolute',
              top: '14px',
              left: '12%',
              right: '12%',
              height: '1px',
              background: 'rgba(255,255,255,0.04)',
              zIndex: 0
            }} />
            
            <div style={{
              position: 'absolute',
              top: '14px',
              left: '12%',
              width: `${(activeStep / 3) * 76}%`,
              height: '1px',
              background: 'hsl(var(--primary))',
              zIndex: 0,
              transition: 'width 0.2s ease-in-out'
            }} />

            {steps.map((step, idx) => {
              const isActive = activeStep === idx;
              const isCompleted = step.value.trim().length > 0;
              
              return (
                <div 
                  key={step.key} 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    zIndex: 1, 
                    cursor: 'pointer'
                  }}
                  onClick={() => setActiveStep(idx)}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    transition: 'all 0.15s ease',
                    background: isActive 
                      ? 'hsl(var(--primary))' 
                      : isCompleted 
                        ? 'rgba(16, 185, 129, 0.08)' 
                        : 'hsl(var(--bg-obsidian))',
                    color: isActive 
                      ? '#09090b' 
                      : isCompleted 
                        ? 'hsl(var(--accent-green))' 
                        : 'hsl(var(--text-muted))',
                    border: isActive 
                      ? 'none' 
                      : isCompleted 
                        ? '1px solid hsl(var(--accent-green) / 0.2)' 
                        : '1px solid hsl(var(--border-color))'
                  }}>
                    {isCompleted && !isActive ? <Check size={11} /> : step.key}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Inspector Form Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'white' }}>{currentStep.label}</span>
              <span style={{ fontSize: '10px', color: 'hsl(var(--text-muted))' }}>{activeStep + 1} / 4</span>
            </div>
            
            <textarea
              rows={5}
              value={currentStep.value}
              onChange={(e) => currentStep.setValue(e.target.value)}
              className="form-textarea"
              placeholder={currentStep.placeholder}
              style={{ resize: 'none', width: '100%', fontSize: '12.5px', lineHeight: '1.4', background: 'hsl(var(--bg-obsidian))' }}
            />
            <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', lineHeight: '1.3' }}>
              {currentStep.tip}
            </span>
          </div>

          {/* Stepper Navigation Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginTop: '10px' }}>
            <button
              onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
              disabled={activeStep === 0}
              className="btn-secondary"
              style={{ flex: 1, justifyContent: 'center', opacity: activeStep === 0 ? 0.4 : 1, padding: '6px 12px', fontSize: '12px' }}
            >
              <ChevronLeft size={14} />
              Back
            </button>
            
            {activeStep < 3 ? (
              <button
                onClick={() => setActiveStep(prev => Math.min(3, prev + 1))}
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center', padding: '6px 12px', fontSize: '12px' }}
              >
                Next
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleCompile}
                className="btn-primary"
                disabled={loading}
                style={{ flex: 1, justifyContent: 'center', padding: '6px 12px', fontSize: '12px' }}
              >
                {loading ? (
                  <>
                    <RefreshCw size={14} className="spin-animation" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Sparkles size={13} />
                    Compile
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Column 2: Center Canvas Sheet (Parallax Draft Deck) */}
        <div className="glass-panel" style={{ 
          padding: '16px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px', 
          background: 'hsl(var(--bg-obsidian))', 
          height: '100%', 
          minHeight: '440px',
          borderStyle: 'dashed'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px', color: 'hsl(var(--text-secondary))' }}>
              <Layout size={13} />
              Artboard Canvas
            </span>
            <span style={{ fontSize: '10px', color: 'hsl(var(--text-muted))', fontFamily: 'monospace' }}>behavioral_deck_01.draft</span>
          </div>

          {/* Interactive Draft Card Mockup */}
          <div style={{
            flex: 1,
            background: 'hsl(var(--bg-card))',
            border: '1px solid hsl(var(--border-color))',
            borderRadius: '6px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Subtle Drafting Grid Lines Overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.015) 1px, transparent 1px)',
              backgroundSize: '15px 15px',
              pointerEvents: 'none',
              zIndex: 0
            }} />

            <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>
              <div style={{ borderBottom: '1px solid hsl(var(--border-color))', paddingBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'hsl(var(--text-muted))', textTransform: 'uppercase' }}>STAR Story Draft Card</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                {[
                  { key: 0, step: 'S', title: 'Situation', val: situation, placeholder: 'Specify the organizational context...', color: 'hsl(var(--primary))' },
                  { key: 1, step: 'T', title: 'Task', val: task, placeholder: 'Specify your target objectives...', color: 'hsl(var(--secondary))' },
                  { key: 2, step: 'A', title: 'Action', val: action, placeholder: 'Specify actions and technologies implemented...', color: 'hsl(var(--accent-green))' },
                  { key: 3, step: 'R', title: 'Result', val: result, placeholder: 'Specify quantitative metrics or outcomes...', color: 'hsl(var(--secondary))' }
                ].map((item) => {
                  const isEditing = activeStep === item.key;
                  return (
                    <div 
                      key={item.key}
                      style={{
                        padding: '10px 12px',
                        background: isEditing ? 'rgba(255,255,255,0.015)' : 'transparent',
                        border: isEditing 
                          ? '1px solid hsl(var(--primary) / 0.3)' 
                          : '1px solid transparent',
                        borderRadius: '6px',
                        transition: 'all 0.15s ease',
                        cursor: 'pointer'
                      }}
                      onClick={() => setActiveStep(item.key)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                        <span style={{ 
                          fontSize: '9px', 
                          fontWeight: 800, 
                          color: '#09090b', 
                          background: item.val.trim() ? item.color : 'hsl(var(--text-muted))', 
                          padding: '1px 4px', 
                          borderRadius: '2px' 
                        }}>
                          {item.step}
                        </span>
                        <span style={{ fontSize: '10.5px', fontWeight: 700, color: isEditing ? 'hsl(var(--primary))' : 'white', opacity: isEditing ? 1 : 0.6 }}>
                          {item.title}
                        </span>
                        {isEditing && (
                          <span style={{ fontSize: '9px', color: 'hsl(var(--primary))', marginLeft: 'auto', fontWeight: 600 }}>Active Layer</span>
                        )}
                      </div>
                      <p style={{ 
                        fontSize: '11.5px', 
                        color: item.val.trim() ? 'hsl(var(--text-secondary))' : 'hsl(var(--text-muted))',
                        fontStyle: item.val.trim() ? 'normal' : 'italic',
                        lineHeight: '1.4',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}>
                        {item.val.trim() ? item.val : item.placeholder}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Right Compiler Output */}
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', minHeight: '440px' }}>
          <h3 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px', color: 'white' }}>
            <TrendingUp size={14} style={{ color: 'hsl(var(--primary))' }} />
            Output Compiler
          </h3>

          {compiledBullet ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, justifyContent: 'space-between' }}>
              <div 
                style={{ 
                  padding: '14px', 
                  background: 'hsl(var(--bg-obsidian))', 
                  border: '1px solid hsl(var(--primary) / 0.2)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  lineHeight: '1.5',
                  color: 'white',
                  fontWeight: 500,
                  position: 'relative'
                }}
              >
                <div style={{ position: 'absolute', top: '-8px', left: '10px', background: 'hsl(var(--primary))', color: '#09090b', fontSize: '8px', padding: '1px 5px', borderRadius: '3px', textTransform: 'uppercase', fontWeight: 700 }}>
                  ATS Bullet
                </div>
                "{compiledBullet}"
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button onClick={copyToClipboard} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '8px 12px' }}>
                  <Copy size={13} />
                  Copy Bullet
                </button>
                <button onClick={injectIntoResume} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '8px 12px' }}>
                  <Plus size={13} />
                  Inject into Resume
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'hsl(var(--text-muted))',
              textAlign: 'center',
              border: '1px dashed hsl(var(--border-color))',
              borderRadius: '6px',
              padding: '16px'
            }}>
              <FileCode size={28} style={{ marginBottom: '10px', color: 'hsl(var(--text-muted))' }} />
              <h4 style={{ color: 'white', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Ready to Compile</h4>
              <p style={{ fontSize: '11px', maxWidth: '200px', lineHeight: '1.4' }}>
                Input Situation, Task, Action, and Result vectors in the inspector, then click Compile to synthesize optimized bullets.
              </p>
            </div>
          )}
        </div>

      </div>

      <style>{`
        .figma-workspace-grid {
          display: grid;
          grid-template-columns: 320px 1.2fr 300px;
          gap: 16px;
          align-items: start;
        }
        @media (max-width: 1200px) {
          .figma-workspace-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 900px) {
          .figma-workspace-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default StarBuilder;
