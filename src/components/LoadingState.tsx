import React from 'react'

export const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-surface border border-border rounded-2xl shadow-sm min-h-[250px] animate-pulse">
      <div className="relative w-12 h-12 mb-4">
        {/* Calm double ring spinner */}
        <div className="absolute inset-0 rounded-full border-4 border-surface-muted"></div>
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
      
      <p className="font-display font-medium text-sm text-text">Consulting Local Gemma Engine...</p>
      <p className="text-xs text-text-muted mt-1.5 text-center max-w-[280px]">
        MaganiHausa is parsing the text and generating a Hausa translation on-device. This may take a few seconds.
      </p>
    </div>
  )
}
