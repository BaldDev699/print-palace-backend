
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '', 
    fullName: '' 
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check URL params for redirect
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect');
        const from = urlParams.get('from');
        
        if (redirect === 'manufacturers' && from === 'manufacturers') {
          navigate('/manufacturers?from=auth');
        } else {
          navigate('/');
        }
      }
    };
    checkUser();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please try again.');
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (data.user) {
        toast.success('Welcome back!');
        // Check URL params for redirect after login
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect');
        const from = urlParams.get('from');
        
        if (redirect === 'manufacturers' && from === 'manufacturers') {
          navigate('/manufacturers?from=auth');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupForm.password !== signupForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (signupForm.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupForm.email,
        password: signupForm.password,
        options: {
          data: {
            full_name: signupForm.fullName,
          }
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          toast.error('This email is already registered. Please try logging in instead.');
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (data.user) {
        toast.success('Account created successfully! You can now start designing.');
        // Check URL params for redirect after signup
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect');
        const from = urlParams.get('from');
        
        if (redirect === 'manufacturers' && from === 'manufacturers') {
          navigate('/manufacturers?from=auth');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">roge</h1>
          <p className="text-muted-foreground">Join the creative community</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>
                  Sign in to access your saved designs and continue creating.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  Join roge to save your designs and access premium features.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSignup}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Your full name"
                      value={signupForm.fullName}
                      onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="At least 6 characters"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Confirm Password</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="Confirm your password"
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthPage;
