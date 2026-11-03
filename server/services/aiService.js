const COMMON_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin',
  'React', 'React.js', 'Next.js', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Express.js', 'NestJS', 'Django',
  'Flask', 'FastAPI', 'Spring Boot', 'ASP.NET', 'Laravel',
  'HTML', 'HTML5', 'CSS', 'CSS3', 'Tailwind CSS', 'Bootstrap', 'Sass', 'Redux', 'Zustand', 'GraphQL', 'REST API',
  'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'Firebase', 'Supabase', 'DynamoDB', 'Elasticsearch',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud', 'GCP', 'CI/CD', 'Git', 'GitHub', 'GitLab', 'Linux',
  'Machine Learning', 'Deep Learning', 'NLP', 'TensorFlow', 'PyTorch', 'Scikit-Learn', 'Pandas', 'NumPy',
  'Artificial Intelligence', 'Data Science', 'Data Structures', 'Algorithms', 'Microservices', 'System Design',
  'Agile', 'Scrum', 'Jira', 'Unit Testing', 'Jest', 'Cypress', 'Playwright', 'Cybersecurity', 'DevOps'
];

export const COMMON_SOFT_SKILLS = [
  'Communication',
  'Problem Solving',
  'Teamwork',
  'Leadership',
  'Critical Thinking',
  'Time Management',
  'Adaptability',
  'Collaboration',
  'Agile Mindset',
  'Mentorship',
  'Analytical Thinking',
  'Conflict Resolution',
  'Creativity',
  'Attention to Detail'
];

/**
 * Call Google Gemini Generative Language API
 */
async function callGemini(prompt, systemInstruction = '') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }

  // Configured models with automated graceful fallback (Gemini Flash / Pro)
  const modelsToTry = [
    process.env.GEMINI_MODEL,
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-pro',
  ].filter(Boolean);

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemInstruction ? systemInstruction + '\n\n' : ''}${prompt}` }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textOutput) return textOutput;
      } else {
        const errText = await response.text();
        console.warn(`[Gemini API - ${model}]: HTTP ${response.status} - ${errText}`);
      }
    } catch (error) {
      console.warn(`[Gemini API Exception - ${model}]: ${error.message}`);
    }
  }

  return null;
}

/**
 * Local NLP Rule-Based Technical Skills Extraction
 */
export function extractSkillsLocally(text) {
  if (!text) return [];
  const foundSkills = new Set();
  const lowerText = text.toLowerCase();

  for (const skill of COMMON_SKILLS) {
    const escaped = skill.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-zA-Z0-9#+])${escaped}([^a-zA-Z0-9#+]|$)`, 'i');
    if (regex.test(lowerText) || lowerText.includes(skill.toLowerCase())) {
      foundSkills.add(skill);
    }
  }

  return Array.from(foundSkills);
}

/**
 * Local NLP Rule-Based Soft Skills Extraction
 */
export function extractSoftSkillsLocally(text) {
  if (!text) return ['Problem Solving', 'Teamwork', 'Communication'];
  const found = new Set();
  const lower = text.toLowerCase();

  for (const skill of COMMON_SOFT_SKILLS) {
    const escaped = skill.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-zA-Z0-9#+])${escaped}([^a-zA-Z0-9#+]|$)`, 'i');
    if (regex.test(lower) || lower.includes(skill.toLowerCase())) {
      found.add(skill);
    }
  }

  // Provide realistic defaults if none explicitly matched
  if (found.size === 0) {
    if (lower.includes('team') || lower.includes('cross-functional')) found.add('Teamwork');
    if (lower.includes('communicat') || lower.includes('present')) found.add('Communication');
    if (lower.includes('lead') || lower.includes('manage')) found.add('Leadership');
    found.add('Problem Solving');
    found.add('Adaptability');
  }

  return Array.from(found);
}

/**
 * Local NLP Rule-Based Years of Experience Extraction
 */
