"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "next-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Save,
  Upload,
  MapPin,
  DollarSign,
  Package,
  AlertCircle,
  CheckCircle,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CategorySelector } from "./category-selector";
import { ConditionFilter } from "./condition-filter";
import { LocationFilter } from "./location-filter";
import { ListingImages } from "./listing-images";
import type { CreateListing, UpdateListing, ListingDetail } from "@/lib/types";
import * as z from "zod";

const listingSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(2000),
  price: z.object({
    amount: z.number().min(0),
    currency: z.string(),
    negotiable: z.boolean().optional(),
  }),
  category: z.string().min(1),
  condition: z.enum(["new", "like-new", "good", "fair", "poor"]),
  location: z.object({
    address: z.string().min(5),
    city: z.string().min(2),
    state: z.string().min(2),
    country: z.string().min(2),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }),
  }),
  images: z.array(z.string()).min(1).max(10),
});

type FormData = z.infer<typeof listingSchema>;

interface ListingFormProps {
  listing?: ListingDetail;
  onSubmit: (data: CreateListing | UpdateListing) => Promise<void>;
  onSaveDraft?: (data: Partial<CreateListing>) => Promise<void>;
  mode?: "create" | "edit";
  loading?: boolean;
  className?: string;
}

export function ListingForm({
  listing,
  onSubmit,
  onSaveDraft,
  mode = "create",
  loading = false,
  className,
}: ListingFormProps) {
  const { t, i18n } = useTranslation(["listings", "common"]);
  const [images, setImages] = useState<string[]>(listing?.images || []);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDraft, setIsDraft] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: listing?.title || "",
      description: listing?.description || "",
      price: {
        amount: listing?.price.amount || 0,
        currency: listing?.price.currency || "USD",
        negotiable: listing?.price.negotiable || false,
      },
      category: listing?.category.id || "",
      condition: listing?.condition || "good",
      location: listing?.location || {
        address: "",
        city: "",
        state: "",
        country: "Indonesia",
        coordinates: { latitude: 0, longitude: 0 },
      },
      images: listing?.images || [],
    },
  });

  const { watch, setValue } = form;
  const watchedFields = watch();

  // Update images in form when images state changes
  useEffect(() => {
    setValue("images", images);
  }, [images, setValue]);

  // Calculate form completion percentage
  const getCompletionPercentage = () => {
    const fields = [
      watchedFields.title,
      watchedFields.description,
      watchedFields.price.amount > 0,
      watchedFields.category,
      watchedFields.condition,
      watchedFields.location.city,
      images.length > 0,
    ];

    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  const handleSubmit = async (data: FormData) => {
    try {
      if (mode === "edit" && listing) {
        await onSubmit({ ...data, id: listing.id } as UpdateListing);
      } else {
        await onSubmit(data as CreateListing);
      }
    } catch (error) {
      console.error("Failed to submit listing:", error);
    }
  };

  const handleSaveDraft = async () => {
    if (!onSaveDraft) return;

    setIsDraft(true);
    try {
      await onSaveDraft(watchedFields as Partial<CreateListing>);
    } finally {
      setIsDraft(false);
    }
  };

  const handleImageUpload = async (files: File[]) => {
    // Simulate upload progress
    setUploadProgress(0);

    const uploadPromises = files.map(async (file, index) => {
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update progress
      setUploadProgress(((index + 1) / files.length) * 100);

      // Return mock URL (in real app, upload to your storage service)
      return URL.createObjectURL(file);
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    setImages((prev) => [...prev, ...uploadedUrls]);
    setUploadProgress(0);
  };

  const completionPercentage = getCompletionPercentage();

  if (previewMode) {
    // Show preview of listing
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t("listings:preview")}</h2>
          <Button variant="outline" onClick={() => setPreviewMode(false)}>
            <Eye className="h-4 w-4 mr-2" />
            {t("listings:editMode")}
          </Button>
        </div>

        {/* Preview implementation would go here */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t("listings:previewDescription")}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Progress indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {t("listings:completionProgress")}
            </span>
            <span className="text-sm text-muted-foreground">
              {completionPercentage}%
            </span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                {t("listings:photos")}
                <span className="text-sm font-normal text-muted-foreground">
                  ({images.length}/10)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ListingImages
                images={images}
                onImagesChange={setImages}
                onUpload={handleImageUpload}
                uploadProgress={uploadProgress}
                editable={true}
                maxImages={10}
              />
              <FormMessage />
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t("listings:basicInformation")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("listings:title")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("listings:titlePlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t("listings:titleDescription")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("listings:description")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("listings:descriptionPlaceholder")}
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value.length}/2000 {t("common:characters")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("listings:category")}</FormLabel>
                    <FormControl>
                      <CategorySelector
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder={t("listings:selectCategory")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("listings:condition.label")}</FormLabel>
                    <FormControl>
                      <ConditionFilter
                        value={field.value ? [field.value] : []}
                        onValueChange={(values) => field.onChange(values[0])}
                        variant="grid"
                        showIcons={true}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Price */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                {t("listings:pricing")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price.amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("listings:price")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price.currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("listings:currency")}</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          {...field}
                        >
                          <option value="USD">USD ($)</option>
                          <option value="IDR">IDR (Rp)</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="price.negotiable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{t("listings:negotiable")}</FormLabel>
                      <FormDescription>
                        {t("listings:negotiableDescription")}
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {t("listings:location")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("listings:selectLocation")}</FormLabel>
                    <FormControl>
                      <LocationFilter
                        value={field.value}
                        onValueChange={field.onChange}
                        variant="form"
                        showMap={true}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {onSaveDraft && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={loading || isDraft}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isDraft ? t("common:saving") : t("listings:saveDraft")}
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => setPreviewMode(true)}
                disabled={completionPercentage < 70}
              >
                <Eye className="h-4 w-4 mr-2" />
                {t("listings:preview")}
              </Button>
            </div>

            <Button
              type="submit"
              disabled={loading || completionPercentage < 70}
              className="min-w-32"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {t("common:submitting")}
                </div>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {mode === "edit" ? t("common:update") : t("listings:publish")}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
