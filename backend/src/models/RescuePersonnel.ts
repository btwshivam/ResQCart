import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IRescuePersonnel extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  organizationName: string;
  organizationType: string;
  serviceArea: string[];
  vehicleType?: string;
  vehicleNumber?: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const rescuePersonnelSchema = new Schema<IRescuePersonnel>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    default: 'rescue',
    enum: ['rescue'],
  },
  organizationName: {
    type: String,
    required: true,
    trim: true,
  },
  organizationType: {
    type: String,
    required: true,
    enum: ['NGO', 'Government', 'Private', 'Other'],
  },
  serviceArea: [{
    type: String,
    required: true,
  }],
  vehicleType: {
    type: String,
    trim: true,
  },
  vehicleNumber: {
    type: String,
    trim: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
rescuePersonnelSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
rescuePersonnelSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const RescuePersonnel = mongoose.model<IRescuePersonnel>('RescuePersonnel', rescuePersonnelSchema); 