import { useEffect, useState } from 'react'
import { getContext } from '@microsoft/power-apps/app'
import { isMock } from '../data'

export interface AppInfo {
  firstName?: string
  /** Shareable link that opens this app (used for the "op je telefoon" QR code). */
  appUrl?: string
}

export function useAppInfo(): AppInfo {
  const [info, setInfo] = useState<AppInfo>(() => (isMock ? { appUrl: window.location.href } : {}))

  useEffect(() => {
    if (isMock) return
    let cancelled = false
    getContext()
      .then(({ app, user }) => {
        if (cancelled) return
        // Prefer the stable Power Apps play link over the host's internal runtime URL.
        const playUrl =
          app.environmentId && app.appId
            ? `https://apps.powerapps.com/play/e/${app.environmentId}/app/${app.appId}`
            : app.appUrl
        setInfo({ firstName: user.fullName?.split(' ')[0], appUrl: playUrl })
      })
      .catch((err) => console.warn('Could not read app context:', err))
    return () => {
      cancelled = true
    }
  }, [])

  return info
}
