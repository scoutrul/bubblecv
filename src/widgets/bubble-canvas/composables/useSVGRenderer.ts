import type { Ref } from 'vue'
import * as d3 from 'd3'
import type { SimulationNode, BubbleContinueEvent } from './types/bubble.types'
import { BubbleSimulationBaseImpl } from './useBubbleSimulation'
import { getExpertiseConfig } from './useBubbleConfig'
import { GAME_CONFIG } from '../../../shared/config/game-config'

interface SVGParticle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  alpha: number
  color: string
  life: number
  element: SVGCircleElement
}

export class SVGRenderer extends BubbleSimulationBaseImpl {
  private svgRef: Ref<SVGElement | null>
  private svg: d3.Selection<SVGElement, unknown, null, undefined> | null = null
  private bubblesGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null
  private effectsGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null
  private particles: SVGParticle[] = []
  private readonly maxParticles = 50

  constructor(svgRef: Ref<SVGElement | null>) {
    super()
    this.svgRef = svgRef
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleMouseLeave = this.handleMouseLeave.bind(this)
    this.handleBubbleContinue = this.handleBubbleContinue.bind(this)
  }

  protected initRenderer(): void {
    if (!this.svgRef.value) return

    const svg = d3.select<SVGElement, unknown>(this.svgRef.value)
    if (!svg.empty()) {
      this.svg = svg
      this.bubblesGroup = svg.append('g').attr('class', 'bubbles')
      this.effectsGroup = svg.append('g').attr('class', 'effects')

      // Add event listeners
      this.svgRef.value.addEventListener('mousemove', this.handleMouseMove)
      this.svgRef.value.addEventListener('click', this.handleClick)
      this.svgRef.value.addEventListener('mouseleave', this.handleMouseLeave)

      // Create simulation
      this.simulation = d3.forceSimulation<SimulationNode>()
        .force('charge', d3.forceManyBody().strength(-100))
        .force('collide', d3.forceCollide<SimulationNode>().radius(d => d.currentRadius + 2))
        .force('center', d3.forceCenter(this.width / 2, this.height / 2))
        .on('tick', () => this.render())
    }
  }

  protected destroyRenderer(): void {
    if (!this.svgRef.value) return

    // Remove event listeners
    this.svgRef.value.removeEventListener('mousemove', this.handleMouseMove)
    this.svgRef.value.removeEventListener('click', this.handleClick)
    this.svgRef.value.removeEventListener('mouseleave', this.handleMouseLeave)

    // Clear SVG groups
    if (this.bubblesGroup) this.bubblesGroup.remove()
    if (this.effectsGroup) this.effectsGroup.remove()
    this.bubblesGroup = null
    this.effectsGroup = null

    // Clear particles
    this.particles.forEach(p => p.element.remove())
    this.particles = []
  }

