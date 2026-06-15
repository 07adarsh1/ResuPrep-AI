// Local storage key for custom user Groq API Key
const API_KEY_STORAGE_KEY = 'resuprep_custom_groq_api_key';

export interface ResumeAnalysisResult {
  score: number;
  missingKeywords: string[];
  bulletPoints: { original: string; suggestion: string; rationale: string }[];
  strengths: string[];
  weaknesses: string[];
}

export interface InterviewFeedback {
  score: number;
  clarity: string;
  accuracy: string;
  pointsMissed: string[];
  idealAnswer: string;
}

// 1. API Key Helpers
export const getApiKey = (): string => {
  const customKey = localStorage.getItem(API_KEY_STORAGE_KEY);
  if (customKey && customKey.trim().length > 0) {
    return customKey;
  }
  // Fallback to environment variable
  const envKey = import.meta.env.VITE_GROQ_API_KEY;
  return (envKey && envKey !== 'your_groq_api_key_here') ? envKey : '';
};

export const setApiKey = (key: string): void => {
  localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
};

export const clearApiKey = (): void => {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
};

export const hasApiKey = (): boolean => {
  return getApiKey().length > 0;
};

// Core fetch helper for Groq API
const callGroqAPI = async (prompt: string, model: string = 'llama-3.3-70b-versatile'): Promise<string> => {
  const key = getApiKey();
  if (!key) {
    throw new Error('Groq API Key is not set.');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API returned ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  if (data.choices && data.choices[0] && data.choices[0].message) {
    return data.choices[0].message.content;
  }

  throw new Error('Invalid response structure from Groq API');
};

// 2. AI Resume Analysis
export const analyzeResume = async (
  resumeText: string,
  jobDescription: string
): Promise<ResumeAnalysisResult> => {
  if (!hasApiKey()) {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate latency
    return getMockResumeAnalysis(resumeText, jobDescription);
  }

  try {
    const prompt = `
      You are an expert ATS (Applicant Tracking System) parser and senior recruiter.
      Analyze the following Resume against the Job Description.
      
      Resume text:
      """${resumeText}"""
      
      Job Description:
      """${jobDescription}"""
      
      Return a JSON object matching this TypeScript interface exactly:
      {
        "score": number, // overall match score out of 100
        "missingKeywords": string[], // 5-8 key technical or soft keywords missing in the resume but present in JD
        "bulletPoints": [
          {
            "original": string, // an bullet point/phrase from the resume that can be improved
            "suggestion": string, // rewritten bullet point using STAR method (Situation, Task, Action, Result) with metrics
            "rationale": string // why this suggestion is stronger (e.g. added active verbs, metrics, impact)
          }
        ], // limit to 3-5 key improvements
        "strengths": string[], // 3-4 bullet points highlighting strong alignments
        "weaknesses": string[] // 3-4 bullet points outlining key gaps or layout weaknesses
      }
    `;

    const responseText = await callGroqAPI(prompt);
    return JSON.parse(responseText) as ResumeAnalysisResult;
  } catch (error) {
    console.error('Groq API resume analysis failed. Falling back to mock data.', error);
    return getMockResumeAnalysis(resumeText, jobDescription);
  }
};

// 3. AI Interview Question Generation
export const generateInterviewQuestions = async (
  resumeText: string,
  jobDescription: string,
  role: string,
  type: string // 'Technical' | 'Behavioral' | 'System Design'
): Promise<string[]> => {
  if (!hasApiKey()) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return getMockQuestions(role, type);
  }

  try {
    const prompt = `
      You are a Lead Engineer conducting an interview for the role of ${role}.
      Generate a list of 5 interview questions of type "${type}".
      Use the candidate's Resume and target Job Description to make the questions highly personalized to their experience and target role.
      
      Resume:
      """${resumeText}"""
      
      Job Description:
      """${jobDescription}"""
      
      Return a JSON array of strings containing exactly 5 questions.
      Your response MUST be in this exact format:
      {
        "questions": ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]
      }
    `;

    // Note: Use llama-3.1-8b-instant for fast, low-latency interview setup
    const responseText = await callGroqAPI(prompt, 'llama-3.1-8b-instant');
    const parsed = JSON.parse(responseText);
    return parsed.questions as string[];
  } catch (error) {
    console.error('Groq API question generation failed. Falling back to mock questions.', error);
    return getMockQuestions(role, type);
  }
};

