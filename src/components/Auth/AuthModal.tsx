import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getReadableError = (error: any) => {
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

  const checkUserExists = async (email: string) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please enter both email and password.',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (isSignIn) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        
        toast({ 
          title: 'Welcome back!', 
          description: 'You have successfully signed in.' 
        });
        onOpenChange(false);
        setEmail('');
        setPassword('');
      } else {
        // Check if user already exists before attempting signup
        const userExists = await checkUserExists(email);
        
        if (userExists) {
          toast({
            title: 'Account Already Exists',
            description: 'An account with this email already exists. Please sign in instead.',
            variant: 'destructive',
          });
          
          // Switch to sign in mode
          setTimeout(() => {
            setIsSignIn(true);
            setPassword('');
            toast({
              title: 'Switched to Sign In',
              description: 'Please enter your password to sign in.',
            });
          }, 2000);
          
          return;
        }

        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        
        toast({ 
          title: 'Account created!', 
          description: 'Check your email to confirm your account before signing in.' 
        });
        
        // Switch to sign in mode after successful signup
        setIsSignIn(true);
        setEmail('');
        setPassword('');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      const errorMessage = getReadableError(error);
      
      toast({
        title: isSignIn ? 'Sign In Failed' : 'Sign Up Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isSignIn ? 'Sign In' : 'Create Account'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
              minLength={6}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Loading...' : (isSignIn ? 'Sign In' : 'Create Account')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setIsSignIn(!isSignIn);
              setEmail('');
              setPassword('');
            }}
            className="w-full"
            disabled={loading}
          >
            {isSignIn ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
