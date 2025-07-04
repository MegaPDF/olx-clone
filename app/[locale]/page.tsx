"use client";

import { useTranslations } from "next-intl";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  TrendingUp,
  Users,
  ShoppingBag,
  Heart,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

interface HomePageProps {
  params: { locale: string };
}

export default function HomePage({ params: { locale } }: HomePageProps) {
  const t = useTranslations("home");
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/listings?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const categories = [
    { name: "Electronics", href: "/listings/electronics", icon: "📱" },
    { name: "Vehicles", href: "/listings/vehicles", icon: "🚗" },
    { name: "Home & Garden", href: "/listings/home-garden", icon: "🏠" },
    { name: "Fashion", href: "/listings/fashion", icon: "👕" },
    { name: "Sports", href: "/listings/sports", icon: "⚽" },
    { name: "Books", href: "/listings/books", icon: "📚" },
  ];

  const stats = [
    { icon: Users, value: "10K+", label: "Active Users" },
    { icon: ShoppingBag, value: "50K+", label: "Total Listings" },
    { icon: TrendingUp, value: "95%", label: "Satisfaction Rate" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        showSearch={true}
        showCreateButton={true}
        showNotifications={true}
      />

      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <Badge variant="secondary" className="mb-6 px-4 py-2">
                <TrendingUp className="w-4 h-4 mr-2" />
                Trusted by thousands
              </Badge>

              {/* Main Heading */}
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Buy & Sell
                </span>
                <br />
                <span className="text-foreground">Everything Locally</span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Discover amazing deals in your neighborhood. From electronics to
                vehicles, find everything you need or sell what you don't.
              </p>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="mb-8">
                <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="What are you looking for?"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-14 text-lg rounded-xl border-2 focus:border-primary"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="h-14 px-8 rounded-xl font-semibold text-lg"
                  >
                    Search
                  </Button>
                </div>
              </form>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto mb-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-full mb-3">
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="rounded-xl px-8"
                  onClick={() => router.push("/listings")}
                >
                  Browse Listings
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl px-8"
                  onClick={() => router.push("/create-listing")}
                >
                  Start Selling
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Categories */}
        <section className="py-12 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Popular Categories
              </h2>
              <p className="text-lg text-muted-foreground">
                Browse items by category
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 max-w-4xl mx-auto">
              {categories.map((category, index) => (
                <Link key={index} href={category.href}>
                  <Card className="p-6 text-center hover:shadow-md transition-all duration-200 hover:scale-105">
                    <div className="text-4xl mb-3">{category.icon}</div>
                    <h3 className="font-medium text-sm">{category.name}</h3>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                How It Works
              </h2>
              <p className="text-lg text-muted-foreground">
                Simple steps to buy and sell
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  1. Search & Browse
                </h3>
                <p className="text-muted-foreground">
                  Find what you need from thousands of listings in your area
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  2. Connect & Chat
                </h3>
                <p className="text-muted-foreground">
                  Contact sellers directly and arrange meetups safely
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">3. Buy or Sell</h3>
                <p className="text-muted-foreground">
                  Complete your transaction and leave reviews
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter/CTA Section */}
        <section className="py-12 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of users buying and selling locally
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="px-8"
                onClick={() => router.push("/auth/signup")}
              >
                Sign Up Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                onClick={() => router.push("/listings")}
              >
                Browse Listings
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Simple Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Marketplace</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-foreground">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-foreground">
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Categories</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/listings/electronics"
                    className="hover:text-foreground"
                  >
                    Electronics
                  </Link>
                </li>
                <li>
                  <Link
                    href="/listings/vehicles"
                    className="hover:text-foreground"
                  >
                    Vehicles
                  </Link>
                </li>
                <li>
                  <Link
                    href="/listings/home-garden"
                    className="hover:text-foreground"
                  >
                    Home & Garden
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/safety" className="hover:text-foreground">
                    Safety Tips
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/blog" className="hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/newsletter" className="hover:text-foreground">
                    Newsletter
                  </Link>
                </li>
                <li>
                  <Link href="/social" className="hover:text-foreground">
                    Social Media
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Marketplace. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
