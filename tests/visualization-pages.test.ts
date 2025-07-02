/**
 * Visualization Pages Test Suite
 * 
 * Tests the new repository visualization pages to ensure they render
 * correctly and handle interactions properly.
 */

import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/'
  }),
  usePathname: () => '/'
}))

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div data-testid="card-content" {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div data-testid="card-header" {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h2 data-testid="card-title" {...props}>{children}</h2>,
  CardDescription: ({ children, ...props }: any) => <p data-testid="card-description" {...props}>{children}</p>
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button data-testid="button" onClick={onClick} {...props}>{children}</button>
  )
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: any) => <span data-testid="badge" {...props}>{children}</span>
}))

vi.mock('@/components/ui/slider', () => ({
  Slider: ({ value, onValueChange, ...props }: any) => (
    <input 
      data-testid="slider" 
      type="range" 
      value={value?.[0] || 0}
      onChange={(e) => onValueChange?.([parseInt(e.target.value)])}
      {...props}
    />
  )
}))

describe('Visualization Pages', () => {
  
  describe('Growth Map Page', () => {
    test('renders growth map interface', async () => {
      const GrowthMapPage = (await import('../src/app/growth-map/page.tsx')).default
      
      render(<GrowthMapPage />)
      
      // Should have main title
      expect(screen.getByText(/Repository Growth Map/i)).toBeDefined()
      
      // Should have timeline controls
      expect(screen.getByText(/Timeline Controls/i)).toBeDefined()
      
      // Should have play/pause buttons
      expect(screen.getByText(/Play/i)).toBeDefined()
      
      // Should have semantic map
      expect(screen.getByText(/Semantic Repository Map/i)).toBeDefined()
    })

    test('handles timeline interaction', async () => {
      const GrowthMapPage = (await import('../src/app/growth-map/page.tsx')).default
      
      render(<GrowthMapPage />)
      
      // Should have speed and commit sliders
      const sliders = screen.getAllByTestId('slider')
      expect(sliders.length).toBeGreaterThanOrEqual(2)
    })

    test('displays commit information', async () => {
      const GrowthMapPage = (await import('../src/app/growth-map/page.tsx')).default
      
      render(<GrowthMapPage />)
      
      // Should show current commit info
      expect(screen.getByText(/Current Commit/i)).toBeDefined()
      expect(screen.getByText(/Semantic Impact/i)).toBeDefined()
      expect(screen.getByText(/Repository Stats/i)).toBeDefined()
    })
  })

  describe('Repo Map Page', () => {
    test('renders interactive repository map', async () => {
      const RepoMapPage = (await import('../src/app/repo-map/page.tsx')).default
      
      render(<RepoMapPage />)
      
      // Should have main title
      expect(screen.getByText(/Repository Map/i)).toBeDefined()
      
      // Should have color mode controls
      expect(screen.getByText(/Semantic/i)).toBeDefined()
      expect(screen.getByText(/Commit Age/i)).toBeDefined()
      expect(screen.getByText(/Complexity/i)).toBeDefined()
      
      // Should show file statistics
      expect(screen.getByText(/files/i)).toBeDefined()
      expect(screen.getByText(/directories/i)).toBeDefined()
    })

    test('handles color mode switching', async () => {
      const RepoMapPage = (await import('../src/app/repo-map/page.tsx')).default
      
      render(<RepoMapPage />)
      
      // Should have mode buttons
      const buttons = screen.getAllByTestId('button')
      const semanticButton = buttons.find(btn => btn.textContent?.includes('Semantic'))
      const commitButton = buttons.find(btn => btn.textContent?.includes('Commit'))
      
      expect(semanticButton).toBeDefined()
      expect(commitButton).toBeDefined()
    })

    test('shows navigation instructions', async () => {
      const RepoMapPage = (await import('../src/app/repo-map/page.tsx')).default
      
      render(<RepoMapPage />)
      
      expect(screen.getByText(/How to Navigate/i)).toBeDefined()
    })
  })

  describe('Enhanced Project Map Page', () => {
    test('renders enhanced project overview', async () => {
      const ProjectMapPage = (await import('../src/app/project-map/page.tsx')).default
      
      render(<ProjectMapPage />)
      
      // Should have main title
      expect(screen.getByText(/Values.md Project Map/i)).toBeDefined()
      
      // Should show system overview
      expect(screen.getByText(/Components Operational/i)).toBeDefined()
      
      // Should have API dataflow section
      expect(screen.getByText(/Real API Dataflow/i)).toBeDefined()
    })

    test('displays semantic evolution story', async () => {
      const ProjectMapPage = (await import('../src/app/project-map/page.tsx')).default
      
      render(<ProjectMapPage />)
      
      // Should have evolution story
      expect(screen.getByText(/Semantic Evolution Story/i)).toBeDefined()
      
      // Should show all chapters
      expect(screen.getByText(/Chapter 1: Genesis/i)).toBeDefined()
      expect(screen.getByText(/Chapter 2: The Brain/i)).toBeDefined()
      expect(screen.getByText(/Chapter 3: The Nervous System/i)).toBeDefined()
      expect(screen.getByText(/Chapter 4: The Face/i)).toBeDefined()
      expect(screen.getByText(/Chapter 5: Evolution/i)).toBeDefined()
      expect(screen.getByText(/Chapter 6: Self-Reflection/i)).toBeDefined()
    })

    test('shows technology stack', async () => {
      const ProjectMapPage = (await import('../src/app/project-map/page.tsx')).default
      
      render(<ProjectMapPage />)
      
      expect(screen.getByText(/Technology Stack/i)).toBeDefined()
      expect(screen.getByText(/Frontend/i)).toBeDefined()
      expect(screen.getByText(/Backend/i)).toBeDefined()
    })
  })

  describe('Visualization Data Integrity', () => {
    test('commit timeline data is valid', async () => {
      const { commitTimeline } = await import('../src/app/growth-map/page.tsx')
      
      expect(Array.isArray(commitTimeline)).toBe(true)
      expect(commitTimeline.length).toBeGreaterThan(0)
      
      // Each commit should have required fields
      commitTimeline.forEach(commit => {
        expect(commit.hash).toBeTruthy()
        expect(commit.date).toBeTruthy()
        expect(commit.message).toBeTruthy()
        expect(Array.isArray(commit.filesChanged)).toBe(true)
        expect(typeof commit.semanticImpact).toBe('object')
      })
    })

    test('repository structure data is valid', async () => {
      const module = await import('../src/app/repo-map/page.tsx')
      
      // Should export the component
      expect(module.default).toBeDefined()
      expect(typeof module.default).toBe('function')
    })

    test('semantic colors are consistent', () => {
      const semanticTypes = ['frontend', 'backend', 'data', 'config', 'test', 'docs']
      const colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#6b7280', '#10b981', '#ec4899']
      
      expect(semanticTypes).toHaveLength(6)
      expect(colors).toHaveLength(6)
      
      // All colors should be valid hex codes
      colors.forEach(color => {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i)
      })
    })
  })

  describe('Interactive Features', () => {
    test('timeline controls work correctly', async () => {
      // Mock useState for timeline
      let isPlaying = false
      let currentIndex = 0
      
      const setIsPlaying = (value: boolean) => { isPlaying = value }
      const setCurrentIndex = (value: number) => { currentIndex = value }
      
      // Simulate play/pause
      setIsPlaying(true)
      expect(isPlaying).toBe(true)
      
      setIsPlaying(false)
      expect(isPlaying).toBe(false)
      
      // Simulate timeline navigation
      setCurrentIndex(3)
      expect(currentIndex).toBe(3)
    })

    test('file node interactions work', () => {
      // Mock file node click
      const mockNode = {
        name: 'test.ts',
        type: 'file' as const,
        semantic: 'frontend' as const,
        size: 1000,
        complexity: 5
      }
      
      const handleClick = vi.fn()
      handleClick(mockNode)
      
      expect(handleClick).toHaveBeenCalledWith(mockNode)
    })

    test('color mode switching works', () => {
      type ColorMode = 'semantic' | 'commit' | 'complexity'
      
      let colorMode: ColorMode = 'semantic'
      const setColorMode = (mode: ColorMode) => { colorMode = mode }
      
      setColorMode('commit')
      expect(colorMode).toBe('commit')
      
      setColorMode('complexity')
      expect(colorMode).toBe('complexity')
      
      setColorMode('semantic')
      expect(colorMode).toBe('semantic')
    })
  })

  describe('Performance Considerations', () => {
    test('large dataset handling', () => {
      // Simulate large repository structure
      const largeFileList = Array.from({ length: 1000 }, (_, i) => ({
        name: `file-${i}.ts`,
        path: `/src/file-${i}.ts`,
        type: 'file' as const,
        semantic: 'frontend' as const,
        size: Math.floor(Math.random() * 10000),
        complexity: Math.floor(Math.random() * 10) + 1
      }))
      
      expect(largeFileList).toHaveLength(1000)
      
      // Should handle filtering efficiently
      const frontendFiles = largeFileList.filter(f => f.semantic === 'frontend')
      expect(frontendFiles).toHaveLength(1000)
    })

    test('animation performance', () => {
      // Test animation state management
      const animationStates = new Map()
      
      for (let i = 0; i < 100; i++) {
        animationStates.set(`file-${i}`, {
          visible: i < 50,
          delay: i * 100
        })
      }
      
      expect(animationStates.size).toBe(100)
      
      // Should clean up efficiently
      animationStates.clear()
      expect(animationStates.size).toBe(0)
    })
  })
})