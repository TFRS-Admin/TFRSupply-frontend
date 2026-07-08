import React, { useState, type FormEvent, type ComponentType, type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes, type LabelHTMLAttributes } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button as ButtonUntyped } from "@/components/ui/button";
import { Input as InputUntyped } from "@/components/ui/input";
import { Label as LabelUntyped } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import AuthLayoutUntyped from "@/components/AuthLayout";

// The shared ui/* kit and AuthLayout are untyped .jsx — cast to locally
// declared prop shapes rather than editing the shared components.
const Button = ButtonUntyped as ComponentType<ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }>;
const Input = InputUntyped as ComponentType<InputHTMLAttributes<HTMLInputElement>>;
const Label = LabelUntyped as ComponentType<LabelHTMLAttributes<HTMLLabelElement>>;
const AuthLayout = AuthLayoutUntyped as ComponentType<{
  icon: ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  children?: ReactNode;
}>;

export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestPasswordReset(email);
    } catch {
      // Always show success regardless
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <AuthLayout
      icon={Mail}
      title="Reset password"
      subtitle="We'll send you a link to reset it"
      footer={
        <Link to="/login" className="text-primary font-medium hover:underline">
          <ArrowLeft className="w-3 h-3 inline mr-1" />Back to log in
        </Link>
      }
    >
      {sent ? (
        <p className="text-sm text-foreground text-center">
          If an account exists with that email, you'll receive a password reset link shortly.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              "Send reset link"
            )}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
