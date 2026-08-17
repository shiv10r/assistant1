import { useEffect, useRef, useState } from 'react'
import { Button, Modal, Label } from '../components/ui'
import { useToast } from '../components/ui/Toast'
import { FiBarcode, FiScanLine, FiX } from 'react-icons/fi'

interface BarcodeScannerProps {
  open: boolean
  onClose: () => void
  onResult: (value: string) => void
  title?: string
}

export default function BarcodeScanner({ open, onClose, onResult, title = 'Scan Barcode / QR' }: BarcodeScannerProps) {
  const { toast } = useToast()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [supported, setSupported] = useState<boolean | null>(null)
  const [camError, setCamError] = useState('')
  const [manual, setManual] = useState('')
  const streamRef = useRef<MediaStream | null>(null)
  const detectorRef = useRef<any>(null)

  useEffect(() => {
    const BarcodeDetectorCtor = (window as any).BarcodeDetector
    setSupported(Boolean(BarcodeDetectorCtor))
  }, [])

  useEffect(() => {
    if (!open) return
    setCamError('')
    const BarcodeDetectorCtor = (window as any).BarcodeDetector
    if (!BarcodeDetectorCtor) return

    detectorRef.current = new BarcodeDetectorCtor({ formats: ['qr_code', 'code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'itf'] })

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => setCamError('Could not start camera'))
        }
        const loop = async () => {
          if (!detectorRef.current || !videoRef.current || !open) return
          try {
            const codes = await detectorRef.current.detect(videoRef.current)
            if (codes && codes.length > 0) {
              const value = String(codes[0].rawValue || '')
              if (value) {
                onResult(value)
                toast({ title: 'Scanned', description: value })
                onClose()
                return
              }
            }
          } catch {
            /* frame error, keep scanning */
          }
          requestAnimationFrame(loop)
        }
        loop()
      })
      .catch(() => setCamError('Camera unavailable — enter the code manually below.'))

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const submitManual = () => {
    if (!manual.trim()) { toast({ title: 'Enter a code', variant: 'error' }); return }
    onResult(manual.trim())
    setManual('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={title} size="md">
      <div className="space-y-4">
        {supported === null ? (
          <div className="text-sm text-muted text-center py-8">Checking scanner support…</div>
        ) : supported ? (
          camError ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-600 flex items-start gap-2">
              <ScanLine className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {camError}
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-3/4 h-40 border-2 border-primary/70 rounded-lg" />
              </div>
              <div className="absolute bottom-2 left-2 text-white/80 text-xs flex items-center gap-1.5 bg-black/50 rounded-md px-2 py-1">
                <ScanLine className="w-3.5 h-3.5" /> Point at a barcode or QR code
              </div>
            </div>
          )
        ) : (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-600 flex items-start gap-2">
            <Barcode className="w-4 h-4 mt-0.5 flex-shrink-0" />
            Your browser does not support the BarcodeDetector API. Use a Chromium browser on desktop/mobile, or enter the code manually below.
          </div>
        )}

        <div className="border-t border-border pt-4">
          <Label htmlFor="manualCode">Manual entry</Label>
          <div className="flex gap-2 mt-1">
            <input
              id="manualCode"
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitManual() }}
              placeholder="Type or paste a code…"
              autoFocus
              className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button onClick={submitManual}>Use</Button>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" /> Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}
