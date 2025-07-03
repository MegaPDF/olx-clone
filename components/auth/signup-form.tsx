"use client";

import { useState } from "react";
import { useTranslation } from "next-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signUpSchema } from "@/lib/validations";
import { signUpAction } from "@/lib/actions/auth";
import { OAuthButtons } from "./oauth-buttons";
import type { SignUpCredentials } from "@/lib/types";

interface SignUpFormProps {
  className?: string;
  redirectTo?: string;
}

export function SignUpForm({ className, redirectTo }: SignUpFormProps) {
  const { t } = useTranslation(["auth", "common"]);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<"basic" | "location" | "preferences">(
    "basic"
  );

  const form = useForm<SignUpCredentials>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      location: {
        address: "",
        city: "",
        state: "",
        country: "",
        coordinates: {
          latitude: 0,
          longitude: 0,
        },
      },
      acceptTerms: false,
      newsletter: false,
    },
    mode: "onChange",
  });

  const onSubmit = async (data: SignUpCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "location") {
          Object.entries(value).forEach(([locKey, locValue]) => {
            if (locKey === "coordinates") {
              const coordinates = locValue as { latitude: number; longitude: number };
              formData.append("latitude", coordinates.latitude.toString());
              formData.append("longitude", coordinates.longitude.toString());
            } else {
              formData.append(locKey, locValue as string);
            }
          });
        } else if (typeof value === "boolean") {
          formData.append(key, value ? "on" : "");
        } else {
          formData.append(key, value as string);
        }
      });

      const result = await signUpAction(formData);

      if (!result.success) {
        setError(result.errors?.[0]?.message || t("auth:errors.signup_failed"));
      } else {
        // Auto sign in after successful registration
        const signInResult = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (signInResult?.ok) {
          router.push(redirectTo || "/auth/verify-email");
        } else {
          router.push("/auth/signin?message=registration_success");
        }
      }
    } catch (err) {
      console.error("Sign up error:", err);
      setError(t("auth:errors.generic"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    const fieldsToValidate =
      step === "basic"
        ? ["name", "email", "password", "confirmPassword"]
        : step === "location"
        ? [
            "location.address",
            "location.city",
            "location.state",
            "location.country",
          ]
        : [];

    const isValid = await form.trigger(fieldsToValidate as any);

    if (isValid) {
      if (step === "basic") {
        setStep("location");
      } else if (step === "location") {
        setStep("preferences");
      }
    }
  };

  const handlePrevious = () => {
    if (step === "preferences") {
      setStep("location");
    } else if (step === "location") {
      setStep("basic");
    }
  };

  const getCurrentStepIndex = () => {
    switch (step) {
      case "basic":
        return 0;
      case "location":
        return 1;
      case "preferences":
        return 2;
      default:
        return 0;
    }
  };

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {t("auth:signup.title")}
        </CardTitle>
        <CardDescription className="text-center">
          {t("auth:signup.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-6">
          {["basic", "location", "preferences"].map((stepName, index) => (
            <div key={stepName} className="flex items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2",
                  index <= getCurrentStepIndex()
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-muted"
                )}
              >
                {index < getCurrentStepIndex() ? (
                  <Check className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < 2 && (
                <div
                  className={cn(
                    "h-0.5 w-16 mx-2",
                    index < getCurrentStepIndex() ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {step === "basic" && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("auth:fields.name")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            placeholder={t("auth:placeholders.name")}
                            className="pl-10"
                            disabled={isLoading}
                            autoComplete="name"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                      <FormLabel>{t("auth:fields.password")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder={t("auth:placeholders.password")}
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
                            placeholder={t(
                              "auth:placeholders.confirm_password"
                            )}
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
              </div>
            )}

            {step === "location" && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="location.address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("auth:fields.address")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            placeholder={t("auth:placeholders.address")}
                            className="pl-10"
                            disabled={isLoading}
                            autoComplete="street-address"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("auth:fields.city")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t("auth:placeholders.city")}
                            disabled={isLoading}
                            autoComplete="address-level2"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("auth:fields.state")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t("auth:placeholders.state")}
                            disabled={isLoading}
                            autoComplete="address-level1"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="location.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("auth:fields.country")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("auth:placeholders.country")}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Indonesia">Indonesia</SelectItem>
                          <SelectItem value="United States">
                            United States
                          </SelectItem>
                          <SelectItem value="Malaysia">Malaysia</SelectItem>
                          <SelectItem value="Singapore">Singapore</SelectItem>
                          <SelectItem value="Thailand">Thailand</SelectItem>
                          <SelectItem value="Philippines">
                            Philippines
                          </SelectItem>
                          <SelectItem value="Vietnam">Vietnam</SelectItem>
                          <SelectItem value="Australia">Australia</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {step === "preferences" && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="acceptTerms"
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
                        <FormLabel className="text-sm">
                          {t("auth:signup.accept_terms_prefix")}{" "}
                          <Link
                            href="/terms"
                            className="text-primary hover:underline"
                          >
                            {t("auth:signup.terms_of_service")}
                          </Link>{" "}
                          {t("auth:signup.and")}{" "}
                          <Link
                            href="/privacy"
                            className="text-primary hover:underline"
                          >
                            {t("auth:signup.privacy_policy")}
                          </Link>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newsletter"
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
                          {t("auth:signup.subscribe_newsletter")}
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="flex gap-4 pt-4">
              {step !== "basic" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {t("common:previous")}
                </Button>
              )}

              {step !== "preferences" ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {t("common:next")}
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading || !form.watch("acceptTerms")}
                  className="flex-1"
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t("auth:signup.submit")}
                </Button>
              )}
            </div>
          </form>
        </Form>

        {step === "basic" && (
          <>
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
              action="signup"
              isLoading={isLoading}
              onLoadingChange={setIsLoading}
              callbackUrl={redirectTo || "/"}
            />
          </>
        )}

        <div className="text-center text-sm">
          <span className="text-muted-foreground">
            {t("auth:signup.already_have_account")}{" "}
          </span>
          <Link
            href="/auth/signin"
            className="font-medium text-primary hover:underline"
          >
            {t("auth:signup.sign_in")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
