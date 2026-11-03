import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import User from '../models/User.js';
import CandidateProfile from '../models/CandidateProfile.js';
import RecruiterProfile from '../models/RecruiterProfile.js';
import Company from '../models/Company.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import SavedJob from '../models/SavedJob.js';
import Notification from '../models/Notification.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_career_connect');
    console.log('[Seeder] Connected to MongoDB database...');

    // Clear existing collections
    await User.deleteMany();
    await CandidateProfile.deleteMany();
    await RecruiterProfile.deleteMany();
    await Company.deleteMany();
    await Job.deleteMany();
    await Application.deleteMany();
    await SavedJob.deleteMany();
    await Notification.deleteMany();

    console.log('[Seeder] Cleared previous database records.');

    // 1. Create Admin
    const adminUser = await User.create({
      name: 'System Administrator',
      email: process.env.ADMIN_EMAIL || 'admin@aicareerconnect.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      role: 'admin',
      phone: '+1 800-555-0199',
    });

    // 2. Create Recruiters
    const recruiter1 = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@techcorp.io',
      password: 'Password@123',
      role: 'recruiter',
      phone: '+1 415-555-0142',
    });

    const recruiter2 = await User.create({
      name: 'Marcus Vance',
      email: 'marcus.vance@cloudscale.net',
      password: 'Password@123',
      role: 'recruiter',
      phone: '+1 212-555-0198',
    });

    // 3. Create Companies
    const company1 = await Company.create({
      name: 'TechCorp Solutions',
      slug: 'techcorp-solutions',
      logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=128&h=128&fit=crop&crop=faces',
      website: 'https://techcorp.io',
      industry: 'Software & Technology',
      companySize: '51-200',
      location: 'San Francisco, CA (Hybrid)',
      description: 'TechCorp Solutions builds next-generation cloud productivity and collaboration enterprise tools powered by modern AI.',
      foundedYear: 2018,
      verified: true,
      createdBy: recruiter1._id,
    });

    const company2 = await Company.create({
      name: 'CloudScale AI',
      slug: 'cloudscale-ai',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop',
      website: 'https://cloudscale.net',
      industry: 'Artificial Intelligence & Cloud',
      companySize: '201-500',
      location: 'New York, NY (Remote)',
      description: 'CloudScale AI is democratizing enterprise machine learning infrastructure and distributed backend microservices.',
      foundedYear: 2020,
      verified: true,
      createdBy: recruiter2._id,
    });

    const company3 = await Company.create({
      name: 'Apex FinTech',
      slug: 'apex-fintech',
      logo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=128&h=128&fit=crop',
      website: 'https://apexfintech.com',
      industry: 'Financial Technology',
      companySize: '501-1000',
      location: 'Austin, TX',
      description: 'Pioneering ultra-secure global payment gateways and automated algorithmic settlement networks.',
      foundedYear: 2015,
      verified: true,
      createdBy: recruiter1._id,
    });

    // Create Recruiter Profiles
    await RecruiterProfile.create({
      user: recruiter1._id,
      company: company1._id,
      designation: 'Head of Talent Acquisition',
      department: 'People Operations',
      phone: '+1 415-555-0142',
      linkedin: 'https://linkedin.com/in/sarahjenkins-recruiter',
    });

    await RecruiterProfile.create({
      user: recruiter2._id,
      company: company2._id,
      designation: 'Senior Technical Recruiter',
      department: 'Engineering HR',
      phone: '+1 212-555-0198',
      linkedin: 'https://linkedin.com/in/marcusvance-tech',
    });

    // 4. Create Candidates
    const candidateUser1 = await User.create({
      name: 'Alex Rivera',
      email: 'alex.rivera@example.com',
      password: 'Password@123',
      role: 'jobseeker',
      phone: '+1 408-555-0123',
    });

    const candidateUser2 = await User.create({
      name: 'Emily Chen',
      email: 'emily.chen@example.com',
      password: 'Password@123',
      role: 'jobseeker',
      phone: '+1 650-555-0187',
    });

    // Create Candidate Profiles
    const candidateProfile1 = await CandidateProfile.create({
      user: candidateUser1._id,
      headline: 'Full Stack MERN Developer | React, Node.js & Cloud Architecture',
      bio: 'Enthusiastic full stack developer with 3+ years experience engineering responsive SPAs and scalable REST microservices.',
      location: 'San Jose, CA',
      skills: ['React', 'JavaScript', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS', 'Git', 'REST API', 'Docker'],
      education: [
        {
          institution: 'San Jose State University',
          degree: 'Bachelor of Science in Computer Science',
          fieldOfStudy: 'Software Engineering',
          startYear: 2018,
          endYear: 2022,
          grade: '3.8 GPA',
        },
      ],
      experience: [
        {
          company: 'Nexus Software Labs',
          title: 'Junior Full Stack Engineer',
          location: 'San Francisco, CA',
          startDate: new Date('2022-07-01'),
          endDate: new Date('2024-05-30'),
          current: false,
          description: 'Developed scalable React user interfaces and optimized Express API endpoints, enhancing throughput by 25%.',
        },
      ],
      expectedSalary: { min: 90000, max: 130000, currency: 'USD' },
      preferredRole: 'Full Stack Developer',
      resumeUrl: '/uploads/resumes/sample-alex-rivera-resume.pdf',
      resumeName: 'Alex_Rivera_Resume_2026.pdf',
      github: 'https://github.com/alexrivera-dev',
      linkedin: 'https://linkedin.com/in/alexrivera-dev',
      portfolio: 'https://alexrivera.dev',
      profileCompletedPercentage: 90,
    });

    await CandidateProfile.create({
      user: candidateUser2._id,
      headline: 'Frontend Engineer & UI/UX Specialist | React, Next.js & Tailwind',
      bio: 'Design-minded frontend engineer specializing in accessible, responsive, and performant web applications.',
      location: 'San Francisco, CA',
      skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Redux', 'HTML5', 'CSS3', 'Jest', 'Figma'],
      education: [
        {
          institution: 'University of California, Berkeley',
          degree: 'B.S. Electrical Engineering & Computer Sciences',
          fieldOfStudy: 'Human-Computer Interaction',
          startYear: 2019,
          endYear: 2023,
          grade: '3.9 GPA',
        },
      ],
      experience: [
        {
          company: 'PixelCraft Digital',
          title: 'Frontend Developer',
          location: 'Remote',
          startDate: new Date('2023-08-01'),
          current: true,
          description: 'Architected design systems and UI component libraries used by over 500k monthly active users.',
        },
      ],
      expectedSalary: { min: 95000, max: 140000, currency: 'USD' },
      preferredRole: 'Frontend Engineer',
      resumeUrl: '/uploads/resumes/sample-emily-chen-resume.pdf',
      resumeName: 'Emily_Chen_Frontend_Resume.pdf',
      github: 'https://github.com/emilychen-ui',
      linkedin: 'https://linkedin.com/in/emilychen-design',
      portfolio: 'https://emilychen.design',
      profileCompletedPercentage: 85,
    });

    // 5. Create Jobs
    const job1 = await Job.create({
      title: 'Senior Full Stack MERN Developer',
      slug: 'senior-full-stack-mern-developer-tc01',
      company: company1._id,
      recruiter: recruiter1._id,
      description: 'We are seeking an experienced Full Stack Developer to lead development on our core enterprise web platform. You will build highly responsive React user interfaces, engineer robust Node.js/Express backend services, and manage MongoDB database architectures.',
      requirements: [
        '3+ years of hands-on production experience with React and Node.js.',
        'Strong proficiency in MongoDB data modeling, aggregation pipelines, and indexing.',
        'Deep understanding of RESTful API design, JWT authentication, and secure web practices.',
        'Experience with state management libraries, Tailwind CSS, and Git workflows.',
      ],
      responsibilities: [
        'Architect and implement scalable full-stack web applications and microservices.',
        'Collaborate with UI/UX designers and product managers to deliver polished user experiences.',
        'Conduct code reviews, mentor junior developers, and drive software quality.',
      ],
      skillsRequired: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'Tailwind CSS', 'REST API'],
      jobType: 'Full-time',
      workplaceType: 'Hybrid',
      experienceLevel: 'Senior-level',
      salary: { min: 120000, max: 160000, currency: 'USD', isNegotiable: true },
      location: 'San Francisco, CA',
      industry: 'Software & Technology',
      vacancies: 2,
      status: 'active',
      approvalStatus: 'approved',
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      applicationsCount: 1,
    });

    const job2 = await Job.create({
      title: 'AI Solutions Engineer',
      slug: 'ai-solutions-engineer-cs02',
      company: company2._id,
      recruiter: recruiter2._id,
      description: 'Join CloudScale AI to bridge the gap between bleeding-edge machine learning models and mission-critical production systems. You will build automated LLM orchestration pipelines, vector search integrations, and developer APIs.',
      requirements: [
        'Proficiency in Python and JavaScript/TypeScript.',
        'Experience integrating Generative AI APIs (Gemini, OpenAI, Anthropic).',
        'Familiarity with containerization (Docker) and cloud deployments.',
        'Understanding of RAG architectures and vector embeddings.',
      ],
      responsibilities: [
        'Develop AI microservices and integrate LLM agents into customer workflows.',
        'Optimize model prompt engineering and automated evaluation metrics.',
        'Build developer-friendly SDKs and interactive API documentation.',
      ],
      skillsRequired: ['Python', 'TypeScript', 'Node.js', 'Artificial Intelligence', 'Docker', 'REST API', 'Machine Learning'],
      jobType: 'Full-time',
      workplaceType: 'Remote',
      experienceLevel: 'Mid-level',
      salary: { min: 130000, max: 175000, currency: 'USD', isNegotiable: false },
      location: 'New York, NY',
      industry: 'Artificial Intelligence & Cloud',
      vacancies: 3,
      status: 'active',
      approvalStatus: 'approved',
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      applicationsCount: 0,
    });

    const job3 = await Job.create({
      title: 'Frontend React & UI Engineer',
      slug: 'frontend-react-ui-engineer-af03',
      company: company3._id,
      recruiter: recruiter1._id,
      description: 'Apex FinTech is hiring a passionate Frontend Engineer to craft smooth, responsive, real-time trading dashboards and payment analytics tools.',
      requirements: [
        '2+ years of front-end experience using React, Vite, and Tailwind CSS.',
        'Strong grasp of state management, CSS layouts, and web accessibility standards.',
        'Comfortable with data visualization libraries (Recharts, Chart.js).',
      ],
      responsibilities: [
        'Build interactive financial dashboards with live WebSocket data streams.',
        'Ensure pixel-perfect fidelity across mobile and desktop devices.',
      ],
      skillsRequired: ['React', 'TypeScript', 'Tailwind CSS', 'Redux', 'HTML5', 'CSS3'],
      jobType: 'Full-time',
      workplaceType: 'On-site',
      experienceLevel: 'Mid-level',
      salary: { min: 105000, max: 140000, currency: 'USD', isNegotiable: true },
      location: 'Austin, TX',
      industry: 'Financial Technology',
      vacancies: 1,
      status: 'active',
      approvalStatus: 'approved',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      applicationsCount: 1,
    });

    const job4 = await Job.create({
      title: 'DevOps & Cloud Infrastructure Engineer',
      slug: 'devops-cloud-infrastructure-engineer-cs04',
      company: company2._id,
      recruiter: recruiter2._id,
      description: 'Design, automate, and scale resilient cloud platforms powering millions of daily requests across multicloud regions.',
      requirements: [
        'Experience with Docker, Kubernetes, and CI/CD pipelines (GitHub Actions).',
        'Strong understanding of AWS or Google Cloud infrastructure as code.',
      ],
      responsibilities: [
        'Maintain zero-downtime deployment pipelines.',
        'Monitor platform observability, latency, and security hardening.',
      ],
      skillsRequired: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux', 'Git'],
      jobType: 'Full-time',
      workplaceType: 'Remote',
      experienceLevel: 'Senior-level',
      salary: { min: 140000, max: 185000, currency: 'USD', isNegotiable: true },
      location: 'Remote',
      industry: 'Artificial Intelligence & Cloud',
      vacancies: 1,
      status: 'active',
      approvalStatus: 'approved',
      deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
      applicationsCount: 0,
    });

    // 6. Create Applications
    await Application.create({
      job: job1._id,
      candidate: candidateUser1._id,
      recruiter: recruiter1._id,
      company: company1._id,
      resumeUrl: candidateProfile1.resumeUrl,
      resumeName: candidateProfile1.resumeName,
      coverLetter: 'I am thrilled to apply for the Senior Full Stack MERN position at TechCorp Solutions. With my deep background in React, Express, and MongoDB, I am eager to contribute immediately to your production engineering goals.',
      status: 'Shortlisted',
      aiMatchScore: 92,
      aiFeedback: 'Candidate possesses comprehensive React, Node.js, Express, and MongoDB skills matching all job requirements.',
      history: [
        { status: 'Applied', changedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), remarks: 'Applied online.' },
        { status: 'Under Review', changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), remarks: 'Initial review completed by hiring manager.' },
        { status: 'Shortlisted', changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), remarks: 'Candidate shortlisted for technical round.' },
      ],
    });

    await Application.create({
      job: job3._id,
      candidate: candidateUser2._id,
      recruiter: recruiter1._id,
      company: company3._id,
      resumeUrl: '/uploads/resumes/sample-emily-chen-resume.pdf',
      resumeName: 'Emily_Chen_Frontend_Resume.pdf',
      coverLetter: 'Excited to bring my modern UI engineering and Tailwind CSS design expertise to Apex FinTech.',
      status: 'Interview',
      aiMatchScore: 95,
      aiFeedback: 'Exceptional match for React and UI design specifications.',
      history: [
        { status: 'Applied', changedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), remarks: 'Application submitted.' },
        { status: 'Shortlisted', changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), remarks: 'Shortlisted based on strong portfolio.' },
        { status: 'Interview', changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), remarks: 'Technical interview scheduled.' },
      ],
    });

    // 7. Create Saved Jobs
    await SavedJob.create({
      user: candidateUser1._id,
      job: job2._id,
    });

    // 8. Create Notifications
    await Notification.create({
      recipient: candidateUser1._id,
      sender: recruiter1._id,
      type: 'application_status',
      title: 'Application Shortlisted!',
      message: 'Great news! Your application for Senior Full Stack MERN Developer has been Shortlisted.',
      link: '/candidate/applications',
    });

    await Notification.create({
      recipient: recruiter1._id,
      sender: candidateUser1._id,
      type: 'new_application',
      title: 'New Candidate Applied',
      message: 'Alex Rivera applied for Senior Full Stack MERN Developer. Match: 92%',
      link: `/recruiter/applicants?job=${job1._id}`,
    });

    console.log('[Seeder] =========================================');
    console.log('[Seeder] DATABASE SEEDED SUCCESSFULLY!');
    console.log('[Seeder] Demo Credentials:');
    console.log('[Seeder] Admin:      admin@aicareerconnect.com / Admin@123456');
    console.log('[Seeder] Recruiter:  sarah.jenkins@techcorp.io / Password@123');
    console.log('[Seeder] Candidate:  alex.rivera@example.com   / Password@123');
    console.log('[Seeder] Candidate:  emily.chen@example.com     / Password@123');
    console.log('[Seeder] =========================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder] Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
