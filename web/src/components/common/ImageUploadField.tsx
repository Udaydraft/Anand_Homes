import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, RefreshCw } from 'lucide-react';
import { constructionService } from '../../services/construction.service';
import { resolveImageUrl } from '../../services/api';

interface ImageUploadFieldProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  className?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  value,
  onChange,
  label = 'Site / Project Photo',
  helperText = 'PNG, JPG, WEBP up to 10MB',
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProcessFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image file size must be less than 10MB.');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const res = await constructionService.uploadPhotoFile(file);
      const fullUrl = res.url.startsWith('http')
        ? res.url
        : res.url.startsWith('/') ? res.url : `/${res.url}`;
      onChange(fullUrl);
    } catch (err) {
      console.warn('Backend file upload fallback to base64:', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <label className="block text-xs font-semibold text-slate-700">{label}</label>}

      {value ? (
        <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">
          <div className="h-36 w-full overflow-hidden bg-slate-900/5">
            <img
              src={resolveImageUrl(value)}
              alt="Preview"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white/95 hover:bg-white text-slate-800 text-xs font-bold shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Change</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <X className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-xl border-2 border-dashed transition-all p-4 text-center flex flex-col items-center justify-center gap-2 ${
            isDragOver
              ? 'border-[#0D5C3A] bg-emerald-50/50'
              : 'border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-slate-50'
          }`}
        >
          {isUploading ? (
            <div className="py-2 flex flex-col items-center gap-2 text-slate-500">
              <Loader2 className="w-6 h-6 text-[#0D5C3A] animate-spin" />
              <span className="text-xs font-medium">Uploading image...</span>
            </div>
          ) : (
            <>
              <div className="w-9 h-9 rounded-full bg-emerald-100/70 text-[#0D5C3A] flex items-center justify-center">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 hover:text-[#0D5C3A]">
                  Click to upload
                </span>
                <span className="text-xs text-slate-500"> or drag and drop</span>
                <p className="text-[11px] text-slate-400 mt-0.5">{helperText}</p>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
    </div>
  );
};
