import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product';
import { connectDB } from '../config/database';

// Load environment variables
dotenv.config();

// Sample product data
const products = [
  // Dairy Products
  {
    name: 'Organic Whole Milk',
    category: 'Dairy',
    subCategory: 'Milk',
    sku: 'dairy-milk-001',
    barcode: '8901234567890',
    price: 4.99,
    currentPrice: 4.99,
    discountPercentage: 0,
    quantityInStock: 24,
    unit: 'gallon',
    productionDate: new Date('2025-06-20'),
    expirationDate: new Date('2025-07-05'),
    shelfLife: 15,
    storageConditions: 'refrigerated',
    atRisk: true,
    rescueStatus: 'none',
    storeId: new mongoose.Types.ObjectId(),
    imageUrl: 'https://example.com/images/milk.jpg',
    nutritionalInfo: {
      calories: 150,
      fat: 8,
      protein: 8,
      carbs: 12
    },
    ingredients: ['Organic Whole Milk'],
    allergens: ['Milk'],
    sustainabilityScore: 8
  },
  {
    name: '2% Reduced Fat Milk',
    category: 'Dairy',
    subCategory: 'Milk',
    sku: 'dairy-milk-002',
    barcode: '8901234567891',
    price: 3.99,
    currentPrice: 3.59,
    discountPercentage: 10,
    quantityInStock: 18,
    unit: 'gallon',
    productionDate: new Date('2025-06-21'),
    expirationDate: new Date('2025-07-02'),
    shelfLife: 14,
    storageConditions: 'refrigerated',
    atRisk: true,
    rescueStatus: 'price-reduction',
    rescueActionDate: new Date('2025-06-28'),
    storeId: new mongoose.Types.ObjectId(),
    imageUrl: 'https://example.com/images/2-percent-milk.jpg',
    nutritionalInfo: {
      calories: 120,
      fat: 5,
      protein: 8,
      carbs: 12
    },
    ingredients: ['Reduced Fat Milk', 'Vitamin A', 'Vitamin D'],
    allergens: ['Milk'],
    sustainabilityScore: 7
  },
  {
    name: 'Organic Greek Yogurt',
    category: 'Dairy',
    subCategory: 'Yogurt',
    sku: 'dairy-yogurt-001',
    barcode: '8901234567892',
    price: 5.49,
    currentPrice: 5.49,
    discountPercentage: 0,
    quantityInStock: 15,
    unit: 'each',
    productionDate: new Date('2025-06-22'),
    expirationDate: new Date('2025-07-10'),
    shelfLife: 21,
    storageConditions: 'refrigerated',
    atRisk: false,
    rescueStatus: 'none',
    storeId: new mongoose.Types.ObjectId(),
    imageUrl: 'https://example.com/images/greek-yogurt.jpg',
    nutritionalInfo: {
      calories: 100,
      fat: 0,
      protein: 18,
      carbs: 6
    },
    ingredients: ['Organic Milk', 'Live Active Cultures'],
    allergens: ['Milk'],
    sustainabilityScore: 9
  },
  
  // Produce Products
  {
    name: 'Organic Apples',
    category: 'Produce',
    subCategory: 'Fruits',
    sku: 'produce-fruit-001',
    barcode: '8901234567893',
    price: 4.99,
    currentPrice: 4.49,
    discountPercentage: 10,
    quantityInStock: 50,
    unit: 'lb',
    productionDate: new Date('2025-06-25'),
    expirationDate: new Date('2025-07-09'),
    shelfLife: 14,
    storageConditions: 'refrigerated',
    atRisk: false,
    rescueStatus: 'price-reduction',
    rescueActionDate: new Date('2025-06-29'),
    storeId: new mongoose.Types.ObjectId(),
    imageUrl: 'https://example.com/images/apples.jpg',
    nutritionalInfo: {
      calories: 95,
      fat: 0,
      protein: 0.5,
      carbs: 25
    },
    ingredients: ['Organic Apples'],
    sustainabilityScore: 9
  },
  {
    name: 'Bananas',
    category: 'Produce',
    subCategory: 'Fruits',
    sku: 'produce-fruit-002',
    barcode: '8901234567894',
    price: 0.69,
    currentPrice: 0.35,
    discountPercentage: 50,
    quantityInStock: 30,
    unit: 'lb',
    productionDate: new Date('2025-06-27'),
    expirationDate: new Date('2025-07-01'),
    shelfLife: 7,
    storageConditions: 'room temperature',
    atRisk: true,
    rescueStatus: 'price-reduction',
    rescueActionDate: new Date('2025-06-29'),
    storeId: new mongoose.Types.ObjectId(),
    imageUrl: 'https://example.com/images/bananas.jpg',
    nutritionalInfo: {
      calories: 105,
      fat: 0,
      protein: 1,
      carbs: 27
    },
    ingredients: ['Bananas'],
    sustainabilityScore: 7
  },
  {
    name: 'Organic Spinach',
    category: 'Produce',
    subCategory: 'Vegetables',
    sku: 'produce-veg-001',
    barcode: '8901234567895',
    price: 3.99,
    currentPrice: 3.99,
    discountPercentage: 0,
    quantityInStock: 20,
    unit: 'each',
    productionDate: new Date('2025-06-28'),
    expirationDate: new Date('2025-07-04'),
    shelfLife: 7,
    storageConditions: 'refrigerated',
    atRisk: false,
    rescueStatus: 'none',
    storeId: new mongoose.Types.ObjectId(),
    imageUrl: 'https://example.com/images/spinach.jpg',
    nutritionalInfo: {
      calories: 23,
      fat: 0,
      protein: 2.9,
      carbs: 3.6
    },
    ingredients: ['Organic Spinach'],
    sustainabilityScore: 9
  },
  
  // Bakery Products
  {
    name: 'Artisan Sourdough Bread',
    category: 'Bakery',
    subCategory: 'Bread',
    sku: 'bakery-bread-001',
    barcode: '8901234567896',
    price: 5.99,
    currentPrice: 4.79,
    discountPercentage: 20,
    quantityInStock: 8,
    unit: 'each',
    productionDate: new Date('2025-06-29'),
    expirationDate: new Date('2025-07-02'),
    shelfLife: 3,
    storageConditions: 'room temperature',
    atRisk: true,
    rescueStatus: 'price-reduction',
    rescueActionDate: new Date('2025-06-29'),
    storeId: new mongoose.Types.ObjectId(),
    imageUrl: 'https://example.com/images/sourdough.jpg',
    nutritionalInfo: {
      calories: 120,
      fat: 0.5,
      protein: 4,
      carbs: 23
    },
    ingredients: ['Organic Flour', 'Water', 'Salt', 'Sourdough Starter'],
    allergens: ['Wheat', 'Gluten'],
    sustainabilityScore: 8
  },
  {
    name: 'Chocolate Chip Cookies',
    category: 'Bakery',
    subCategory: 'Cookies',
    sku: 'bakery-cookies-001',
    barcode: '8901234567897',
    price: 3.99,
    currentPrice: 3.99,
    discountPercentage: 0,
    quantityInStock: 12,
    unit: 'pack',
    productionDate: new Date('2025-06-29'),
    expirationDate: new Date('2025-07-06'),
    shelfLife: 7,
    storageConditions: 'room temperature',
    atRisk: false,
    rescueStatus: 'none',
    storeId: new mongoose.Types.ObjectId(),
    imageUrl: 'https://example.com/images/cookies.jpg',
    nutritionalInfo: {
      calories: 180,
      fat: 9,
      protein: 2,
      carbs: 24
    },
    ingredients: ['Flour', 'Sugar', 'Butter', 'Chocolate Chips', 'Eggs', 'Vanilla'],
    allergens: ['Wheat', 'Dairy', 'Eggs'],
    sustainabilityScore: 6
  },
  
  // Meat Products
  {
    name: 'Organic Chicken Breast',
    category: 'Meat',
    subCategory: 'Poultry',
    sku: 'meat-poultry-001',
    barcode: '8901234567898',
    price: 8.99,
    currentPrice: 8.99,
    discountPercentage: 0,
    quantityInStock: 15,
    unit: 'lb',
    productionDate: new Date('2025-06-28'),
    expirationDate: new Date('2025-07-03'),
    shelfLife: 5,
    storageConditions: 'refrigerated',
    atRisk: false,
    rescueStatus: 'none',
    storeId: new mongoose.Types.ObjectId(),
    imageUrl: 'https://example.com/images/chicken.jpg',
    nutritionalInfo: {
      calories: 165,
      fat: 3.6,
      protein: 31,
      carbs: 0
    },
    ingredients: ['Organic Chicken'],
    sustainabilityScore: 7
  },
  {
    name: 'Grass-Fed Ground Beef',
    category: 'Meat',
    subCategory: 'Beef',
    sku: 'meat-beef-001',
    barcode: '8901234567899',
    price: 7.99,
    currentPrice: 6.39,
    discountPercentage: 20,
    quantityInStock: 10,
    unit: 'lb',
    productionDate: new Date('2025-06-28'),
    expirationDate: new Date('2025-07-01'),
    shelfLife: 3,
    storageConditions: 'refrigerated',
    atRisk: true,
    rescueStatus: 'price-reduction',
    rescueActionDate: new Date('2025-06-29'),
    storeId: new mongoose.Types.ObjectId(),
    imageUrl: 'https://example.com/images/ground-beef.jpg',
    nutritionalInfo: {
      calories: 250,
      fat: 20,
      protein: 26,
      carbs: 0
    },
    ingredients: ['Grass-Fed Beef'],
    sustainabilityScore: 8
  },
  
  // Seafood Products
  {
    name: 'Wild-Caught Salmon',
    category: 'Seafood',
    subCategory: 'Fish',
    sku: 'seafood-fish-001',
    barcode: '8901234567900',
    price: 14.99,
    currentPrice: 11.99,
    discountPercentage: 20,
    quantityInStock: 8,
    unit: 'lb',
    productionDate: new Date('2025-06-29'),
    expirationDate: new Date('2025-07-01'),
    shelfLife: 2,
    storageConditions: 'refrigerated',
    atRisk: true,
    rescueStatus: 'price-reduction',
    rescueActionDate: new Date('2025-06-29'),
    storeId: new mongoose.Types.ObjectId(),
    imageUrl: 'https://example.com/images/salmon.jpg',
    nutritionalInfo: {
      calories: 208,
      fat: 13,
      protein: 22,
      carbs: 0
    },
    ingredients: ['Wild-Caught Salmon'],
    allergens: ['Fish'],
    sustainabilityScore: 9
  },
  
  // Deli Products
  {
    name: 'Sliced Turkey Breast',
    category: 'Deli',
    subCategory: 'Sliced Meat',
    sku: 'deli-meat-001',
    barcode: '8901234567901',
    price: 9.99,
    currentPrice: 9.99,
    discountPercentage: 0,
    quantityInStock: 5,
    unit: 'lb',
    productionDate: new Date('2025-06-28'),
    expirationDate: new Date('2025-07-05'),
    shelfLife: 7,
    storageConditions: 'refrigerated',
    atRisk: false,
    rescueStatus: 'none',
    storeId: new mongoose.Types.ObjectId(),
    imageUrl: 'https://example.com/images/turkey.jpg',
    nutritionalInfo: {
      calories: 100,
      fat: 2,
      protein: 22,
      carbs: 1
    },
    ingredients: ['Turkey Breast', 'Salt', 'Natural Flavors'],
    sustainabilityScore: 6
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');
    
    // Insert new products
    await Product.insertMany(products);
    console.log(`Added ${products.length} products to the database`);
    
    // Disconnect from database
    await mongoose.disconnect();
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase(); 