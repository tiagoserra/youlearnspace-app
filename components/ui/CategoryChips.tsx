'use client'

import { useRef, useState } from 'react'
import { CategoryChipsProps } from '@/lib/types'
import styles from './CategoryChips.module.css'

export default function CategoryChips({
  categories,
  selectedCategory,
  onCategoryChange,
  sidebarExpanded,
  isMobile
}: CategoryChipsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [hasMoved, setHasMoved] = useState(false)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setHasMoved(false)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
    scrollRef.current.style.cursor = 'grabbing'
  }

  const handleMouseLeave = () => {
    if (!scrollRef.current) return
    setIsDragging(false)
    scrollRef.current.style.cursor = 'grab'
  }

  const handleMouseUp = () => {
    if (!scrollRef.current) return
    setIsDragging(false)
    scrollRef.current.style.cursor = 'grab'
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    setHasMoved(true)
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 2
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  const handleChipClick = (category: string) => {
    if (!hasMoved) {
      onCategoryChange(category)
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (!scrollRef.current) return
    e.preventDefault()
    scrollRef.current.scrollLeft += e.deltaY
  }

  return (
    <div
      className={styles.container}
      style={{
        paddingLeft: isMobile ? '16px' : sidebarExpanded ? '16px' : '16px'
      }}
    >
      <div
        ref={scrollRef}
        className={styles.chipsWrapper}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
      >
        {categories.map((category) => (
          <button
            key={category}
            className={`${styles.chip} ${selectedCategory === category ? styles.active : ''}`}
            onClick={() => handleChipClick(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  )
}
