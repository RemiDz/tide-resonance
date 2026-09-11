import type { SVGProps } from 'react'

const paths = {
  wave: 'M2 9c3-5 5 5 9 0s6 5 11 0M2 15c3-5 5 5 9 0s6 5 11 0',
  pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  down: 'm7 10 5 5 5-5',
  right: 'm9 6 6 6-6 6',
  left: 'm15 6-6 6 6 6',
  up: 'M12 19V5m-6 6 6-6 6 6',
  ebb: 'M12 5v14m-6-6 6 6 6-6',
  close: 'm6 6 12 12M6 18 18 6',
  search: 'm21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
  locate: 'M12 2v3m0 14v3M2 12h3m14 0h3M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0ZM14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z',
  settings: 'M4 7h9m4 0h3M4 17h3m4 0h9M13 4v6M7 14v6',
  play: 'm9 5 11 7-11 7Z',
  pause: 'M8 5v14M16 5v14',
  check: 'm5 12 4 4L19 6',
  info: 'M12 11v6m0-10v.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
} as const

export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: keyof typeof paths }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}><path d={paths[name]} /></svg>
}
