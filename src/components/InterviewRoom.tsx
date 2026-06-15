import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Video, 
  Mic, 
  Play, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  Award, 
  RefreshCw,
  Volume2,
  VolumeX,
  StopCircle
} from 'lucide-react';
import { generateInterviewQuestions, evaluateAnswer } from '../services/groqService';
import type { InterviewFeedback } from '../services/groqService';

interface InterviewRoomProps {
  resumeText: string;
  jobDescription: string;
  targetRole: string;
  addAttempt: (attempt: { role: string; type: string; score: number }) => void;
}

interface QuestionState {
  text: string;
  answer: string;
  feedback: InterviewFeedback | null;
}

// Locate native browser SpeechRecognition API
const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const InterviewRoom: React.FC<InterviewRoomProps> = ({
  resumeText,
  jobDescription,
  targetRole,
  addAttempt
}) => {
  // Navigation states: 'setup' | 'active' | 'feedback' | 'finished'
  const [sessionState, setSessionState] = useState<'setup' | 'active' | 'feedback' | 'finished'>('setup');
  
  // Settings states
  const [roleInput, setRoleInput] = useState<string>(targetRole);
  const [interviewType, setInterviewType] = useState<string>('Technical');
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  
  // Active states
  const [questions, setQuestions] = useState<QuestionState[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [loadingQuestions, setLoadingQuestions] = useState<boolean>(false);
  const [loadingFeedback, setLoadingFeedback] = useState<boolean>(false);
  
  // Timer states
  const [seconds, setSeconds] = useState<number>(0);
  const timerRef = useRef<any>(null);

  // Voice recognition and synthesis states
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const voiceTimeoutRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        
        // Populate user response textarea
        setQuestions(prev => {
          const updated = [...prev];
          updated[currentIdx].answer = transcript;
          return updated;
        });
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (voiceTimeoutRef.current) clearTimeout(voiceTimeoutRef.current);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [currentIdx]);

  // Read question aloud via Text-to-Speech (TTS)
  const speakQuestion = (text: string) => {
    if (!isAudioEnabled || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel(); // Stop any active speaker
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Choose standard English voice
    const voices = window.speechSynthesis.getVoices();
    const cleanVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'));
    if (cleanVoice) utterance.voice = cleanVoice;
    
    utterance.rate = 0.95; // Slightly slower for readability
    window.speechSynthesis.speak(utterance);
  };

  // Triggers TTS whenever a new question loads
  useEffect(() => {
    if (sessionState === 'active' && questions.length > 0) {
      speakQuestion(questions[currentIdx].text);
    }
  }, [currentIdx, sessionState, questions]);

  const startTimer = () => {
    setSeconds(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const initializeInterview = async () => {
    setLoadingQuestions(true);
    try {
      const generatedQs = await generateInterviewQuestions(resumeText, jobDescription, roleInput, interviewType);
      
      const qStates: QuestionState[] = generatedQs.map(q => ({
        text: q,
        answer: '',
        feedback: null
      }));

      setQuestions(qStates);
      setCurrentIdx(0);
      setSessionState('active');
      startTimer();
    } catch (e) {
      console.error(e);
      alert('Could not initialize interview. Please verify API key.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Toggle voice capture (Real mic vs simulated fallback)
  const toggleVoiceCapture = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel(); // Mute interviewer when talking

    if (recognitionRef.current) {
      // Browser supports Web SpeechRecognition
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        recognitionRef.current.start();
      }
    } else {
      // Fallback: simulated typing
      if (isListening) {
        setIsListening(false);
        if (voiceTimeoutRef.current) clearTimeout(voiceTimeoutRef.current);
      } else {
        setIsListening(true);
        const simulatedSpeeches = [
          "In my previous projects, I led the core team in constructing reusable component modules and database indexes, resolving query latencies by 30%. We worked within a strict Agile setup to ship weekly patches.",
          "When handling conflict, I prioritize open discussion and reference data points rather than subjective preferences. I set up structured syncing meetings to align our goals.",
          "I approach system design by mapping endpoints first, followed by decoupling storage layers. I use cache systems like Redis to prevent server bottlenecks during peak requests."
        ];
        
        const speechText = simulatedSpeeches[Math.floor(Math.random() * simulatedSpeeches.length)];
        let charIdx = 0;
        
        const typeSpeech = () => {
          if (charIdx < speechText.length) {
            setQuestions(prev => {
              const updated = [...prev];
              updated[currentIdx].answer += speechText.charAt(charIdx);
              return updated;
            });
            charIdx += 2;
            voiceTimeoutRef.current = setTimeout(typeSpeech, 30);
          } else {
            setIsListening(false);
          }
        };
        voiceTimeoutRef.current = setTimeout(typeSpeech, 500);
      }
    }
  };

  const submitAnswer = async () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    const currentQ = questions[currentIdx];
    if (!currentQ.answer.trim()) {
      alert('Please write or speak an answer before submitting.');
      return;
    }

    stopTimer();
    setLoadingFeedback(true);
    try {
      const feedback = await evaluateAnswer(currentQ.text, currentQ.answer, resumeText);
      setQuestions(prev => {
        const updated = [...prev];
        updated[currentIdx].feedback = feedback;
        return updated;
      });
      setSessionState('feedback');
    } catch (e) {
      console.error(e);
      alert('Answer evaluation failed.');
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSessionState('active');
      startTimer();
    } else {
      setSessionState('finished');
      
      const totalScore = questions.reduce((sum, q) => sum + (q.feedback?.score || 0), 0);
      const avgScore = Math.round(totalScore / questions.length);
      
      addAttempt({
        role: roleInput,
        type: interviewType,
        score: avgScore
      });
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[currentIdx].answer = e.target.value;
      return updated;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '28px', fontWeight: 800 }}>AI Interview Simulator</h2>
        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '14px', marginTop: '4px' }}>
          Test your domain preparation in a realistic mock interview room tailored to your resume and career objectives.
        </p>
      </div>

      {/* Setup screen */}
      {sessionState === 'setup' && (
        <div className="glass-panel" style={{ padding: '30px', maxWidth: '650px', margin: '0 auto', width: '100%' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Video size={20} className="text-gradient" /> Configure Interview Session
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Target Role</label>
              <input 
                type="text" 
                value={roleInput} 
                onChange={(e) => setRoleInput(e.target.value)}
                className="form-input" 
                placeholder="e.g. React Developer"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="setup-split">
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Interview Core</label>
                <select 
                  value={interviewType} 
                  onChange={(e) => setInterviewType(e.target.value)}
                  className="form-input"
                  style={{ background: 'hsl(var(--bg-obsidian))', border: '1px solid hsl(var(--border-color))' }}
                >
                  <option value="Technical">Technical (Coding & Core concepts)</option>
                  <option value="Behavioral">Behavioral (STAR framework)</option>
                  <option value="System Design">System Design (Architectures)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Response Type</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => setInputMode('text')}
                    className={`btn-secondary ${inputMode === 'text' ? 'active-mode-btn' : ''}`}
                    style={{ flex: 1, padding: '10px', fontSize: '13px', justifyContent: 'center' }}
                  >
                    Text Input
                  </button>
                  <button 
                    onClick={() => setInputMode('voice')}
                    className={`btn-secondary ${inputMode === 'voice' ? 'active-mode-btn' : ''}`}
                    style={{ flex: 1, padding: '10px', fontSize: '13px', justifyContent: 'center' }}
                  >
                    Voice Mic Input
                  </button>
                </div>
              </div>
            </div>

            <button 
              onClick={initializeInterview} 
              className="btn-primary" 
              disabled={loadingQuestions}
              style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '10px' }}
            >
              {loadingQuestions ? (
                <>
                  <RefreshCw size={18} className="spin-animation" />
                  Generating Custom Session...
                </>
              ) : (
                <>
                  <Play size={16} />
                  Start Mock Interview
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Active Question screen */}
      {sessionState === 'active' && questions.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }} className="interview-room-grid">
          
          {/* Answer Box Panel */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid hsl(var(--border-color))', paddingBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'hsl(var(--primary))', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Live Interview Session
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginTop: '2px' }}>
                  Question {currentIdx + 1} of {questions.length}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button 
                  onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'hsl(var(--text-secondary))',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title={isAudioEnabled ? "Mute Read Aloud" : "Unmute Read Aloud"}
                >
                  {isAudioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'hsl(var(--accent-amber))', background: 'rgba(245, 158, 11, 0.1)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                  <Clock size={14} />
                  <span>{formatTime(seconds)}</span>
                </div>
              </div>
            </div>

            {/* AI Voice visualizer avatar */}
            <div className="glass-panel" style={{
              padding: '20px',
              background: 'rgba(255,255,255,0.01)',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              border: '1px dashed hsl(var(--border-color))'
            }}>
              {/* Pulsing Avatar */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
                  zIndex: 2,
                  position: 'relative'
                }}>
                  <Volume2 size={24} />
                </div>
                <div className="audio-ripple" style={{
                  position: 'absolute',
                  top: '-4px',
                  left: '-4px',
                  right: '-4px',
                  bottom: '-4px',
                  borderRadius: '50%',
                  border: '2px solid hsl(var(--primary) / 0.3)',
                  zIndex: 1
                }}></div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '13px', color: 'hsl(var(--text-muted))', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Interviewer Prompt</h4>
                  <button 
                    onClick={() => speakQuestion(questions[currentIdx].text)}
                    style={{ background: 'transparent', border: 'none', color: 'hsl(var(--primary))', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    <Volume2 size={12} /> Replay Audio
                  </button>
                </div>
                <p style={{ fontSize: '15px', fontWeight: 600, color: 'hsl(var(--text-primary))', marginTop: '4px', lineHeight: '1.5' }}>
                  "{questions[currentIdx].text}"
                </p>
              </div>
            </div>

            {/* Answer Input Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--text-secondary))', marginBottom: '8px' }}>
                {inputMode === 'text' ? 'Draft Your Answer' : 'Speech Recognition Capture'}
              </label>

              {inputMode === 'text' ? (
                <textarea
                  value={questions[currentIdx].answer}
                  onChange={handleTextChange}
                  className="form-textarea"
                  style={{ minHeight: '220px', resize: 'vertical', fontSize: '13px', lineHeight: '1.6' }}
                  placeholder="Structure your answer using the STAR method if possible (Situation, Task, Action, Result)..."
                />
              ) : (
                <div 
                  className="glass-panel" 
                  style={{ 
                    minHeight: '220px', 
                    background: 'hsl(var(--bg-obsidian))', 
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: '1px solid hsl(var(--border-color))'
                  }}
                >
                  <div style={{ 
                    maxHeight: '130px', 
                    overflowY: 'auto', 
                    color: questions[currentIdx].answer ? 'hsl(var(--text-primary))' : 'hsl(var(--text-muted))',
                    fontSize: '14px',
                    fontStyle: questions[currentIdx].answer ? 'normal' : 'italic',
                    lineHeight: '1.6'
                  }}>
                    {questions[currentIdx].answer || "Click 'Start Voice Capture' below and speak into your microphone to record your answer..."}
                  </div>
                  
                  {/* Visualizer SVGs */}
                  {isListening && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', height: '30px', alignItems: 'center' }}>
                      <div className="wave-bar" style={{ animationDelay: '0.1s' }}></div>
                      <div className="wave-bar" style={{ animationDelay: '0.3s', height: '25px' }}></div>
                      <div className="wave-bar" style={{ animationDelay: '0.2s', height: '18px' }}></div>
                      <div className="wave-bar" style={{ animationDelay: '0.4s', height: '28px' }}></div>
                      <div className="wave-bar" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button 
                      onClick={toggleVoiceCapture}
                      className={`btn-secondary ${isListening ? 'listening-mic-btn' : ''}`}
                      style={{ 
                        borderRadius: '30px', 
                        padding: '10px 24px', 
                        fontSize: '12.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      {isListening ? (
                        <>
                          <StopCircle size={14} style={{ color: 'hsl(var(--accent-rose))' }} />
                          Stop Capture
                        </>
                      ) : (
                        <>
                          <Mic size={14} />
                          Start Voice Capture
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={submitAnswer}
              className="btn-primary"
              disabled={loadingFeedback || !questions[currentIdx].answer.trim()}
              style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
            >
              {loadingFeedback ? (
                <>
                  <RefreshCw size={18} className="spin-animation" />
                  AI Evaluating Answer...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Submit Answer & Get Grades
                </>
              )}
            </button>
          </div>

          {/* Right Panel: Side Tips */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Interview Cheat Card</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
              <div style={{ padding: '12px', borderLeft: '3px solid hsl(var(--primary))', background: 'rgba(255,255,255,0.01)' }}>
                <h4 style={{ fontWeight: 600, marginBottom: '4px' }}>STAR Framework Structure</h4>
                <p style={{ color: 'hsl(var(--text-secondary))', lineHeight: '1.4' }}>
                  <strong>S:</strong> Situation (Set the context)<br />
                  <strong>T:</strong> Task (Describe your goal)<br />
                  <strong>A:</strong> Action (What steps did you take?)<br />
                  <strong>R:</strong> Result (Quantifiable outcome)
                </p>
              </div>

              <div>
                <h4 style={{ fontWeight: 600, marginBottom: '6px' }}>Domain Recommendation</h4>
                <ul style={{ paddingLeft: '16px', color: 'hsl(var(--text-secondary))', display: 'flex', flexDirection: 'column', gap: '6px', listStyleType: 'disc' }}>
                  <li>Be specific. Rather than saying "I optimized database code", specify "I modified Postgres query joints".</li>
                  <li>In mock text prompts, try writing answers that span 2-3 detailed paragraphs.</li>
                  <li>Speak clearly if using the voice recorder.</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Answer Feedback Report screen */}
      {sessionState === 'feedback' && questions[currentIdx].feedback && (
        <div className="glass-panel" style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid hsl(var(--border-color))', paddingBottom: '16px', marginBottom: '20px' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'hsl(var(--accent-green))', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                AI Feedback Report
              </span>
              <h3 style={{ fontSize: '20px', fontWeight: 800, marginTop: '2px' }}>
                Question {currentIdx + 1} Assessment
              </h3>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ 
                fontSize: '28px', 
                fontWeight: 800, 
                color: questions[currentIdx].feedback!.score >= 80 ? 'hsl(var(--accent-green))' : 'hsl(var(--accent-amber))',
                background: `${questions[currentIdx].feedback!.score >= 80 ? 'hsl(var(--accent-green))' : 'hsl(var(--accent-amber))'}10`,
                padding: '4px 12px',
                borderRadius: '8px',
                border: '1px solid currentColor'
              }}>
                {questions[currentIdx].feedback!.score}%
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Clarity and accuracy assessment */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="feedback-split">
              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid hsl(var(--border-color))', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ fontWeight: 700, fontSize: '13px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Volume2 size={14} className="text-gradient" /> Communication Clarity
                </h4>
                <p style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))', lineHeight: '1.5' }}>
                  {questions[currentIdx].feedback!.clarity}
                </p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid hsl(var(--border-color))', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ fontWeight: 700, fontSize: '13px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={14} className="text-gradient" /> Context Accuracy
                </h4>
                <p style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))', lineHeight: '1.5' }}>
                  {questions[currentIdx].feedback!.accuracy}
                </p>
              </div>
            </div>

            {/* Key talking points missed */}
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px' }}>Gaps & Recommended Focus Items</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {questions[currentIdx].feedback!.pointsMissed.map((point, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>
                    <AlertCircle size={14} style={{ color: 'hsl(var(--accent-amber))', flexShrink: 0 }} />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample Ideal Answer */}
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)', 
              border: '1px solid hsl(var(--primary) / 0.15)',
              borderRadius: '12px',
              padding: '18px'
            }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                🌟 Recruiter-Approved Ideal Response
              </h4>
              <p style={{ fontSize: '12.5px', color: 'hsl(var(--text-primary))', lineHeight: '1.6', fontStyle: 'italic' }}>
                "{questions[currentIdx].feedback!.idealAnswer}"
              </p>
            </div>

            {/* Navigation Button */}
            <button 
              onClick={handleNext}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
            >
              {currentIdx < questions.length - 1 ? (
                <>
                  Next Question
                  <ChevronRight size={16} />
                </>
              ) : (
                <>
                  View Final Interview Grade
                  <Award size={16} />
                </>
              )}
            </button>

          </div>
        </div>
      )}

      {/* Finished Summary screen */}
      {sessionState === 'finished' && (
        <div className="glass-panel" style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', textAlign: 'center', width: '100%' }}>
          
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
            padding: '24px',
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            border: '2px solid hsl(var(--primary) / 0.3)'
          }}>
            <Award size={40} className="text-gradient" />
          </div>

          <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>Interview Completed!</h3>
          <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '14px', marginBottom: '24px' }}>
            Excellent effort. Your answers were evaluated and scored against placement standards for <strong>{roleInput}</strong>.
          </p>

          {/* Scores Overview list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
            {questions.map((q, idx) => (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid hsl(var(--border-color))',
                  borderRadius: '10px',
                  fontSize: '13px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
                  <span style={{ fontWeight: 600, color: 'hsl(var(--text-muted))' }}>Q{idx + 1}</span>
                  <span style={{ 
                    maxWidth: '350px', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap',
                    color: 'hsl(var(--text-secondary))' 
                  }}>
                    {q.text}
                  </span>
                </div>
                <span style={{ 
                  fontWeight: 700, 
                  color: q.feedback!.score >= 80 ? 'hsl(var(--accent-green))' : 'hsl(var(--accent-amber))' 
                }}>
                  {q.feedback!.score}%
                </span>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button 
              onClick={() => setSessionState('setup')}
              className="btn-secondary"
            >
              Start New Attempt
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary"
            >
              Go to Dashboard
            </button>
          </div>

        </div>
      )}

      {/* Waveform visual CSS */}
      <style>{`
        .active-mode-btn {
          background: hsl(var(--border-color)) !important;
          border-color: hsl(var(--primary)) !important;
        }
        .listening-mic-btn {
          background: rgba(239, 68, 68, 0.1) !important;
          border-color: rgba(239, 68, 68, 0.4) !important;
          color: #f87171 !important;
        }
        .wave-bar {
          width: 4px;
          height: 10px;
          background: hsl(var(--accent-rose));
          border-radius: 4px;
          animation: sound-wave 0.8s ease-in-out infinite alternate;
        }
        @keyframes sound-wave {
          0% { height: 10px; }
          100% { height: 35px; }
        }
        @media (max-width: 968px) {
          .interview-room-grid {
            grid-template-columns: 1fr !important;
          }
          .setup-split {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default InterviewRoom;
