import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IFoodBank extends Document {
  name: string;
  email: string;
  password: string;
  contactPerson: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    }
  };
  operatingHours: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
  capacity: {
    refrigerated: number; // in cubic feet
    frozen: number; // in cubic feet
    dryStorage: number; // in cubic feet
  };
  acceptedCategories: string[];
  transportationAvailable: boolean;
  pickupRadius: number; // in miles
  verificationStatus: 'pending' | 'verified' | 'rejected';
  role: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const foodBankSchema = new Schema<IFoodBank>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  contactPerson: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    zipCode: {
      type: String,
      required: true,
      trim: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  capacity: {
    refrigerated: {
      type: Number,
      default: 0
    },
    frozen: {
      type: Number,
      default: 0
    },
    dryStorage: {
      type: Number,
      default: 0
    }
  },
  acceptedCategories: [{
    type: String,
    enum: ['Dairy', 'Produce', 'Bakery', 'Meat', 'Seafood', 'Deli', 'Other']
  }],
  transportationAvailable: {
    type: Boolean,
    default: false
  },
  pickupRadius: {
    type: Number,
    default: 10
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  role: {
    type: String,
    default: 'foodbank'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
foodBankSchema.pre('save', async function(next) {
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
foodBankSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const FoodBank = mongoose.model<IFoodBank>('FoodBank', foodBankSchema); 