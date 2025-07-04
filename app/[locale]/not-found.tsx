"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Home, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8 text-center">
          {/* Error Icon */}
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              Page Not Found
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Sorry, we couldn't find the page you're looking for. It might have
              been moved, deleted, or you entered the wrong URL.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button onClick={handleGoBack} className="w-full" variant="default">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>

            <Button asChild className="w-full" variant="outline">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>

            <Button asChild className="w-full" variant="ghost">
              <Link href="/listings">
                <Search className="w-4 h-4 mr-2" />
                Browse Listings
              </Link>
            </Button>
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              Need help?{" "}
              <Link
                href="/contact"
                className="text-primary hover:underline font-medium"
              >
                Contact us
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
