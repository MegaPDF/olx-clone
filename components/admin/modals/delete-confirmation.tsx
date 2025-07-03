"use client";

import { useTranslation } from "next-i18next";
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
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Trash2,
  User,
  Package,
  MessageSquare,
  CreditCard,
  FileText,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title?: string;
  description?: string;
  itemType:
    | "user"
    | "listing"
    | "category"
    | "payment"
    | "report"
    | "message"
    | "custom";
  itemName?: string;
  itemCount?: number;
  requiresConfirmation?: boolean;
  confirmationText?: string;
  isDangerous?: boolean;
  isSubmitting?: boolean;
  consequences?: string[];
  relatedItems?: Array<{
    type: string;
    count: number;
    action: "delete" | "keep" | "transfer";
  }>;
}

export function DeleteConfirmation({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemType,
  itemName,
  itemCount = 1,
  requiresConfirmation = false,
  confirmationText,
  isDangerous = false,
  isSubmitting = false,
  consequences = [],
  relatedItems = [],
}: DeleteConfirmationProps) {
  const { t } = useTranslation(["admin", "common"]);
  const [confirmationInput, setConfirmationInput] = useState("");
  const [acknowledgeConsequences, setAcknowledgeConsequences] = useState(false);

  const getIcon = () => {
    switch (itemType) {
      case "user":
        return <User className="h-6 w-6 text-blue-600" />;
      case "listing":
        return <Package className="h-6 w-6 text-green-600" />;
      case "message":
        return <MessageSquare className="h-6 w-6 text-purple-600" />;
      case "payment":
        return <CreditCard className="h-6 w-6 text-yellow-600" />;
      case "report":
        return <FileText className="h-6 w-6 text-orange-600" />;
      default:
        return <Trash2 className="h-6 w-6 text-red-600" />;
    }
  };

  const getDefaultTitle = () => {
    if (title) return title;

    const itemTypePlural = itemCount > 1 ? `${itemType}s` : itemType;
    return t("delete.confirm_delete", {
      type: t(`common.${itemTypePlural}`),
      count: itemCount,
    });
  };

  const getDefaultDescription = () => {
    if (description) return description;

    if (itemCount > 1) {
      return t("delete.multiple_items_warning", {
        count: itemCount,
        type: t(`common.${itemType}s`),
      });
    }

    return t("delete.single_item_warning", {
      type: t(`common.${itemType}`),
      name: itemName || t("common.this_item"),
    });
  };

  const getConfirmationTextRequired = () => {
    return confirmationText || (itemName ? `DELETE ${itemName}` : "DELETE");
  };

  const handleConfirm = async () => {
    if (
      requiresConfirmation &&
      confirmationInput !== getConfirmationTextRequired()
    ) {
      return;
    }

    if (isDangerous && !acknowledgeConsequences) {
      return;
    }

    await onConfirm();
  };

  const isConfirmDisabled = () => {
    if (isSubmitting) return true;
    if (
      requiresConfirmation &&
      confirmationInput !== getConfirmationTextRequired()
    )
      return true;
    if (isDangerous && !acknowledgeConsequences) return true;
    return false;
  };

  const reset = () => {
    setConfirmationInput("");
    setAcknowledgeConsequences(false);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                "flex-shrink-0 p-2 rounded-full",
                isDangerous
                  ? "bg-red-100 dark:bg-red-900/30"
                  : "bg-orange-100 dark:bg-orange-900/30"
              )}
            >
              {isDangerous ? (
                <AlertTriangle className="h-6 w-6 text-red-600" />
              ) : (
                getIcon()
              )}
            </div>
            <div className="flex-1">
              <AlertDialogTitle className="text-lg font-semibold">
                {getDefaultTitle()}
              </AlertDialogTitle>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="space-y-4">
          <AlertDialogDescription className="text-sm text-muted-foreground">
            {getDefaultDescription()}
          </AlertDialogDescription>

          {/* Item Details */}
          {itemName && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                {getIcon()}
                <div>
                  <p className="font-medium text-sm">{itemName}</p>
                  <p className="text-xs text-muted-foreground">
                    {t(`common.${itemType}`)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Related Items Warning */}
          {relatedItems.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">
                {t("delete.related_items")}
              </h4>
              <div className="space-y-2">
                {relatedItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded"
                  >
                    <span className="text-sm">
                      {item.count}{" "}
                      {t(`common.${item.type}${item.count > 1 ? "s" : ""}`)}
                    </span>
                    <Badge
                      variant={
                        item.action === "delete" ? "destructive" : "secondary"
                      }
                      className="text-xs"
                    >
                      {t(`delete.actions.${item.action}`)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Consequences */}
          {consequences.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span>{t("delete.consequences")}</span>
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {consequences.map((consequence, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span>{consequence}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Confirmation Input */}
          {requiresConfirmation && (
            <div className="space-y-2">
              <Label
                htmlFor="confirmation-input"
                className="text-sm font-medium"
              >
                {t("delete.type_to_confirm", {
                  text: getConfirmationTextRequired(),
                })}
              </Label>
              <Input
                id="confirmation-input"
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                placeholder={getConfirmationTextRequired()}
                className={cn(
                  "font-mono",
                  confirmationInput === getConfirmationTextRequired()
                    ? "border-green-500 focus:border-green-500"
                    : ""
                )}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                {t("delete.confirmation_help")}
              </p>
            </div>
          )}

          {/* Acknowledge Consequences */}
          {isDangerous && (
            <div className="flex items-start space-x-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <Checkbox
                id="acknowledge"
                checked={acknowledgeConsequences}
                onCheckedChange={(checked) => setAcknowledgeConsequences(checked === true)}
                disabled={isSubmitting}
                className="mt-0.5"
              />
              <Label
                htmlFor="acknowledge"
                className="text-sm text-red-800 dark:text-red-200 leading-relaxed"
              >
                {t("delete.acknowledge_consequences")}
              </Label>
            </div>
          )}

          {/* Final Warning */}
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                {t("delete.final_warning")}
              </p>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel onClick={handleClose} disabled={isSubmitting}>
            {t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isConfirmDisabled()}
            className={cn(
              "bg-red-600 hover:bg-red-700 focus:ring-red-600",
              isDangerous && "bg-red-700 hover:bg-red-800"
            )}
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>{t("delete.deleting")}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Trash2 className="h-4 w-4" />
                <span>
                  {itemCount > 1
                    ? t("delete.delete_items", { count: itemCount })
                    : t("delete.delete_item")}
                </span>
              </div>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
