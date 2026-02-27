import React from "react";

export default function ConfirmModal({ open, title, message, confirmText = "Yes", cancelText = "Cancel", onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-2">{message}</p>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700">{cancelText}</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-md bg-red-600 text-white">{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
