import React, { useState, useEffect } from 'react'

interface VerifyCardProps {
  originalText: string
  translation: string
  drugInfo: string | null
}

export const VerifyCard: React.FC<VerifyCardProps> = ({ originalText, translation, drugInfo }) => {
  const [hasHausaVoice, setHasHausaVoice] = useState(false)
  const [showVoiceTooltip, setShowVoiceTooltip] = useState(false)

  // Web Speech API voices are loaded asynchronously; we listen to the voiceschanged event
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      const found = voices.some((v) => v.lang.toLowerCase().startsWith('ha'))
      setHasHausaVoice(found)
    }

    updateVoices()
    window.speechSynthesis.onvoiceschanged = updateVoices

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  }, [])
  
  // Custom function to highlight numbers, units, drug names, and Hausa keys (kwaya, sau)
  const renderHighlightedText = (text: string) => {
    if (!text) return <span className="text-text-muted italic">No input text</span>

    // Case-sensitive regex to split text (does not use '/i' to avoid matching all lowercase words with [A-Z])
    const splitRegex = /(\b\d+(?:\.\d+)?\s*(?:[mM][gG]|[mM][lL]|[gG]|[mM][cC][gG]|[tT]ablets?|[cC]apsules?|[sS]achets?|kwaya|Kwaya|days?|Days?|weeks?|Weeks?|hours?|Hours?|times?|Times?|sau|Sau)?\b|\b(?:kwaya|Kwaya|sau|Sau)\b|\b(?!Take|Apply|Dissolve|Give|Use|Inject|Drink|Eat|A|The|This|If|In|On|At|To|For|With|And|Or|Daily|Every|Twice|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Kada|Kana|Kina|Yadda|Wannan|Domin|Ku|Sha|Shiga|Guga|Sau)[A-Z][a-zA-Z]*\b)/g

    // Split text based on matches
    const parts = text.split(splitRegex)
    
    // Compile clean, non-global testers to avoid lastIndex issues
    const isNumberUnit = /^\d+(?:\.\d+)?\s*(?:[mM][gG]|[mM][lL]|[gG]|[mM][cC][gG]|[tT]ablets?|[cC]apsules?|[sS]achets?|kwaya|Kwaya|days?|Days?|weeks?|Weeks?|hours?|Hours?|times?|Times?|sau|Sau)?$/
    const isDrugOrHausa = /^(?:kwaya|Kwaya|sau|Sau)$|^(?!Take|Apply|Dissolve|Give|Use|Inject|Drink|Eat|A|The|This|If|In|On|At|To|For|With|And|Or|Daily|Every|Twice|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Kada|Kana|Kina|Yadda|Wannan|Domin|Ku|Sha|Shiga|Guga|Sau)[A-Z][a-zA-Z]*$/

    return parts.map((part, index) => {
      const trimmed = part.trim()
      
      if (isNumberUnit.test(trimmed)) {
        return (
          <strong
            key={index}
            className="text-primary font-bold font-tabular text-[1.05em] bg-surface-muted px-1 rounded border border-border"
          >
            {part}
          </strong>
        )
      }
      
      if (isDrugOrHausa.test(trimmed)) {
        return (
          <strong
            key={index}
            className="text-primary font-bold underline decoration-accent/30 decoration-2 underline-offset-2"
          >
            {part}
          </strong>
        )
      }

      return <span key={index}>{part}</span>
    })
  }

  const handleSpeak = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(translation)
      utterance.lang = 'ha-NG' // Hausa (Nigeria)
      
      // Look for a Hausa voice
      const voices = window.speechSynthesis.getVoices()
      const hausaVoice = voices.find((v) => v.lang.toLowerCase().startsWith('ha'))
      if (hausaVoice) {
        utterance.voice = hausaVoice
      }
      
      window.speechSynthesis.speak(utterance)
    } else {
      alert('Speech synthesis is not supported on this device/browser.')
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Side by side Verification Panel */}
      <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border">
        
        {/* English Original Panel */}
        <div className="flex-1 p-6 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">English Prescription</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface-muted text-text-muted font-medium">Original</span>
          </div>
          <div className="flex-grow font-sans text-text text-sm md:text-base leading-relaxed whitespace-pre-wrap">
            {renderHighlightedText(originalText)}
          </div>
        </div>

        {/* Kano Hausa Translation Panel */}
        <div className="flex-1 p-6 flex flex-col bg-surface-muted/30">
          <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Kano Hausa Translation</span>
            <div className="flex items-center gap-2 relative">
              <button
                onClick={handleSpeak}
                type="button"
                className="text-[10px] font-bold text-primary hover:bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/20 transition flex items-center gap-1 cursor-pointer bg-white"
                title="Pronounce Hausa translation"
              >
                <span>🔊</span> Lafazi (Speak)
              </button>

              {/* Informative indicator if no native Hausa voice is installed */}
              {!hasHausaVoice && (
                <div className="relative">
                  <button
                    type="button"
                    onMouseEnter={() => setShowVoiceTooltip(true)}
                    onMouseLeave={() => setShowVoiceTooltip(false)}
                    onClick={() => setShowVoiceTooltip(!showVoiceTooltip)}
                    className="text-accent text-xs font-bold hover:opacity-80 p-0.5 cursor-pointer"
                    title="Hausa voice setup tip"
                  >
                    ⚠️
                  </button>
                  {showVoiceTooltip && (
                    <div className="absolute right-0 bottom-6 w-64 p-3 bg-text text-white text-[10px] leading-relaxed rounded-xl shadow-xl z-50">
                      <p className="font-bold mb-1">📢 Pronunciation Tip:</p>
                      <p>
                        Your device is using a default voice. To hear native Hausa:
                      </p>
                      <ul className="list-disc pl-3 mt-1 gap-0.5 flex flex-col">
                        <li><strong>macOS/iOS:</strong> Settings &gt; Accessibility &gt; Spoken Content &gt; Voices &gt; Download Hausa.</li>
                        <li><strong>Android:</strong> Settings &gt; Languages &gt; Text-to-speech output &gt; Preferred engine (Google) &gt; Install voice data &gt; Hausa.</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Verified</span>
            </div>
          </div>
          <div className="flex-grow font-sans text-text text-sm md:text-base leading-relaxed whitespace-pre-wrap">
            {renderHighlightedText(translation)}
          </div>
        </div>

      </div>

      {/* Drug Information Recognition Card */}
      {drugInfo && (
        <div className="bg-surface border border-border rounded-2xl shadow-sm p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <span className="text-lg">🌿</span>
            <h4 className="font-display font-bold text-sm text-primary tracking-tight">
              Bayanin Magunguna da Kariya (Gemma 4)
            </h4>
          </div>
          <div className="text-xs md:text-sm text-text-muted leading-relaxed font-sans whitespace-pre-wrap">
            {drugInfo}
          </div>
        </div>
      )}
    </div>
  )
}
