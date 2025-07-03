'use client';

import { useTranslation } from 'next-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { X, Plus, Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import type { CategoryDetail } from '@/lib/types/category';
import type { LocalizedContent } from '@/lib/types/global';

interface CategoryFormProps {
  category?: CategoryDetail;
  parentCategories?: CategoryDetail[];
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  className?: string;
}

interface CategoryFormData {
  name: LocalizedContent;
  description: LocalizedContent;
  slug: string;
  icon?: string;
  image?: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
  seo: {
    title: LocalizedContent;
    description: LocalizedContent;
    keywords: string[];
  };
}

const createCategorySchema = (t: any) => z.object({
  name: z.object({
    en: z.string().min(1, t('validation.required')),
    id: z.string().min(1, t('validation.required')),
  }),
  description: z.object({
    en: z.string().min(1, t('validation.required')),
    id: z.string().min(1, t('validation.required')),
  }),
  slug: z.string()
    .min(1, t('validation.required'))
    .regex(/^[a-z0-9-]+$/, t('validation.slug_format')),
  icon: z.string().optional(),
  image: z.string().optional(),
  parentId: z.string().optional(),
  isActive: z.boolean(),
  sortOrder: z.number().min(0),
  seo: z.object({
    title: z.object({
      en: z.string().min(1, t('validation.required')),
      id: z.string().min(1, t('validation.required')),
    }),
    description: z.object({
      en: z.string().min(1, t('validation.required')),
      id: z.string().min(1, t('validation.required')),
    }),
    keywords: z.array(z.string()),
  }),
});

export function CategoryForm({
  category,
  parentCategories = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
  className
}: CategoryFormProps) {
  const { t } = useTranslation(['admin', 'common']);
  const [keywords, setKeywords] = useState<string[]>(category?.seo.keywords || []);
  const [newKeyword, setNewKeyword] = useState('');
  const [imagePreview, setImagePreview] = useState<string | undefined>(category?.image);

  const schema = createCategorySchema(t);
  
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: category?.name || { en: '', id: '' },
      description: category?.description || { en: '', id: '' },
      slug: category?.slug || '',
      icon: category?.icon || '',
      image: category?.image || '',
      parentId: category?.parent || '',
      isActive: category?.isActive ?? true,
      sortOrder: category?.sortOrder ?? 0,
      seo: {
        title: category?.seo?.title || { en: '', id: '' },
        description: category?.seo?.description || { en: '', id: '' },
        keywords: category?.seo?.keywords || [],
      },
    },
  });

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (value: string, locale: 'en' | 'id') => {
    const currentName = form.getValues('name');
    const updatedName = { ...currentName, [locale]: value };
    form.setValue('name', updatedName);

    // Auto-generate slug from English name
    if (locale === 'en' && !category) {
      const slug = generateSlug(value);
      form.setValue('slug', slug);
    }

    // Auto-generate meta title if empty
    const currentMetaTitle = form.getValues('seo.title');
    if (!currentMetaTitle[locale]) {
      const updatedMetaTitle = { ...currentMetaTitle, [locale]: value };
      form.setValue('seo.title', updatedMetaTitle);
    }
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      const updatedKeywords = [...keywords, newKeyword.trim()];
      setKeywords(updatedKeywords);
      form.setValue('seo.keywords', updatedKeywords);
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    const updatedKeywords = keywords.filter(k => k !== keyword);
    setKeywords(updatedKeywords);
    form.setValue('seo.keywords', updatedKeywords);
  };

  const handleImageUpload = async (file: File) => {
    // This would typically upload to your storage service
    // For now, create a preview URL
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    form.setValue('image', url);
  };

  const handleSubmit = async (data: CategoryFormData) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={cn('space-y-6', className)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('categories.form.basic_info')}</CardTitle>
                <CardDescription>
                  {t('categories.form.basic_info_description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Category Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name.en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('categories.form.name_en')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t('categories.form.name_en_placeholder')}
                            onChange={(e) => handleNameChange(e.target.value, 'en')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name.id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('categories.form.name_id')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t('categories.form.name_id_placeholder')}
                            onChange={(e) => handleNameChange(e.target.value, 'id')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Category Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="description.en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('categories.form.description_en')}</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={t('categories.form.description_en_placeholder')}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description.id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('categories.form.description_id')}</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={t('categories.form.description_id_placeholder')}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Slug and Parent */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('categories.form.slug')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t('categories.form.slug_placeholder')}
                          />
                        </FormControl>
                        <FormDescription>
                          {t('categories.form.slug_description')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="parentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('categories.form.parent_category')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('categories.form.select_parent')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">{t('categories.form.no_parent')}</SelectItem>
                            {parentCategories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name.en}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Icon and Sort Order */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('categories.form.icon')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t('categories.form.icon_placeholder')}
                          />
                        </FormControl>
                        <FormDescription>
                          {t('categories.form.icon_description')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="sortOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('categories.form.sort_order')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          {t('categories.form.sort_order_description')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card>
              <CardHeader>
                <CardTitle>{t('categories.form.seo_settings')}</CardTitle>
                <CardDescription>
                  {t('categories.form.seo_description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Meta Titles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="seo.title.en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('categories.form.meta_title_en')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t('categories.form.meta_title_placeholder')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="seo.title.id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('categories.form.meta_title_id')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t('categories.form.meta_title_placeholder')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Meta Descriptions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="seo.description.en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('categories.form.meta_description_en')}</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={t('categories.form.meta_description_placeholder')}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="seo.description.id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('categories.form.meta_description_id')}</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={t('categories.form.meta_description_placeholder')}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Keywords */}
                <div className="space-y-3">
                  <Label>{t('categories.form.keywords')}</Label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder={t('categories.form.add_keyword')}
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    />
                    <Button type="button" variant="outline" onClick={addKeyword}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {keywords.map((keyword) => (
                        <Badge key={keyword} variant="secondary" className="px-2 py-1">
                          {keyword}
                          <X
                            className="h-3 w-3 ml-1 cursor-pointer"
                            onClick={() => removeKeyword(keyword)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-6">
            {/* Status & Options */}
            <Card>
              <CardHeader>
                <CardTitle>{t('categories.form.settings')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>{t('categories.form.is_active')}</FormLabel>
                        <FormDescription>
                          {t('categories.form.is_active_description')}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Category Image */}
            <Card>
              <CardHeader>
                <CardTitle>{t('categories.form.category_image')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Category preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImagePreview(undefined);
                          form.setValue('image', '');
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        {t('categories.form.upload_image')}
                      </p>
                      <Button type="button" variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        {t('common.upload')}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Form Actions */}
        <Separator />
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('common.cancel')}
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />}
            {category ? t('common.update') : t('common.create')}
          </Button>
        </div>
      </form>
    </Form>
  );
}