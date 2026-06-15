import React, { useState } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  Plus, 
  ThumbsUp, 
  ThumbsDown
} from 'lucide-react';
import { analyzeResume } from '../services/groqService';
import type { ResumeAnalysisResult } from '../services/groqService';

interface ResumeOptimizerProps {
  resumeText: string;
  setResumeText: (text: string) => void;
  jobDescription: string;
  setJobDescription: (text: string) => void;
  setGlobalResumeScore: (score: number) => void;
}

const ResumeOptimizer: React.FC<ResumeOptimizerProps> = ({
  resumeText,
  setResumeText,
  jobDescription,
  setJobDescription,
  setGlobalResumeScore
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [analysis, setAnalysis] = useState<ResumeAnalysisResult | null>(() => {
    const saved = localStorage.getItem('resuprep_last_analysis');
    return saved ? JSON.parse(saved) : null;
  });

  const runAnalysis = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      alert('Please provide both your Resume and the target Job Description.');
      return;
    }

    setLoading(true);
    setAnalysis(null);
    
    // Cycle loading messages for rich AI experience
    const stages = [
      'Scanning resume files...',
      'Deconstructing job requirements...',
      'Mapping technical keyword compliance...',
      'Constructing STAR bullet improvements...',
      'Compiling final alignment report...'
    ];
    
    let currentStageIndex = 0;
    setLoadingStage(stages[0]);
    const stageInterval = setInterval(() => {
      currentStageIndex = (currentStageIndex + 1) % stages.length;
      setLoadingStage(stages[currentStageIndex]);
    }, 1500);

    try {
      const result = await analyzeResume(resumeText, jobDescription);
      setAnalysis(result);
      setGlobalResumeScore(result.score);
      localStorage.setItem('resuprep_last_resume_score', result.score.toString());
      localStorage.setItem('resuprep_last_analysis', JSON.stringify(result));
    } catch (e) {
      console.error(e);
      alert('Failed to analyze resume.');
    } finally {
      clearInterval(stageInterval);
      setLoading(false);
    }
  };

  const applyRewrite = (original: string, suggestion: string) => {
    // Attempt to locate and replace the original bullet point in the resume text editor
    if (resumeText.includes(original)) {
      const updatedResume = resumeText.replace(original, suggestion);
      setResumeText(updatedResume);
      alert('Bullet point successfully updated in your resume editor!');
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(suggestion);
      alert('Original text modified. Copied suggestion to clipboard instead!');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '28px', fontWeight: 800 }}>Resume Optimizer</h2>
        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '14px', marginTop: '4px' }}>
          Compare your resume with any job description, fetch ATS keyword match ratings, and improve bullet points using the STAR method.
        </p>
      </div>

      {/* Main Grid split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' }} className="optimizer-grid">
        
        {/* Left Panel: Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Target Job description */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} style={{ color: 'hsl(var(--primary))' }} />
              Target Job Description
            </h3>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="form-textarea"
              style={{ minHeight: '180px', resize: 'vertical', fontSize: '13px', lineHeight: '1.5' }}
              placeholder="Paste the target job description here..."
            />
          </div>

          {/* Resume Text Editor */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} style={{ color: 'hsl(var(--primary))' }} />
              Your Resume Content
            </h3>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="form-textarea"
              style={{ minHeight: '350px', resize: 'vertical', fontSize: '13px', fontFamily: 'monospace', lineHeight: '1.5' }}
              placeholder="Paste your raw resume text here..."
            />
          </div>

          <button 
            onClick={runAnalysis} 
            className="btn-primary" 
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="spin-animation" />
                Analyzing Alignment...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Analyze & Optimize Resume
              </>
            )}
          </button>
        </div>

        {/* Right Panel: Results */}
        <div className="glass-panel" style={{ padding: '24px', minHeight: '600px', position: 'relative' }}>
          
          {/* Loading state */}
          {loading && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'hsl(var(--bg-card) / 0.8)',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              backdropFilter: 'blur(8px)'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                border: '3px solid hsl(var(--primary) / 0.1)',
                borderTopColor: 'hsl(var(--primary))',
                marginBottom: '20px'
              }} className="spin-animation"></div>
              <h4 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '6px' }} className="text-gradient">AI Processing Engine</h4>
              <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '13px' }}>{loadingStage}</p>
            </div>
          )}

          {analysis ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Score Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid hsl(var(--border-color))', paddingBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Alignment Report</h3>
                  <p style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>Analyzed via Llama 3.3 (Groq)</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ 
                    fontSize: '24px', 
                    fontWeight: 800, 
                    color: analysis.score >= 80 ? 'hsl(var(--accent-green))' : 'hsl(var(--accent-amber))'
                  }}>
                    {analysis.score}%
                  </span>
                  <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', display: 'block' }}>Match Index</span>
                </div>
              </div>

              {/* Missing Keywords */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px', color: 'hsl(var(--text-primary))' }}>
                  Missing Keywords (ATS Gaps)
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {analysis.missingKeywords.map((kw, idx) => (
                    <span 
                      key={idx}
                      style={{
                        fontSize: '12px',
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#f87171',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontWeight: 600
                      }}
                    >
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="strengths-gaps-grid">
                
                <div style={{ background: 'rgba(16, 185, 129, 0.02)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '12px', padding: '16px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'hsl(var(--accent-green))', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <ThumbsUp size={14} /> Strengths
                  </h4>
                  <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'hsl(var(--text-secondary))', listStyleType: 'disc' }}>
                    {analysis.strengths.map((str, idx) => <li key={idx}>{str}</li>)}
                  </ul>
                </div>

                <div style={{ background: 'rgba(245, 158, 11, 0.02)', border: '1px solid rgba(245, 158, 11, 0.15)', borderRadius: '12px', padding: '16px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'hsl(var(--accent-amber))', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <ThumbsDown size={14} /> Key Gaps
                  </h4>
                  <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'hsl(var(--text-secondary))', listStyleType: 'disc' }}>
                    {analysis.weaknesses.map((weak, idx) => <li key={idx}>{weak}</li>)}
                  </ul>
                </div>

              </div>

              {/* STAR Rewrite Suggestions */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: 'hsl(var(--text-primary))' }}>
                  STAR Bullet Point Recommendations
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {analysis.bulletPoints.map((bp, idx) => (
                    <div 
                      key={idx}
                      style={{
                        background: 'rgba(255, 255, 255, 0.01)',
                        border: '1px solid hsl(var(--border-color))',
                        borderRadius: '12px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      {/* Original vs Rewrite comparison */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.05)', color: 'hsl(var(--text-muted))', padding: '2px 6px', borderRadius: '4px', marginTop: '2px', fontWeight: 600 }}>Original</span>
                          <p style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', fontStyle: 'italic', textDecoration: 'line-through' }}>{bp.original}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <span style={{ fontSize: '10px', background: 'rgba(139,92,246,0.15)', color: 'hsl(var(--primary))', padding: '2px 6px', borderRadius: '4px', marginTop: '2px', fontWeight: 600 }}>Suggested</span>
                          <p style={{ fontSize: '13px', color: 'hsl(var(--text-primary))', fontWeight: 500 }}>{bp.suggestion}</p>
                        </div>
                      </div>

                      {/* Rationale and Apply button */}
                      <div style={{ borderTop: '1px dashed hsl(var(--border-color))', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
                        <p style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>
                          💡 <strong>Why:</strong> {bp.rationale}
                        </p>
                        <button 
                          onClick={() => applyRewrite(bp.original, bp.suggestion)}
                          className="btn-secondary"
                          style={{
                            padding: '6px 12px',
                            fontSize: '11px',
                            borderColor: 'hsl(var(--primary) / 0.3)',
                            color: 'hsl(var(--primary))',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Apply Change
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'hsl(var(--text-muted))',
              textAlign: 'center',
              padding: '60px 20px'
            }}>
              <Sparkles size={48} style={{ marginBottom: '16px', color: 'hsl(var(--primary))', opacity: 0.5 }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'hsl(var(--text-primary))', marginBottom: '8px' }}>Optimization Report</h3>
              <p style={{ fontSize: '14px', maxWidth: '350px', lineHeight: '1.5' }}>
                Paste your resume and the target job description in the left panel, and click "Analyze" to generate compliance feedback.
              </p>
            </div>
          )}

        </div>

      </div>

      <style>{`
        .spin-animation {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 1100px) {
          .optimizer-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 600px) {
          .strengths-gaps-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ResumeOptimizer;
