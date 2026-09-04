import type { CSSProperties } from 'react'
import './Skeleton.css'

export interface SkeletonProps {
  /** Height in px (required). */
  height: number
  /** Width in px. Defaults to 100% of the parent. */
  width?: number
  /** Border radius in px. Defaults to 8, matching the wireframe's bars. */
  radius?: number
  /** Extra class names. */
  className?: string
  /** Extra inline styles. */
  style?: CSSProperties
}

/**
 * Skeleton – a gray placeholder block standing in for real content in the
 * wireframe. Use it anywhere you need a "fill this in later" box, or replace
 * usages with real content as you build on this structure.
 */
export default function Skeleton({ height, width, radius = 8, className = '', style }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`.trim()}
      style={{ height, width, borderRadius: radius, ...style }}
      aria-hidden="true"
    />
  )
}
