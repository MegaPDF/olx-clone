"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { signInSchema } from "@/lib/validations";
import { OAuthButtons } from "./oauth-buttons";
import type { SignInCredentials } from "@/lib/types";

interface SignInFormProps {
  className?: string;
  redirectTo?: string;
}

export function SignInForm({ className, redirectTo }: SignInFormProps) {
  const t = useTranslations("listings"); // CHANGED
  const locale = useLocale(); // CHANGED
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const callbackUrl = redirectTo || searchParams.get("callbackUrl") || "/";
  const errorParam = searchParams.get("error");

  const form = useForm<SignInCredentials>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (data: SignInCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError(getErrorMessage(result.error));
      } else if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      console.error("Sign in error:", err);
      setError(t("auth:errors.generic"));
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (error: string): string => {
    const errorMap: Record<string, string> = {
      CredentialsSignin: t("auth:errors.invalid_credentials"),
      OAuthSignin: t("auth:errors.oauth_signin"),
      OAuthCallback: t("auth:errors.oauth_callback"),
      OAuthCreateAccount: t("auth:errors.oauth_create_account"),
      EmailCreateAccount: t("auth:errors.email_create_account"),
      Callback: t("auth:errors.callback"),
      OAuthAccountNotLinked: t("auth:errors.oauth_account_not_linked"),
      SessionRequired: t("auth:errors.session_required"),
    };

    return errorMap[error] || t("auth:errors.generic");
  };

  // Show error from URL params (redirected from OAuth or other errors)
  const urlError = errorParam ? getErrorMessage(errorParam) : null;

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {t("auth:signin.title")}
        </CardTitle>
        <CardDescription className="text-center">
          {t("auth:signin.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {(error || urlError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || urlError}</AlertDescription>
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
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    {t("auth:fields.password")}
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      {t("auth:signin.forgot_password")}
                    </Link>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder={t("auth:placeholders.password")}
                        className="pl-10 pr-10"
                        disabled={isLoading}
                        autoComplete="current-password"
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

            <FormField
              control={form.control}
              name="remember"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-normal">
                      {t("auth:signin.remember_me")}
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("auth:signin.submit")}
            </Button>
          </form>
        </Form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {t("auth:or")}
            </span>
          </div>
        </div>

        <OAuthButtons
          action="signin"
          isLoading={isLoading}
          onLoadingChange={setIsLoading}
          callbackUrl={callbackUrl}
        />

        <div className="text-center text-sm">
          <span className="text-muted-foreground">
            {t("auth:signin.no_account")}{" "}
          </span>
          <Link
            href="/auth/signup"
            className="font-medium text-primary hover:underline"
          >
            {t("auth:signin.create_account")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
