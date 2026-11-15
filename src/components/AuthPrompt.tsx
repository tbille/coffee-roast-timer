/**
 * AuthPrompt Component
 * Inline authentication component for use within dialogs
 * Provides both Sign Up and Sign In functionality
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from "sonner";
import { useAuth } from '@/hooks/useAuth';

interface AuthPromptProps {
  onAuthSuccess: () => void;
}

export const AuthPrompt = ({ onAuthSuccess }: AuthPromptProps) => {
  const [activeTab, setActiveTab] = useState<'signup' | 'signin'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Missing fields", { description: "Please fill in both email and password." });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = activeTab === 'signup' 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        let errorMessage = error.message;
        
        // Handle common error cases with friendly messages
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Try signing in instead.';
          // Auto-switch to sign in tab
          setActiveTab('signin');
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before signing in.';
        }
        
        toast.error(activeTab === 'signup' ? "Sign up failed" : "Sign in failed", { description: errorMessage });
      } else {
        if (activeTab === 'signup') {
          toast.success("Account created", { description: "Please check your email to confirm your account, then sign in to save." });
          // Switch to sign in tab after successful signup
          setActiveTab('signin');
          setPassword(''); // Clear password for security
        } else {
          toast.message("Welcome back", { description: "Signing you in..." });
          // Call success callback - the parent will handle auto-save
          onAuthSuccess();
        }
      }
    } catch (error) {
      toast.error("An error occurred", { description: (error instanceof Error && error.message) || "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signup' | 'signin')} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
        <TabsTrigger value="signin">Sign In</TabsTrigger>
      </TabsList>
      
      <TabsContent value="signup">
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoComplete="email"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <Input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account & Save'}
          </Button>
        </form>
      </TabsContent>
      
      <TabsContent value="signin">
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="signin-email">Email</Label>
            <Input
              id="signin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoComplete="email"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="signin-password">Password</Label>
            <Input
              id="signin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In & Save'}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
};
