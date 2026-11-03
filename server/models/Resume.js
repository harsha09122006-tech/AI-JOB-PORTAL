import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    parsedText: {
      type: String,
      default: '',
    },
    extractedSkills: [
      {
        type: String,
      },
    ],
    softSkills: [
      {
        type: String,
      },
    ],
    extractedEducation: [
      {
        type: String,
      },
    ],
    extractedExperience: [
      {
        type: String,
      },
    ],
    yearsOfExperience: {
      type: Number,
      default: 0,
    },
    currentRole: {
      type: String,
      default: '',
    },
    preferredRoles: [
      {
        type: String,
      },
    ],
    projects: [
      {
        type: String,
      },
    ],
    certifications: [
      {
        type: String,
      },
    ],
    qualityScore: {
      type: Number,
      default: 0,
    },
    suggestions: [
      {
        type: String,
      },
    ],
    missingSkills: [
      {
        type: String,
      },
    ],
    analysisSummary: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Resume = mongoose.model('Resume', resumeSchema);
export default Resume;
