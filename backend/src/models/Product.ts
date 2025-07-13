import mongoose, { Document, Model } from 'mongoose';

// Define interface for the document
interface IProduct extends Document {
  name: string;
  category: 'Dairy' | 'Produce' | 'Bakery' | 'Meat' | 'Seafood' | 'Deli' | 'Other';
  subCategory?: string;
  sku: string;
  barcode?: string;
  price: number;
  currentPrice?: number;
  discountPercentage: number;
  quantityInStock: number;
  unit: 'gallon' | 'quart' | 'pint' | 'oz' | 'lb' | 'each' | 'pack';
  productionDate?: Date;
  expirationDate: Date;
  predictedExpirationDate?: Date;
  predictedSaleRate?: number;
  shelfLife: number;
  storageConditions: 'refrigerated' | 'frozen' | 'room temperature';
  atRisk: boolean;
  rescueStatus: 'none' | 'price-reduction' | 'food-bank-alert' | 'employee-discount' | 'final-sale';
  rescueActionDate?: Date;
  storeId: mongoose.Types.ObjectId;
  imageUrl?: string;
  nutritionalInfo?: {
    calories?: number;
    fat?: number;
    protein?: number;
    carbs?: number;
  };
  ingredients?: string[];
  allergens?: string[];
  sustainabilityScore?: number;
}

// Define interface for the model with static methods
interface IProductModel extends Model<IProduct> {
  findAtRisk(daysThreshold?: number): Promise<IProduct[]>;
}

// Define the product schema
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Dairy', 'Produce', 'Bakery', 'Meat', 'Seafood', 'Deli', 'Other'],
      default: 'Dairy',
    },
    subCategory: {
      type: String,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    barcode: {
      type: String,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currentPrice: {
      type: Number,
      min: 0,
    },
    discountPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    quantityInStock: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      enum: ['gallon', 'quart', 'pint', 'oz', 'lb', 'each', 'pack'],
    },
    productionDate: {
      type: Date,
    },
    expirationDate: {
      type: Date,
      required: true,
    },
    predictedExpirationDate: {
      type: Date,
    },
    predictedSaleRate: {
      type: Number,
      min: 0,
    },
    shelfLife: {
      type: Number, // in days
      required: true,
      min: 1,
    },
    storageConditions: {
      type: String,
      enum: ['refrigerated', 'frozen', 'room temperature'],
      default: 'refrigerated',
    },
    atRisk: {
      type: Boolean,
      default: false,
    },
    rescueStatus: {
      type: String,
      enum: ['none', 'price-reduction', 'food-bank-alert', 'employee-discount', 'final-sale'],
      default: 'none',
    },
    rescueActionDate: {
      type: Date,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    imageUrl: {
      type: String,
    },
    nutritionalInfo: {
      calories: Number,
      fat: Number,
      protein: Number,
      carbs: Number,
    },
    ingredients: [String],
    allergens: [String],
    sustainabilityScore: {
      type: Number,
      min: 0,
      max: 10,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for frequent queries
productSchema.index({ expirationDate: 1 });
productSchema.index({ category: 1 });
productSchema.index({ atRisk: 1 });
productSchema.index({ rescueStatus: 1 });
productSchema.index({ storeId: 1 });

// Add a static method to find at-risk products
productSchema.statics.findAtRisk = function(daysThreshold = 7) {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
  
  return this.find({
    expirationDate: { $lte: thresholdDate },
    atRisk: true,
    quantityInStock: { $gt: 0 },
  });
};

// Create and export the model
const Product = mongoose.model<IProduct, IProductModel>('Product', productSchema);
export default Product; 