import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Video, 
  BookOpen, 
  Settings as SettingsIcon, 
  Key, 
  CheckCircle2, 
  AlertCircle,
  Briefcase,
  Sparkles,
  Menu,
  X,
  Layers,
  Award
} from 'lucide-react';
import { setApiKey, hasApiKey } from './services/groqService';
import Dashboard from './components/Dashboard';
import ResumeOptimizer from './components/ResumeOptimizer';
import InterviewRoom from './components/InterviewRoom';
import PrepSheets from './components/PrepSheets';
import ResumeBuilder from './components/ResumeBuilder';
import StarBuilder from './components/StarBuilder';
import ThreeBackground from './components/ThreeBackground';
import TiltCard from './components/TiltCard';

// Sample default values for instant testing
const DEFAULT_RESUME = `ADARSH KUMAR
Software Engineer | adarsh@email.com | Github: github.com/adarsh | LinkedIn: linkedin.com/in/adarsh

SUMMARY
Self-motivated and result-driven software engineer with 2+ years of experience building responsive web applications using React, JavaScript, and Node.js. Experienced in database querying and API integration.

TECHNICAL SKILLS
- Frontend: HTML5, CSS3, JavaScript (ES6+), React.js, Redux
- Backend: Node.js, Express, SQL (PostgreSQL), RESTful APIs
- Tools: Git, VS Code, Postman, Webpack

EXPERIENCE
Software Engineer | TechInnovations Inc. | 2024 - Present
- Responsible for writing JavaScript code and updating website features.
- Worked with SQL databases to fetch and update application data.
- Participated in team standups and contributed to code review pipelines.

Junior Web Developer | WebDesign Studio | 2023 - 2024
- Created responsive mockups and landing pages for clients.
- Troubleshooted and patched UI styling bugs across legacy web apps.

EDUCATION
B.S. in Computer Science | State University | Graduated 2023`;

const DEFAULT_JD = `Role: Full Stack / Frontend Engineer (React/TypeScript)
Company: NexaGrowth Tech

About the Role:
We are looking for a Software Engineer to join our core product team. You will build and scale highly interactive dashboard interfaces, optimize rendering speeds, and integrate scalable APIs.

Key Responsibilities:
- Design, build, and maintain highly interactive web interfaces using React and TypeScript.
- Implement state-of-the-art state management architectures.
- Optimize database query latency and maintain stable PostgreSQL configurations.
- Create automated test pipelines (Jest/RTL) and integrate deployment steps.

Preferred Qualifications:
- 2+ years of production experience with React, TypeScript, and HSL/Vanilla CSS.
- Hands-on experience optimizing database queries and scaling PostgreSQL.
- Strong knowledge of CI/CD, Jest/Cypress testing, and AWS cloud services.`;

