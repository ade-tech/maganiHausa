import React from 'react'

export const SafetyNote: React.FC = () => {
  return (
    <div className="bg-surface border-l-4 border-accent p-4 rounded-r-xl shadow-sm flex gap-3 items-start">
      <span className="text-accent text-lg leading-none" role="img" aria-label="warning">
        ⚠️
      </span>
      <div className="flex flex-col gap-1.5 text-xs md:text-sm leading-relaxed">
        <div>
          <strong className="text-text font-bold text-accent">Gargaɗin Tsaro:</strong>{' '}
          <span className="text-text font-medium">
            MaganiHausa tana fassara ne kawai don fahimta, ba ta maye gurbin karanta lakabin jikin kwalba ko tambayar likitan magani (pharmacist) ba. Kullum a duba lambobi da sunan magani a jikin ainihin kwalin maganin.
          </span>
        </div>
        <div className="text-[10px] md:text-xs text-text-muted border-t border-border/40 pt-1.5 mt-0.5">
          <strong className="font-semibold">Safety Notice:</strong> MaganiHausa explains, it does not replace reading the original label or asking a pharmacist. Always verify numbers and drug names on the actual container.
        </div>
      </div>
    </div>
  )
}
