'use client'

import { useState, useEffect } from 'react'
import { Sidebar, TabType } from '@/components/Sidebar'
import { PrescriptionInput } from '@/components/PrescriptionInput'
import { VerifyCard } from '@/components/VerifyCard'
import { SafetyNote } from '@/components/SafetyNote'
import { LoadingState } from '@/components/LoadingState'

interface HistoryItem {
  id: string
  timestamp: string
  originalText: string
  translation: string
  drugInfo: string | null
  hasImage: boolean
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentResult, setCurrentResult] = useState<{ originalText: string; translation: string; drugInfo: string | null } | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  
  // States for viewing a history item detail
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null)

  const [modelsList, setModelsList] = useState<string[]>([])
  const [selectedModel, setSelectedModel] = useState('gemma4:e4b')

  useEffect(() => {
    async function fetchModels() {
      try {
        const response = await fetch('/api/models')
        const data = await response.json()
        if (data.models && data.models.length > 0) {
          setModelsList(data.models)
          const hasDefault = data.models.some((m: string) => m.includes('gemma4:e4b'))
          if (hasDefault) {
            setSelectedModel('gemma4:e4b')
          } else {
            setSelectedModel(data.models[0])
          }
        }
      } catch (e) {
        console.error('Failed to load local models:', e)
      }
    }
    fetchModels()
  }, [])

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('magani_history_v2')
      if (stored) {
        setHistory(JSON.parse(stored))
      } else {
        // Fallback for v1 history compatibility
        const oldStored = localStorage.getItem('magani_history')
        if (oldStored) {
          const parsed = JSON.parse(oldStored)
          const converted = parsed.map((item: any) => ({ ...item, drugInfo: null }))
          setHistory(converted)
        }
      }
    } catch (e) {
      console.error('Failed to load translation history:', e)
    }
  }, [])

  // Save translation to history helper
  const saveToHistory = (originalText: string, translation: string, drugInfo: string | null, hasImage: boolean) => {
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleString(),
      originalText,
      translation,
      drugInfo,
      hasImage,
    }
    const updated = [newItem, ...history]
    setHistory(updated)
    try {
      localStorage.setItem('magani_history_v2', JSON.stringify(updated))
    } catch (e) {
      console.error('Failed to save translation to history:', e)
    }
  }

  // Clear translation history
  const handleClearHistory = () => {
    setHistory([])
    try {
      localStorage.removeItem('magani_history_v2')
      localStorage.removeItem('magani_history')
    } catch (e) {
      console.error('Failed to clear history:', e)
    }
  }

  // Trigger translation request
  const handleTranslate = async (text: string, imageBase64: string | null) => {
    setIsLoading(true)
    setApiError(null)
    setCurrentResult(null)

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          image: imageBase64,
          model: selectedModel,
        }),
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        throw new Error(data.error || `Server responded with status ${response.status}`)
      }

      setCurrentResult({
        originalText: data.originalText,
        translation: data.translation,
        drugInfo: data.drugInfo,
      })

      saveToHistory(data.originalText, data.translation, data.drugInfo, !!imageBase64)
    } catch (err: any) {
      console.error(err)
      setApiError(err?.message || 'Failed to complete translation. Please ensure Ollama is running locally.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickExample = (text: string) => {
    handleTranslate(text, null)
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-bg">
      {/* Navigation Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} selectedModel={selectedModel} />

      {/* Main Workspace Canvas */}
      <main className="flex-1 p-6 md:p-10 pb-24 md:pb-10 overflow-y-auto">
        
        {/* ==================== TRANSLATION HOME/DASHBOARD TAB ==================== */}
        {activeTab === 'dashboard' && (
          <div className="max-w-4xl flex flex-col gap-6">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="font-display font-bold text-3xl text-text mb-1">🌿 MaganiHausa</h1>
                <p className="text-text-muted text-xs md:text-sm leading-relaxed">
                  Explain and translate medical prescriptions into Kano Hausa offline.
                </p>
              </div>
              <div className="flex gap-2">
                <div className="bg-surface-muted/50 border border-border px-3 py-1.5 rounded-xl text-[10px] md:text-xs font-mono text-text flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-600 animate-ping text-[8px] self-center"></span>
                  {modelsList.length > 0 ? (
                    <div className="flex items-center gap-1 text-text">
                      <span>Model:</span>
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="bg-transparent font-bold border-none outline-none p-0 cursor-pointer text-text text-[10px] md:text-xs font-semibold focus:ring-0"
                      >
                        {modelsList.map((m) => (
                          <option key={m} value={m} className="bg-white text-text font-sans">
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <span>Model: gemma4:e4b</span>
                  )}
                </div>
              </div>
            </header>

            {/* Quick Metrics Header */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-surface border border-border p-3 rounded-xl shadow-xs">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Session Runs</span>
                <span className="font-display font-extrabold text-lg text-primary mt-0.5 block font-tabular">
                  {history.length}
                </span>
              </div>
              <div className="bg-surface border border-border p-3 rounded-xl shadow-xs">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Accuracy Safeguard</span>
                <span className="text-[10px] font-bold text-primary mt-1.5 block">
                  Numbers Locked
                </span>
              </div>
              <div className="bg-surface border border-border p-3 rounded-xl shadow-xs">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Pronunciation</span>
                <span className="text-[10px] font-bold text-primary mt-1.5 block">
                  Lafazi Active
                </span>
              </div>
              <div className="bg-surface border border-border p-3 rounded-xl shadow-xs">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Security</span>
                <span className="text-[10px] font-bold text-primary mt-1.5 block">
                  100% Local Inference
                </span>
              </div>
            </div>

            {/* Core Translation Workspace (Input Component) */}
            <PrescriptionInput onTranslate={handleTranslate} isLoading={isLoading} />

            {/* Loading Indicator */}
            {isLoading && <LoadingState />}

            {/* API Error Box */}
            {apiError && (
              <div className="p-4 bg-danger/10 border-l-4 border-danger text-danger text-sm rounded-r-xl">
                <p className="font-bold">Error communicating with local Gemma model:</p>
                <p className="mt-1 font-mono text-xs">{apiError}</p>
                <p className="mt-3 text-xs text-text-muted">
                  Please verify Ollama is running locally on port 11434 (`ollama serve`) and the `gemma4:e4b` model has been pulled (`ollama pull gemma4:e4b`).
                </p>
              </div>
            )}

            {/* Results (VerifyCard & SafetyNote) */}
            {currentResult && (
              <div className="flex flex-col gap-6 animate-fade-in">
                <VerifyCard
                  originalText={currentResult.originalText}
                  translation={currentResult.translation}
                  drugInfo={currentResult.drugInfo}
                />
                <SafetyNote />
              </div>
            )}

            {/* Quick Examples Selection Dashboard Panel */}
            <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
              <h3 className="font-display font-bold text-text text-[11px] uppercase tracking-wider mb-3">
                Try a Sample Prescription
              </h3>
              <div className="flex flex-col gap-2">
                {[
                  { text: 'Amoxicillin 250mg: Take 1 capsule every 8 hours for 7 days.', label: 'Antibiotic Course' },
                  { text: 'Paracetamol 500mg: Take 2 tablets three times daily for 5 days.', label: 'Pain Relief' },
                  { text: 'Dissolve 1 sachet in water every morning before breakfast.', label: 'Soluble Powder' },
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickExample(sample.text)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between text-left p-3.5 border border-border rounded-xl hover:bg-surface-muted transition text-xs text-text cursor-pointer bg-bg/5"
                  >
                    <span className="font-medium">{sample.text}</span>
                    <span className="text-[9px] text-accent font-semibold uppercase mt-1 sm:mt-0 tracking-wider">
                      {sample.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TRANSLATION HISTORY TAB ==================== */}
        {activeTab === 'history' && (
          <div className="max-w-4xl flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <header>
                <h1 className="font-display font-bold text-3xl text-text mb-1">⏳ Translation History</h1>
                <p className="text-text-muted text-sm">Review past explained prescriptions from this session.</p>
              </header>
              {history.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-xs font-semibold text-danger hover:bg-danger/5 px-3 py-2 rounded-lg border border-danger/20 transition cursor-pointer"
                >
                  Clear History
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="bg-surface border border-border border-dashed p-12 text-center rounded-2xl">
                <span className="text-3xl block mb-2">⏳</span>
                <p className="text-sm font-semibold text-text">No History Found</p>
                <p className="text-xs text-text-muted mt-1">Translations you run will appear here.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="bg-surface border border-border rounded-xl p-4 shadow-sm flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-start gap-4 pb-2 border-b border-border text-xs text-text-muted font-mono">
                      <span>{item.timestamp}</span>
                      <span className="flex items-center gap-1">
                        {item.hasImage ? '📸 Image Capture' : '📝 Text Paste'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Original</span>
                        <p className="text-xs text-text font-medium leading-relaxed max-h-[80px] overflow-y-auto font-sans">
                          {item.originalText}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-1">Kano Hausa</span>
                        <p className="text-xs text-text font-medium leading-relaxed max-h-[80px] overflow-y-auto font-sans">
                          {item.translation}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-border mt-1">
                      <button
                        onClick={() => setSelectedHistoryItem(item)}
                        className="text-xs font-bold text-primary hover:bg-surface-muted px-3 py-1.5 rounded-lg border border-primary/20 transition cursor-pointer"
                      >
                        Inspect Verify Card
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modal for viewing verification card detail of a history item */}
            {selectedHistoryItem && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <div className="bg-bg border border-border rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="p-4 border-b border-border bg-surface flex justify-between items-center">
                    <span className="font-display font-bold text-text text-sm">
                      Inspect Record: {selectedHistoryItem.timestamp}
                    </span>
                    <button
                      onClick={() => setSelectedHistoryItem(null)}
                      className="text-text-muted hover:text-text font-bold text-lg p-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="p-6 overflow-y-auto flex-grow flex flex-col gap-6">
                    <VerifyCard
                      originalText={selectedHistoryItem.originalText}
                      translation={selectedHistoryItem.translation}
                      drugInfo={selectedHistoryItem.drugInfo}
                    />
                    <SafetyNote />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== ABOUT TAB ==================== */}
        {activeTab === 'about' && (
          <div className="max-w-3xl flex flex-col gap-6">
            <header>
              <h1 className="font-display font-bold text-3xl text-text mb-2">💡 About MaganiHausa</h1>
              <p className="text-text-muted text-sm">
                Bridging medical communication gaps for Kano Hausa speakers offline.
              </p>
            </header>

            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4 text-xs md:text-sm text-text leading-relaxed">
              <h3 className="font-display font-bold text-primary text-base">The BUK Hackathon - Local Language Track</h3>
              <p>
                MaganiHausa was conceptualized and engineered for the GDGoC Bayero University Kano hackathon. In Northern Nigeria, prescriptions are routinely written in English, creating a hazardous gap for over 50 million Hausa speakers.
              </p>
              
              <h3 className="font-display font-bold text-primary text-base">Safety First Architecture</h3>
              <p>
                To avoid lethal translation slip-ups, numbers, dosage units (mg, ml, sachets), and drug names are highlighted and locked alongside the Kano Hausa output. They are visually aligned side-by-side in the <strong className="font-semibold text-accent">VerifyCard</strong> so the user can easily check correctness against the container labels.
              </p>

              <h3 className="font-display font-bold text-primary text-base">Medication Recognition Card</h3>
              <p>
                Gemma 4 parses the active drug name inside the prescription and extracts key safety advice and description details to construct a customized educational safety card for the user.
              </p>

              <h3 className="font-display font-bold text-primary text-base">Offline Engine (Gemma 4)</h3>
              <p>
                MaganiHausa processes both text and prescription images locally using the <strong className="font-semibold text-primary">gemma4:e4b</strong> model. Because it is hosted locally on the user's host via Ollama, it doesn't need active internet connection, preserving completely private records with zero network latency.
              </p>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
