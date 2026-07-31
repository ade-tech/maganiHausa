import React, { useState, useRef } from 'react'
import { CameraScanner } from './CameraScanner'

interface PrescriptionInputProps {
  onTranslate: (text: string, imageBase64: string | null) => void
  isLoading: boolean
}

export const PrescriptionInput: React.FC<PrescriptionInputProps> = ({ onTranslate, isLoading }) => {
  const [text, setText] = useState('')
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setImageBase64(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleClearImage = () => {
    setImageBase64(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() && !imageBase64) return
    onTranslate(text, imageBase64)
  }

  return (
    <div className="bg-surface border border-border rounded-2xl shadow-sm p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="prescription-text" className="block text-sm font-semibold text-text mb-2">
            Enter Prescription Text
          </label>
          <textarea
            id="prescription-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste medical instructions here (e.g., 'Amoxicillin 500mg: Take 1 capsule three times daily for 7 days'). Or upload/scan a photo below."
            className="w-full min-h-[140px] p-4 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y bg-bg/20 text-text placeholder-text-muted/60 leading-relaxed"
            disabled={isLoading}
          />
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {/* Image Preview Container */}
        {imageBase64 && (
          <div className="border border-border rounded-xl p-3 bg-bg/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={imageBase64}
                alt="Prescription preview"
                className="w-16 h-16 object-cover rounded-lg border border-border bg-white"
              />
              <div>
                <p className="text-xs font-semibold text-text">Prescription Photo Attached</p>
                <p className="text-[10px] text-text-muted">Gemma 4 will analyze this image directly</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClearImage}
              className="text-xs font-medium text-danger hover:bg-danger/5 px-3 py-1.5 rounded-lg border border-danger/10 transition cursor-pointer bg-white"
              disabled={isLoading}
            >
              Remove
            </button>
          </div>
        )}

        {/* Actions Button Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
          <div className="flex items-center gap-2">
            {/* Upload File Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-text hover:bg-bg/50 px-3 py-2 rounded-lg border border-border bg-surface transition cursor-pointer"
              disabled={isLoading}
            >
              <span>📁</span> Upload Photo
            </button>

            {/* Live Video Camera Scanner Button */}
            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              className="flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-text hover:bg-bg/50 px-3 py-2 rounded-lg border border-border bg-surface transition cursor-pointer"
              disabled={isLoading}
            >
              <span>📷</span> Scan with Camera
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || (!text.trim() && !imageBase64)}
            className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
          >
            Translate Prescription
          </button>
        </div>
      </form>

      {/* Live Video Camera Modal overlay */}
      {isCameraOpen && (
        <CameraScanner
          onCapture={(base64) => setImageBase64(base64)}
          onClose={() => setIsCameraOpen(false)}
        />
      )}
    </div>
  )
}
