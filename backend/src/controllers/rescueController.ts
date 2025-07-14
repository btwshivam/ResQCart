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
    
    console.log(`Fetching rescue requests for food bank: ${foodBankId}`);
    
    // First check if the food bank exists and if the ID is valid
    if (!mongoose.Types.ObjectId.isValid(foodBankId)) {
      console.log(`Invalid food bank ID format: ${foodBankId}`);
      return res.status(400).json({ message: 'Invalid food bank ID format' });
    }
    
    const foodBankExists = await FoodBank.exists({ _id: foodBankId });
    if (!foodBankExists) {
      console.log(`Food bank with ID ${foodBankId} not found`);
      return res.json([]); // Return empty array instead of error
    }
    
    // Find rescue requests
    const rescueRequests = await RescueRequest.find({ 
      foodBankId,
      // Include all statuses except 'pending' (accepted, in-progress, completed, cancelled)
      status: { $ne: 'pending' }
    })
    .populate({
      path: 'products',
      // Handle missing products gracefully
      match: { _id: { $exists: true } }
    })
    .populate({
      path: 'storeId',
      select: 'name address phone',
      // Handle missing stores gracefully
      match: { _id: { $exists: true } }
    })
    .sort({ createdAt: -1 });
    
    console.log(`Found ${rescueRequests.length} rescue requests for food bank ${foodBankId}`);
    
    // Filter out any rescue requests with null products or storeId (in case they were deleted)
    const validRescueRequests = rescueRequests.filter(req => {
      // Keep requests that have at least one valid product
      const hasValidProducts = Array.isArray(req.products) && req.products.some(p => p !== null);
      // Keep requests that have a valid store
      const hasValidStore = req.storeId !== null;
      
      return hasValidProducts && hasValidStore;
    });
    
    console.log(`Found ${validRescueRequests.length} valid rescue requests for food bank ${foodBankId}`);
    
    res.json(validRescueRequests);
  } catch (error) {
    console.error('Error fetching food bank rescue requests:', error);
    // Return empty array instead of error to prevent frontend crashes
    res.json([]);
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
    const { status, foodBankId, scheduledPickupTime } = req.body;
    
    console.log('Update rescue request payload:', { id, status, foodBankId, scheduledPickupTime });
    
    if (!['pending', 'accepted', 'in-progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    // Validate the request ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid rescue request ID format' });
    }
    
    // Check if the rescue request exists before updating
    const existingRequest = await RescueRequest.findById(id);
    if (!existingRequest) {
      return res.status(404).json({ message: 'Rescue request not found' });
    }
    
    // Build update object based on received data
    const updateData: any = { status };
    
    // Add foodBankId if provided (for claiming)
    if (status === 'accepted' && foodBankId) {
      // Check if food bank ID is valid
      if (!mongoose.Types.ObjectId.isValid(foodBankId)) {
        return res.status(400).json({ message: 'Invalid food bank ID format' });
      }
      
      // Verify the food bank exists
      const foodBankExists = await FoodBank.exists({ _id: foodBankId });
      if (!foodBankExists) {
        return res.status(404).json({ message: 'Food bank not found' });
      }
      
      updateData.foodBankId = foodBankId;
      console.log(`Assigning rescue request to food bank: ${foodBankId}`);
    }
    
    // Add scheduled pickup time if provided
    if (scheduledPickupTime) {
      // Validate date format
      const scheduledDate = new Date(scheduledPickupTime);
      if (isNaN(scheduledDate.getTime())) {
        return res.status(400).json({ message: 'Invalid pickup time format' });
      }
      updateData.scheduledPickupTime = scheduledPickupTime;
    }
    
    // Add actual pickup time for completed status
    if (status === 'completed') {
      updateData.actualPickupTime = new Date();
    }
    
    console.log('Updating rescue request:', id, 'with data:', updateData);
    
    // Use try/catch specifically for the update operation
    try {
      const rescueRequest = await RescueRequest.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      ).populate({
        path: 'products',
        // Handle missing products gracefully
        match: { _id: { $exists: true } }
      });
      
      if (!rescueRequest) {
        return res.status(404).json({ message: 'Rescue request could not be updated' });
      }
      
      // Verify the update was successful by checking if foodBankId was set correctly
      if (status === 'accepted' && foodBankId) {
        if (!rescueRequest.foodBankId || rescueRequest.foodBankId.toString() !== foodBankId) {
          console.error('Food bank ID was not properly set in the update operation');
          return res.status(500).json({ message: 'Failed to update food bank association' });
        }
      }
      
      console.log('Successfully updated rescue request:', rescueRequest._id);
      res.json(rescueRequest);
    } catch (updateError) {
      console.error('Error during update operation:', updateError);
      res.status(400).json({ message: 'Error updating rescue request', error: updateError.message });
    }
  } catch (error) {
    console.error('Error updating rescue request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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