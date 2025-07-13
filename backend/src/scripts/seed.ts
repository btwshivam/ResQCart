import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product';
import { connectDB } from '../config/database';

// Load environment variables
dotenv.config();

// Get current date for expiration calculations
const currentDate = new Date();
const tomorrow = new Date(currentDate);
tomorrow.setDate(currentDate.getDate() + 1);
const twoDaysLater = new Date(currentDate);
twoDaysLater.setDate(currentDate.getDate() + 2);
const threeDaysLater = new Date(currentDate);
threeDaysLater.setDate(currentDate.getDate() + 3);
const fourDaysLater = new Date(currentDate);
fourDaysLater.setDate(currentDate.getDate() + 4);

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
    productionDate: new Date('2023-06-20'),
    expirationDate: tomorrow,
    shelfLife: 15,
    storageConditions: 'refrigerated',
    atRisk: true,
    rescueStatus: 'none',
    storeId: new mongoose.Types.ObjectId(),
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=400&auto=format',
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
    productionDate: new Date('2023-06-21'),
    expirationDate: twoDaysLater,
    shelfLife: 14,
    storageConditions: 'refrigerated',
    atRisk: true,
    rescueStatus: 'price-reduction',
    rescueActionDate: new Date(),
    storeId: new mongoose.Types.ObjectId(),
    imageUrl: 'https://images.unsplash.com/photo-1576186726115-4d51596775d1?q=80&w=400&auto=format',
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
    productionDate: new Date('2023-06-22'),
    expirationDate: threeDaysLater,
    shelfLife: 21,
    storageConditions: 'refrigerated',
    atRisk: true,
    rescueStatus: 'none',
    storeId: new mongoose.Types.ObjectId(),
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=400&auto=format',
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
    productionDate: new Date('2023-06-25'),
    expirationDate: fourDaysLater,
    shelfLife: 14,
    storageConditions: 'refrigerated',
    atRisk: true,
    rescueStatus: 'price-reduction',
    rescueActionDate: new Date(),
    storeId: new mongoose.Types.ObjectId(),
    imageUrl: 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?q=80&w=400&auto=format',
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
    productionDate: new Date('2023-06-27'),
    expirationDate: tomorrow,
    shelfLife: 7,
    storageConditions: 'room temperature',
    atRisk: true,
    rescueStatus: 'price-reduction',
    rescueActionDate: new Date(),
    storeId: new mongoose.Types.ObjectId(),
    imageUrl: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?q=80&w=400&auto=format',
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
    productionDate: new Date('2023-06-28'),
    expirationDate: threeDaysLater,
    shelfLife: 7,
    storageConditions: 'refrigerated',
    atRisk: true,
    rescueStatus: 'none',
    storeId: new mongoose.Types.ObjectId(),
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=400&auto=format',
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
    productionDate: new Date('2023-06-29'),
    expirationDate: tomorrow,
    shelfLife: 3,
    storageConditions: 'room temperature',
    atRisk: true,
    rescueStatus: 'price-reduction',
    rescueActionDate: new Date(),
    storeId: new mongoose.Types.ObjectId(),
    imageUrl: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?q=80&w=400&auto=format',
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
    productionDate: new Date('2023-06-29'),
    expirationDate: fourDaysLater,
    shelfLife: 7,
    storageConditions: 'room temperature',
    atRisk: true,
    rescueStatus: 'none',
    storeId: new mongoose.Types.ObjectId(),
    imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=400&auto=format',
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
    productionDate: new Date('2023-06-28'),
    expirationDate: twoDaysLater,
    shelfLife: 5,
    storageConditions: 'refrigerated',
    atRisk: true,
    rescueStatus: 'none',
    storeId: new mongoose.Types.ObjectId(),
    imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?q=80&w=400&auto=format',
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
    productionDate: new Date('2023-06-28'),
    expirationDate: tomorrow,
    shelfLife: 3,
    storageConditions: 'refrigerated',
    atRisk: true,
    rescueStatus: 'price-reduction',
    rescueActionDate: new Date(),
    storeId: new mongoose.Types.ObjectId(),
    imageUrl: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?q=80&w=400&auto=format',
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
    productionDate: new Date('2023-06-29'),
    expirationDate: tomorrow,
    shelfLife: 2,
    storageConditions: 'refrigerated',
    atRisk: true,
    rescueStatus: 'price-reduction',
    rescueActionDate: new Date(),
    storeId: new mongoose.Types.ObjectId(),
    imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=400&auto=format',
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
    productionDate: new Date('2023-06-28'),
    expirationDate: threeDaysLater,
    shelfLife: 7,
    storageConditions: 'refrigerated',
    atRisk: true,
    rescueStatus: 'none',
    storeId: new mongoose.Types.ObjectId(),
    imageUrl: 'https://images.unsplash.com/photo-1606851091851-e8c8c0fca5ba?q=80&w=400&auto=format',
    nutritionalInfo: {
      calories: 100,
      fat: 2,
      protein: 22,
      carbs: 1
    },
    ingredients: ['Turkey Breast', 'Salt', 'Natural Flavors'],
    sustainabilityScore: 6
  },
  // Additional products to ensure more than 8 at-risk items
  {
    name: 'Fresh Strawberries',
    category: 'Produce',
    subCategory: 'Fruits',
    sku: 'produce-fruit-003',
    barcode: '8901234567902',
    price: 4.99,
    currentPrice: 3.99,
    discountPercentage: 20,
    quantityInStock: 15,
    unit: 'pack',
    productionDate: new Date('2023-06-28'),
    expirationDate: twoDaysLater,
    shelfLife: 5,
    storageConditions: 'refrigerated',
    atRisk: true,
    rescueStatus: 'price-reduction',
    rescueActionDate: new Date(),
    storeId: new mongoose.Types.ObjectId(),
    imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=400&auto=format',
    nutritionalInfo: {
      calories: 50,
      fat: 0,
      protein: 1,
      carbs: 12
    },
    ingredients: ['Fresh Strawberries'],
    sustainabilityScore: 8
  },
  {
    name: 'Organic Blueberries',
    category: 'Produce',
    subCategory: 'Fruits',
    sku: 'produce-fruit-004',
    barcode: '8901234567903',
    price: 5.99,
    currentPrice: 4.79,
    discountPercentage: 20,
    quantityInStock: 10,
    unit: 'pack',
    productionDate: new Date('2023-06-29'),
    expirationDate: twoDaysLater,
    shelfLife: 7,
    storageConditions: 'refrigerated',
    atRisk: true,
    rescueStatus: 'price-reduction',
    rescueActionDate: new Date(),
    storeId: new mongoose.Types.ObjectId(),
    imageUrl: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?q=80&w=400&auto=format',
    nutritionalInfo: {
      calories: 80,
      fat: 0.5,
      protein: 1,
      carbs: 20
    },
    ingredients: ['Organic Blueberries'],
    sustainabilityScore: 9
  },
  {
    name: 'Artisan Baguette',
    category: 'Bakery',
    subCategory: 'Bread',
    sku: 'bakery-bread-002',
    barcode: '8901234567904',
    price: 3.49,
    currentPrice: 2.79,
    discountPercentage: 20,
    quantityInStock: 7,
    unit: 'each',
    productionDate: new Date('2023-06-29'),
    expirationDate: tomorrow,
    shelfLife: 2,
    storageConditions: 'room temperature',
    atRisk: true,
    rescueStatus: 'price-reduction',
    rescueActionDate: new Date(),
    storeId: new mongoose.Types.ObjectId(),
    imageUrl: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?q=80&w=400&auto=format',
    nutritionalInfo: {
      calories: 130,
      fat: 0.5,
      protein: 4,
      carbs: 26
    },
    ingredients: ['Flour', 'Water', 'Salt', 'Yeast'],
    allergens: ['Wheat', 'Gluten'],
    sustainabilityScore: 7
  },
  {
    name: 'Fresh Atlantic Cod',
    category: 'Seafood',
    subCategory: 'Fish',
    sku: 'seafood-fish-002',
    barcode: '8901234567905',
    price: 12.99,
    currentPrice: 9.74,
    discountPercentage: 25,
    quantityInStock: 6,
    unit: 'lb',
    productionDate: new Date('2023-06-29'),
    expirationDate: tomorrow,
    shelfLife: 2,
    storageConditions: 'refrigerated',
    atRisk: true,
    rescueStatus: 'price-reduction',
    rescueActionDate: new Date(),
    storeId: new mongoose.Types.ObjectId(),
    imageUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=400&auto=format',
    nutritionalInfo: {
      calories: 90,
      fat: 1,
      protein: 20,
      carbs: 0
    },
    ingredients: ['Atlantic Cod'],
    allergens: ['Fish'],
    sustainabilityScore: 7
  },
  {
    name: 'Organic Heavy Cream',
    category: 'Dairy',
    subCategory: 'Cream',
    sku: 'dairy-cream-001',
    barcode: '8901234567906',
    price: 4.49,
    currentPrice: 3.59,
    discountPercentage: 20,
    quantityInStock: 8,
    unit: 'pint',
    productionDate: new Date('2023-06-27'),
    expirationDate: twoDaysLater,
    shelfLife: 10,
    storageConditions: 'refrigerated',
    atRisk: true,
    rescueStatus: 'price-reduction',
    rescueActionDate: new Date(),
    storeId: new mongoose.Types.ObjectId(),
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=400&auto=format',
    nutritionalInfo: {
      calories: 50,
      fat: 5,
      protein: 0.5,
      carbs: 0.5
    },
    ingredients: ['Organic Cream'],
    allergens: ['Milk'],
    sustainabilityScore: 8
  },
  {
    name: 'Fresh Tomatoes',
    category: 'Produce',
    subCategory: 'Vegetables',
    sku: 'produce-veg-002',
    barcode: '8901234567907',
    price: 2.99,
    currentPrice: 2.39,
    discountPercentage: 20,
    quantityInStock: 20,
    unit: 'lb',
    productionDate: new Date('2023-06-28'),
    expirationDate: threeDaysLater,
    shelfLife: 7,
    storageConditions: 'room temperature',
    atRisk: true,
    rescueStatus: 'price-reduction',
    rescueActionDate: new Date(),
    storeId: new mongoose.Types.ObjectId(),
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=400&auto=format',
    nutritionalInfo: {
      calories: 20,
      fat: 0,
      protein: 1,
      carbs: 4
    },
    ingredients: ['Fresh Tomatoes'],
    sustainabilityScore: 9
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