// 4. AI Answer Evaluation
export const evaluateAnswer = async (
  question: string,
  answer: string,
  resumeText: string
): Promise<InterviewFeedback> => {
  if (!hasApiKey()) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return getMockAnswerEvaluation(question, answer);
  }

  try {
    const prompt = `
      You are an interviewer evaluating a candidate's response during a mock interview.
      
      Question: "${question}"
      Candidate's Answer: "${answer}"
      Candidate's Resume Context: "${resumeText}"
      
      Evaluate the response and provide constructive, detailed feedback.
      Return a JSON object matching this TypeScript interface:
      {
        "score": number, // score from 0 to 100 based on completeness, relevance, and structure
        "clarity": string, // constructive feedback on communication, speed, and clarity (2-3 sentences)
        "accuracy": string, // assessment of technical accuracy or appropriateness of behavioral answer (2-3 sentences)
        "pointsMissed": string[], // 2-3 key talking points, details, or STAR elements they missed or could have emphasized
        "idealAnswer": string // A highly polished, professional sample answer demonstrating how to structure the response
      }
    `;

    const responseText = await callGroqAPI(prompt);
    return JSON.parse(responseText) as InterviewFeedback;
  } catch (error) {
    console.error('Groq API answer evaluation failed. Falling back to mock feedback.', error);
    return getMockAnswerEvaluation(question, answer);
  }
};

// 5. AI Cheat Sheet Generation
export const generateCheatSheetFromAI = async (role: string): Promise<string> => {
  if (!hasApiKey()) {
    await new Promise((resolve) => setTimeout(resolve, 2500));
    return ''; // Return empty to fall back to mock
  }

  try {
    const prompt = `
      You are a Principal Tech Recruiter.
      Generate a comprehensive, premium Interview Placement Cheat Sheet for the role: "${role}".
      
      The sheet should be in Markdown format and cover:
      1. Core Technical Competencies (3-4 bullet points)
      2. Top 3 System Design or Concept Questions to study
      3. 3 Behavioral checkpoints (STAR tips)
      4. "Common Red Flags" to avoid during the interview
      
      Keep it structured, dense, highly professional, and direct. Use alerts or highlights where appropriate.
      Return a JSON object matching this exact format:
      {
        "markdown": "Your markdown text here (use standard newline characters for separation)"
      }
    `;

    const responseText = await callGroqAPI(prompt);
    const parsed = JSON.parse(responseText);
    return parsed.markdown || '';
  } catch (error) {
    console.error('Groq API cheat sheet generation failed.', error);
    throw error;
  }
};

export interface AIFlashcard {
  category: 'technical' | 'behavioral' | 'architecture';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  answerSummary: string;
  keyPoints: string[];
  pitfalls: string;
}

// AI Flashcards Generator Service
export const generateAIFlashcards = async (
  targetRole: string,
  resumeText: string,
  count: number,
  subject: string
): Promise<AIFlashcard[]> => {
  if (!hasApiKey()) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return getMockFlashcards(targetRole, count, subject);
  }

  try {
    const prompt = `
      You are a Principal Tech Recruiter and engineering mentor.
      Generate exactly ${count} highly relevant interview preparation flashcards tailored for the role of "${targetRole}" based on the candidate's resume context:
      """${resumeText}"""
      
      The flashcard categories should be tailored to the subject filter: '${subject}' (unless 'all' was selected, in which case mix them among 'technical', 'architecture', and 'behavioral').
      If subject is not 'all', the category for ALL generated cards MUST be exactly '${subject}'.
      
      Return a JSON object matching this exact format:
      {
        "flashcards": [
          {
            "category": "technical", // must be exactly 'technical', 'behavioral', or 'architecture'
            "difficulty": "Medium", // must be exactly 'Easy', 'Medium', or 'Hard'
            "question": "Clear, concise interview question?",
            "answerSummary": "Detailed response summary of the core answer.",
            "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
            "pitfalls": "Critical trap to avoid during the answer."
          }
        ]
      }
    `;

    const responseText = await callGroqAPI(prompt);
    const parsed = JSON.parse(responseText);
    return (parsed.flashcards || []) as AIFlashcard[];
  } catch (error) {
    console.error('Groq API flashcard generation failed. Falling back to mock.', error);
    return getMockFlashcards(targetRole, count, subject);
  }
};