  protected render(): void {
    if (!this.bubblesGroup || !this.effectsGroup) return

    // Update screen shake
    if (this.screenShake.intensity > 0.1) {
      const shakeX = this.screenShake.x
      const shakeY = this.screenShake.y
      this.bubblesGroup.attr('transform', `translate(${shakeX},${shakeY})`)
      this.effectsGroup.attr('transform', `translate(${shakeX},${shakeY})`)
    } else {
      this.bubblesGroup.attr('transform', null)
      this.effectsGroup.attr('transform', null)
    }

    // Update particles
    this.particles = this.particles.filter(particle => {
      // Update particle physics
      particle.x += particle.vx
      particle.y += particle.vy
      particle.vy += 0.1 // Gravity
      particle.life -= 0.02
      particle.alpha = Math.max(0, particle.life)
      particle.radius *= 0.99

      // Update particle element
      particle.element.setAttribute('cx', particle.x.toString())
      particle.element.setAttribute('cy', particle.y.toString())
      particle.element.setAttribute('r', particle.radius.toString())
      particle.element.setAttribute('fill', `rgba(${particle.color},${particle.alpha})`)

      // Remove if dead
      if (particle.life <= 0) {
        particle.element.remove()
        return false
      }
      return true
    })

    // Update explosion effects
    this.explosionEffects = this.explosionEffects.filter(effect => {
      effect.radius += 5
      effect.alpha -= 0.02

      if (effect.alpha <= 0) {
        // Remove effect elements
        const safeId = `${Math.floor(effect.x)}_${Math.floor(effect.y)}`
        this.effectsGroup
          ?.selectAll(`circle[data-effect-id="${safeId}"]`)
          .remove()
        return false
      }

      // Update or create effect elements
      const safeId = `${Math.floor(effect.x)}_${Math.floor(effect.y)}`
      const effectId = `${effect.x},${effect.y}`

      // Shockwave
      this.effectsGroup
        ?.selectAll(`circle.shockwave[data-effect-id="${safeId}"]`)
        .data([effect])
        .join('circle')
        .attr('class', 'shockwave')
        .attr('data-effect-id', safeId)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', d => d.radius)
        .attr('fill', 'none')
        .attr('stroke', `rgba(255,255,255,${effect.alpha * 0.3})`)
        .attr('stroke-width', 2)

      // Outer ring
      this.effectsGroup
        ?.selectAll(`circle.outer-ring[data-effect-id="${safeId}"]`)
        .data([effect])
        .join('circle')
        .attr('class', 'outer-ring')
        .attr('data-effect-id', safeId)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', d => d.radius * 0.9)
        .attr('fill', 'none')
        .attr('stroke', `rgba(255,100,100,${effect.alpha * 0.8})`)
        .attr('stroke-width', 4)

      // Inner ring
      this.effectsGroup
        ?.selectAll(`circle.inner-ring[data-effect-id="${safeId}"]`)
        .data([effect])
        .join('circle')
        .attr('class', 'inner-ring')
        .attr('data-effect-id', safeId)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', d => d.radius * 0.7)
        .attr('fill', 'none')
        .attr('stroke', `rgba(255,200,100,${effect.alpha * 0.6})`)
        .attr('stroke-width', 2)

      // Central flash
      const flashGradientId = `flash-gradient-${safeId}`
      const defs = this.effectsGroup?.selectAll('defs').data([null]).join('defs')
      
      defs?.selectAll(`radialGradient#${flashGradientId}`)
        .data([effect])
        .join('radialGradient')
        .attr('id', flashGradientId)
        .selectAll('stop')
        .data([
          { offset: '0%', color: `rgba(255,255,255,${effect.alpha})` },
          { offset: '100%', color: 'rgba(255,255,255,0)' }
        ])
        .join('stop')
        .attr('offset', d => d.offset)
        .attr('stop-color', d => d.color)

      this.effectsGroup
        ?.selectAll(`circle.flash[data-effect-id="${safeId}"]`)
        .data([effect])
        .join('circle')
        .attr('class', 'flash')
        .attr('data-effect-id', safeId)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', d => d.radius * 0.3)
        .attr('fill', `url(#${flashGradientId})`)

      return true
    })

    // Update bubbles
    const bubbleSelection = this.bubblesGroup
      .selectAll<SVGCircleElement, SimulationNode>('circle.bubble')
      .data(this.nodes, d => d.id)

    // Remove old bubbles
    bubbleSelection.exit().remove()

    // Add new bubbles
    const enterBubbles = bubbleSelection
      .enter()
      .append('circle')
      .attr('class', 'bubble')
      .attr('r', d => d.currentRadius)
      .attr('fill', d => d.color)

    // Update all bubbles
    bubbleSelection
      .merge(enterBubbles)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => d.currentRadius)
      .attr('fill', d => d.color)

    // Update text
    const textSelection = this.bubblesGroup
      .selectAll<SVGTextElement, SimulationNode>('text.bubble-text')
      .data(this.nodes.filter(d => d.isHovered && d.textLines), d => d.id)

    // Remove old text
    textSelection.exit().remove()

    // Add new text
    const enterText = textSelection
      .enter()
      .append('text')
      .attr('class', 'bubble-text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('font-family', 'Arial')
      .style('font-size', '14px')
      .style('pointer-events', 'none')

    // Update all text
    textSelection
      .merge(enterText)
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .selectAll<SVGTSpanElement, string>('tspan')
      .data(d => d.textLines || [])
      .join('tspan')
      .attr('x', d => (d as any).x)
      .attr('dy', (_, i) => i === 0 ? '-1em' : '1.2em')
      .text(d => d)
  }

