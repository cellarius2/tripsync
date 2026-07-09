import type { ReactNode } from "react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-gray-200 bg-white shadow-2xl shadow-black/20" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white p-5">
          <h2 className="font-display text-xl font-semibold text-navy-950">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-semibold text-navy-700 hover:bg-burgundy-50 hover:text-burgundy-600"
          >
            Fechar
          </button>
        </div>
        <div className="p-5 text-navy-950">{children}</div>
      </div>
    </div>
  );
}
