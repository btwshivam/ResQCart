import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin';
import { User } from '../models/User';
import { RescuePersonnel } from '../models/RescuePersonnel';
import { jwtConfig } from '../config/jwt.config';

// Helper function to generate JWT token
const generateToken = (user: any) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role
  };
  return jwt.sign(payload, jwtConfig.secret, jwtConfig.options);
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userType, ...userData } = req.body;
    let newUser;

    switch (userType) {
      case 'admin':
        if (await Admin.findOne({ email: userData.email })) {
          res.status(400).json({ message: 'Admin email already exists' });
          return;
        }
        newUser = new Admin(userData);
        break;

      case 'user':
        if (await User.findOne({ email: userData.email })) {
          res.status(400).json({ message: 'User email already exists' });
          return;
        }
        newUser = new User(userData);
        break;

      case 'rescue':
        if (await RescuePersonnel.findOne({ email: userData.email })) {
          res.status(400).json({ message: 'Rescue personnel email already exists' });
          return;
        }
        newUser = new RescuePersonnel(userData);
        break;

      default:
        res.status(400).json({ message: 'Invalid user type' });
        return;
    }

    await newUser.save();
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      }
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Registration failed',
      error: error.message
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, userType } = req.body;
    let UserModel;

    switch (userType) {
      case 'admin':
        UserModel = Admin;
        break;
      case 'user':
        UserModel = User;
        break;
      case 'rescue':
        UserModel = RescuePersonnel;
        break;
      default:
        res.status(400).json({ message: 'Invalid user type' });
        return;
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Login failed',
      error: error.message
    });
  }
}; 