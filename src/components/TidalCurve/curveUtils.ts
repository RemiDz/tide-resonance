import type { TidePoint } from '@/types/tidal'

export interface SVGPoint {
  x: number
  y: number
}

export interface ViewBox {
  width: number
  height: number
}

export interface Padding {
  top: number
  right: number
  bottom: number
  left: number
}

/**
 * Map TidePoint[] to SVG coordinate space.
 * X axis = time (00:00 → 23:59), Y axis = height (inverted for SVG).
 */
export function mapToSVG(
  points: TidePoint[],
  viewBox: ViewBox,
  padding: Padding
): SVGPoint[] {
  if (points.length === 0) return []

  const plotW = viewBox.width - padding.left - padding.right
  const plotH = viewBox.height - padding.top - padding.bottom

  // Time range: start of day → end of day
  const dayStart = new Date(points[0].time)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(dayStart)
  dayEnd.setHours(23, 59, 59, 999)
  const timeRange = dayEnd.getTime() - dayStart.getTime()

  // Height range with some buffer
  const heights = points.map((p) => p.height)
  const minH = Math.min(...heights)
  const maxH = Math.max(...heights)
  const heightRange = maxH - minH || 1
  const buffer = heightRange * 0.1

  return points.map((p) => {
    const tFrac = (p.time.getTime() - dayStart.getTime()) / timeRange
    const hFrac = (p.height - (minH - buffer)) / (heightRange + buffer * 2)
    return {
      x: padding.left + tFrac * plotW,
      y: padding.top + (1 - hFrac) * plotH, // invert Y for SVG
    }
  })
}

/**
 * Convert SVG points to a smooth cubic bezier path using Catmull-Rom interpolation.
 * Control points: p1 ± (p2 - p0) / 6
 */
export function catmullRomToBezierPath(points: SVGPoint[]): string {
  if (points.length < 2) return ''
  if (points.length === 2) {
    return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`
  }

  let d = `M ${points[0].x},${points[0].y}`

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]

    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6

    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`
  }

  return d
}

/**
 * Get the SVG position of the current time on the curve.
 * Linearly interpolates between the two nearest points.
 */
export function getNowPosition(
  points: TidePoint[],
  svgPoints: SVGPoint[],
  now: Date
): SVGPoint | null {
  if (points.length < 2 || svgPoints.length < 2) return null

  const nowMs = now.getTime()

  // Find the segment that brackets `now`
  for (let i = 0; i < points.length - 1; i++) {
    const t0 = points[i].time.getTime()
    const t1 = points[i + 1].time.getTime()

    if (nowMs >= t0 && nowMs <= t1) {
      const frac = (nowMs - t0) / (t1 - t0)
      return {
        x: svgPoints[i].x + frac * (svgPoints[i + 1].x - svgPoints[i].x),
        y: svgPoints[i].y + frac * (svgPoints[i + 1].y - svgPoints[i].y),
      }
    }
  }

  // If now is before first point or after last, clamp
  if (nowMs < points[0].time.getTime()) return svgPoints[0]
  return svgPoints[svgPoints.length - 1]
}

/**
 * Build the closed area path for the filled region under the curve.
 */
export function areaPath(
  curvePath: string,
  svgPoints: SVGPoint[],
  viewBox: ViewBox,
  padding: Padding
): string {
  if (svgPoints.length === 0) return ''
  const bottomY = viewBox.height - padding.bottom
  const lastPt = svgPoints[svgPoints.length - 1]
  const firstPt = svgPoints[0]
  return `${curvePath} L ${lastPt.x},${bottomY} L ${firstPt.x},${bottomY} Z`
}
