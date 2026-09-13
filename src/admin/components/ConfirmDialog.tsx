import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";
import Spinner from "./Spinner";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Delete",
  isLoading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  isLoading?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title="" maxWidth="max-w-sm">
      <div className="flex flex-col items-center text-center -mt-8">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <AlertTriangle className="w-5 h-5 text-red-400" />
        </div>
        <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
        <p className="text-white/60 text-sm mb-6">{description}</p>
        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl bg-red-500/90 text-white text-sm font-medium hover:bg-red-500 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading && <Spinner className="w-4 h-4" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
