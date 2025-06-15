
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getReadableError, checkUserExists, validateAuthForm } from '@/utils/authHelpers';

interface AuthFormProps {
  isSignIn: boolean;
  onToggleMode: () => void;
  onSuccess: () => void;
}

export const AuthForm = ({ isSignIn, onToggleMode, onSuccess }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const validationError = validateAuthForm(email, password);
    if (validationError) {
      toast({
        title: 'Error',
        description: validationError,
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
        onSuccess();
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
            onToggleMode();
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
        onToggleMode();
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

  const handleToggleMode = () => {
    onToggleMode();
    setEmail('');
    setPassword('');
  };

  return (
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
        onClick={handleToggleMode}
        className="w-full"
        disabled={loading}
      >
        {isSignIn ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
      </Button>
    </form>
  );
};
