import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Sheet } from './Sheet'

interface Props {
  appUrl?: string
  onClose: () => void
}

const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1)
const isPhoneOrTablet = () =>
  isIOS() || /android/i.test(navigator.userAgent) || window.matchMedia('(pointer: coarse)').matches

/**
 * Code apps can't run inside the Power Apps mobile app, so on a phone they're opened
 * via their link in the browser and pinned to the home screen. This sheet makes that easy.
 */
export function PhoneSheet({ appUrl, onClose }: Props) {
  const [qrSvg, setQrSvg] = useState('')
  const [copied, setCopied] = useState(false)
  const onPhone = isPhoneOrTablet()
  const ios = isIOS()

  useEffect(() => {
    if (!appUrl || onPhone) return
    QRCode.toString(appUrl, { type: 'svg', margin: 1, color: { dark: '#2c2c2c', light: '#ffffff' } })
      .then(setQrSvg)
      .catch((err) => console.warn('QR generation failed:', err))
  }, [appUrl, onPhone])

  async function copy() {
    if (!appUrl) return
    try {
      await navigator.clipboard.writeText(appUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard can be blocked inside the Power Apps frame; the link stays selectable below.
      setCopied(false)
    }
  }

  const iosSteps = (
    <ol className="steps">
      <li>Open de link in <strong>Safari</strong></li>
      <li>Tik op het <strong>Deel</strong>-icoon (vierkant met pijltje ⬆️)</li>
      <li>Kies <strong>“Zet op beginscherm”</strong> en tik op <strong>Voeg toe</strong></li>
    </ol>
  )
  const androidSteps = (
    <ol className="steps">
      <li>Open de link in <strong>Chrome</strong></li>
      <li>Tik rechtsboven op <strong>⋮</strong></li>
      <li>Kies <strong>“Toevoegen aan startscherm”</strong></li>
    </ol>
  )

  return (
    <Sheet title="Op je telefoon zetten" onClose={onClose}>
      <div className="phone">
        {!onPhone && (
          <>
            <p className="phone-intro">Scan deze code met de camera van je telefoon om de app te openen.</p>
            <div className="qr" aria-label="QR-code naar de app">
              {qrSvg ? <div dangerouslySetInnerHTML={{ __html: qrSvg }} /> : <span className="qr-placeholder">Link laden…</span>}
            </div>
          </>
        )}

        {appUrl && (
          <div className="link-row">
            <input className="link-input" readOnly value={appUrl} onFocus={(e) => e.currentTarget.select()} aria-label="Link naar de app" />
            <button type="button" className="btn btn-small" onClick={copy}>
              {copied ? 'Gekopieerd ✓' : 'Kopieer'}
            </button>
          </div>
        )}

        <p className="phone-intro">Zet de app daarna op je beginscherm, dan opent hij voortaan met één tik:</p>

        <div className="platforms">
          <div className={`platform ${onPhone && ios ? 'is-current' : ''}`}>
            <h3>📱 iPhone</h3>
            {iosSteps}
          </div>
          <div className={`platform ${onPhone && !ios ? 'is-current' : ''}`}>
            <h3>🤖 Android</h3>
            {androidSteps}
          </div>
        </div>

        <p className="phone-note">
          De eerste keer log je in met je werkaccount. De Power Apps-app uit de App Store is hier niet nodig: deze app
          draait in de browser.
        </p>
      </div>
    </Sheet>
  )
}
