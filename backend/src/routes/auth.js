import { Router } from 'express';
import { loginUser, registerUser } from '../services/dataService.js';

const router = Router();

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(`Login request received - Email: "${email}", Password length: ${password?.length || 0}`);
    
    if (!email || !password) {
      console.log('Login failed: Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    console.log(`Login attempt for email: ${email}`);
    const user = await loginUser(email.trim(), password.trim());
    if (!user) {
      console.log(`Login failed for email: ${email} - user not found or password incorrect`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Check if user is approved
    if (user.approval_status === 'pending') {
      return res.status(403).json({ 
        message: 'Your account is pending approval. Please wait for admin approval.',
        approval_status: 'pending'
      });
    }
    
    if (user.approval_status === 'rejected') {
      return res.status(403).json({ 
        message: user.rejection_reason || 'Your account has been rejected. Please contact support.',
        approval_status: 'rejected'
      });
    }
    
    console.log(`Login successful for user: ${user.email} (${user.role})`);
    res.json({ user });
  } catch (error) {
    console.error('Login route error:', error);
    console.error('Error stack:', error.stack);
    next(error);
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      confirmPassword,
      phone,
      role,
      id_document_path,
      referee_license_path
    } = req.body;

    // Validation
    if (!first_name || !last_name || !email || !password || !role) {
      return res.status(400).json({ message: 'First name, last name, email, password, and role are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Valid roles for registration
    const validRoles = ['referee', 'club_manager', 'coach', 'journalist', 'player'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }

    // Referees must upload license document
    if (role === 'referee' && !referee_license_path) {
      return res.status(400).json({ message: 'Referee license document is required' });
    }
    
    // Coaches may optionally upload license document (not required but recommended)

    // All users must upload ID document
    if (!id_document_path) {
      return res.status(400).json({ message: 'ID document is required' });
    }

    const user = await registerUser({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.trim().toLowerCase(),
      password,
      phone: phone?.trim() || null,
      role,
      id_document_path,
      referee_license_path: (role === 'referee' || role === 'coach') ? referee_license_path : null
    });

    res.status(201).json({
      message: 'Registration successful. Your account is pending admin approval.',
      user: {
        id: user.id,
        email: user.email,
        approval_status: user.approval_status
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.message === 'Email already registered') {
      return res.status(409).json({ message: error.message });
    }
    next(error);
  }
});

export default router;
