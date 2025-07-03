"use client";

import { useState } from "react";
import { useTranslation } from "next-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Loader2,
  Mail,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { resetPasswordSchema } from "@/lib/validations";
import type { ResetPasswordCredentials } from "@/lib/types";

interface ForgotPasswordFormProps {
  className?: string;
}

export function ForgotPasswordForm({ className }: ForgotPasswordFormProps) {
  const { t } = useTranslation(["auth", "common"]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string>("");

  const form = useForm<ResetPasswordCredentials>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ResetPasswordCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        setError(
          result.error?.message || t("auth:errors.forgot_password_failed")
        );
      } else {
        setSubmittedEmail(data.email);
        setIsSuccess(true);
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(t("auth:errors.generic"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!submittedEmail) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: submittedEmail }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error?.message || t("auth:errors.resend_failed"));
      }
    } catch (err) {
      console.error("Resend email error:", err);
      setError(t("auth:errors.generic"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToForm = () => {
    setIsSuccess(false);
    setSubmittedEmail("");
    setError(null);
    form.reset();
  };

  if (isSuccess) {
    return (
      <Card className={cn("w-full max-w-md", className)}>
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {t("auth:forgot_password.success_title")}
          </CardTitle>
          <CardDescription>
            {t("auth:forgot_password.success_description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-center">
              {t("auth:forgot_password.email_sent_to")}{" "}
              <span className="font-medium text-foreground">
                {submittedEmail}
              </span>
            </p>
          </div>

          <div className="text-center text-sm space-y-2">
            <p className="text-muted-foreground">
              {t("auth:forgot_password.check_email_instruction")}
            </p>
            <p className="text-muted-foreground">
              {t("auth:forgot_password.check_spam")}
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleResendEmail}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Send className="mr-2 h-4 w-4" />
              {t("auth:forgot_password.resend_email")}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={handleBackToForm}
              disabled={isLoading}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("auth:forgot_password.try_another_email")}
            </Button>
          </div>

          <div className="text-center">
            <Link
              href="/auth/signin"
              className="text-sm text-primary hover:underline"
            >
              {t("auth:forgot_password.back_to_signin")}
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {t("auth:forgot_password.title")}
        </CardTitle>
        <CardDescription className="text-center">
          {t("auth:forgot_password.description")}
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth:fields.email")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type="email"
                        placeholder={t("auth:placeholders.email")}
                        className="pl-10"
                        disabled={isLoading}
                        autoComplete="email"
                        autoFocus
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Send className="mr-2 h-4 w-4" />
              {t("auth:forgot_password.submit")}
            </Button>
          </form>
        </Form>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            {t("auth:forgot_password.remember_password")}{" "}
            <Link
              href="/auth/signin"
              className="font-medium text-primary hover:underline"
            >
              {t("auth:forgot_password.back_to_signin")}
            </Link>
          </p>

          <p className="text-sm text-muted-foreground">
            {t("auth:forgot_password.no_account")}{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-primary hover:underline"
            >
              {t("auth:forgot_password.create_account")}
            </Link>
          </p>
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="text-sm font-medium mb-2">
            {t("auth:forgot_password.help_title")}
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• {t("auth:forgot_password.help_1")}</li>
            <li>• {t("auth:forgot_password.help_2")}</li>
            <li>• {t("auth:forgot_password.help_3")}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
