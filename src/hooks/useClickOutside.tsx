import { useEffect } from 'react'
import type { RefObject } from 'react'

function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: MouseEvent) => void,
) {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      const el = ref?.current
      if (!el) return
      if (el.contains(event.target as Node)) return
      handler(event)
    }

    document.addEventListener('click', listener)
    return () => {
      document.removeEventListener('click', listener)
    }
  }, [ref, handler])
}

export default useClickOutside

