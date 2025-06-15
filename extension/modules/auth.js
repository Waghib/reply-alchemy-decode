
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2.45.0';

const SUPABASE_URL = "https://aodowsouzxzjuvroqule.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZG93c291enh6anV2cm9xdWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MDA1MjQsImV4cCI6MjA2NTQ3NjUyNH0.Ez5lIB3pF2Hguyn5BgPKhUUbSwL977-edi-wgrHFca4";

export class AuthManager {
  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    this.currentUser = null;
    this.subscribed = false;
    this.isSignInMode = true;
  }

  async checkAuthStatus() {
    console.log('Checking auth status...');
    
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      
      if (error) {
        console.error('Auth check error:', error);
        return { authenticated: false, user: null, error: error.message };
      }
      
      if (session?.user) {
        this.currentUser = session.user;
        console.log('User authenticated:', this.currentUser.email);
        return { authenticated: true, user: session.user };
      } else {
        console.log('User not authenticated');
        return { authenticated: false, user: null };
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      return { authenticated: false, user: null, error: error.message };
    }
  }

  async signIn(email, password) {
    console.log('Attempting sign in for:', email);
    
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });
      
      if (error) {
        console.error('Sign in error:', error);
        throw new Error(this.getReadableError(error));
      }
      
      if (data.user) {
        this.currentUser = data.user;
        console.log('Sign in successful:', this.currentUser.email);
        return { success: true, user: data.user };
      }
      
      throw new Error('Sign in failed - no user returned');
      
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async signUp(email, password) {
    console.log('Attempting sign up for:', email);
    
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email: email.trim(),
        password: password
      });
      
      if (error) {
        console.error('Sign up error:', error);
        throw new Error(this.getReadableError(error));
      }
      
      if (data.user) {
        this.currentUser = data.user;
        console.log('Sign up successful:', this.currentUser.email);
        
        // Check if email confirmation is required
        if (!data.session) {
          return { 
            success: true, 
            user: data.user, 
            needsConfirmation: true,
            message: 'Please check your email to confirm your account.' 
          };
        }
        
        return { success: true, user: data.user };
      }
      
      throw new Error('Sign up failed - no user returned');
      
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  getReadableError(error) {
    if (!error) return 'An unknown error occurred';
    
    const message = error.message || error.error_description || error.toString();
    
    // Map common Supabase errors to user-friendly messages
    if (message.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (message.includes('Email not confirmed')) {
      return 'Please check your email and click the confirmation link before signing in.';
    }
    if (message.includes('User already registered')) {
      return 'An account with this email already exists. Please sign in instead.';
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
    
    return message;
  }

  async checkSubscription() {
    try {
      const { data: subscription } = await this.supabase.functions.invoke('check-subscription');
      this.subscribed = subscription?.subscribed || false;
      return this.subscribed;
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  }

  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      
      this.currentUser = null;
      this.subscribed = false;
      console.log('Sign out successful');
      
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  }

  toggleAuthMode() {
    this.isSignInMode = !this.isSignInMode;
    console.log('Auth mode toggled to:', this.isSignInMode ? 'Sign In' : 'Sign Up');
    return this.isSignInMode;
  }

  onAuthStateChange(callback) {
    return this.supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      callback(event, session);
    });
  }
}
