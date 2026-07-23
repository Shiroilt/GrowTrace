import { useState } from 'react';

export default function AddPlantModal({ isOpen, onClose, onPlantCreated }) {
  const [formData, setFormData] = useState({
    device_id: '',
    name: '',
    species: '',
    image: '',
    description: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageMode, setImageMode] = useState('url'); // 'url' | 'file'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');



  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validation
    if (!formData.device_id.trim()) {
      setErrorMsg('Firebase Device ID is required.');
      return;
    }

    if (!formData.name.trim()) {
      setErrorMsg('Plant Name is required.');
      return;
    }

    if (!formData.species.trim()) {
      setErrorMsg('Species is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      let res;

      // --------------------------------
      // FILE IMAGE UPLOAD
      // --------------------------------
      if (imageMode === 'file' && imageFile) {
        const bodyData = new FormData();

        bodyData.append('name', formData.name.trim());
        bodyData.append('species', formData.species.trim());
        bodyData.append('device_id', formData.device_id.trim());

        if (formData.description.trim()) {
          bodyData.append(
            'description',
            formData.description.trim()
          );
        }

        bodyData.append('image', imageFile);

        res = await fetch(
          'http://127.0.0.1:8000/api/plants/',
          {
            method: 'POST',
            body: bodyData,
          }
        );
      }

      // --------------------------------
      // IMAGE URL / NO IMAGE
      // --------------------------------
      else {
        res = await fetch(
          'http://127.0.0.1:8000/api/plants/',
          {
            method: 'POST',

            headers: {
              'Content-Type': 'application/json',
            },

            body: JSON.stringify({
              name: formData.name.trim(),
              species: formData.species.trim(),
              device_id: formData.device_id.trim(),
              description:
                formData.description.trim() || null,
              image:
                formData.image.trim() || null,
            }),
          }
        );
      }

      // --------------------------------
      // BACKEND ERROR
      // --------------------------------
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));

        console.error(
          'Backend plant creation error:',
          errorData
        );

        throw new Error(
          errorData.device_id?.[0] ||
          errorData.name?.[0] ||
          errorData.species?.[0] ||
          errorData.detail ||
          'Failed to create plant'
        );
      }

      // --------------------------------
      // SUCCESS
      // --------------------------------
      const createdPlant = await res.json();

      console.log(
        'Plant successfully created:',
        createdPlant
      );

      onPlantCreated(createdPlant);

      // Reset form
      setFormData({
        device_id: '',
        name: '',
        species: '',
        image: '',
        description: '',
      });

      setImageFile(null);
      setImagePreview('');
      setImageMode('url');

      onClose();

    } catch (err) {
      console.error('Create plant error:', err);

      setErrorMsg(
        err.message ||
        'Failed to create plant. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-lg rounded-2xl botanical-shadow ghost-border overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-emerald-50/40">
          <div>
            <h2 className="text-xl font-bold text-on-surface">Connect New Plant</h2>
            <p className="text-xs text-secondary mt-0.5">Add a new plant to your botanical archive</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Error message display */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Plant Name */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-secondary mb-1.5">
                Plant Name <span className="text-emerald-600">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Monstera Deliciosa"
                className="w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>

            {/* Plant ID */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-secondary mb-1.5">
                Firebase Device ID <span className="text-emerald-600">*</span>
              </label>

              <input
                type="text"
                name="device_id"
                required
                value={formData.device_id}
                onChange={handleChange}
                placeholder="e.g. cutting1"
                className="w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />

              <p className="text-[10px] text-secondary mt-1">
                Enter the exact device ID stored in Firebase.
              </p>
            </div>
          </div>

          {/* Species */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-secondary mb-1.5">
              Species <span className="text-emerald-600">*</span>
            </label>
            <input
              type="text"
              name="species"
              required
              value={formData.species}
              onChange={handleChange}
              placeholder="e.g. Monstera deliciosa Liebm."
              className="w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          {/* Image Input Options */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-secondary">
                Plant Image
              </label>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`px-2 py-0.5 rounded-md transition-all ${imageMode === 'url' ? 'bg-emerald-100 text-emerald-800 font-medium' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                  Image URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('file')}
                  className={`px-2 py-0.5 rounded-md transition-all ${imageMode === 'file' ? 'bg-emerald-100 text-emerald-800 font-medium' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                  Upload File
                </button>
              </div>
            </div>

            {imageMode === 'url' ? (
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            ) : (
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs text-secondary file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                />
              </div>
            )}

            {/* Preview */}
            {(formData.image || imagePreview) && (
              <div className="mt-2 relative w-full h-24 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                <img
                  src={imageMode === 'file' ? imagePreview : formData.image}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}
          </div>

          {/* Description (Optional) */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-secondary mb-1.5">
              Description <span className="text-gray-400 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Add notes about location, care instructions, or sensor details..."
              className="w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-secondary hover:bg-gray-50 hover:text-on-surface transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ background: '#00694c' }}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Plant'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
