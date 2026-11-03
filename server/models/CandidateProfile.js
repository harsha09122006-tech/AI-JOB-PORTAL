import mongoose from 'mongoose';

const candidateProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    headline: {
      type: String,
      default: '',
      trim: true,
    },
    bio: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    education: [
      {
        institution: { type: String, required: true },
        degree: { type: String, required: true },
        fieldOfStudy: { type: String, default: '' },
        startYear: { type: Number },
        endYear: { type: Number },
        grade: { type: String, default: '' },
      },
    ],
    experience: [
      {
        company: { type: String, required: true },
        title: { type: String, required: true },
        location: { type: String, default: '' },
        startDate: { type: Date },
        endDate: { type: Date },
        current: { type: Boolean, default: false },
        description: { type: String, default: '' },
      },
    ],
    expectedSalary: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
    },
    preferredRole: {
      type: String,
      default: '',
      trim: true,
    },
    resumeUrl: {
      type: String,
      default: '',
    },
    resumeName: {
      type: String,
      default: '',
    },
    github: {
      type: String,
      default: '',
      trim: true,
    },
    linkedin: {
      type: String,
      default: '',
      trim: true,
    },
    portfolio: {
      type: String,
      default: '',
      trim: true,
    },
    profileCompletedPercentage: {
      type: Number,
      default: 20,
    },
  },
  {
    timestamps: true,
  }
);

// Method to calculate completion percentage dynamically
candidateProfileSchema.methods.calculateCompletion = function () {
  let score = 20; // basic registration
  if (this.headline) score += 10;
  if (this.bio) score += 10;
  if (this.location) score += 10;
  if (this.skills && this.skills.length > 0) score += 20;
  if (this.education && this.education.length > 0) score += 10;
  if (this.experience && this.experience.length > 0) score += 10;
  if (this.resumeUrl) score += 10;
  this.profileCompletedPercentage = Math.min(100, score);
  return this.profileCompletedPercentage;
};

const CandidateProfile = mongoose.model('CandidateProfile', candidateProfileSchema);
export default CandidateProfile;