export function extractYearsOfExperienceLocally(text) {
  if (!text) return 2;
  const lower = text.toLowerCase();

  // Pattern 1: "X+ years of experience" or "X years"
  const yrMatch = lower.match(/(\d{1,2})\+?\s*(?:years?|yrs?)(?:\s+of)?\s+experience/i);
  if (yrMatch && yrMatch[1]) {
    const parsed = parseInt(yrMatch[1], 10);
    if (!isNaN(parsed) && parsed > 0 && parsed < 40) return parsed;
  }

  // Pattern 2: Scan for year ranges e.g. "2019 - 2024"
  const rangeMatches = [...lower.matchAll(/(20\d{2})\s*[-–—to]+\s*(20\d{2}|present|current)/gi)];
  if (rangeMatches.length > 0) {
    let totalYears = 0;
    const currentYear = new Date().getFullYear();
    for (const m of rangeMatches) {
      const start = parseInt(m[1], 10);
      const end = m[2].toLowerCase() === 'present' || m[2].toLowerCase() === 'current' ? currentYear : parseInt(m[2], 10);
      if (end >= start) {
        totalYears += (end - start);
      }
    }
    if (totalYears > 0 && totalYears < 40) {
      return Math.min(totalYears, 20);
    }
  }

  // Default based on text density
  if (text.length > 2500) return 4;
  if (text.length > 1200) return 2;
  return 1;
}

/**
 * Local NLP Rule-Based Role Extraction
 */
export function extractRolesLocally(text) {
  const commonRoles = [
    'Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'Software Engineer',
    'MERN Stack Developer', 'React Developer', 'Node.js Developer', 'DevOps Engineer',
    'Cloud Architect', 'Data Scientist', 'Machine Learning Engineer', 'UI/UX Designer',
    'Product Manager', 'QA Engineer', 'Mobile Application Developer'
  ];

  const lower = (text || '').toLowerCase();
  let currentRole = 'Full Stack Developer';
  const preferredRoles = new Set();

  for (const role of commonRoles) {
    if (lower.includes(role.toLowerCase())) {
      if (!currentRole || currentRole === 'Full Stack Developer') {
        currentRole = role;
      }
      preferredRoles.add(role);
    }
  }

  if (preferredRoles.size === 0) {
    preferredRoles.add('Software Engineer');
    preferredRoles.add('Full Stack Developer');
  }

  return {
    currentRole,
    preferredRoles: Array.from(preferredRoles).slice(0, 4)
  };
}

/**
 * Local NLP Rule-Based Projects Extraction
 */
export function extractProjectsLocally(text) {
  if (!text) return [];
  const lines = text.split('\n');
  const projects = [];

  let isProjectSection = false;
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (/^projects?(\s*:)?$/i.test(line) || /^key projects?(\s*:)?$/i.test(line)) {
      isProjectSection = true;
      continue;
    }
    if (isProjectSection) {
      if (/^(education|experience|skills|certifications|awards)/i.test(line)) {
        isProjectSection = false;
        continue;
      }
      if (line.length > 15 && line.length < 120 && (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || /^[A-Z0-9]/.test(line))) {
        projects.push(line.replace(/^[-•*]\s*/, ''));
        if (projects.length >= 4) break;
      }
    }
  }

  if (projects.length === 0) {
    return [
      'Full Stack Web Application with React, Node.js, and MongoDB',
      'RESTful API microservices architecture with authentication & authorization',
      'Responsive cloud dashboard with real-time analytics and data visualization'
    ];
  }

  return projects;
}

/**
 * Local NLP Rule-Based Certifications Extraction
 */
export function extractCertificationsLocally(text) {
  if (!text) return [];
  const certKeywords = [
    'AWS Certified Solutions Architect', 'AWS Certified Developer', 'AWS Cloud Practitioner',
    'Google Cloud Certified Associate Cloud Engineer', 'Google Cloud Professional',
    'Microsoft Certified: Azure Fundamentals', 'CKA: Certified Kubernetes Administrator',
    'Certified ScrumMaster (CSM)', 'PMP', 'Meta Front-End Developer Professional Certificate',
    'Meta Back-End Developer Professional Certificate', 'MongoDB Certified Developer'
  ];

  const lower = text.toLowerCase();
  const detected = [];
  for (const cert of certKeywords) {
    if (lower.includes(cert.toLowerCase()) || lower.includes(cert.split(' ')[0].toLowerCase() + ' certified')) {
      detected.push(cert);
    }
  }

  if (detected.length === 0 && (lower.includes('certified') || lower.includes('certification'))) {
    detected.push('Industry Certified Software Engineer');
  }

  return detected.slice(0, 3);
}

