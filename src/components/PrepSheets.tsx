import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  FileText, 
  RefreshCw,
  Eye,
  CornerDownRight,
  Trash2,
  Compass,
  Sliders
} from 'lucide-react';
import { generateCheatSheetFromAI, generateAIFlashcards } from '../services/groqService';

interface PrepSheetsProps {
  targetRole: string;
  resumeText: string;
}

interface Flashcard {
  id: string;
  category: 'technical' | 'behavioral' | 'architecture';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  answerSummary: string;
  keyPoints: string[];
  pitfalls: string;
}

const DEFAULT_FLASHCARDS: Flashcard[] = [
  {
    id: '1',
    category: 'technical',
    difficulty: 'Medium',
    question: 'What is hydration in React SSR, and how does it work?',
    answerSummary: 'Hydration is the process of attaching event listeners to the server-rendered HTML string to make it interactive in the client.',
    keyPoints: ['Server generates static HTML', 'Client downloads React bundles', 'React walks the DOM to match elements', 'Event bindings are attached'],
    pitfalls: 'Ensure server and client render trees match exactly to prevent Hydration Mismatch errors.'
  },
  {
    id: '2',
    category: 'technical',
    difficulty: 'Hard',
    question: 'Explain the difference between optimistic updates and standard mutation states.',
    answerSummary: 'Optimistic updates render UI changes immediately assuming the API request will succeed, reverting the state only if the request fails.',
    keyPoints: ['Improves perceived performance', 'Requires temporary cache state', 'Must implement rollback handling'],
    pitfalls: 'Failing to handle rollback triggers, leaving the UI out of sync on API errors.'
  },
  {
    id: '3',
    category: 'architecture',
    difficulty: 'Hard',
    question: 'How do you design a database indexing strategy for high-read, low-write queries?',
    answerSummary: 'Use index scans like B-Trees for range queries, hash indexes for exact lookups, and composite indexes for queries with multiple WHERE clauses.',
    keyPoints: ['Use EXPLAIN ANALYZE to test', 'Create composite indexes in correct column order', 'Covering indexes to bypass table scans'],
    pitfalls: 'Over-indexing columns which degrades write (INSERT/UPDATE) operations speed.'
  },
  {
    id: '4',
    category: 'behavioral',
    difficulty: 'Easy',
    question: 'Walk me through a time you had to deal with a sudden change in project scope.',
    answerSummary: 'Explain how you structured a triage meeting, prioritized tasks using an impact-effort matrix, and communicated scope cut proposals to stakeholders.',
    keyPoints: ['Situation: Client changed product targets', 'Task: Refocus 2 weeks work', 'Action: Backlog pruning sessions', 'Result: Shipped 80% MVP on schedule'],
    pitfalls: 'Focusing on complaining about scope changes instead of showcasing adaptable engineering practices.'
  },
  {
    id: '5',
    category: 'architecture',
    difficulty: 'Medium',
    question: 'What is CDN caching, and how do Cache-Control headers optimize asset loading?',
    answerSummary: 'CDNs store static assets on edge servers closer to users. Cache-Control headers specify how long browsers and proxies cache files.',
    keyPoints: ['Max-age directives', 'Immutable headers for hashed bundle files', 'Edge caching invalidation hooks'],
    pitfalls: 'Setting long cache times on index.html, preventing users from receiving updates.'
  },
  {
    id: '6',
    category: 'behavioral',
    difficulty: 'Medium',
    question: 'Describe a scenario where you solved a major technical debt bottleneck.',
    answerSummary: 'Frame the response around refactoring a monolithic script or optimizing high-latency database queries with concrete performance results.',
    keyPoints: ['Identified 800ms bottleneck', 'Convinced product managers to allocate refactor scope', 'Rebuilt layout components / Query joins', 'Result: latency dropped to 120ms'],
    pitfalls: 'Blaming previous developers rather than outlining technical trade-offs and business impact.'
  }
];

