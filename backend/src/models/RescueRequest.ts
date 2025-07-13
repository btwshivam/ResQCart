import mongoose, { Document, Schema } from 'mongoose';

export interface IRescueRequest extends Document {
  products: mongoose.Types.ObjectId[];
  storeId: mongoose.Types.ObjectId;
  foodBankId?: mongoose.Types.ObjectId;
  rescuePersonnelId?: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  rescueType: 'price-reduction' | 'food-bank-alert' | 'employee-discount' | 'final-sale';
  scheduledPickupTime?: Date;
  actualPickupTime?: Date;
  notes?: string;
  totalWeight?: number; // in kg
  totalValue?: number; // in USD
  environmentalImpact?: number; // CO2 equivalent saved in kg
  rescueCascadeStage: number; // 1-4 representing the stage in the cascade
  daysUntilExpiration: number;
  createdAt: Date;
  updatedAt: Date;
}

const rescueRequestSchema = new Schema<IRescueRequest>({
  products: [{
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  }],
  storeId: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  foodBankId: {
    type: Schema.Types.ObjectId,
    ref: 'FoodBank'
  },
  rescuePersonnelId: {
    type: Schema.Types.ObjectId,
    ref: 'RescuePersonnel'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  rescueType: {
    type: String,
    enum: ['price-reduction', 'food-bank-alert', 'employee-discount', 'final-sale'],
    required: true
  },
  scheduledPickupTime: {
    type: Date
  },
  actualPickupTime: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  totalWeight: {
    type: Number,
    min: 0
  },
  totalValue: {
    type: Number,
    min: 0
  },
  environmentalImpact: {
    type: Number,
    min: 0
  },
  rescueCascadeStage: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  daysUntilExpiration: {
    type: Number,
    required: true
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

// Add indexes for frequent queries
rescueRequestSchema.index({ storeId: 1 });
rescueRequestSchema.index({ foodBankId: 1 });
rescueRequestSchema.index({ status: 1 });
rescueRequestSchema.index({ rescueType: 1 });
rescueRequestSchema.index({ rescueCascadeStage: 1 });
rescueRequestSchema.index({ daysUntilExpiration: 1 });

export const RescueRequest = mongoose.model<IRescueRequest>('RescueRequest', rescueRequestSchema); 