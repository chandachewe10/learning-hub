"use client";

import { AlertTriangle, Trash2, Info } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Variant = "danger" | "warning" | "info";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
  loading?: boolean;
}

const variantConfig: Record<Variant, {
  icon: React.ReactNode;
  iconBg: string;
  confirmClass: string;
}> = {
  danger: {
    icon: <Trash2 className="w-5 h-5 text-red-600" />,
    iconBg: "bg-red-100",
    confirmClass: "bg-red-600 hover:bg-red-700 text-white",
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
    iconBg: "bg-amber-100",
    confirmClass: "bg-amber-600 hover:bg-amber-700 text-white",
  },
  info: {
    icon: <Info className="w-5 h-5 text-indigo-600" />,
    iconBg: "bg-indigo-100",
    confirmClass: "bg-indigo-600 hover:bg-indigo-700 text-white",
  },
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  const cfg = variantConfig[variant];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
              {cfg.icon}
            </div>
            <DialogTitle className="text-base">{title}</DialogTitle>
          </div>
          {description && (
            <DialogDescription className="text-slate-500 text-sm leading-relaxed pl-[52px]">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter className="gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            {cancelLabel}
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 ${cfg.confirmClass}`}
          >
            {loading ? "Please wait…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