  public async handleBubbleContinue(event: BubbleContinueEvent): Promise<void> {
    const { bubbleId } = event.detail
    const bubble = this.nodes.find(node => node.id === bubbleId)
    if (!bubble) return

    // Create explosion particles
    const particleCount = Math.min(this.maxParticles - this.particles.length, 20)
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount
      const speed = 2 + Math.random() * 3
      const color = this.getRGBFromColor(bubble.color)
      const radius = 2 + Math.random() * 3
      const life = 0.8 + Math.random() * 0.4

      const particle: SVGParticle = {
        x: bubble.x,
        y: bubble.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius,
        alpha: 1,
        color,
        life,
        element: document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      }

      this.effectsGroup?.node()?.appendChild(particle.element)
      this.particles.push(particle)
    }

    // Award XP
    let leveledUp = false
    if (bubble.isEasterEgg) {
      leveledUp = await this.sessionStore.gainXP(GAME_CONFIG.XP_PER_EASTER_EGG)
    } else {
      leveledUp = await this.sessionStore.gainBubbleXP(bubble.skillLevel)
    }

    // Show Level Up modal
    if (leveledUp) {
      this.modalStore.openLevelUpModal(this.sessionStore.currentLevel)
    }

    // Mark bubble as visited
    await this.sessionStore.visitBubble(bubble.id)
    bubble.isVisited = true

    // Create explosion and remove bubble
    this.explodeBubble(bubble)
  }

  private getRGBFromColor(color: string): string {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return '255, 255, 255'

    ctx.fillStyle = color
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
    return `${r}, ${g}, ${b}`
  }

  protected drawBubble(bubble: SimulationNode): void {
    if (!this.bubblesGroup) return

    this.bubblesGroup
      .selectAll<SVGCircleElement, SimulationNode>(`circle[data-id="${bubble.id}"]`)
      .data([bubble])
      .join('circle')
      .attr('data-id', bubble.id)
      .attr('cx', bubble.x)
      .attr('cy', bubble.y)
      .attr('r', bubble.currentRadius)
      .attr('fill', bubble.color)
  }

  protected drawText(bubble: SimulationNode): void {
    if (!this.bubblesGroup || !bubble.textLines) return

    const text = this.bubblesGroup
      .selectAll<SVGTextElement, SimulationNode>(`text[data-id="${bubble.id}"]`)
      .data([bubble])
      .join('text')
      .attr('data-id', bubble.id)
      .attr('x', bubble.x)
      .attr('y', bubble.y)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('font-family', 'Arial')
      .style('font-size', '14px')
      .style('pointer-events', 'none')

    text.selectAll<SVGTSpanElement, string>('tspan')
      .data(bubble.textLines)
      .join('tspan')
      .attr('x', bubble.x)
      .attr('dy', (_, i) => i === 0 ? '-1em' : '1.2em')
      .text(d => d)
  }

  protected getContainerRect(): DOMRect | null {
    return this.svgRef.value?.getBoundingClientRect() || null
  }

  protected setCursor(cursor: string): void {
    if (this.svgRef.value) {
      this.svgRef.value.style.cursor = cursor
    }
  }

  protected handleMouseLeave(): void {
    if (this.hoveredBubble) {
      this.hoveredBubble.isHovered = false
      this.hoveredBubble = null
    }
  }

  protected async handleClick(event: MouseEvent): Promise<void> {
    if (!this.svgRef.value || !this.hoveredBubble) return

    const bubbleContinueEvent = new CustomEvent('bubble-continue', {
      detail: { bubbleId: this.hoveredBubble.id }
    })
    window.dispatchEvent(bubbleContinueEvent)
  }

  protected pushNeighbors(centerBubble: SimulationNode, pushRadius: number, pushStrength: number): void {
    this.nodes.forEach(otherBubble => {
      if (otherBubble.id === centerBubble.id) return

      const dx = otherBubble.x - centerBubble.x
      const dy = otherBubble.y - centerBubble.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < pushRadius) {
        const force = (1 - distance / pushRadius) * pushStrength
        const angle = Math.atan2(dy, dx)
        
        otherBubble.vx = (otherBubble.vx || 0) + Math.cos(angle) * force
        otherBubble.vy = (otherBubble.vy || 0) + Math.sin(angle) * force
      }
    })
  }
} 