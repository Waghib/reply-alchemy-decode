
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
      return { authenticated: false, user: null };
    }
  }

  async handleAuth(email, password, isSignUp = false) {
    try {
      let result;
      
      if (isSignUp) {
        result = await this.supabase.auth.signUp({
          email: email,
          password: password
        });
      } else {
        result = await this.supabase.auth.signInWithPassword({
          email: email,
          password: password
        });
      }
      
      if (result.error) {
        if (!isSignUp && result.error.message.includes('Invalid login credentials')) {
          // Try sign up if sign in failed
          return await this.handleAuth(email, password, true);
        }
        throw result.error;
      }
      
      if (result.data.user) {
        this.currentUser = result.data.user;
        return { success: true, user: result.data.user };
      }
      
    } catch (error) {
      console.error('Auth error:', error);
      throw error;
    }
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
    await this.supabase.auth.signOut();
    this.currentUser = null;
    this.subscribed = false;
  }

  toggleAuthMode() {
    this.isSignInMode = !this.isSignInMode;
    return this.isSignInMode;
  }

  onAuthStateChange(callback) {
    return this.supabase.auth.onAuthStateChange(callback);
  }
}