// 6. AI STAR Story Builder
export const buildStarStory = async (
  situation: string,
  task: string,
  action: string,
  result: string
): Promise<string> => {
  if (!hasApiKey()) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return `Re-architected the layout elements and query structures (Situation) to resolve the high-latency database loading bugs (Task), implementing custom state caches and optimized query joints (Action), which successfully slashed average page load times by 40% (Result).`;
  }

  try {
    const prompt = `
      You are an expert resume writer.
      Compile a candidate's behavioral STAR parameters into a single, highly compelling resume bullet point.
      Use active verbs, avoid passive phrasing, and emphasize the metrics and business results.
      
      Parameters:
      - Situation: "${situation}"
      - Task: "${task}"
      - Action: "${action}"
      - Result: "${result}"
      
      Return a JSON object in this exact format:
      {
        "bulletPoint": "Your compiled high-impact bullet point here"
      }
    `;

    const responseText = await callGroqAPI(prompt);
    const parsed = JSON.parse(responseText);
    return parsed.bulletPoint || '';
  } catch (error) {
    console.error('Groq API STAR story compilation failed. Falling back to mock.', error);
    return `Compiled Story: Re-architected ${situation} to resolve ${task}, by executing ${action}, which successfully achieved ${result}.`;
  }
};

// ==========================================
// Fallback Mock Data Engines
// ==========================================

function getMockResumeAnalysis(resumeText: string, jobDescription: string): ResumeAnalysisResult {
  const jdLower = jobDescription.toLowerCase();
  const resLower = resumeText.toLowerCase();
  
  const keywords = ['react', 'typescript', 'aws', 'api', 'docker', 'agile', 'python', 'sql', 'system design', 'ci/cd'];
  const matched = keywords.filter(kw => resLower.includes(kw));
  const missing = keywords.filter(kw => jdLower.includes(kw) && !resLower.includes(kw));
  
  const baseScore = 65 + Math.min(matched.length * 4, 25);
  const score = Math.min(baseScore, 98);

  const missingKeywords = missing.length > 0 ? missing : ['CI/CD Pipelines', 'Cloud Architecture (AWS)', 'Unit Testing (Jest/RTL)'];

  return {
    score,
    missingKeywords,
    bulletPoints: [
      {
        original: 'Responsible for writing JavaScript code and updating website features.',
        suggestion: 'Redesigned core React dashboard layout and integrated custom state machines, accelerating rendering performance by 35% and improving active user retention by 14%.',
        rationale: 'Converted passive tasks into metric-driven outcomes using the STAR framework. Added specific metrics (35% speedup) to convey actual business value.'
      },
      {
        original: 'Worked with SQL databases to fetch and update application data.',
        suggestion: 'Optimized PostgreSQL query index strategies and rebuilt complex relational joints, slashing server query latency from 850ms to 120ms (a 7x optimization).',
        rationale: 'Replaced generic databases text with specific actions (index optimization, query latency reduction) that show deep engineering capability.'
      }
    ],
    strengths: [
      'Strong foundational knowledge of modern component layouts (React/JS).',
      'Demonstrated experience with API integrations and backend querying.',
      'Active contributions to project scope and code review pipelines.'
    ],
    weaknesses: [
      'Lacks concrete business outcome metrics on several job bullet points.',
      'No explicit mention of test coverage practices (e.g. Jest, Cypress).',
      'Could benefit from highlighting cloud infrastructure deployments (AWS/Azure).'
    ]
  };
}

