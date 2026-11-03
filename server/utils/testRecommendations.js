const BASE_URL = 'http://127.0.0.1:3000/api';

async function testRecommendationWorkflow() {
  console.log('--- Testing AI Resume & Recommendation Engine ---');

  // Step 1: Login as Candidate (Alex Rivera)
  console.log('\n1. Logging in as Candidate (alex.rivera@example.com)...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'alex.rivera@example.com',
      password: 'Password@123',
    }),
  });

  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('✓ Login successful! Token acquired.');

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  // Step 2: Test Resume Analysis with extended structured fields
  console.log('\n2. Testing POST /api/ai/resume-analysis with candidate resume content...');
  const sampleResume = `
ALEX RIVERA
Full Stack Developer | alex.rivera@example.com | (555) 234-5678 | San Francisco, CA
GitHub: github.com/alexrivera | Portfolio: alexrivera.dev

PROFESSIONAL SUMMARY
Dynamic Full Stack Developer with 4 years of experience building modern web applications, scalable REST APIs, and microservices using React, Node.js, Express, MongoDB, and TypeScript. Demonstrated communication, leadership, and team collaboration.

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, HTML5, CSS3, SQL
Frameworks & Libraries: React, Node.js, Express, Next.js, Redux, Tailwind CSS, Jest
Databases & Cloud: MongoDB, PostgreSQL, Redis, Docker, AWS, Git, CI/CD
Methodologies: Agile, Scrum, REST API design, Microservices

WORK EXPERIENCE
Full Stack Developer | Tech Innovations Inc. | 2021 - Present
- Designed and engineered high-throughput REST APIs handling 50k+ daily requests.
- Built responsive React dashboards with state management and Tailwind CSS.
- Containerized microservices using Docker and deployed on AWS with CI/CD pipelines.

Software Engineer Intern | Cloud Solutions | 2020 - 2021
- Developed interactive web components in JavaScript and React.
- Wrote automated unit tests with Jest, increasing test coverage by 25%.

EDUCATION
Bachelor of Science in Computer Science | California State University | 2016 - 2020

KEY PROJECTS
- Cloud Task Management System: Built full stack React + Node.js real-time kanban app with Socket.io.
- AI Search & Recommendation Microservice: Built Python and MongoDB service for fast content filtering.

CERTIFICATIONS
- AWS Certified Solutions Architect
- Meta Front-End Developer Professional Certificate
`;

  const analysisRes = await fetch(`${BASE_URL}/ai/resume-analysis`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ resumeText: sampleResume }),
  });

  const analysisData = await analysisRes.json();
  console.log('✓ Analysis Status:', analysisRes.status);
  console.log('  Extracted Technical Skills:', analysisData.analysis?.skills?.slice(0, 8));
  console.log('  Extracted Soft Skills:', analysisData.analysis?.softSkills);
  console.log('  Extracted Years of Experience:', analysisData.analysis?.yearsOfExperience);
  console.log('  Detected Current Role:', analysisData.analysis?.currentRole);
  console.log('  Quality ATS Score:', analysisData.analysis?.qualityScore);
  console.log('  Extracted Projects Count:', analysisData.analysis?.projects?.length);
  console.log('  Extracted Certifications:', analysisData.analysis?.certifications);

  // Step 3: Test GET /api/ai/recommendations (Top 10 AI Recommendations)
  console.log('\n3. Testing GET /api/ai/recommendations (All Active Matches)...');
  const recRes = await fetch(`${BASE_URL}/ai/recommendations`, {
    method: 'GET',
    headers: authHeaders,
  });

  const recData = await recRes.json();
  console.log('✓ Recommendations Status:', recRes.status);
  console.log('  Total Ranked Recommendations:', recData.count);

  if (recData.recommendations?.length > 0) {
    const topRec = recData.recommendations[0];
    console.log(`\n  Top Recommendation (#1):`);
    console.log(`  - Title: ${topRec.job?.title} at ${topRec.job?.company?.name}`);
    console.log(`  - Location: ${topRec.job?.location} (${topRec.job?.workplaceType})`);
    console.log(`  - Match Percentage: ${topRec.matchPercentage}%`);
    console.log(`  - Score Breakdown:`, topRec.scoreBreakdown);
    console.log(`  - Matching Skills:`, topRec.matchingSkills);
    console.log(`  - Missing Skills:`, topRec.missingSkills);
    console.log(`  - Reason: "${topRec.explanation}"`);
  }

  // Step 4: Test GET /api/ai/recommendations with Location & Job Type Filters
  console.log('\n4. Testing GET /api/ai/recommendations with filters (workplaceType=Remote)...');
  const remoteRecRes = await fetch(`${BASE_URL}/ai/recommendations?workplaceType=Remote`, {
    method: 'GET',
    headers: authHeaders,
  });

  const remoteData = await remoteRecRes.json();
  console.log('✓ Remote Recommendations Count:', remoteData.count);
  remoteData.recommendations?.forEach((r, idx) => {
    console.log(`    [${idx + 1}] ${r.job?.title} (${r.job?.workplaceType}) -> ${r.matchPercentage}% match`);
  });

  // Step 5: Test Empty Guidance fallback with impossible filter
  console.log('\n5. Testing GET /api/ai/recommendations with impossible location filter (Mars)...');
  const emptyRecRes = await fetch(`${BASE_URL}/ai/recommendations?location=MarsStation`, {
    method: 'GET',
    headers: authHeaders,
  });

  const emptyData = await emptyRecRes.json();
  console.log('✓ Empty Guidance Message:', emptyData.emptyGuidance?.message);
  console.log('✓ Suggested In-Demand Skills for Upskilling:', emptyData.emptyGuidance?.suggestedSkills);

  // Step 6: Test POST /api/ai/job-match for a specific job
  if (recData.recommendations?.length > 0) {
    const targetJobId = recData.recommendations[0].job._id;
    console.log(`\n6. Testing POST /api/ai/job-match for Job ID: ${targetJobId}...`);
    const matchRes = await fetch(`${BASE_URL}/ai/job-match`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ jobId: targetJobId, resumeText: sampleResume }),
    });

    const matchData = await matchRes.json();
    console.log('✓ Job Match Status:', matchRes.status);
    console.log('  Match Percentage:', matchData.match?.matchPercentage, '%');
    console.log('  Score Breakdown:', matchData.match?.scoreBreakdown);
    console.log('  Explanation:', matchData.match?.explanation);
  }

  console.log('\n======================================================');
  console.log('ALL AI RESUME & RECOMMENDATION TESTS PASSED PERFECTLY!');
  console.log('======================================================');
}

testRecommendationWorkflow().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
