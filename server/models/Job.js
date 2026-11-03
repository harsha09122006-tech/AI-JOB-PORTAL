import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide job title'],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Job must belong to a company'],
      index: true,
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Job must have a recruiter owner'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide job description'],
    },
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    responsibilities: [
      {
        type: String,
        trim: true,
      },
    ],
    skillsRequired: [
      {
        type: String,
        trim: true,
        index: true,
      },
    ],
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Internship', 'Contract'],
      default: 'Full-time',
      index: true,
    },
    workplaceType: {
      type: String,
      enum: ['On-site', 'Remote', 'Hybrid'],
      default: 'On-site',
      index: true,
    },
    experienceLevel: {
      type: String,
      enum: ['Entry-level', 'Mid-level', 'Senior-level', 'Director/Executive'],
      default: 'Mid-level',
      index: true,
    },
    salary: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
      isNegotiable: { type: Boolean, default: false },
    },
    location: {
      type: String,
      required: [true, 'Please provide job location'],
      trim: true,
      index: true,
    },
    industry: {
      type: String,
      required: [true, 'Please provide job industry'],
      trim: true,
      index: true,
    },
    vacancies: {
      type: Number,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'closed'],
      default: 'active',
      index: true,
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
      index: true,
    },
    deadline: {
      type: Date,
    },
    applicationsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

jobSchema.index({
  title: 'text',
  description: 'text',
  location: 'text',
  skillsRequired: 'text',
});

const Job = mongoose.model('Job', jobSchema);
export default Job;