function getMockQuestions(role: string, type: string): string[] {
  const roleLower = role.toLowerCase();
  
  if (type === 'Technical') {
    if (roleLower.includes('front') || roleLower.includes('react')) {
      return [
        "Can you explain the difference between React Server Components (RSC) and standard Client Components, and when to use each?",
        "How would you optimize a slow-rendering list of 10,000 items in a React application?",
        "What are the differences between TypeScript interfaces and type aliases? In what scenarios is one preferred over the other?",
        "Describe how browser caching works and how you would configure caching headers for a modern SPA assets bundle.",
        "What is the event loop in JavaScript, and how do macro-tasks differ from micro-tasks in async executions?"
      ];
    } else if (roleLower.includes('back') || roleLower.includes('node') || roleLower.includes('python')) {
      return [
        "Explain connection pooling in database queries. How does it improve database operations performance?",
        "How would you secure a REST API from cross-site scripting (XSS) and SQL injection vulnerabilities?",
        "What is the difference between SQL and NoSQL databases, and how do you choose between them for a scale-heavy service?",
        "Describe how you would design a background job system that processes 100,000 image resizing tasks concurrently.",
        "What is the role of indexes in databases? Can you explain what a composite index is and its pitfalls?"
      ];
    } else {
      return [
        "Explain how memory management works in your preferred programming language, including garbage collection.",
        "How does a hash map work under the hood? What is its time complexity, and how are hash collisions resolved?",
        "Explain the difference between TCP and UDP. When would you use UDP over TCP?",
        "Describe the process of a client making an HTTPS request. How is the SSL/TLS handshake completed?",
        "Explain how Git merges work under the hood and what happens during a fast-forward merge."
      ];
    }
  } else if (type === 'System Design') {
    return [
      "How would you design a real-time notification system that sends pushes to 50 million monthly active users?",
      "Design a URL shortening service like Bit.ly. What are your storage estimations and write/read bottlenecks?",
      "How would you design a rate limiter for an public API platform? Compare token bucket vs leaky bucket algorithms.",
      "Design an image/video uploading system for a platform like Instagram, ensuring fast uploads and distributed CDN retrieval.",
      "How would you handle eventual consistency in a microservices system when a payment transaction triggers updates across inventory and orders?"
    ];
  } else { // Behavioral / STAR
    return [
      "Describe a time when you had a disagreement with a team member or stakeholder. How did you handle it and what was the outcome?",
      "Give an example of a project that failed or missed its deadline. What did you learn and how did you adjust your workflow afterwards?",
      "Describe a challenging technical problem you solved recently. Walk through the situation, your actions, and the end result.",
      "Tell me about a time when you had to work with a legacy codebase or undocumented systems. What steps did you take to navigate it?",
      "How do you prioritize your tasks when juggling multiple critical bugs and ongoing feature releases simultaneously?"
    ];
  }
}

function getMockAnswerEvaluation(question: string, answer: string): InterviewFeedback {
  const cleanAns = answer.trim().toLowerCase();
  
  if (cleanAns.length < 20) {
    return {
      score: 35,
      clarity: "The response is extremely brief and lacks structural flow. In professional interviews, short answers are often interpreted as a lack of depth or experience.",
      accuracy: "No substantial technical or context arguments were provided, leaving the interviewer unable to grade your accuracy.",
      pointsMissed: [
        "Providing actual background context of the problem.",
        "Listing technical choices or action steps taken.",
        "Highlighting the final business result or learning metrics."
      ],
      idealAnswer: "A complete response should follow the STAR framework (Situation, Task, Action, Result). For example: 'In my last role, we noticed [Situation]. My task was to [Task]. I did this by [Action]. As a result, we achieved [Result] and learned [Learning].'"
    };
  }

  const score = Math.floor(Math.random() * 15) + 75; // 75 to 90
  
  return {
    score,
    clarity: "Your communication is clear and directly addresses the core question. You organized your thoughts well, making it easy to follow your technical explanation.",
    accuracy: "The explanation of the underlying concepts is correct. You correctly identified core patterns and terminology associated with the problem.",
    pointsMissed: [
      "Quantifying your results (e.g., specific percentage changes or performance metrics).",
      "Detailing alternative solutions you considered and why you rejected them.",
      "Elaborating on how this solution impacted team collaboration or deployment pipelines."
    ],
    idealAnswer: `Here is a strong, structured answer: "When facing ${question.toLowerCase().replace(/\?$/, '')}, I approach it by first defining the system boundaries. In my previous work, we had a similar scenario where we resolved this by implementing [Strategy]. By doing this, we minimized overhead, achieved a 40% reduction in resource footprint, and established a modular base that made onboarding other engineers seamless."`
  };
}

