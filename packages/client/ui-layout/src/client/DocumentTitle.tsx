/** Browser title selection follows the active main panel without subscribing the frame. */
import { useEffect } from 'react'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'

/** Props for the browser title projection. */
export type DocumentTitleProps = Pick<PropsRuntime<'root'>, 'useSessions' | 'useSessionStatus' | 'usePanelInfo'> & {
  /** Build-configured or localized product title. */
  productTitle: string
}

/**
 * Project the selected durable session title into the browser title and
 * restore the build-selected product title when unmounted. A status prefix
 * mirrors workspace activity onto background browser tabs: `❗` while any
 * Session awaits user interaction, otherwise `●` while any Session runs.
 * @param props - Selected session title and status projection.
 * @returns No rendered content.
 */
export function DocumentTitle({ useSessions, useSessionStatus, usePanelInfo, productTitle }: DocumentTitleProps): null {
  const showSessionTitle = usePanelInfo(info => info.activePanelId === null)
  const title = useSessions((state) => {
    const current = Object.values(state.byId)
      .find(session => (session.retainedBy.mainView ?? 0) > 0)?.id
    return !showSessionTitle || current === undefined ? undefined : state.byId[current]?.title
  })
  const status = useSessionStatus((snapshot) => {
    let running = false
    for (const entry of snapshot.values()) {
      if (entry.pendingInteraction !== undefined) return 'pending'
      running ||= entry.running === true
    }
    return running ? 'running' : 'idle'
  })
  useEffect(() => {
    const base = title === undefined ? productTitle : `${title} — ${productTitle}`
    document.title = status === 'pending' ? `❗ ${base}` : status === 'running' ? `● ${base}` : base
    return () => { document.title = productTitle }
  }, [productTitle, title, status])
  return null
}
