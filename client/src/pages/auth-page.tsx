import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, loginSchema, type InsertUser, type LoginData } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Receipt, ArrowLeft } from "lucide-react";
import { Redirect } from "wouter";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { user, loginMutation, registerMutation } = useAuth();

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      fullName: "",
      email: "",
      username: "",
      password: "",
    },
  });

  const handleLogin = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const handleRegister = (data: InsertUser) => {
    registerMutation.mutate(data);
  };

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 items-center min-h-[calc(100vh-4rem)]">
          {/* Left Column - Form */}
          <div className="space-y-6">
            {!isLogin && (
              <Button
                variant="ghost"
                onClick={() => setIsLogin(true)}
                className="mb-4"
                data-testid="button-back-to-login"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Button>
            )}

            <div className="text-center md:text-left">
              <div className="mx-auto md:mx-0 h-16 w-16 bg-primary rounded-full flex items-center justify-center mb-6">
                <Receipt className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="text-muted-foreground mt-2">
                {isLogin 
                  ? "Sign in to your Smart Expense Scanner account" 
                  : "Start tracking your expenses today"
                }
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>
                  {isLogin ? "Sign In" : "Register"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLogin ? (
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your username" 
                                {...field} 
                                data-testid="input-login-username"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Enter your password" 
                                {...field} 
                                data-testid="input-login-password"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-3">
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={loginMutation.isPending}
                          data-testid="button-sign-in"
                        >
                          {loginMutation.isPending ? "Signing in..." : "Sign In"}
                        </Button>
                        
                        <Button
                          type="button"
                          variant="secondary"
                          className="w-full"
                          onClick={() => setIsLogin(false)}
                          data-testid="button-show-register"
                        >
                          Create Account
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your full name" 
                                {...field} 
                                data-testid="input-register-fullname"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email"
                                placeholder="Enter your email" 
                                {...field} 
                                data-testid="input-register-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Choose a username" 
                                {...field} 
                                data-testid="input-register-username"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Create a password" 
                                {...field} 
                                data-testid="input-register-password"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={registerMutation.isPending}
                        data-testid="button-create-account"
                      >
                        {registerMutation.isPending ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Hero */}
          <div className="hidden md:block">
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl p-8 backdrop-blur-sm">
                  <Receipt className="h-24 w-24 mx-auto text-primary mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Smart Expense Scanner</h2>
                  <p className="text-muted-foreground">
                    Transform your receipts into organized expense data with our intelligent OCR technology.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-card/50 p-4 rounded-lg border">
                  <h3 className="font-semibold mb-1">📱 Mobile Optimized</h3>
                  <p className="text-muted-foreground text-xs">
                    Scan receipts on the go with your phone camera
                  </p>
                </div>
                <div className="bg-card/50 p-4 rounded-lg border">
                  <h3 className="font-semibold mb-1">🤖 Smart OCR</h3>
                  <p className="text-muted-foreground text-xs">
                    Automatically extract vendor, items, and totals
                  </p>
                </div>
                <div className="bg-card/50 p-4 rounded-lg border">
                  <h3 className="font-semibold mb-1">📊 Analytics</h3>
                  <p className="text-muted-foreground text-xs">
                    Track spending patterns and categorize expenses
                  </p>
                </div>
                <div className="bg-card/50 p-4 rounded-lg border">
                  <h3 className="font-semibold mb-1">📄 Export</h3>
                  <p className="text-muted-foreground text-xs">
                    Download expense reports as Excel files
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
