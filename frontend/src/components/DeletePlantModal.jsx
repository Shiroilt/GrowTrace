import { useState } from 'react';

export default function DeletePlantModal({ isOpen, onClose, onConfirm, plantName }) {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const isConfirmed = confirmText.trim().toLowerCase() === 'delete';

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!isConfirmed) return;
    setIsDeleting(true);
    await onConfirm();
    setIsDeleting(false);
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-2xl botanical-shadow ghost-border overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-red-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Delete Plant</h2>
              <p className="text-xs text-gray-500">Permanent action</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleDelete} className="p-6 space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            Are you sure you want to delete <span className="font-semibold text-gray-900">{plantName || 'this plant'}</span>? This will permanently remove its record and sensor history.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800">
            <p className="font-medium mb-1">Confirmation Required</p>
            <p>Please type <strong className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-900">delete</strong> in the input box below to confirm.</p>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-secondary mb-1.5">
              Type "delete" to proceed
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="delete"
              autoFocus
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-secondary hover:bg-gray-50 hover:text-on-surface transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isConfirmed || isDeleting}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all flex items-center gap-2 shadow-sm ${
                isConfirmed && !isDeleting
                  ? 'bg-red-600 hover:bg-red-700 active:scale-[0.98] cursor-pointer'
                  : 'bg-red-300 cursor-not-allowed opacity-70'
              }`}
            >
              {isDeleting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Plant'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