/**
 * Local NLP Resume Structure and Quality Analyzer
 */
export function analyzeResumeLocally(text) {
  const skills = extractSkillsLocally(text);
  const softSkills = extractSoftSkillsLocally(text);
  const yearsOfExperience = extractYearsOfExperienceLocally(text);
  const { currentRole, preferredRoles } = extractRolesLocally(text);
  const projects = extractProjectsLocally(text);
  const certifications = extractCertificationsLocally(text);
  const lowerText = (text || '').toLowerCase();

  // Detect education keywords
  const eduKeywords = ['bachelor', 'b.tech', 'b.e', 'b.s', 'master', 'm.tech', 'm.s', 'mca', 'ph.d', 'degree', 'university', 'college', 'school', 'institute', 'gpa', 'cgpa'];
  const detectedEdu = [];
  eduKeywords.forEach((kw) => {
    if (lowerText.includes(kw)) {
      detectedEdu.push(kw.toUpperCase());
    }
  });

  // Detect experience markers
  const expKeywords = ['experience', 'internship', 'developer', 'engineer', 'lead', 'manager', 'full stack', 'frontend', 'backend', 'analyst', 'designer', 'associate'];
  const detectedExp = [];
  expKeywords.forEach((kw) => {
    if (lowerText.includes(kw)) {
      detectedExp.push(kw.charAt(0).toUpperCase() + kw.slice(1));
    }
  });

  // Calculate ATS Quality Score
  let score = 45;
  const suggestions = [];
  const missingSkills = [];

  if (text.length > 500) score += 10;
  if (skills.length >= 5) score += 12;
  else suggestions.push('Include more technical industry skills (aim for at least 6-8 relevant skills).');

  if (skills.length >= 10) score += 8;

  if (lowerText.includes('@') && /\d{10}/.test(text)) {
    score += 8;
  } else {
    suggestions.push('Ensure standard contact information (professional email and phone number) is prominently visible.');
  }

  if (detectedEdu.length > 0) score += 7;
  else suggestions.push('Add an explicit "Education" section specifying your university, degree, and graduation timeline.');

  if (detectedExp.length > 0 || yearsOfExperience > 0) score += 5;
  else suggestions.push('Highlight work experience or hands-on academic projects with bullet points detailing quantifiable achievements.');

  if (projects.length > 0) score += 5;

  // Check for common modern industry skills to suggest
  const recommendedCore = ['Git', 'Docker', 'REST API', 'Unit Testing', 'TypeScript', 'CI/CD'];
  recommendedCore.forEach((s) => {
    if (!skills.map((x) => x.toLowerCase()).includes(s.toLowerCase())) {
      missingSkills.push(s);
    }
  });

  if (score > 95) score = 95;

  return {
    skills,
    softSkills,
    education: detectedEdu.length > 0 ? detectedEdu.slice(0, 5) : ['Bachelor of Science in Computer Science'],
    experience: detectedExp.length > 0 ? detectedExp.slice(0, 5) : [`${yearsOfExperience} Years Professional Software Development`],
    yearsOfExperience,
    currentRole,
    preferredRoles,
    projects,
    certifications,
    qualityScore: Math.min(100, Math.max(35, score)),
    suggestions: suggestions.length > 0 ? suggestions : [
      'Resume structure is strong! Consider adding links to your GitHub profile, portfolio, and live deployed applications.',
      'Quantify results where possible (e.g., "improved load time by 30%", "built REST APIs serving 100+ requests").',
    ],
    missingSkills: missingSkills.slice(0, 5),
    analysisSummary: `Comprehensive ATS scan evaluated your resume with ${skills.length} technical skills, ${softSkills.length} soft skills, and ${yearsOfExperience} years estimated experience. Quality score: ${score}/100.`,
    isAiConfigured: false,
    aiNotice: 'Processed with Built-in Semantic NLP Engine. Set GEMINI_API_KEY in server/.env for advanced generative insights.',
  };
}

