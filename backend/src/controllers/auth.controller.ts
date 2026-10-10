import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbStore } from '../config/database';
import { ENV } from '../config/env';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class AuthController {
  public static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, role, department } = req.body;

      if (!email || !password || !name) {
        res.status(400).json({ success: false, message: 'Email, password, and name are required' });
        return;
      }

      const existingUser = await dbStore.findUserByEmail(email);
      if (existingUser) {
        res.status(409).json({ success: false, message: 'User with this email already exists' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await dbStore.createUser({
        email,
        password: hashedPassword,
        name,
        role: role === 'admin' ? 'admin' : 'operator',
        department: department || 'Coastal Operations'
      });

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        ENV.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            department: user.department
          },
          token
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Registration failed', error: (error as Error).message });
    }
  }

  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ success: false, message: 'Email and password are required' });
        return;
      }

      const user = await dbStore.findUserByEmail(email);
      if (!user || !user.password) {
        res.status(401).json({ success: false, message: 'Invalid email or password' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(401).json({ success: false, message: 'Invalid email or password' });
        return;
      }

      user.lastLogin = new Date().toISOString();

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        ENV.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            department: user.department,
            lastLogin: user.lastLogin
          },
          token
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Login failed', error: (error as Error).message });
    }
  }

  public static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { password, ...safeUser } = req.user;
    res.status(200).json({
      success: true,
      data: safeUser
    });
  }
}
