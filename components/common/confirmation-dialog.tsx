"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertTriangle,
  CheckCircle,
  Info,
  Trash2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "warning" | "info";
  requiresConfirmation?: boolean;
  confirmationText?: string;
  confirmationPlaceholder?: string;
  requiresAcknowledgment?: boolean;
  acknowledgmentText?: string;
  isLoading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  variant = "default",
  requiresConfirmation = false,
  confirmationText = "",
  confirmationPlaceholder,
  requiresAcknowledgment = false,
  acknowledgmentText,
  isLoading = false,
  icon,
  children,
}: ConfirmationDialogProps) {
  const t = useTranslations("listings"); // CHANGED
  const locale = useLocale(); // CHANGED
  const [confirmationInput, setConfirmationInput] = useState("");
  const [isAcknowledged, setIsAcknowledged] = useState(false);

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onOpenChange(false);
      // Reset state
      setConfirmationInput("");
      setIsAcknowledged(false);
    } catch (error) {
      // Error handling is typically done by the parent component
      console.error("Confirmation action failed:", error);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset state
    setConfirmationInput("");
    setIsAcknowledged(false);
  };

  const isConfirmDisabled =
    isLoading ||
    (requiresConfirmation && confirmationInput !== confirmationText) ||
    (requiresAcknowledgment && !isAcknowledged);

  const getIcon = () => {
    if (icon) return icon;

    switch (variant) {
      case "destructive":
        return <AlertTriangle className="h-6 w-6 text-red-600" />;
      case "warning":
        return <AlertCircle className="h-6 w-6 text-orange-600" />;
      case "info":
        return <Info className="h-6 w-6 text-blue-600" />;
      default:
        return <CheckCircle className="h-6 w-6 text-green-600" />;
    }
  };

  const getTitle = () => {
    if (title) return title;

    switch (variant) {
      case "destructive":
        return t("dialogs.confirm_delete");
      case "warning":
        return t("dialogs.confirm_action");
      case "info":
        return t("dialogs.information");
      default:
        return t("dialogs.confirm");
    }
  };

  const getConfirmText = () => {
    if (confirmText) return confirmText;

    switch (variant) {
      case "destructive":
        return t("delete");
      case "warning":
        return t("proceed");
      default:
        return t("confirm");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {getIcon()}
            <AlertDialogTitle className="text-left">
              {getTitle()}
            </AlertDialogTitle>
          </div>
          {(description || children) && (
            <AlertDialogDescription className="text-left">
              {description}
              {children}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        {(requiresConfirmation || requiresAcknowledgment) && (
          <div className="space-y-4">
            {requiresConfirmation && (
              <div className="space-y-2">
                <Label
                  htmlFor="confirmation-input"
                  className="text-sm font-medium"
                >
                  {t("dialogs.type_to_confirm", { text: confirmationText })}
                </Label>
                <Input
                  id="confirmation-input"
                  type="text"
                  placeholder={confirmationPlaceholder || confirmationText}
                  value={confirmationInput}
                  onChange={(e) => setConfirmationInput(e.target.value)}
                  disabled={isLoading}
                  className={cn(
                    requiresConfirmation &&
                      confirmationInput !== confirmationText
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : ""
                  )}
                />
              </div>
            )}

            {requiresAcknowledgment && (
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="acknowledgment"
                  checked={isAcknowledged}
                  onCheckedChange={(checked) =>
                    setIsAcknowledged(checked as boolean)
                  }
                  disabled={isLoading}
                />
                <Label
                  htmlFor="acknowledgment"
                  className="text-sm leading-relaxed cursor-pointer"
                >
                  {acknowledgmentText || t("dialogs.acknowledge_consequences")}
                </Label>
              </div>
            )}
          </div>
        )}

        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
            {cancelText || t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className={cn(
              variant === "destructive" &&
                "bg-red-600 hover:bg-red-700 focus:ring-red-600",
              variant === "warning" &&
                "bg-orange-600 hover:bg-orange-700 focus:ring-orange-600"
            )}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {getConfirmText()}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