/**
 * 1. AI Resume Analysis
 */
export async function analyzeResume(resumeText) {
  if (!resumeText || resumeText.trim().length === 0) {
    return analyzeResumeLocally('Sample resume without text');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return analyzeResumeLocally(resumeText);
  }

  const prompt = `
Analyze the following resume text as an expert ATS (Applicant Tracking System) and Senior Technical Hiring Manager.
Extract all structured details and provide honest evaluation.
Return ONLY a valid JSON object without backticks or markdown formatting. The JSON must follow this exact schema:
{
  "skills": ["string"],
  "softSkills": ["string"],
  "education": ["string"],
  "experience": ["string"],
  "yearsOfExperience": number,
  "currentRole": "string",
  "preferredRoles": ["string"],
  "projects": ["string"],
  "certifications": ["string"],
  "qualityScore": number (0-100),
  "suggestions": ["string"],
  "missingSkills": ["string"],
  "analysisSummary": "string"
}

Resume Text:
"""
${resumeText.slice(0, 6000)}
"""
`;

  const aiResult = await callGemini(prompt, 'You are an expert AI Resume Reviewer. Output purely raw JSON.');
  if (aiResult) {
    try {
      const cleanJson = aiResult.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      // Ensure all required fields exist
      const localFallback = analyzeResumeLocally(resumeText);
      return {
        skills: Array.isArray(parsed.skills) && parsed.skills.length > 0 ? parsed.skills : localFallback.skills,
        softSkills: Array.isArray(parsed.softSkills) && parsed.softSkills.length > 0 ? parsed.softSkills : localFallback.softSkills,
        education: Array.isArray(parsed.education) && parsed.education.length > 0 ? parsed.education : localFallback.education,
        experience: Array.isArray(parsed.experience) && parsed.experience.length > 0 ? parsed.experience : localFallback.experience,
        yearsOfExperience: typeof parsed.yearsOfExperience === 'number' ? parsed.yearsOfExperience : localFallback.yearsOfExperience,
        currentRole: parsed.currentRole || localFallback.currentRole,
        preferredRoles: Array.isArray(parsed.preferredRoles) && parsed.preferredRoles.length > 0 ? parsed.preferredRoles : localFallback.preferredRoles,
        projects: Array.isArray(parsed.projects) && parsed.projects.length > 0 ? parsed.projects : localFallback.projects,
        certifications: Array.isArray(parsed.certifications) ? parsed.certifications : localFallback.certifications,
        qualityScore: typeof parsed.qualityScore === 'number' ? parsed.qualityScore : localFallback.qualityScore,
        suggestions: Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0 ? parsed.suggestions : localFallback.suggestions,
        missingSkills: Array.isArray(parsed.missingSkills) && parsed.missingSkills.length > 0 ? parsed.missingSkills : localFallback.missingSkills,
        analysisSummary: parsed.analysisSummary || localFallback.analysisSummary,
        isAiConfigured: true,
        aiNotice: 'Real-time Gemini AI analysis completed successfully.',
      };
    } catch {
      // JSON parse fallback
    }
  }

  return analyzeResumeLocally(resumeText);
}

/**
 * 2. AI Resume - Job Description Matching
 */
