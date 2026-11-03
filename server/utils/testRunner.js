import assert from 'assert';

const BASE_URL = 'http://127.0.0.1:3000/api';

async function runTests() {
  console.log('==================================================');
  console.log('  AI CAREER CONNECT - AUTOMATED END-TO-END SUITE  ');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    process.stdout.write(`• Testing: ${name}... `);
    try {
      await fn();
      console.log('✅ PASSED');
      passed++;
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`);
      failed++;
    }
  }

  // 1. Health check
  await test('Server Health Check', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
  });

  // 2. Candidate Login
  let candidateToken = '';
  let candidateId = '';
  await test('Candidate Login (Alex Rivera)', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alex.rivera@example.com', password: 'Password@123' }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.token);
    assert.strictEqual(data.user.role, 'jobseeker');
    candidateToken = data.token;
    candidateId = data.user._id;
  });

  // 3. Recruiter Login
  let recruiterToken = '';
  await test('Recruiter Login (Sarah Jenkins)', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'sarah.jenkins@techcorp.io', password: 'Password@123' }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.token);
    assert.strictEqual(data.user.role, 'recruiter');
    recruiterToken = data.token;
  });

  // 4. Admin Login
  let adminToken = '';
  await test('Admin Login (System Administrator)', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@aicareerconnect.com', password: 'Admin@123456' }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.token);
    assert.strictEqual(data.user.role, 'admin');
    adminToken = data.token;
  });

  // 5. User Registration (New Job Seeker)
  const testCandidateEmail = `test.candidate.${Date.now()}@example.com`;
  await test('Register New Job Seeker', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jordan Miller',
        email: testCandidateEmail,
        password: 'Password@123',
        confirmPassword: 'Password@123',
        role: 'jobseeker',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.user.role, 'jobseeker');
  });

  // 6. User Registration Security: Block registering as Admin
  await test('Block Registration with Admin Role', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Hacker Admin',
        email: `hacker.${Date.now()}@example.com`,
        password: 'Password@123',
        role: 'admin',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 403);
    assert.strictEqual(data.success, false);
  });

  // 7. Job Search & Filtering
  let firstJobId = '';
  await test('Fetch Jobs with Search and Filters', async () => {
    const res = await fetch(`${BASE_URL}/jobs?search=MERN&jobType=Full-time`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.jobs.length > 0);
    firstJobId = data.jobs[0]._id;
  });

  // 8. Recruiter Creates a New Job
  let newlyCreatedJobId = '';
  await test('Recruiter Posts a New Job', async () => {
    const res = await fetch(`${BASE_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        title: 'Lead React Native Architect',
        jobType: 'Full-time',
        workplaceType: 'Remote',
        experienceLevel: 'Senior-level',
        location: 'Remote, US',
        industry: 'Software & Technology',
        salaryMin: 135000,
        salaryMax: 175000,
        skillsRequired: ['React Native', 'TypeScript', 'Redux', 'iOS', 'Android'],
        description: 'Leading mobile architecture for next-generation collaboration apps.',
        requirements: ['5+ years mobile development experience.'],
        responsibilities: ['Architect cross-platform mobile apps.'],
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    assert.ok(data.job._id);
    newlyCreatedJobId = data.job._id;
  });

  // 9. Candidate Applies for Job
  let newApplicationId = '';
  await test('Candidate Applies for Position', async () => {
    const res = await fetch(`${BASE_URL}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
      },
      body: JSON.stringify({
        jobId: newlyCreatedJobId,
        resumeUrl: '/uploads/resumes/sample-alex-rivera-resume.pdf',
        resumeName: 'Alex_Rivera_Resume.pdf',
        coverLetter: 'Thrilled to apply for this exciting React Native position!',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    assert.ok(data.application._id);
    assert.strictEqual(data.application.status, 'Applied');
    newApplicationId = data.application._id;
  });

  // 10. Prevent Duplicate Applications
  await test('Prevent Duplicate Application Submission', async () => {
    const res = await fetch(`${BASE_URL}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
      },
      body: JSON.stringify({
        jobId: newlyCreatedJobId,
        resumeUrl: '/uploads/resumes/sample-alex-rivera-resume.pdf',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
    assert.match(data.message, /already submitted an application/i);
  });

  // 11. Recruiter Updates Application Status
  await test('Recruiter Shortlists Candidate', async () => {
    const res = await fetch(`${BASE_URL}/applications/${newApplicationId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        status: 'Shortlisted',
        remarks: 'Candidate portfolio and skills aligned well with requirements.',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.application.status, 'Shortlisted');
  });

  // 12. Save / Bookmark Job
  await test('Candidate Bookmarks a Job', async () => {
    const res = await fetch(`${BASE_URL}/saved-jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
      },
      body: JSON.stringify({ jobId: newlyCreatedJobId }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
  });

  // 13. AI Resume Analysis
  await test('AI Resume Analysis Endpoint', async () => {
    const sampleResume = `
      Alex Rivera - Full Stack Developer
      Email: alex@example.com | Phone: 408-555-0123
      San Jose, CA

      TECHNICAL SKILLS:
      React, Node.js, Express, MongoDB, JavaScript, TypeScript, Tailwind CSS, Git, Docker, REST API

      EDUCATION:
      B.S. Computer Science, San Jose State University, 2022

      EXPERIENCE:
      Full Stack Software Engineer at Nexus Labs (2022-2024)
      - Engineered high-throughput REST APIs using Express and MongoDB.
      - Developed scalable React interfaces reducing frontend render times by 30%.
    `;

    const res = await fetch(`${BASE_URL}/ai/resume-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
      },
      body: JSON.stringify({ resumeText: sampleResume }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.analysis.qualityScore > 0);
    assert.ok(data.analysis.skills.length >= 5);
  });

  // 14. AI Job Matching
  await test('AI Resume-Job Compatibility Matching', async () => {
    const res = await fetch(`${BASE_URL}/ai/job-match`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
      },
      body: JSON.stringify({
        jobId: newlyCreatedJobId,
        candidateSkills: ['React Native', 'TypeScript', 'Redux', 'Node.js'],
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.match.matchPercentage >= 50);
    assert.ok(data.match.matchingSkills.length > 0);
  });

  // 15. AI Career Assistant Chat
  await test('AI Career Assistant Coaching Query', async () => {
    const res = await fetch(`${BASE_URL}/ai/career-assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Give me 3 top technical interview questions for a Senior React developer',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.reply.length > 50);
  });

  // 16. Recruiter Dashboard & Analytics
  await test('Recruiter Dashboard Analytics', async () => {
    const res = await fetch(`${BASE_URL}/recruiters/dashboard`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.stats.totalJobs > 0);
  });

  // 17. Admin Dashboard Overview
  await test('Admin Dashboard Statistics', async () => {
    const res = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.stats.totalUsers >= 4);
    assert.ok(data.stats.totalJobs >= 4);
  });

  // 18. Admin Job Approval
  await test('Admin Moderates Job Approval', async () => {
    const res = await fetch(`${BASE_URL}/admin/jobs/${newlyCreatedJobId}/approval`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ approvalStatus: 'approved' }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.job.approvalStatus, 'approved');
  });

  console.log('\n==================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('==================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

