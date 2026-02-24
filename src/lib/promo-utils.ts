export interface StarPoint {
  x: number
  y: number
  size: number
  opacity: number
}

/** Day hash for auto-selecting hook index (0–4). */
export function getDayHash(date: Date): number {
  return (date.getDate() + (date.getMonth() + 1) * 31) % 5
}

/** Generate a deterministic star field. */
export function generateStarField(count: number, seed: number): StarPoint[] {
  const stars: StarPoint[] = []
  let s = seed
  const next = () => {
    s = (s * 16807 + 0) % 2147483647
    return s / 2147483647
  }
  for (let i = 0; i < count; i++) {
    stars.push({
      x: next() * 100,
      y: next() * 100,
      size: 0.5 + next() * 1.5,
      opacity: 0.15 + next() * 0.45,
    })
  }
  return stars
}

/** Download a single card image. */
export function downloadCard(dataUrl: string, filename: string): void {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/** Download all cards sequentially with a delay between each. */
export async function downloadAllCards(
  images: { dataUrl: string; slug: string; cardNum: number }[],
  dateStr: string
): Promise<void> {
  for (const img of images) {
    const filename = `tide-resonance-${img.cardNum}-${img.slug}-${dateStr}.png`
    downloadCard(img.dataUrl, filename)
    await new Promise((r) => setTimeout(r, 200))
  }
}

/** Format date as YYYY-MM-DD. */
export function formatDateISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