const PrepSheets: React.FC<PrepSheetsProps> = ({ targetRole, resumeText }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'technical' | 'behavioral' | 'architecture'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  
  // Flashcards state loaded from local storage or falling back to default
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem('resuprep_flashcards');
    return saved ? JSON.parse(saved) : DEFAULT_FLASHCARDS;
  });

  // Dynamic Cheat Sheet State
  const [cheatSheet, setCheatSheet] = useState<string>('');
  const [loadingCheatSheet, setLoadingCheatSheet] = useState<boolean>(false);
  const [loadingAICards, setLoadingAICards] = useState<boolean>(false);

  // AI Generation configuration states
  const [cardCount, setCardCount] = useState<number>(3);
  const [cardSubject, setCardSubject] = useState<string>('all');

  useEffect(() => {
    localStorage.setItem('resuprep_flashcards', JSON.stringify(flashcards));
  }, [flashcards]);

  const handleFlip = (id: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'hsl(var(--accent-green))';
      case 'Medium': return 'hsl(var(--accent-amber))';
      case 'Hard': return 'hsl(var(--accent-rose))';
      default: return 'white';
    }
  };

  // Generate Career Cheat Sheet via AI
  const handleGenerateCheatSheet = async () => {
    setLoadingCheatSheet(true);
    setCheatSheet('');
    
    try {
      const result = await generateCheatSheetFromAI(targetRole);
      if (result) {
        setCheatSheet(result);
      } else {
        setCheatSheet(getMockCheatSheet(targetRole));
      }
    } catch (e) {
      console.error(e);
      setCheatSheet(getMockCheatSheet(targetRole));
    } finally {
      setLoadingCheatSheet(false);
    }
  };

  // Generate personalized AI cards
  const handleGenerateAICards = async () => {
    setLoadingAICards(true);
    try {
      const generated = await generateAIFlashcards(targetRole, resumeText, cardCount, cardSubject);
      const formatted: Flashcard[] = generated.map((card, idx) => ({
        id: `ai-${Date.now()}-${idx}`,
        category: card.category,
        difficulty: card.difficulty,
        question: card.question,
        answerSummary: card.answerSummary,
        keyPoints: card.keyPoints,
        pitfalls: card.pitfalls
      }));
      setFlashcards(prev => [...formatted, ...prev]);
      alert(`Successfully appended ${cardCount} personalized AI flashcards to your deck!`);
    } catch (e) {
      console.error(e);
      alert('Failed to generate AI flashcards.');
    } finally {
      setLoadingAICards(false);
    }
  };

  // Delete Card
  const handleDeleteCard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Stop click from flipping the card
    if (confirm('Are you sure you want to delete this prep card?')) {
      setFlashcards(prev => prev.filter(card => card.id !== id));
    }
  };

  // Filter logic
  const filteredCards = flashcards.filter(card => {
    const matchesTab = activeTab === 'all' || card.category === activeTab;
    const matchesSearch = card.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          card.answerSummary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }} className="prep-header-split">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'white', letterSpacing: '-0.3px' }}>Placement Prep Cards</h2>
          <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '12.5px', marginTop: '2px' }}>
            Study conceptual checkpoints, generate AI role sheets, and configure automated study cards.
          </p>
        </div>
      </div>

      {/* Dynamic Cheat Sheet Display */}
      {cheatSheet && (
        <div className="glass-panel" style={{ 
          padding: '20px', 
          background: 'hsl(var(--bg-card))',
          border: '1px solid hsl(var(--primary) / 0.25)',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'white' }}>
              <FileText size={16} style={{ color: 'hsl(var(--primary))' }} />
              Placement Cheat Sheet: {targetRole}
            </h4>
            <button 
              onClick={() => setCheatSheet('')}
              style={{ background: 'transparent', border: 'none', color: 'hsl(var(--text-muted))', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
            >
              Close Sheet
            </button>
          </div>
          
          <div 
            style={{ 
              fontSize: '12.5px', 
              color: 'hsl(var(--text-secondary))', 
              lineHeight: '1.5', 
              maxHeight: '280px', 
              overflowY: 'auto',
              paddingRight: '10px'
            }}
            className="cheat-sheet-content"
          >
            {cheatSheet.split('\n').map((line, idx) => {
              if (line.startsWith('#')) {
                return <h5 key={idx} style={{ color: 'white', fontSize: '13.5px', fontWeight: 700, marginTop: '12px', marginBottom: '4px' }}>{line.replace(/#/g, '').trim()}</h5>;
              }
              if (line.startsWith('*') || line.startsWith('-')) {
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', margin: '3px 0' }}>
                    <span style={{ color: 'hsl(var(--primary))' }}>•</span>
                    <span>{line.substring(2)}</span>
                  </div>
                );
              }
              return <p key={idx} style={{ margin: '6px 0' }}>{line}</p>;
            })}
          </div>
        </div>
      )}

      {/* Premium AI Generation Toolbar */}
      <div className="glass-panel" style={{ 
        padding: '16px', 
        display: 'flex', 
        flexWrap: 'wrap', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        gap: '16px',
        background: 'hsl(var(--bg-card))',
        border: '1px solid hsl(var(--border-color))',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Target Subject Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: 'hsl(var(--text-secondary))', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sliders size={12} style={{ color: 'hsl(var(--primary))' }} />
              Subject:
            </span>
            <select 
              value={cardSubject} 
              onChange={(e) => setCardSubject(e.target.value)}
              className="form-input"
              style={{ fontSize: '12px', background: 'hsl(var(--bg-obsidian))', padding: '6px 12px', height: '34px', width: '190px', margin: 0 }}
            >
              <option value="all">All Subjects (Mix)</option>
              <option value="technical">Technical & Coding</option>
              <option value="architecture">Architectural / System Design</option>
              <option value="behavioral">Behavioral (STAR Stories)</option>
            </select>
          </div>

          {/* Card Quantity Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: 'hsl(var(--text-secondary))', letterSpacing: '0.5px' }}>Quantity:</span>
            <select 
              value={cardCount} 
              onChange={(e) => setCardCount(Number(e.target.value))}
              className="form-input"
              style={{ fontSize: '12px', background: 'hsl(var(--bg-obsidian))', padding: '6px 12px', height: '34px', width: '110px', margin: 0 }}
            >
              <option value={1}>1 Card</option>
              <option value={3}>3 Cards</option>
              <option value={5}>5 Cards</option>
              <option value={8}>8 Cards</option>
              <option value={10}>10 Cards</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={handleGenerateAICards} 
            className="btn-primary"
            disabled={loadingAICards}
            style={{ fontSize: '12.5px', height: '34px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {loadingAICards ? (
              <>
                <RefreshCw size={14} className="spin-animation" />
                Generating Cards...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                AI Generate Cards
              </>
            )}
          </button>

          <button 
            onClick={handleGenerateCheatSheet} 
            className="btn-secondary"
            disabled={loadingCheatSheet}
            style={{ fontSize: '12.5px', height: '34px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {loadingCheatSheet ? (
              <>
                <RefreshCw size={14} className="spin-animation" />
                Generating Guide...
              </>
            ) : (
              <>
                <FileText size={14} />
                AI Placement Guide
              </>
            )}
          </button>
        </div>
      </div>

      {/* Helper Context Subtext */}
      <p style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', marginTop: '-8px', display: 'flex', alignItems: 'center', gap: '6px' }} className="hide-on-mobile">
        <Compass size={12} style={{ color: 'hsl(var(--primary))' }} />
        AI parses target role <strong>({targetRole})</strong> and resume metrics to generate custom flashcards.
      </p>

      {/* Main Flashcard Deck Workspace */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Filters & Search Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }} className="filters-row">
          
          {/* Category buttons */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {[
              { label: 'All', value: 'all' },
              { label: 'Technical', value: 'technical' },
              { label: 'Architecture', value: 'architecture' },
              { label: 'Behavioral', value: 'behavioral' }
            ].map((tab) => (
              <button 
                key={tab.value}
                onClick={() => setActiveTab(tab.value as any)} 
                className={`btn-secondary ${activeTab === tab.value ? 'active-filter-btn' : ''}`}
                style={{ padding: '6px 12px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid hsl(var(--border-color))' }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', maxWidth: '240px', width: '100%' }}>
            <Search 
              size={14} 
              style={{ 
                position: 'absolute', 
                left: '10px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'hsl(var(--text-muted))' 
              }} 
            />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '30px', paddingRight: '10px', fontSize: '11.5px', height: '32px', background: 'hsl(var(--bg-card))' }}
              placeholder="Search questions..."
            />
          </div>
        </div>

        {/* Flashcards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          
          {filteredCards.map((card) => {
            const isFlipped = !!flippedCards[card.id];
            return (
              <div key={card.id} className="flip-card-container">
                <div 
                  className={`flip-card ${isFlipped ? 'flipped' : ''}`}
                  onClick={() => handleFlip(card.id)}
                >
                  {/* Front Side */}
                  <div className="flip-card-front" style={{ border: '1px solid hsl(var(--border-color))' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ 
                        fontSize: '9px', 
                        textTransform: 'uppercase', 
                        fontWeight: 700, 
                        color: 'hsl(var(--primary))',
                        background: 'rgba(16, 185, 129, 0.08)',
                        padding: '1px 6px',
                        borderRadius: '3px'
                      }}>
                        {card.category}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ 
                          fontSize: '10px', 
                          fontWeight: 600, 
                          color: getDifficultyColor(card.difficulty) 
                        }}>
                          {card.difficulty}
                        </span>
                        <button 
                          onClick={(e) => handleDeleteCard(card.id, e)}
                          style={{ 
                            background: 'transparent', 
                            border: 'none', 
                            color: 'hsl(var(--text-muted))', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            padding: 0
                          }}
                          className="delete-card-btn"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    
                    <h4 style={{ fontSize: '13.5px', fontWeight: 700, margin: '16px 0', lineHeight: '1.4', color: 'white' }}>
                      {card.question}
                    </h4>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'hsl(var(--text-muted))', marginTop: 'auto' }}>
                      <Eye size={11} />
                      <span>Click to reveal response criteria</span>
                    </div>
                  </div>

                  {/* Back Side */}
                  <div className="flip-card-back">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: 'white' }}>RESPONSE GUIDELINES:</span>
                          <button 
                            onClick={(e) => handleDeleteCard(card.id, e)}
                            style={{ 
                              background: 'transparent', 
                              border: 'none', 
                              color: 'hsl(var(--text-muted))', 
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              padding: 0
                            }}
                            className="delete-card-btn"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <p style={{ fontSize: '11px', color: 'hsl(var(--text-primary))', lineHeight: '1.4', marginBottom: '6px' }}>
                          {card.answerSummary}
                        </p>
                        
                        {/* Sub points */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', borderLeft: '1.5px solid hsl(var(--primary) / 0.4)', paddingLeft: '6px' }}>
                          {card.keyPoints.slice(0, 3).map((p, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '9.5px', color: 'hsl(var(--text-secondary))' }}>
                              <CornerDownRight size={9} style={{ color: 'hsl(var(--primary))' }} />
                              <span>{p}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '6px', fontSize: '9.5px', color: 'hsl(var(--accent-rose))' }}>
                        ⚠️ <strong>Trap:</strong> {card.pitfalls}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {filteredCards.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px 10px',
            border: '1px dashed hsl(var(--border-color))',
            borderRadius: '6px',
            color: 'hsl(var(--text-muted))'
          }}>
            <Compass size={24} style={{ marginBottom: '8px', strokeWidth: '1.5' }} />
            <p style={{ fontSize: '12px' }}>No flashcards match your current filters or search query.</p>
          </div>
        )}
      </div>

      <style>{`
        .active-filter-btn {
          background: rgba(255, 255, 255, 0.04) !important;
          border-color: hsl(var(--primary)) !important;
          color: white !important;
        }
        .delete-card-btn:hover {
          color: hsl(var(--accent-rose)) !important;
        }
        @media (max-width: 968px) {
          .filters-row {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
          }
        }
      `}</style>
    </div>
  );
};

// Helper mock compiler
function getMockCheatSheet(role: string): string {
  return `### Career Placement Guide: ${role}

#### 1. Core Technical Competencies
- Technical proficiency in high-speed, modern rendering libraries.
- Strong capabilities in database query index matching.
- Implementation patterns using structured testing scripts.

#### 2. Key Concept Questions to Study
- **State Optimization**: How to structure states in a component tree to minimize rendering overhead.
- **Latency Troubleshooting**: Diagnostics procedures to debug slow server connections.
- **Microservices Orchestration**: Maintaining reliability in multi-layered, asynchronous systems.

#### 3. Behavioral Checkpoints (STAR)
- **Adaptability**: Give a concrete scenario where you successfully pivot development under shifting constraints.
- **Collaboration**: Describe handling complex technical disagreements by aligning on target metric performance.

#### 4. Critical Pitfalls (Avoid These)
- Mentioning general tasks ("I wrote code") instead of quantifiable outputs ("I reduced memory leaks by 20%").
- Blaming past programmers for legacy codebase complexity instead of highlighting how you resolved it.
- Skipping error checks and edge cases when whiteboarding logic.`;
}

export default PrepSheets;
