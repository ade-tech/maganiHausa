import React, { useEffect, useRef, useState } from 'react'

interface CameraScannerProps {
  onCapture: (base64Data: string) => void
  onClose: () => void
}

export const CameraScanner: React.FC<CameraScannerProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    async function startCamera() {
      try {
        setIsInitializing(true)
        setError(null)
        
        // request back camera if possible on mobile devices
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        })
        
        setStream(mediaStream)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      } catch (err: any) {
        console.error('Camera access error:', err)
        setError('Could not access your camera. Please ensure camera permissions are enabled.')
      } finally {
        setIsInitializing(false)
      }
    }

    startCamera()

    return () => {
      // Clean up: stop all media tracks when component unmounts
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  // Handler to capture current frame from video stream
  const handleCapture = () => {
    if (!videoRef.current) return

    const video = videoRef.current
    const canvas = document.createElement('canvas')
    
    // Set canvas dimensions equal to the video's actual stream dimension
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    
    const context = canvas.getContext('2d')
    if (context) {
      // Draw the video frame to the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Export frame as a base64 JPEG data URL
      const base64Data = canvas.toDataURL('image/jpeg', 0.9)
      
      // Callback
      onCapture(base64Data)
      
      // Clean up camera stream and close modal
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl max-w-lg w-full flex flex-col relative">
        
        {/* Header */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-white">
          <div>
            <h3 className="font-display font-bold text-text text-sm">🌿 Live Prescription Scanner</h3>
            <p className="text-[10px] text-text-muted mt-0.5">Align the prescription in the grid below</p>
          </div>
          <button
            onClick={() => {
              if (stream) stream.getTracks().forEach((t) => t.stop())
              onClose()
            }}
            className="text-text-muted hover:text-text text-sm font-semibold px-2 py-1 rounded hover:bg-bg/50 transition cursor-pointer"
          >
            Cancel
          </button>
        </div>

        {/* Video Area / Scanning Screen */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          {isInitializing && (
            <div className="text-white text-xs flex flex-col items-center gap-2">
              <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
              <span>Initializing Camera...</span>
            </div>
          )}

          {error && (
            <div className="p-6 text-center text-white text-xs flex flex-col items-center gap-3">
              <span className="text-xl">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {!error && !isInitializing && (
            <>
              {/* Live Video Feed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              
              {/* Overlay target grid layer */}
              <div className="absolute inset-4 border-2 border-dashed border-white/50 rounded-xl pointer-events-none flex items-center justify-center">
                <div className="text-[10px] font-semibold text-white/70 bg-black/40 px-2 py-1 rounded">
                  Prescription Text Area
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer controls */}
        {!error && !isInitializing && (
          <div className="p-4 bg-white border-t border-border flex justify-center">
            <button
              onClick={handleCapture}
              type="button"
              className="px-6 py-3 bg-primary text-white font-bold rounded-xl text-xs shadow hover:opacity-90 transition cursor-pointer flex items-center gap-2"
            >
              <span>📸</span> Capture Prescription Image
            </button>
          </div>
        )}
        
      </div>
    </div>
  )
}
