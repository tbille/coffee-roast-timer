import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { pageTitle } from '@/components/PageTitle';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { useAuth } from '@/hooks/useAuth';

/** Only same-site paths are allowed as a redirect target (no "//host" or absolute URLs). */
const safeNext = (value: string | null) =>
  value && value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\') ? value : '/roasts';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = safeNext(searchParams.get('next'));

  // Redirect once signed in (or if already signed in) to where the user was going.
  useEffect(() => {
    if (user) {
      navigate(next, { replace: true });
    }
  }, [user, navigate, next]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Missing fields", { description: "Please fill in both email and password." });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        let errorMessage = error.message;
        
        // Handle common error cases with friendly messages
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Try signing in instead.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before signing in.';
        }
        
        toast.error(isSignUp ? "Sign up failed" : "Sign in failed", { description: errorMessage });
      } else {
        if (isSignUp) {
          toast.success("Account created", { description: "Please check your email to confirm your account." });
        } else {
          toast.message("Welcome back", { description: "You have been signed in successfully." });
        }
      }
    } catch (error) {
      toast.error("An error occurred", { description: (error instanceof Error && error.message) || "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle(isSignUp ? 'Create an account' : 'Sign in')}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="mx-auto w-full max-w-md px-4 py-10 sm:px-6 md:py-16">
        <PageHeader
          title={isSignUp ? 'Create an account' : 'Sign in'}
          description="Sign in to sync your roasts across devices and share them on Discover."
        />

        <div className="rounded-lg border bg-card p-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="h-11 w-full" disabled={loading}>
              {loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {isSignUp ? 'Already have an account?' : 'New here?'}{' '}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {isSignUp ? 'Sign in' : 'Create a free account'}
            </button>
          </p>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          No account needed to roast: the timer and the post-roast card work without one, and roasts stay on this
          device until you sign in.{' '}
          <Link to="/roast" className="font-medium text-primary underline-offset-4 hover:underline">
            Start a roast
          </Link>
        </p>
      </div>
    </>
  );
};

export default Auth;
