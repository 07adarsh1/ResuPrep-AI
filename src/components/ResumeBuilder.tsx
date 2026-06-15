import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  Download, 
  User, 
  Briefcase, 
  BookOpen, 
  Layers
} from 'lucide-react';

interface ResumeBuilderProps {
  setResumeText: (text: string) => void;
}

interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  github: string;
  linkedin: string;
  summary: string;
}

interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  location: string;
  dateRange: string;
  bullets: string[];
}

interface EducationEntry {
  id: string;
  school: string;
  degree: string;
  location: string;
  dateRange: string;
}

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ setResumeText }) => {
  // 1. Core States representing structured resume
  const [personal, setPersonal] = useState<PersonalInfo>({
    name: 'ADARSH KUMAR',
    title: 'Software Engineer',
    email: 'adarsh@email.com',
    phone: '+1 (555) 019-2834',
    github: 'github.com/adarsh',
    linkedin: 'linkedin.com/in/adarsh',
    summary: 'Self-motivated and result-driven software engineer with 2+ years of experience building responsive web applications using React, JavaScript, and Node.js. Experienced in database querying and API integration.'
  });

  const [experiences, setExperiences] = useState<ExperienceEntry[]>([
    {
      id: '1',
      company: 'TechInnovations Inc.',
      role: 'Software Engineer',
      location: 'San Francisco, CA',
      dateRange: '2024 - Present',
      bullets: [
        'Responsible for writing JavaScript code and updating website features.',
        'Worked with SQL databases to fetch and update application data.',
        'Participated in team standups and contributed to code review pipelines.'
      ]
    },
    {
      id: '2',
      company: 'WebDesign Studio',
      role: 'Junior Web Developer',
      location: 'Remote',
      dateRange: '2023 - 2024',
      bullets: [
        'Created responsive mockups and landing pages for clients.',
        'Troubleshooted and patched UI styling bugs across legacy web apps.'
      ]
    }
  ]);

  const [educations, setEducations] = useState<EducationEntry[]>([
    {
      id: '1',
      school: 'State University',
      degree: 'B.S. in Computer Science',
      location: 'Austin, TX',
      dateRange: 'Graduated 2023'
    }
  ]);

  const [skills, setSkills] = useState<string>(
    '- Frontend: HTML5, CSS3, JavaScript (ES6+), React.js, Redux\n- Backend: Node.js, Express, SQL (PostgreSQL), RESTful APIs\n- Tools: Git, VS Code, Postman, Webpack'
  );

  // 2. Automate Compilation from Structured to Raw Text
  useEffect(() => {
    compileResumeToRawText();
  }, [personal, experiences, educations, skills]);

  const compileResumeToRawText = () => {
    let raw = `${personal.name.toUpperCase()}\n`;
    raw += `${personal.title} | ${personal.email} | ${personal.phone}\n`;
    if (personal.github || personal.linkedin) {
      raw += `Github: ${personal.github} | LinkedIn: ${personal.linkedin}\n`;
    }
    
    if (personal.summary) {
      raw += `\nSUMMARY\n${personal.summary}\n`;
    }

    if (skills) {
      raw += `\nTECHNICAL SKILLS\n${skills}\n`;
    }

    if (experiences.length > 0) {
      raw += `\nEXPERIENCE\n`;
      experiences.forEach(exp => {
        raw += `${exp.role} | ${exp.company} | ${exp.dateRange}\n`;
        exp.bullets.forEach(b => {
          if (b.trim()) raw += `- ${b}\n`;
        });
        raw += `\n`;
      });
    }

    if (educations.length > 0) {
      raw += `EDUCATION\n`;
      educations.forEach(edu => {
        raw += `${edu.degree} | ${edu.school} | ${edu.dateRange}\n`;
      });
    }

    setResumeText(raw);
  };

  // Add/Remove Helpers
  const addExperience = () => {
    const newEntry: ExperienceEntry = {
      id: Date.now().toString(),
      company: '',
      role: '',
      location: '',
      dateRange: '',
      bullets: ['']
    };
    setExperiences(prev => [...prev, newEntry]);
  };

  const removeExperience = (id: string) => {
    setExperiences(prev => prev.filter(item => item.id !== id));
  };

  const updateExperience = (id: string, field: keyof ExperienceEntry, value: any) => {
    setExperiences(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const addExpBullet = (expId: string) => {
    setExperiences(prev => prev.map(item => {
      if (item.id === expId) {
        return { ...item, bullets: [...item.bullets, ''] };
      }
      return item;
    }));
  };

  const removeExpBullet = (expId: string, idx: number) => {
    setExperiences(prev => prev.map(item => {
      if (item.id === expId) {
        const updated = [...item.bullets];
        updated.splice(idx, 1);
        return { ...item, bullets: updated };
      }
      return item;
    }));
  };

  const updateExpBullet = (expId: string, idx: number, val: string) => {
    setExperiences(prev => prev.map(item => {
      if (item.id === expId) {
        const updated = [...item.bullets];
        updated[idx] = val;
        return { ...item, bullets: updated };
      }
      return item;
    }));
  };

  const addEducation = () => {
    const newEntry: EducationEntry = {
      id: Date.now().toString(),
      school: '',
      degree: '',
      location: '',
      dateRange: ''
    };
    setEducations(prev => [...prev, newEntry]);
  };

  const removeEducation = (id: string) => {
    setEducations(prev => prev.filter(item => item.id !== id));
  };

  const updateEducation = (id: string, field: keyof EducationEntry, value: string) => {
    setEducations(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Printable Iframe PDF exporter (Highly robust)
  const handlePrint = () => {
    const printableElement = document.getElementById('printable-resume');
    if (!printableElement) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocker is active. Please enable pop-ups to export your PDF.');
      return;
    }

    // Set page styling
    printWindow.document.write(`
      <html>
        <head>
          <title>${personal.name.replace(/\s+/g, '_')}_Resume</title>
          <style>
            body {
              font-family: 'Times New Roman', Times, serif;
              color: #111;
              padding: 20px;
              margin: 0;
              background: #fff;
              line-height: 1.4;
              font-size: 13.5px;
            }
            .header-sec {
              text-align: center;
              margin-bottom: 15px;
            }
            .header-sec h1 {
              margin: 0 0 5px;
              font-size: 26px;
              letter-spacing: 0.5px;
            }
            .header-sec p {
              margin: 2px 0;
              font-size: 12.5px;
              color: #444;
            }
            .sec-title {
              text-transform: uppercase;
              font-weight: bold;
              border-bottom: 1px solid #333;
              margin-top: 15px;
              margin-bottom: 8px;
              font-size: 13px;
              letter-spacing: 0.5px;
            }
            .summary-sec {
              margin-bottom: 12px;
            }
            .skills-sec {
              white-space: pre-wrap;
              margin-bottom: 12px;
            }
            .entry-header {
              display: flex;
              justify-content: space-between;
              font-weight: bold;
              font-size: 13px;
            }
            .entry-sub {
              display: flex;
              justify-content: space-between;
              font-style: italic;
              font-size: 12.5px;
              color: #444;
              margin-bottom: 5px;
            }
            .bullets {
              padding-left: 20px;
              margin: 5px 0 10px;
            }
            .bullets li {
              margin-bottom: 3px;
            }
            .edu-entry {
              margin-bottom: 8px;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="header-sec">
            <h1>${personal.name.toUpperCase()}</h1>
            <p>${personal.title}</p>
            <p>${personal.email} | ${personal.phone}</p>
            <p>${personal.github ? 'Github: ' + personal.github : ''} ${personal.github && personal.linkedin ? ' | ' : ''} ${personal.linkedin ? 'LinkedIn: ' + personal.linkedin : ''}</p>
          </div>

          <div class="sec-title">Summary</div>
          <div class="summary-sec">${personal.summary}</div>

          <div class="sec-title">Skills</div>
          <div class="skills-sec">${skills.replace(/^- /gm, '• ')}</div>

          <div class="sec-title">Experience</div>
          ${experiences.map(exp => `
            <div style="margin-bottom: 10px;">
              <div class="entry-header">
                <span>${exp.company}</span>
                <span>${exp.location}</span>
              </div>
              <div class="entry-sub">
                <span>${exp.role}</span>
                <span>${exp.dateRange}</span>
              </div>
              <ul class="bullets">
                ${exp.bullets.map(b => b.trim() ? `<li>${b}</li>` : '').join('')}
              </ul>
            </div>
          `).join('')}

          <div class="sec-title">Education</div>
          ${educations.map(edu => `
            <div class="edu-entry">
              <div class="entry-header">
                <span>${edu.school}</span>
                <span>${edu.location}</span>
              </div>
              <div class="entry-sub">
                <span>${edu.degree}</span>
                <span>${edu.dateRange}</span>
              </div>
            </div>
          `).join('')}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    // Delay to let browser load printing parameters
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="builder-header-split">
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 800 }}>Resume Builder</h2>
          <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '14px', marginTop: '4px' }}>
            Structure your credentials cleanly, review visual layouts, and compile directly to PDF.
          </p>
        </div>
        <button onClick={handlePrint} className="btn-primary">
          <Download size={16} />
          Export to PDF
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="builder-grid">
        
        {/* Left Form Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Section 1: Personal Details */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} style={{ color: 'hsl(var(--primary))' }} /> Personal Details
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', display: 'block', marginBottom: '4px' }}>Full Name</label>
                <input 
                  type="text" 
                  value={personal.name} 
                  onChange={(e) => setPersonal(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input" 
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', display: 'block', marginBottom: '4px' }}>Target Title</label>
                <input 
                  type="text" 
                  value={personal.title} 
                  onChange={(e) => setPersonal(prev => ({ ...prev, title: e.target.value }))}
                  className="form-input" 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', display: 'block', marginBottom: '4px' }}>Email Address</label>
                <input 
                  type="email" 
                  value={personal.email} 
                  onChange={(e) => setPersonal(prev => ({ ...prev, email: e.target.value }))}
                  className="form-input" 
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', display: 'block', marginBottom: '4px' }}>Phone Number</label>
                <input 
                  type="text" 
                  value={personal.phone} 
                  onChange={(e) => setPersonal(prev => ({ ...prev, phone: e.target.value }))}
                  className="form-input" 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', display: 'block', marginBottom: '4px' }}>GitHub Profile URL</label>
                <input 
                  type="text" 
                  value={personal.github} 
                  onChange={(e) => setPersonal(prev => ({ ...prev, github: e.target.value }))}
                  className="form-input" 
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', display: 'block', marginBottom: '4px' }}>LinkedIn Profile URL</label>
                <input 
                  type="text" 
                  value={personal.linkedin} 
                  onChange={(e) => setPersonal(prev => ({ ...prev, linkedin: e.target.value }))}
                  className="form-input" 
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', display: 'block', marginBottom: '4px' }}>Executive Summary</label>
              <textarea 
                value={personal.summary} 
                onChange={(e) => setPersonal(prev => ({ ...prev, summary: e.target.value }))}
                className="form-textarea" 
                style={{ minHeight: '80px', resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Section 2: Technical Skills */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} style={{ color: 'hsl(var(--primary))' }} /> Skills Breakdown
            </h3>
            <textarea 
              value={skills} 
              onChange={(e) => setSkills(e.target.value)}
              className="form-textarea" 
              style={{ minHeight: '100px', resize: 'vertical', fontFamily: 'monospace', fontSize: '13px' }}
              placeholder="- Frontend: React, JS..."
            />
          </div>

          {/* Section 3: Professional Experience */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={16} style={{ color: 'hsl(var(--primary))' }} /> Professional Experience
              </h3>
              <button onClick={addExperience} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                + Add Experience
              </button>
            </div>

            {experiences.map((exp) => (
              <div 
                key={exp.id}
                style={{
                  border: '1px solid hsl(var(--border-color))',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  background: 'rgba(255,255,255,0.01)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'white' }}>Company Entry</span>
                  <button onClick={() => removeExperience(exp.id)} style={{ background: 'transparent', border: 'none', color: 'hsl(var(--accent-rose))', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>Company Name</label>
                    <input 
                      type="text" 
                      value={exp.company} 
                      onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                      className="form-input" 
                      style={{ padding: '8px', fontSize: '12.5px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>Role / Designation</label>
                    <input 
                      type="text" 
                      value={exp.role} 
                      onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                      className="form-input" 
                      style={{ padding: '8px', fontSize: '12.5px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>Location</label>
                    <input 
                      type="text" 
                      value={exp.location} 
                      onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                      className="form-input" 
                      style={{ padding: '8px', fontSize: '12.5px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>Date / Year Range</label>
                    <input 
                      type="text" 
                      value={exp.dateRange} 
                      onChange={(e) => updateExperience(exp.id, 'dateRange', e.target.value)}
                      className="form-input" 
                      style={{ padding: '8px', fontSize: '12.5px' }}
                    />
                  </div>
                </div>

                {/* Bullets List */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>Key Accomplishment Bullets</label>
                    <button onClick={() => addExpBullet(exp.id)} style={{ background: 'transparent', border: 'none', color: 'hsl(var(--primary))', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                      + Add Bullet
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {exp.bullets.map((b, bIdx) => (
                      <div key={bIdx} style={{ display: 'flex', gap: '8px' }}>
                        <input 
                          type="text" 
                          value={b} 
                          onChange={(e) => updateExpBullet(exp.id, bIdx, e.target.value)}
                          className="form-input" 
                          style={{ padding: '8px', fontSize: '12.5px' }}
                        />
                        {exp.bullets.length > 1 && (
                          <button onClick={() => removeExpBullet(exp.id, bIdx)} style={{ background: 'transparent', border: 'none', color: 'hsl(var(--text-muted))', cursor: 'pointer' }}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Section 4: Education */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={16} style={{ color: 'hsl(var(--primary))' }} /> Academic Credentials
              </h3>
              <button onClick={addEducation} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                + Add Academic
              </button>
            </div>

            {educations.map((edu) => (
              <div 
                key={edu.id}
                style={{
                  border: '1px solid hsl(var(--border-color))',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  background: 'rgba(255,255,255,0.01)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'white' }}>Degree Entry</span>
                  <button onClick={() => removeEducation(edu.id)} style={{ background: 'transparent', border: 'none', color: 'hsl(var(--accent-rose))', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>Institution / School</label>
                    <input 
                      type="text" 
                      value={edu.school} 
                      onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                      className="form-input" 
                      style={{ padding: '8px', fontSize: '12.5px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>Degree Earned</label>
                    <input 
                      type="text" 
                      value={edu.degree} 
                      onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                      className="form-input" 
                      style={{ padding: '8px', fontSize: '12.5px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>Location</label>
                    <input 
                      type="text" 
                      value={edu.location} 
                      onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                      className="form-input" 
                      style={{ padding: '8px', fontSize: '12.5px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>Date Range / Year</label>
                    <input 
                      type="text" 
                      value={edu.dateRange} 
                      onChange={(e) => updateEducation(edu.id, 'dateRange', e.target.value)}
                      className="form-input" 
                      style={{ padding: '8px', fontSize: '12.5px' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right Live Preview Sheet mockup */}
        <div style={{ position: 'sticky', top: '24px', height: 'fit-content' }}>
          
          <div className="glass-panel" style={{ padding: '12px', borderBottom: 'none', borderRadius: '16px 16px 0 0', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'hsl(var(--accent-green))' }}></span>
            <span>Live Interactive Preview</span>
          </div>

          <div 
            id="printable-resume"
            style={{
              background: '#ffffff',
              color: '#1e293b',
              padding: '40px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
              minHeight: '650px',
              fontFamily: 'Georgia, serif',
              lineHeight: '1.4',
              borderRadius: '0 0 16px 16px',
              overflow: 'hidden',
              fontSize: '12px'
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 'bold', color: '#0f172a', letterSpacing: '0.5px' }}>
                {personal.name.toUpperCase() || 'YOUR NAME'}
              </h1>
              <p style={{ margin: '2px 0', fontSize: '12px', fontWeight: 600, color: '#4f46e5' }}>{personal.title || 'Target Job Title'}</p>
              <p style={{ margin: '2px 0', color: '#64748b' }}>
                {personal.email} | {personal.phone}
              </p>
              <p style={{ margin: '2px 0', color: '#64748b', fontSize: '11px' }}>
                {personal.github && `GitHub: ${personal.github}`}
                {personal.github && personal.linkedin && '  |  '}
                {personal.linkedin && `LinkedIn: ${personal.linkedin}`}
              </p>
            </div>

            {/* Summary */}
            {personal.summary && (
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ textTransform: 'uppercase', fontSize: '11.5px', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1', color: '#334155', paddingBottom: '3px', marginBottom: '6px', letterSpacing: '0.5px' }}>
                  Summary
                </h3>
                <p style={{ color: '#334155', fontSize: '11.5px', textAlign: 'justify' }}>{personal.summary}</p>
              </div>
            )}

            {/* Skills */}
            {skills && (
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ textTransform: 'uppercase', fontSize: '11.5px', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1', color: '#334155', paddingBottom: '3px', marginBottom: '6px', letterSpacing: '0.5px' }}>
                  Technical Skills
                </h3>
                <p style={{ color: '#334155', fontSize: '11.5px', whiteSpace: 'pre-wrap' }}>
                  {skills.replace(/^- /gm, '• ')}
                </p>
              </div>
            )}

            {/* Experience */}
            {experiences.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ textTransform: 'uppercase', fontSize: '11.5px', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1', color: '#334155', paddingBottom: '3px', marginBottom: '8px', letterSpacing: '0.5px' }}>
                  Experience
                </h3>
                {experiences.map((exp, idx) => (
                  <div key={exp.id} style={{ marginBottom: idx < experiences.length - 1 ? '12px' : '0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#1e293b' }}>
                      <span>{exp.company || 'Company Name'}</span>
                      <span style={{ fontWeight: 'normal', color: '#64748b' }}>{exp.location || 'Location'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontStyle: 'italic', color: '#475569', marginTop: '2px', fontSize: '11px' }}>
                      <span>{exp.role || 'Designation'}</span>
                      <span>{exp.dateRange || 'Date Range'}</span>
                    </div>
                    <ul style={{ margin: '4px 0 0', paddingLeft: '18px', color: '#334155' }}>
                      {exp.bullets.map((b, bIdx) => b.trim() ? (
                        <li key={bIdx} style={{ marginBottom: '2px' }}>{b}</li>
                      ) : null)}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            {educations.length > 0 && (
              <div>
                <h3 style={{ textTransform: 'uppercase', fontSize: '11.5px', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1', color: '#334155', paddingBottom: '3px', marginBottom: '8px', letterSpacing: '0.5px' }}>
                  Education
                </h3>
                {educations.map(edu => (
                  <div key={edu.id} style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#1e293b' }}>
                      <span>{edu.school || 'University Name'}</span>
                      <span style={{ fontWeight: 'normal', color: '#64748b' }}>{edu.location || 'Location'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontStyle: 'italic', marginTop: '2px', fontSize: '11px' }}>
                      <span>{edu.degree || 'Degree Title'}</span>
                      <span>{edu.dateRange || 'Graduation Year'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 968px) {
          .builder-grid {
            grid-template-columns: 1fr !important;
          }
          .builder-header-split {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default ResumeBuilder;