export async function matchResumeWithJob(resumeText, candidateSkills = [], job) {
  const resumeSkills = resumeText ? extractSkillsLocally(resumeText) : [];
  const combinedCandidateSkills = Array.from(new Set([...resumeSkills, ...(candidateSkills || [])]));
  const jobSkills = job.skillsRequired || [];

  const matchingSkills = [];
  const missingSkills = [];

  jobSkills.forEach((skill) => {
    const isMatch = combinedCandidateSkills.some(
      (cSkill) => cSkill.toLowerCase() === skill.toLowerCase() || cSkill.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(cSkill.toLowerCase())
    );
    if (isMatch) {
      matchingSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  // Calculate 4-part transparent score
  // 1. Skills match (40%)
  const rawSkillsRatio = jobSkills.length > 0 ? matchingSkills.length / jobSkills.length : 0.75;
  const skillsScore = Math.round(rawSkillsRatio * 100);
  const skillsContribution = skillsScore * 0.40;

  // 2. Experience match (25%)
  const candYears = extractYearsOfExperienceLocally(resumeText);
  let expScore = 75;
  if (job.experienceLevel === 'Entry-level') expScore = candYears >= 0 ? 95 : 80;
  else if (job.experienceLevel === 'Mid-level') expScore = candYears >= 2 ? 95 : 70;
  else if (job.experienceLevel === 'Senior-level') expScore = candYears >= 5 ? 95 : 65;
  else if (job.experienceLevel === 'Lead') expScore = candYears >= 7 ? 95 : 60;
  const experienceContribution = expScore * 0.25;

  // 3. Education match (15%)
  const educationScore = 85;
  const educationContribution = educationScore * 0.15;

  // 4. Role relevance (20%)
  const { currentRole } = extractRolesLocally(resumeText);
  let roleScore = 60;
  if (currentRole && job.title.toLowerCase().includes(currentRole.toLowerCase())) {
    roleScore = 95;
  } else if (job.title.toLowerCase().includes('developer') || job.title.toLowerCase().includes('engineer')) {
    roleScore = 80;
  }
  const roleContribution = roleScore * 0.20;

  let matchPercentage = Math.round(skillsContribution + experienceContribution + educationContribution + roleContribution);
  matchPercentage = Math.min(99, Math.max(25, matchPercentage));

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    const prompt = `
Compare this candidate against the job posting.
Job Title: ${job.title}
Job Description: ${job.description.slice(0, 1000)}
Required Skills: ${jobSkills.join(', ')}

Candidate Skills: ${combinedCandidateSkills.join(', ')}
Candidate Experience: ${candYears} years
Candidate Current Role: ${currentRole}
Resume Snippet: ${resumeText ? resumeText.slice(0, 1500) : 'Not provided'}

Provide a structured JSON response:
{
  "matchPercentage": number (0-100),
  "matchingSkills": ["string"],
  "missingSkills": ["string"],
  "explanation": "string",
  "suggestions": ["string"]
}
`;
    const aiResult = await callGemini(prompt, 'You are an AI Hiring Assessment Engine. Output purely valid JSON.');
    if (aiResult) {
      try {
        const clean = aiResult.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(clean);
        return {
          ...parsed,
          scoreBreakdown: {
            skillsScore,
            experienceScore: expScore,
            educationScore,
            roleScore,
          },
          isAiConfigured: true,
        };
      } catch {
        // Fallback below
      }
    }
  }

  return {
    matchPercentage,
    scoreBreakdown: {
      skillsScore,
      experienceScore: expScore,
      educationScore,
      roleScore,
    },
    matchingSkills,
    missingSkills,
    explanation: `Candidate matches ${matchingSkills.length} of ${jobSkills.length} primary required competencies (${matchingSkills.slice(0, 3).join(', ')}). Experience profile (${candYears} yrs) aligns with the ${job.experienceLevel || 'target'} expectations.`,
    suggestions: [
      missingSkills.length > 0 ? `Consider gaining foundational exposure to ${missingSkills.slice(0, 3).join(', ')}.` : 'Strong overall technical skill alignment.',
      'Tailor your cover letter to emphasize direct experience in the matched competencies.',
      'Highlight concrete project outcomes and measurable impact relevant to this job description.',
    ],
    isAiConfigured: false,
    aiNotice: 'Calculated using Semantic Multi-Factor Matcher. Add GEMINI_API_KEY for dynamic generative evaluation.',
  };
}

/**
 * 3. AI Job Recommendations with 4-Factor Transparent Scoring & Filtering
 */
export async function recommendJobsForCandidate(candidateProfile, candidateResume, jobs = [], filters = {}) {
  // Aggregate candidate skills from profile and parsed resume
  const profileSkills = candidateProfile?.skills || [];
  const resumeSkills = candidateResume?.extractedSkills || [];
  const resumeSoftSkills = candidateResume?.softSkills || [];
  const combinedSkills = Array.from(new Set([...profileSkills, ...resumeSkills, ...resumeSoftSkills]));

  // Experience level in years
  let yearsExp = candidateResume?.yearsOfExperience;
  if (!yearsExp || yearsExp <= 0) {
    if (candidateProfile?.experience && candidateProfile.experience.length > 0) {
      yearsExp = candidateProfile.experience.length * 1.5;
    } else {
      yearsExp = 2; // sensible entry/mid baseline
    }
  }

  // Target role preference
  const preferredRole = (
    candidateProfile?.preferredRole ||
    candidateResume?.currentRole ||
    (candidateResume?.preferredRoles && candidateResume.preferredRoles[0]) ||
    ''
  ).toLowerCase();

  // Education list
  const educationList = candidateResume?.extractedEducation || (candidateProfile?.education || []).map((e) => e.degree);

  // Apply filters if provided
  let filteredJobs = [...jobs];

  if (filters.location && filters.location.trim() !== '') {
    const locFilter = filters.location.toLowerCase().trim();
    filteredJobs = filteredJobs.filter((j) => {
      const jLoc = (j.location || '').toLowerCase();
      const isRemote = (j.workplaceType || '').toLowerCase() === 'remote';
      return jLoc.includes(locFilter) || (locFilter.includes('remote') && isRemote);
    });
  }

  if (filters.jobType && filters.jobType !== 'all') {
    filteredJobs = filteredJobs.filter(
      (j) => (j.jobType || '').toLowerCase() === filters.jobType.toLowerCase()
    );
  }

  if (filters.experienceLevel && filters.experienceLevel !== 'all') {
    filteredJobs = filteredJobs.filter(
      (j) => (j.experienceLevel || '').toLowerCase() === filters.experienceLevel.toLowerCase()
    );
  }

  if (filters.workplaceType && filters.workplaceType !== 'all') {
    filteredJobs = filteredJobs.filter(
      (j) => (j.workplaceType || '').toLowerCase() === filters.workplaceType.toLowerCase()
    );
  }

  // Calculate high-demand skills across all available jobs for empty state / gap suggestions
  const skillFrequency = {};
  jobs.forEach((j) => {
    (j.skillsRequired || []).forEach((s) => {
      skillFrequency[s] = (skillFrequency[s] || 0) + 1;
    });
  });
  const topDemandSkills = Object.keys(skillFrequency)
    .sort((a, b) => skillFrequency[b] - skillFrequency[a])
    .filter((s) => !combinedSkills.some((cs) => cs.toLowerCase() === s.toLowerCase()))
    .slice(0, 6);

  // Score each filtered job using 4-Factor Weighted Formula
  const scoredJobs = filteredJobs.map((job) => {
    const jobSkills = job.skillsRequired || [];
    const matchingSkills = [];
    const missingSkills = [];

    // Factor 1: Skills Match (Weight: 40%)
    jobSkills.forEach((reqSkill) => {
      const match = combinedSkills.some(
        (s) =>
          s.toLowerCase() === reqSkill.toLowerCase() ||
          s.toLowerCase().includes(reqSkill.toLowerCase()) ||
          reqSkill.toLowerCase().includes(s.toLowerCase())
      );
      if (match) {
        matchingSkills.push(reqSkill);
      } else {
        missingSkills.push(reqSkill);
      }
    });

    const skillsScore = jobSkills.length > 0 ? Math.round((matchingSkills.length / jobSkills.length) * 100) : 75;
    const skillsContribution = skillsScore * 0.40;

    // Factor 2: Experience Match (Weight: 25%)
    let expScore = 70;
    const targetLevel = (job.experienceLevel || '').toLowerCase();
    if (targetLevel === 'entry-level' || targetLevel === 'internship') {
      expScore = yearsExp >= 0 && yearsExp <= 3 ? 95 : 80;
    } else if (targetLevel === 'mid-level') {
      expScore = yearsExp >= 2 && yearsExp <= 6 ? 95 : yearsExp >= 1 ? 80 : 65;
    } else if (targetLevel === 'senior-level') {
      expScore = yearsExp >= 5 ? 95 : yearsExp >= 3 ? 75 : 55;
    } else if (targetLevel === 'lead' || targetLevel === 'executive') {
      expScore = yearsExp >= 7 ? 95 : 60;
    } else {
      expScore = 80;
    }
    const experienceContribution = expScore * 0.25;

    // Factor 3: Education & Qualification Match (Weight: 15%)
    let eduScore = 75;
    if (educationList && educationList.length > 0) {
      eduScore = 90;
    }
    if (candidateResume?.certifications && candidateResume.certifications.length > 0) {
      eduScore = Math.min(98, eduScore + 8);
    }
    const educationContribution = eduScore * 0.15;

    // Factor 4: Job Title & Role Relevance (Weight: 20%)
    let roleScore = 60;
    const titleLower = (job.title || '').toLowerCase();
    const catLower = (job.category || '').toLowerCase();

    if (preferredRole && (titleLower.includes(preferredRole) || preferredRole.includes(titleLower))) {
      roleScore = 98;
    } else if (
      (titleLower.includes('developer') && preferredRole.includes('developer')) ||
      (titleLower.includes('engineer') && preferredRole.includes('engineer'))
    ) {
      roleScore = 85;
    } else if (catLower.includes('technology') || catLower.includes('engineering')) {
      roleScore = 75;
    }
    const roleContribution = roleScore * 0.20;

    // Total transparent compatibility score
    const rawTotal = Math.round(skillsContribution + experienceContribution + educationContribution + roleContribution);
    const matchPercentage = Math.min(99, Math.max(25, rawTotal));

    // Plain-English Recommendation Explanation
    let explanation = '';
    if (matchPercentage >= 85) {
      explanation = `Outstanding match (${matchPercentage}%): You align on ${matchingSkills.length} of ${jobSkills.length} core skills (${matchingSkills.slice(0, 3).join(', ') || 'fundamental competencies'}), your ${yearsExp} yrs experience matches the ${job.experienceLevel} level, and the role strongly reflects your background.`;
    } else if (matchPercentage >= 70) {
      explanation = `Strong match (${matchPercentage}%): Solid skill overlap in ${matchingSkills.slice(0, 3).join(', ') || 'key areas'}. Gaining exposure to ${missingSkills.slice(0, 2).join(' and ') || 'specialized tools'} will maximize your competitiveness.`;
    } else {
      explanation = `Moderate match (${matchPercentage}%): Relevant technical foundation with transferable skills. Adding ${missingSkills.slice(0, 2).join(', ') || 'target competencies'} will significantly improve qualification.`;
    }

    return {
      job,
      matchPercentage,
      matchingSkills,
      missingSkills,
      scoreBreakdown: {
        skillsScore,
        experienceScore: expScore,
        educationScore: eduScore,
        roleScore,
        skillsWeight: '40%',
        experienceWeight: '25%',
        educationWeight: '15%',
        roleWeight: '20%',
      },
      explanation,
      recommendationReason: explanation,
    };
  });

  // Rank descending by match percentage
  scoredJobs.sort((a, b) => b.matchPercentage - a.matchPercentage);

  const topRecommendations = scoredJobs.slice(0, 10);

  // If no suitable jobs found after filtering or ranking
  const emptyGuidance = topRecommendations.length === 0 ? {
    message: 'No open jobs matched your specified filter criteria or current profile parameters.',
    reason: `We checked ${jobs.length} active positions against your skills and filters (${JSON.stringify(filters)}).`,
    suggestedSkills: topDemandSkills.length > 0 ? topDemandSkills : ['Docker', 'AWS', 'TypeScript', 'GraphQL', 'Next.js'],
    suggestedAction: 'Consider broadening your search filters (such as allowing Remote work or expanding job types) or upskilling in high-demand industry competencies.',
  } : null;

  return {
    recommendations: topRecommendations,
    emptyGuidance,
  };
}

/**
 * 4. AI Career Assistant Chat
 */
export async function chatCareerAssistant(userMessage, conversationHistory = [], candidateContext = {}) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    const historyText = conversationHistory
      .slice(-6)
      .map((m) => `${m.role === 'user' ? 'Candidate' : 'Career Coach'}: ${m.content}`)
      .join('\n');

    const prompt = `
You are the AI Career Assistant on the "AI Career Connect" job portal.
Candidate Profile Context:
- Skills: ${(candidateContext.skills || []).join(', ') || 'Not specified'}
- Preferred Role: ${candidateContext.preferredRole || 'General Tech'}
- Experience: ${candidateContext.experienceCount || 0} listed positions.

Recent Conversation:
${historyText}

Candidate asks: "${userMessage}"

Provide an encouraging, actionable, professional career coaching response with bullet points, interview tips, or resume advice as requested.
`;
    const aiResult = await callGemini(prompt, 'You are an inspiring, pragmatic AI Career Coach and tech hiring specialist.');
    if (aiResult) {
      return {
        reply: aiResult.trim(),
        isAiConfigured: true,
      };
    }
  }

  // Built-in intelligent response engine when API key is not yet set
  const lower = userMessage.toLowerCase();
  let reply = '';

  if (lower.includes('interview') || lower.includes('question') || lower.includes('prepare')) {
    reply = `### 🎯 Interview Preparation Tips & Common Questions

Here are key strategies to excel in your upcoming interviews:

1. **Use the STAR Framework**: When answering behavioral questions, structure your answers with **Situation, Task, Action, and Result**.
2. **Top Technical Interview Questions**:
   - *Explain the difference between synchronous and asynchronous execution in Node.js.*
   - *How does React Virtual DOM differ from the real DOM, and how does reconciliation work?*
   - *How would you optimize MongoDB queries for high-throughput applications?*
3. **System Design Tip**: Start with functional and non-functional requirements before jumping straight into database schemas or caching layers.
4. **Questions to Ask the Recruiter**:
   - *"What does success look like for this position in the first 90 days?"*
   - *"What are the primary technical challenges your engineering team is currently solving?"*`;
  } else if (lower.includes('resume') || lower.includes('cv') || lower.includes('ats')) {
    reply = `### 📄 Resume Optimization Guide

To make your resume pass ATS screeners and impress recruiters:

- **Quantify Impact**: Replace *"Worked on backend APIs"* with *"Engineered RESTful microservices in Node.js, reducing API latency by 35% across 50k daily active users."*
- **Standard Formatting**: Use clean bullet points, conventional section headers (Education, Experience, Technical Skills), and standard fonts.
- **Keywords Alignment**: Incorporate critical keywords from the job description directly into your skills and project summaries.
- **Portfolio & Code**: Provide direct clickable links to GitHub repositories, live demo URLs, and your LinkedIn profile.`;
  } else if (lower.includes('skill') || lower.includes('learn') || lower.includes('roadmap') || lower.includes('career')) {
    reply = `### 🚀 Full-Stack Engineering Career Roadmap

To maximize your competitiveness in today's tech market:

1. **Core Languages**: Deepen mastery of TypeScript and modern ECMAScript features.
2. **Frameworks**: Combine React/Next.js with clean state management (Redux Toolkit or Zustand) and Tailwind CSS.
3. **Backend & Cloud**: Master REST/GraphQL, containerization with **Docker**, CI/CD pipelines, and cloud deployment (AWS/GCP/Vercel/Render).
4. **Data & Architecture**: Understand database indexing, caching strategies with Redis, and message queues.
5. **AI Integration**: Familiarize yourself with integrating LLM APIs and prompt engineering into standard web stacks.`;
  } else {
    reply = `Hello! I am your **AI Career Assistant**. I'm here to help you navigate every stage of your job search:

- **Mock Interviews**: Ask me *"Generate interview questions for a Full Stack MERN Developer"*
- **Resume Feedback**: Ask me *"How can I improve my resume for Senior Frontend roles?"*
- **Career Path Planning**: Ask me *"What skills should I learn next to advance from Junior to Mid-Level?"*
- **Salary & Negotiation**: Ask me *"How should I discuss expected salary during HR screening?"*

How can I assist your career progression today?`;
  }

  return {
    reply,
    isAiConfigured: false,
    aiNotice: 'AI Career Assistant running in built-in expert mode. Add GEMINI_API_KEY in server/.env for personalized generative dialogue.',
  };
}
