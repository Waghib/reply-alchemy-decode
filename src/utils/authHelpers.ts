
import { supabase } from '@/integrations/supabase/client';

export const getReadableError = (error: any) => {
  if (!error) return 'An unknown error occurred';
  
  const message = error.message || error.error_description || error.toString();
  
  // Map common Supabase errors to user-friendly messages
  if (message.includes('User already registered')) {
    return 'An account with this email already exists. Please sign in instead or use a different email address.';
  }
  if (message.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }
  if (message.includes('Email not confirmed')) {
    return 'Please check your email and click the confirmation link before signing in.';
  }
  if (message.includes('Password should be at least')) {
    return 'Password must be at least 6 characters long.';
  }
  if (message.includes('Invalid email')) {
    return 'Please enter a valid email address.';
  }
  if (message.includes('Too many requests')) {
    return 'Too many attempts. Please wait a moment before trying again.';
  }
  if (message.includes('signup disabled')) {
    return 'Account registration is currently disabled. Please contact support.';
  }
  if (message.includes('Email rate limit exceeded')) {
    return 'Too many emails sent. Please wait before requesting another confirmation email.';
  }
  
  return message;
};

export const checkUserExists = async (email: string) => {
  try {
    // First try to sign in with a dummy password to check if user exists
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: 'dummy-password-check'
    });
    
    // If error contains "Invalid login credentials", user exists but password is wrong
    // If error contains "Invalid email", user doesn't exist
    if (error?.message?.includes('Invalid login credentials')) {
      return true; // User exists
    }
    
    return false; // User doesn't exist
  } catch (error) {
    console.error('Error checking user existence:', error);
    return false;
  }
};

export const validateAuthForm = (email: string, password: string) => {
  if (!email || !password) {
    return 'Please enter both email and password.';
  }

  if (password.length < 6) {
    return 'Password must be at least 6 characters long.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address.';
  }

  return null;
};
