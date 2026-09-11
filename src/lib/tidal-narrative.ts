export function formatTimeUntil(target: Date): string {
  const diffMs = target.getTime() - Date.now()
  if (diffMs <= 0) return 'now'
  const totalMinutes = Math.ceil(diffMs / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`
}

export function formatTime12h(date: Date, timeZone?: string): string {
  return date.toLocaleTimeString('en-GB', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}
