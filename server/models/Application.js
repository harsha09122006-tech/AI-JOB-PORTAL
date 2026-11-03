import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Application must be linked to a job'],
      index: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Application must be linked to a candidate'],
      index: true,
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Application must be linked to a recruiter'],
      index: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Application must be linked to a company'],
      index: true,
    },
    resumeUrl: {
      type: String,
      required: [true, 'Resume is required for application'],
    },
    resumeName: {
      type: String,
      default: 'Resume.pdf',
    },
    coverLetter: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'],
      default: 'Applied',
      index: true,
    },
    aiMatchScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    aiFeedback: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    history: [
      {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        remarks: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications for the same job by the same candidate
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);
export default Application;

