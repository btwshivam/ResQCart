import { Request, Response } from 'express';
import Product from '../models/Product';
import { RescueRequest } from '../models/RescueRequest';
import { FoodBank } from '../models/FoodBank';
import mongoose from 'mongoose';

// Get all rescue requests
export const getAllRescueRequests = async (req: Request, res: Response) => {
  try {
    const rescueRequests = await RescueRequest.find()
      .populate('products')
      .populate('foodBankId', 'name contactPerson phone')
      .populate('rescuePersonnelId', 'firstName lastName phone');
    
    res.json(rescueRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get rescue requests for a specific store
export const getStoreRescueRequests = async (req: Request, res: Response) => {
  try {
    const storeId = req.params.storeId;
    
    const rescueRequests = await RescueRequest.find({ storeId })
      .populate('products')
      .populate('foodBankId', 'name contactPerson phone')
      .populate('rescuePersonnelId', 'firstName lastName phone')
      .sort({ createdAt: -1 });
    
    res.json(rescueRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get rescue requests for a specific food bank
export const getFoodBankRescueRequests = async (req: Request, res: Response) => {
  try {
    const foodBankId = req.params.foodBankId;
    
    const rescueRequests = await RescueRequest.find({ foodBankId })
      .populate('products')
      .populate('storeId')
      .sort({ createdAt: -1 });
    
    res.json(rescueRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Create a new rescue request
export const createRescueRequest = async (req: Request, res: Response) => {
  try {
    const rescueRequest = new RescueRequest(req.body);
    const savedRescueRequest = await rescueRequest.save();
    
    // Update product rescue status
    if (savedRescueRequest.products && savedRescueRequest.products.length > 0) {
      await Product.updateMany(
        { _id: { $in: savedRescueRequest.products } },
        { 
          rescueStatus: savedRescueRequest.rescueType,
          rescueActionDate: new Date()
        }
      );
    }
    
    res.status(201).json(savedRescueRequest);
  } catch (error) {
    res.status(400).json({ message: 'Invalid rescue request data', error });
  }
};

// Update a rescue request status
export const updateRescueRequestStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'accepted', 'in-progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const rescueRequest = await RescueRequest.findByIdAndUpdate(
      id,
      { 
        status,
        ...(status === 'completed' ? { actualPickupTime: new Date() } : {})
      },
      { new: true }
    );
    
    if (!rescueRequest) {
      return res.status(404).json({ message: 'Rescue request not found' });
    }
    
    res.json(rescueRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get nearby food banks for a store
export const getNearbyFoodBanks = async (req: Request, res: Response) => {
  try {
    const { lat, lng, radius = 25 } = req.query; // radius in miles
    
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }
    
    // Find food banks with coordinates within radius
    // This is a simplified approach - for production, use geospatial queries
    const foodBanks = await FoodBank.find({
      verificationStatus: 'verified'
    });
    
    // Filter food banks by distance (simplified calculation)
    const nearbyFoodBanks = foodBanks.filter(foodBank => {
      if (!foodBank.address.coordinates) return false;
      
      const latDiff = Math.abs(Number(lat) - foodBank.address.coordinates.lat);
      const lngDiff = Math.abs(Number(lng) - foodBank.address.coordinates.lng);
      
      // Rough distance calculation (not accurate but simple for demo)
      const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 69; // approx miles
      return distance <= Number(radius);
    });
    
    res.json(nearbyFoodBanks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Run the rescue cascade system
export const runRescueCascade = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Get all products with expiration dates
    const products = await Product.find({
      expirationDate: { $exists: true },
      quantityInStock: { $gt: 0 },
      rescueStatus: 'none' // Only target products not already in rescue
    }).session(session);
    
    const today = new Date();
    const storeId = req.body.storeId || '65f1a1a1a1a1a1a1a1a1a1a1'; // Default store ID for demo
    
    const rescueResults = {
      stage1: 0, // 7-5 days: Rebalance inventory
      stage2: 0, // 4-3 days: Dynamic pricing
      stage3: 0, // 2-1 days: Food bank pickups
      stage4: 0  // 0 days: Flash sales
    };
    
    // Process each product through the rescue cascade
    for (const product of products) {
      const expirationDate = new Date(product.expirationDate);
      const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Skip products already expired
      if (daysUntilExpiration < 0) continue;
      
      // Determine rescue stage based on days until expiration
      let rescueStage = 0;
      let rescueType: 'none' | 'price-reduction' | 'food-bank-alert' | 'employee-discount' | 'final-sale' = 'none';
      let discountPercentage = 0;
      
      if (daysUntilExpiration >= 5 && daysUntilExpiration <= 7) {
        // Stage 1: Rebalance inventory (5-7 days before expiration)
        rescueStage = 1;
        rescueType = 'price-reduction';
        discountPercentage = 10;
        rescueResults.stage1++;
      } else if (daysUntilExpiration >= 3 && daysUntilExpiration <= 4) {
        // Stage 2: Dynamic pricing (3-4 days before expiration)
        rescueStage = 2;
        rescueType = 'price-reduction';
        discountPercentage = 30;
        rescueResults.stage2++;
      } else if (daysUntilExpiration >= 1 && daysUntilExpiration <= 2) {
        // Stage 3: Food bank pickups (1-2 days before expiration)
        rescueStage = 3;
        rescueType = 'food-bank-alert';
        rescueResults.stage3++;
      } else if (daysUntilExpiration === 0) {
        // Stage 4: Flash sales (day of expiration)
        rescueStage = 4;
        rescueType = 'final-sale';
        discountPercentage = 70;
        rescueResults.stage4++;
      }
      
      if (rescueStage > 0) {
        // Update product with rescue status
        product.rescueStatus = rescueType;
        product.atRisk = true;
        
        if (discountPercentage > 0) {
          product.discountPercentage = discountPercentage;
          product.currentPrice = product.price * (1 - discountPercentage / 100);
        }
        
        await product.save({ session });
        
        // Create rescue request for food bank alerts
        if (rescueType === 'food-bank-alert') {
          const rescueRequest = new RescueRequest({
            products: [product._id],
            storeId,
            rescueType,
            rescueCascadeStage: rescueStage,
            daysUntilExpiration,
            status: 'pending',
            totalValue: product.price * product.quantityInStock,
            // Estimate weight based on product category (simplified)
            totalWeight: product.quantityInStock * (product.category === 'Produce' ? 0.5 : 1.0),
            // Estimate environmental impact (simplified)
            environmentalImpact: product.quantityInStock * 2.5 // 2.5 kg CO2 per item
          });
          
          await rescueRequest.save({ session });
        }
      }
    }
    
    await session.commitTransaction();
    
    res.json({
      message: 'Rescue cascade completed successfully',
      results: rescueResults,
      totalProductsProcessed: products.length,
      totalProductsRescued: Object.values(rescueResults).reduce((a, b) => a + b, 0)
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Server error', error });
  } finally {
    session.endSession();
  }
}; 