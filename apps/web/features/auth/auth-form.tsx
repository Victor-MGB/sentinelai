'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CircleCheck, Lock, Mail, User } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type AuthFormProps = {
  mode: 'login' | 'signup';
};

export function AuthForm({ mode }: AuthFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const isLogin = mode === 'login';

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          {isLogin ? 'Sign in to SentinelAI' : 'Create your workspace'}
        </CardTitle>
        <CardDescription>
          {isLogin
            ? 'Use your work email to access your incident workspace.'
            : 'Start with a free workspace. No credit card required.'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {!isLogin ? (
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <div className="relative">
                <User
                  className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                  aria-hidden="true"
                />
                <Input
                  id="name"
                  name="name"
                  autoComplete="name"
                  placeholder="Ada Lovelace"
                  className="pl-9"
                  required
                />
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="email">Work email</Label>
            <div className="relative">
              <Mail
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                className="pl-9"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {isLogin ? (
                <Link href="#" className="text-muted-foreground hover:text-foreground text-xs">
                  Forgot password?
                </Link>
              ) : null}
            </div>
            <div className="relative">
              <Lock
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                placeholder="••••••••••"
                className="pl-9"
                minLength={12}
                required
              />
            </div>
            {!isLogin ? (
              <p className="text-muted-foreground text-xs">
                At least 12 characters. Use a password manager.
              </p>
            ) : null}
          </div>

          {submitted ? (
            <Alert>
              <CircleCheck aria-hidden="true" />
              <AlertTitle>
                {isLogin ? 'Credentials submitted' : 'Workspace request received'}
              </AlertTitle>
              <AlertDescription>
                Authentication is not connected in this frontend preview. Use the demo workspace to
                explore the application shell.
              </AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-3">
          <Button type="submit" className="w-full">
            {isLogin ? 'Sign in' : 'Create account'}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
          {isLogin ? (
            <>
              <p className="text-muted-foreground text-center text-xs">
                New to SentinelAI?{' '}
                <Link href="/signup" className="text-foreground font-medium hover:underline">
                  Create an account
                </Link>
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/app/acme">Continue to demo workspace</Link>
              </Button>
            </>
          ) : (
            <p className="text-muted-foreground text-center text-xs">
              Already have an account?{' '}
              <Link href="/login" className="text-foreground font-medium hover:underline">
                Sign in
              </Link>
            </p>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
