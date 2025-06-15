
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AuthForm } from './AuthForm';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  const [isSignIn, setIsSignIn] = useState(true);

  const handleSuccess = () => {
    onOpenChange(false);
  };

  const handleToggleMode = () => {
    setIsSignIn(!isSignIn);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isSignIn ? 'Sign In' : 'Create Account'}
          </DialogTitle>
        </DialogHeader>
        <AuthForm 
          isSignIn={isSignIn}
          onToggleMode={handleToggleMode}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};