function getMockFlashcards(role: string, count: number, subject: string): AIFlashcard[] {
  const allMocks: AIFlashcard[] = [
    {
      category: 'technical',
      difficulty: 'Medium',
      question: `For a ${role} position, how do you handle scale bottlenecks and concurrency limits?`,
      answerSummary: 'Identify memory leak vectors, optimize query loops, and employ asynchronous worker queues (e.g. BullMQ) to distribute process loads.',
      keyPoints: ['Use profilers to trace leak sources', 'Debounce or throttle database reads', 'Move heavy tasks to background worker threads'],
      pitfalls: 'Simply increasing container memory limits instead of addressing core computational overhead.'
    },
    {
      category: 'technical',
      difficulty: 'Easy',
      question: `Explain how event delegation works in JavaScript and its advantages.`,
      answerSummary: 'Event delegation attaches a single event listener to a parent element rather than multiple listeners to individual child elements, leveraging event bubbling.',
      keyPoints: ['Reduces memory footprint', 'Saves event listener bindings', 'Handles dynamically added child nodes automatically'],
      pitfalls: 'Forgetting to check if the event target matches the selector, resulting in unintended event triggers.'
    },
    {
      category: 'technical',
      difficulty: 'Hard',
      question: `What are the pros and cons of using WebSockets vs Server-Sent Events (SSE) for dynamic updates?`,
      answerSummary: 'WebSockets offer bidirectional communication suited for real-time collaboration, while SSE offers unidirectional server-to-client streaming over standard HTTP.',
      keyPoints: ['SSE has auto-reconnection built-in', 'WebSockets handle binary data natively', 'WebSockets bypass HTTP headers overhead after handshake'],
      pitfalls: 'Using WebSockets for simple dashboards where read-only SSE or HTTP polling is sufficient.'
    },
    {
      category: 'architecture',
      difficulty: 'Hard',
      question: `Describe a microservices caching topography suited for a ${role} application.`,
      answerSummary: 'Deploy multi-layer caching with in-memory local caches for configuration metrics, and centralized Redis databases for session tokens.',
      keyPoints: ['Cache eviction policies (LRU/LFU)', 'Write-through vs write-behind write modes', 'Cache invalidation on database updates'],
      pitfalls: 'Ignoring cache stampede risks when highly popular cache keys expire simultaneously.'
    },
    {
      category: 'architecture',
      difficulty: 'Medium',
      question: `What is the difference between horizontal and vertical database partitioning (sharding)?`,
      answerSummary: 'Horizontal partitioning splits table rows across multiple databases, while vertical partitioning splits table columns into separate tables.',
      keyPoints: ['Horizontal scaling reduces lookup times', 'Vertical scaling reduces row byte width', 'Requires a routing layer or smart client'],
      pitfalls: 'Executing cross-shard joins which are extremely expensive and destroy system performance.'
    },
    {
      category: 'architecture',
      difficulty: 'Medium',
      question: `How does a Content Delivery Network (CDN) cache invalidation process work?`,
      answerSummary: 'CDN edge servers cache static assets. Invalidation purges files by exact URL path or wildcard tag, forcing edge servers to fetch fresh copies.',
      keyPoints: ['Time-to-Live (TTL) expirations', 'Purge-by-Tag or Purge-by-URL API calls', 'Hashed filenames prevent cache issues'],
      pitfalls: 'Triggering global CDN purges during user spikes, causing severe cache stampedes on origin servers.'
    },
    {
      category: 'behavioral',
      difficulty: 'Medium',
      question: 'Tell me about a time you had to justify refactoring work to a non-technical product manager.',
      answerSummary: 'Translate the refactoring work into business outcomes (such as increased uptime, lowered server bills, or accelerated feature velocity).',
      keyPoints: ['Situation: Legacy module bloated page load times', 'Task: Secure 2 days to refactor', 'Action: Mapped load speed to user bounce metrics', 'Result: Halved page weight, boosting checkout conversions by 3%'],
      pitfalls: 'Using overly technical jargon that doesn\'t explain why the work makes the business more profitable.'
    },
    {
      category: 'behavioral',
      difficulty: 'Easy',
      question: 'How do you handle receiving critical constructive feedback from a senior engineer?',
      answerSummary: 'Approach feedback with growth mindset, separate criticism of the code from personal value, clarify recommendations, and implement revisions.',
      keyPoints: ['Active listening without defensiveness', 'Asking clarifying questions for technical rationale', 'Documenting code refactor learnings'],
      pitfalls: 'Reacting defensively or taking criticism of code style as a personal attack.'
    },
    {
      category: 'behavioral',
      difficulty: 'Hard',
      question: 'Give an example of resolving a high-severity production incident under tight time constraints.',
      answerSummary: 'Triage the issue systematically: establish a status channel, isolate the failure vector, roll back to a stable state, and perform post-mortem analysis.',
      keyPoints: ['Rolled back commit to stop bleed', 'Analyzed logs to trace Null Pointer reference', 'Patched, tested, and redeployed safely'],
      pitfalls: 'Attempting complex hotfixes in production while users are actively experiencing the outage, compounding the issue.'
    }
  ];

  // Filter based on subject
  const filtered = subject === 'all' 
    ? allMocks 
    : allMocks.filter(c => c.category === subject);

  // Return requested count (cycle elements if requested count > available)
  const result: AIFlashcard[] = [];
  for (let i = 0; i < count; i++) {
    const card = filtered[i % filtered.length];
    result.push({
      ...card,
      id: `ai-mock-${Date.now()}-${i}`
    } as any);
  }
  return result;
}