function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [resumeText, setResumeText] = useState<string>(() => {
    return localStorage.getItem('resuprep_resume') || DEFAULT_RESUME;
  });
  const [jobDescription, setJobDescription] = useState<string>(() => {
    return localStorage.getItem('resuprep_jd') || DEFAULT_JD;
  });
  const [targetRole, setTargetRole] = useState<string>(() => {
    return localStorage.getItem('resuprep_target_role') || 'Software Engineer';
  });
  
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [apiStatus, setApiStatus] = useState<boolean>(hasApiKey());
  const [isEnvKeyActive, setIsEnvKeyActive] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Stats for the Dashboard
  const [interviewAttempts, setInterviewAttempts] = useState<any[]>(() => {
    const saved = localStorage.getItem('resuprep_interview_attempts');
    return saved ? JSON.parse(saved) : [
      { id: '1', role: 'Frontend Engineer', type: 'Technical', score: 82, date: '2026-06-10' },
      { id: '2', role: 'Backend Engineer', type: 'System Design', score: 68, date: '2026-06-12' },
      { id: '3', role: 'Full Stack Engineer', type: 'Behavioral', score: 90, date: '2026-06-14' }
    ];
  });

  const [resumeScore, setResumeScore] = useState<number>(() => {
    return Number(localStorage.getItem('resuprep_last_resume_score')) || 74;
  });

  useEffect(() => {
    localStorage.setItem('resuprep_resume', resumeText);
  }, [resumeText]);

  useEffect(() => {
    localStorage.setItem('resuprep_jd', jobDescription);
  }, [jobDescription]);

  useEffect(() => {
    localStorage.setItem('resuprep_target_role', targetRole);
  }, [targetRole]);

  useEffect(() => {
    localStorage.setItem('resuprep_interview_attempts', JSON.stringify(interviewAttempts));
  }, [interviewAttempts]);

  useEffect(() => {
    // Check if key is available in env or local storage
    const hasKey = hasApiKey();
    setApiStatus(hasKey);
    
    // Check if the key being used is the environment one
    const localKey = localStorage.getItem('resuprep_custom_groq_api_key');
    const envKey = import.meta.env.VITE_GROQ_API_KEY;
    const isEnvActive = (!localKey || localKey.trim() === '') && (envKey && envKey !== 'your_groq_api_key_here');
    setIsEnvKeyActive(!!isEnvActive);
  }, []);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(apiKeyInput);
    setApiStatus(hasApiKey());
    
    const localKey = localStorage.getItem('resuprep_custom_groq_api_key');
    setIsEnvKeyActive(!localKey && !!import.meta.env.VITE_GROQ_API_KEY);
    setApiKeyInput('');
    alert('API Key updated successfully!');
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('resuprep_custom_groq_api_key');
    setApiStatus(hasApiKey());
    
    const envKey = import.meta.env.VITE_GROQ_API_KEY;
    setIsEnvKeyActive(!!envKey && envKey !== 'your_groq_api_key_here');
    alert('Custom API Key cleared. System will fallback to developer API configuration.');
  };

  const addInterviewAttempt = (attempt: { role: string; type: string; score: number }) => {
    const newAttempt = {
      id: Date.now().toString(),
      ...attempt,
      date: new Date().toISOString().split('T')[0]
    };
    setInterviewAttempts(prev => [newAttempt, ...prev]);
  };

  return (
    <div className="saas-layout">
      {/* 3D Parallax Perspective Canvas Background */}
      <ThreeBackground />

      {/* Mobile Navbar Header */}
      <div className="glass-panel mobile-only-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 110,
        borderRadius: 0,
        borderLeft: 'none',
        borderRight: 'none',
        borderTop: 'none',
        margin: 0,
        height: '60px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)',
            padding: '6px',
            borderRadius: '8px',
            color: '#020617',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Sparkles size={18} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.5px' }} className="text-gradient">ResuPrep AI</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${isSidebarOpen ? 'mobile-open' : ''}`} style={{
        '@media (max-width: 968px)': {
          display: isSidebarOpen ? 'flex' : 'none'
        }
      } as any}>
        <div>
          {/* Logo Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }} className="sidebar-logo">
            <div 
              className="logo-glow-container"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)',
                padding: '8px',
                borderRadius: '6px',
                color: '#020617',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Sparkles size={22} className="animate-float" />
            </div>
            <div>
              <h1 style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px' }} className="text-gradient">ResuPrep AI</h1>
              <p style={{ fontSize: '9px', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '1.2px', marginTop: '2px' }}>AI Placement Engine</p>
            </div>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button 
              onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
              className={`btn-secondary ${activeTab === 'dashboard' ? 'active-nav-btn' : ''}`}
              style={{ justifyContent: 'flex-start', width: '100%', padding: '10px 12px', background: 'transparent', border: '1px solid transparent' }}
            >
              <LayoutDashboard size={16} />
              Dashboard
            </button>
            <button 
              onClick={() => { setActiveTab('builder'); setIsSidebarOpen(false); }}
              className={`btn-secondary ${activeTab === 'builder' ? 'active-nav-btn' : ''}`}
              style={{ justifyContent: 'flex-start', width: '100%', padding: '10px 12px', background: 'transparent', border: '1px solid transparent' }}
            >
              <Layers size={16} />
              Resume Builder
            </button>
            <button 
              onClick={() => { setActiveTab('resume'); setIsSidebarOpen(false); }}
              className={`btn-secondary ${activeTab === 'resume' ? 'active-nav-btn' : ''}`}
              style={{ justifyContent: 'flex-start', width: '100%', padding: '10px 12px', background: 'transparent', border: '1px solid transparent' }}
            >
              <FileText size={16} />
              Resume Optimizer
            </button>
            <button 
              onClick={() => { setActiveTab('star-builder'); setIsSidebarOpen(false); }}
              className={`btn-secondary ${activeTab === 'star-builder' ? 'active-nav-btn' : ''}`}
              style={{ justifyContent: 'flex-start', width: '100%', padding: '10px 12px', background: 'transparent', border: '1px solid transparent' }}
            >
              <Award size={16} />
              STAR Story Builder
            </button>
            <button 
              onClick={() => { setActiveTab('mock-interview'); setIsSidebarOpen(false); }}
              className={`btn-secondary ${activeTab === 'mock-interview' ? 'active-nav-btn' : ''}`}
              style={{ justifyContent: 'flex-start', width: '100%', padding: '10px 12px', background: 'transparent', border: '1px solid transparent' }}
            >
              <Video size={16} />
              AI Mock Interview
            </button>
            <button 
              onClick={() => { setActiveTab('prep-sheets'); setIsSidebarOpen(false); }}
              className={`btn-secondary ${activeTab === 'prep-sheets' ? 'active-nav-btn' : ''}`}
              style={{ justifyContent: 'flex-start', width: '100%', padding: '10px 12px', background: 'transparent', border: '1px solid transparent' }}
            >
              <BookOpen size={16} />
              Placement Prep Cards
            </button>
            <button 
              onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
              className={`btn-secondary ${activeTab === 'settings' ? 'active-nav-btn' : ''}`}
              style={{ justifyContent: 'flex-start', width: '100%', padding: '10px 12px', background: 'transparent', border: '1px solid transparent' }}
            >
              <SettingsIcon size={16} />
              Settings
            </button>
          </nav>
        </div>

        {/* API Info Card */}
        <div className="glass-panel" style={{ padding: '12px', fontSize: '11px', border: '1px solid hsl(var(--border-color))', borderRadius: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Key size={13} style={{ color: apiStatus ? 'hsl(var(--accent-green))' : 'hsl(var(--accent-amber))' }} />
            <span style={{ fontWeight: 600 }}>Groq AI Connection</span>
          </div>
          {apiStatus ? (
            <div style={{ color: 'hsl(var(--accent-green))', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={10} />
              <span>{isEnvKeyActive ? 'Dev Config Active' : 'Custom Key Active'}</span>
            </div>
          ) : (
            <div style={{ color: 'hsl(var(--accent-amber))', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={10} />
                <span>Simulated Mode</span>
              </div>
              <button 
                onClick={() => setActiveTab('settings')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'hsl(var(--primary))',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '10px',
                  fontWeight: 600,
                  textDecoration: 'underline',
                  padding: 0
                }}
              >
                Configure API Key
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="main-content" style={{ background: 'transparent' }}>
        {/* Top Utility breadcrumbs toolbar */}
        <div className="top-utility-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'hsl(var(--text-muted))', fontWeight: 500 }}>Files</span>
            <span style={{ color: 'hsl(var(--border-color))' }}>/</span>
            <span style={{ color: 'hsl(var(--text-secondary))', fontWeight: 500 }}>ResuPrep Engine</span>
            <span style={{ color: 'hsl(var(--border-color))' }}>/</span>
            <span style={{ color: 'white', fontWeight: 600, textTransform: 'capitalize' }}>
              {activeTab.replace('-', ' ')}
            </span>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'hsl(var(--accent-green))',
              marginLeft: '8px',
              boxShadow: '0 0 8px hsl(var(--accent-green))'
            }} />
            <span style={{ fontSize: '10px', color: 'hsl(var(--accent-green))', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} className="hide-on-mobile">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'hsl(var(--text-secondary))' }}>
              <span style={{ fontSize: '11px', fontWeight: 600 }}>Target Role:</span>
              <span style={{ 
                background: 'rgba(255, 255, 255, 0.04)', 
                border: '1px solid hsl(var(--border-color))',
                padding: '2px 8px',
                borderRadius: '4px',
                color: 'white',
                fontWeight: 600
              }}>
                {targetRole}
              </span>
            </div>
            {apiStatus ? (
              <span style={{ 
                color: 'hsl(var(--accent-green))', 
                fontSize: '11px', 
                fontWeight: 700, 
                border: '1px solid hsl(var(--accent-green) / 0.3)', 
                padding: '2px 8px', 
                borderRadius: '4px',
                background: 'rgba(16, 185, 129, 0.05)'
              }}>
                Groq Connected
              </span>
            ) : (
              <span style={{ 
                color: 'hsl(var(--accent-amber))', 
                fontSize: '11px', 
                fontWeight: 700, 
                border: '1px solid hsl(var(--accent-amber) / 0.3)', 
                padding: '2px 8px', 
                borderRadius: '4px',
                background: 'rgba(245, 158, 11, 0.05)'
              }}>
                Simulated AI
              </span>
            )}
          </div>
        </div>

        {/* Workspace Canvas Pane with key to re-trigger transitions */}
        <div className="workspace-canvas" key={activeTab}>
          {/* Tab Routing */}
          {activeTab === 'dashboard' && (
            <Dashboard 
              interviewAttempts={interviewAttempts} 
              resumeScore={resumeScore} 
              targetRole={targetRole}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'resume' && (
            <ResumeOptimizer 
              resumeText={resumeText} 
              setResumeText={setResumeText} 
              jobDescription={jobDescription}
              setJobDescription={setJobDescription}
              setGlobalResumeScore={setResumeScore}
            />
          )}

          {activeTab === 'builder' && (
            <ResumeBuilder 
              setResumeText={setResumeText} 
            />
          )}

          {activeTab === 'star-builder' && (
            <StarBuilder 
              resumeText={resumeText} 
              setResumeText={setResumeText} 
            />
          )}

          {activeTab === 'mock-interview' && (
            <InterviewRoom 
              resumeText={resumeText} 
              jobDescription={jobDescription}
              targetRole={targetRole}
              addAttempt={addInterviewAttempt}
            />
          )}

          {activeTab === 'prep-sheets' && (
            <PrepSheets targetRole={targetRole} resumeText={resumeText} />
          )}

          {activeTab === 'settings' && (
            <TiltCard className="glass-panel" style={{ padding: '24px', maxWidth: '700px', margin: '0 auto' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px', color: 'white' }}>Global Settings</h2>
              <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '20px', fontSize: '13px' }}>
                Configure your career objectives and setup the Groq AI engine for customized results.
              </p>

              <form onSubmit={handleSaveApiKey} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    <Briefcase size={15} style={{ color: 'hsl(var(--primary))' }} />
                    Target Career Role
                  </label>
                  <input 
                    type="text" 
                    value={targetRole} 
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="form-input" 
                    placeholder="e.g. Frontend Engineer, Product Manager"
                    required
                  />
                  <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', display: 'block', marginTop: '4px' }}>
                    This role is used to tailor mock interview questions and placement prep guides.
                  </span>
                </div>

                <div style={{ borderTop: '1px solid hsl(var(--border-color))', paddingTop: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    <Key size={15} style={{ color: 'hsl(var(--primary))' }} />
                    Custom Groq API Key
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      type="password" 
                      value={apiKeyInput} 
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      className="form-input" 
                      placeholder={apiStatus && !isEnvKeyActive ? "••••••••••••••••••••••••••••" : "Paste your GROQ API Key here..."}
                    />
                    <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
                      Save Key
                    </button>
                  </div>
                  
                  {apiStatus && !isEnvKeyActive && (
                    <button 
                      type="button" 
                      onClick={handleClearApiKey}
                      className="btn-secondary" 
                      style={{ marginTop: '10px', fontSize: '12px', padding: '6px 12px', borderColor: 'hsl(var(--accent-rose) / 0.5)', color: 'hsl(var(--accent-rose))' }}
                    >
                      Clear Custom Key
                    </button>
                  )}

                  <div className="glass-panel" style={{ marginTop: '16px', padding: '12px', background: 'hsl(var(--bg-obsidian))', fontSize: '12px', border: '1px solid hsl(var(--border-color))', borderRadius: '6px' }}>
                    <h4 style={{ fontWeight: 600, marginBottom: '4px', color: 'hsl(var(--text-primary))' }}>How the API Connection works:</h4>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px', color: 'hsl(var(--text-secondary))', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <li>If you enter a <strong>Custom Key</strong>, it is saved directly in your browser's Local Storage and never leaves your machine.</li>
                      <li>If you don't enter a custom key, the application will fallback to the developer-provided key configured in the project environment (`VITE_GROQ_API_KEY`).</li>
                      <li>If neither is configured, the application falls back to a high-fidelity local simulation mode.</li>
                    </ul>
                  </div>
                </div>
              </form>
            </TiltCard>
          )}
        </div>
      </main>

      {/* CSS overrides for Router/Layout matching & 3D Tab Slide transitions */}
      <style>{`
        .workspace-canvas {
          animation: tab-perspective-slide 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
          transform-origin: top center;
        }

        @keyframes tab-perspective-slide {
          0% { 
            opacity: 0; 
            transform: translateY(15px) scale(0.985); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }

        .mobile-only-header {
          display: none !important;
        }
        @media (max-width: 968px) {
          .mobile-only-header {
            display: flex !important;
          }
          .sidebar {
            position: fixed;
            top: 60px;
            left: 0;
            right: 0;
            bottom: 0;
            height: calc(100vh - 60px);
            display: none !important;
          }
          .sidebar.mobile-open {
            display: flex !important;
            width: 100%;
          }
          .sidebar-logo {
            display: none !important;
          }
          .main-content {
            height: calc(100vh - 60px);
          }
          .top-utility-bar {
            display: none !important;
          }
        }
        .hide-on-mobile {
          @media (max-width: 768px) {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
