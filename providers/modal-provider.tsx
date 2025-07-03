"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Modal {
  id: string;
  title?: string;
  content: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closable?: boolean;
  onClose?: () => void;
  className?: string;
}

interface ModalContextType {
  modals: Modal[];
  openModal: (props: Omit<Modal, "id">) => string;
  closeModal: (modalId: string) => void;
  closeAllModals: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalProviderProps {
  children: ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [modals, setModals] = useState<Modal[]>([]);

  const openModal = useCallback((props: Omit<Modal, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const modal: Modal = {
      ...props,
      id,
      closable: props.closable ?? true,
    };

    setModals((prev) => [...prev, modal]);
    return id;
  }, []);

  const closeModal = useCallback((modalId: string) => {
    setModals((prev) => {
      const modal = prev.find((m) => m.id === modalId);
      if (modal?.onClose) {
        modal.onClose();
      }
      return prev.filter((m) => m.id !== modalId);
    });
  }, []);

  const closeAllModals = useCallback(() => {
    setModals((prev) => {
      prev.forEach((modal) => {
        if (modal.onClose) {
          modal.onClose();
        }
      });
      return [];
    });
  }, []);

  return (
    <ModalContext.Provider
      value={{ modals, openModal, closeModal, closeAllModals }}
    >
      {children}
      <ModalViewport modals={modals} onClose={closeModal} />
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}

// Modal viewport for rendering modals
function ModalViewport({
  modals,
  onClose,
}: {
  modals: Modal[];
  onClose: (id: string) => void;
}) {
  if (modals.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50">
      {modals.map((modal, index) => (
        <ModalComponent
          key={modal.id}
          modal={modal}
          onClose={() => onClose(modal.id)}
          zIndex={50 + index}
        />
      ))}
    </div>
  );
}

function ModalComponent({
  modal,
  onClose,
  zIndex,
}: {
  modal: Modal;
  onClose: () => void;
  zIndex: number;
}) {
  const sizeStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full m-4",
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && modal.closable) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
      style={{ zIndex }}
      onClick={handleBackdropClick}
    >
      <div
        className={cn(
          "bg-background rounded-lg shadow-lg max-h-[90vh] overflow-auto",
          sizeStyles[modal.size || "md"],
          modal.className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(modal.title || modal.closable) && (
          <div className="flex items-center justify-between p-6 border-b">
            {modal.title && (
              <h2 className="text-lg font-semibold">{modal.title}</h2>
            )}
            {modal.closable && (
              <button
                onClick={onClose}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        <div className="p-6">{modal.content}</div>
      </div>
    </div>
  );
}

// Common modal helpers
export const modal = {
  confirm: (
    message: string,
    title: string = "Confirm",
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    const { openModal, closeModal } = useModal();

    const modalId = openModal({
      title,
      size: "sm",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{message}</p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                closeModal(modalId);
                onCancel?.();
              }}
              className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                closeModal(modalId);
                onConfirm();
              }}
              className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
            >
              Confirm
            </button>
          </div>
        </div>
      ),
    });

    return modalId;
  },

  alert: (message: string, title: string = "Alert") => {
    const { openModal, closeModal } = useModal();

    const modalId = openModal({
      title,
      size: "sm",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{message}</p>
          <div className="flex justify-end">
            <button
              onClick={() => closeModal(modalId)}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              OK
            </button>
          </div>
        </div>
      ),
    });

    return modalId;
  },
};
