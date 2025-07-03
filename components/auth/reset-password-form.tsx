"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// Progress component inline since it might not exist in UI components
const Progress = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => (
  <div className={cn("w-full bg-muted rounded-full", className)}>
    <div
      className={cn(
        "h-full rounded-full transition-all duration-300",
        value < 40
          ? "bg-red-500"
          : value < 60
          ? "bg-orange-500"
          : value < 80
          ? "bg-yellow-500"
          : "bg-green-500"
      )}
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);
import {
  Loader2,
  Lock,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { newPasswordSchema } from "@/lib/validations";
import type { NewPasswordCredentials } from "@/lib/types";

interface ResetPasswordFormProps {
  className?: string;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  isValid: boolean;
}

export function ResetPasswordForm({ className }: ResetPasswordFormProps) {
  const { t } = useTranslation(["auth", "common"]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    isValid: false,
  });

  const token = searchParams.get("token");

  const form = useForm<NewPasswordCredentials>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      token: token || "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = form.watch("password");

  useEffect(() => {
    if (!token) {
      setError(t("auth:reset_password.invalid_token"));
    }
  }, [token, t]);

  useEffect(() => {
    if (password) {
      const strength = calculatePasswordStrength(password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({ score: 0, feedback: [], isValid: false });
    }
  }, [password]);

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    const feedback: string[] = [];

    // Length check
    if (password.length >= 8) {
      score += 20;
    } else {
      feedback.push(t("auth:password_strength.min_length"));
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 20;
    } else {
      feedback.push(t("auth:password_strength.uppercase"));
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 20;
    } else {
      feedback.push(t("auth:password_strength.lowercase"));
    }

    // Number check
    if (/\d/.test(password)) {
      score += 20;
    } else {
      feedback.push(t("auth:password_strength.number"));
    }

    // Special character check
    if (/[^A-Za-z0-9]/.test(password)) {
      score += 20;
    } else {
      feedback.push(t("auth:password_strength.special_char"));
    }

    return {
      score,
      feedback,
      isValid: score >= 80,
    };
  };

  const getStrengthColor = (score: number): string => {
    if (score < 40) return "bg-red-500";
    if (score < 60) return "bg-orange-500";
    if (score < 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = (score: number): string => {
    if (score < 40) return t("auth:password_strength.weak");
    if (score < 60) return t("auth:password_strength.fair");
    if (score < 80) return t("auth:password_strength.good");
    return t("auth:password_strength.strong");
  };

  const onSubmit = async (data: NewPasswordCredentials) => {
    if (!token) {
      setError(t("auth:reset_password.invalid_token"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          token,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(
          result.error?.message || t("auth:errors.reset_password_failed")
        );
      } else {
        setIsSuccess(true);
        // Redirect to sign in after 3 seconds
        setTimeout(() => {
          router.push("/auth/signin?message=password_reset_success");
        }, 3000);
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setError(t("auth:errors.generic"));
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <Card className={cn("w-full max-w-md", className)}>
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {t("auth:reset_password.invalid_link_title")}
          </CardTitle>
          <CardDescription>
            {t("auth:reset_password.invalid_link_description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/auth/forgot-password">
              {t("auth:reset_password.request_new_link")}
            </Link>
          </Button>
          <div className="text-center">
            <Link
              href="/auth/signin"
              className="text-sm text-primary hover:underline"
            >
              {t("auth:reset_password.back_to_signin")}
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isSuccess) {
    return (
      <Card className={cn("w-full max-w-md", className)}>
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {t("auth:reset_password.success_title")}
          </CardTitle>
          <CardDescription>
            {t("auth:reset_password.success_description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/auth/signin">
              {t("auth:reset_password.continue_signin")}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {t("auth:reset_password.title")}
        </CardTitle>
        <CardDescription className="text-center">
          {t("auth:reset_password.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth:fields.new_password")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder={t("auth:placeholders.new_password")}
                        className="pl-10 pr-10"
                        disabled={isLoading}
                        autoComplete="new-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {password && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("auth:password_strength.label")}
                  </span>
                  <span
                    className={cn(
                      "font-medium",
                      passwordStrength.score < 40
                        ? "text-red-600"
                        : passwordStrength.score < 60
                        ? "text-orange-600"
                        : passwordStrength.score < 80
                        ? "text-yellow-600"
                        : "text-green-600"
                    )}
                  >
                    {getStrengthText(passwordStrength.score)}
                  </span>
                </div>
                <Progress value={passwordStrength.score} className="h-2" />
                {passwordStrength.feedback.length > 0 && (
                  <div className="space-y-1">
                    {passwordStrength.feedback.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 text-xs"
                      >
                        <X className="h-3 w-3 text-red-500" />
                        <span className="text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                )}
                {passwordStrength.isValid && (
                  <div className="flex items-center space-x-2 text-xs">
                    <Check className="h-3 w-3 text-green-500" />
                    <span className="text-green-600">
                      {t("auth:password_strength.requirements_met")}
                    </span>
                  </div>
                )}
              </div>
            )}

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth:fields.confirm_password")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder={t("auth:placeholders.confirm_password")}
                        className="pl-10 pr-10"
                        disabled={isLoading}
                        autoComplete="new-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !passwordStrength.isValid}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("auth:reset_password.submit")}
            </Button>
          </form>
        </Form>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            {t("auth:reset_password.remember_password")}{" "}
            <Link
              href="/auth/signin"
              className="font-medium text-primary hover:underline"
            >
              {t("auth:reset_password.back_to_signin")}
            </Link>
          </p>
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="text-sm font-medium mb-2">
            {t("auth:password_strength.tips_title")}
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• {t("auth:password_strength.tip_1")}</li>
            <li>• {t("auth:password_strength.tip_2")}</li>
            <li>• {t("auth:password_strength.tip_3")}</li>
            <li>• {t("auth:password_strength.tip_4")}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
