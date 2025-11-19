"use client";

import { useState } from "react";
import Link from "next/link";
import { Briefcase, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function RecruiterLoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate form submission
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <Card className="border-primary/10 shadow-lg transition-all hover:shadow-primary/5">
      <CardHeader className="space-y-1 pb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 shadow-inner">
            <Briefcase className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-center text-3xl font-bold">Recruiter Login</CardTitle>
        <CardDescription className="text-center text-lg">Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 px-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                id="email" 
                type="email" 
                placeholder="name@company.com" 
                className="pl-10 transition-all focus:border-primary" 
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Link href="/recruiter/forgot-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                id="password" 
                type="password" 
                className="pl-10 transition-all focus:border-primary" 
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 px-6 pb-8 pt-2">
          <Button 
            className="w-full transition-all" 
            size="lg"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
          <Separator className="my-2" />
          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Link href="/recruiter/register" className="text-primary hover:underline font-medium transition-colors">
              Create a recruiter account
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
