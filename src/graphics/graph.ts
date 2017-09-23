/*--------------------------------------------------------------------------

neuron: function approximation

The MIT License (MIT)

Copyright (c) 2016 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---------------------------------------------------------------------------*/

export type Plot = {x: number, y: number}
export type Bounds = {
  minx: number,
  maxx: number,
  miny: number,
  maxy: number
}

export type Graph2DOptions = {
  backgroundColor?: string,
  lineColor?      : string,
  gridColor?      : string,
  textColor?      : string
}

/**
 * Graph2D
 * 
 * A 2D graph representation. provides a plot interface and
 * automatically 
 */
export class Graph2D {
  private context: CanvasRenderingContext2D
  private bounds:  Bounds
  private plots :  Plot[]

  /**
   * creates a new graph2D
   * @param {HTMLCanvasElement} canvas the html canvas to bind to.
   * @returns {Graph2D}
   */
  constructor(private canvas: HTMLCanvasElement, private options?: Graph2DOptions) {
    this.options = this.options || {}
    this.options.backgroundColor = this.options.backgroundColor || "#FFF"
    this.options.lineColor       = this.options.lineColor       || "#000"
    this.options.textColor       = this.options.textColor       || "#000"
    this.options.gridColor       = this.options.gridColor       || "#777"

    this.context = canvas.getContext("2d")
    this.bounds = { minx: -1, maxx: 1, miny: -1, maxy: 1 }
    this.plots = []
  }

  /**
   * plots the given value on this graph.
   * @param {number} x the x value of the plot. 
   * @param {number} y the y value of the plot.
   * @returns {void}
   */
  public plot(x: number, y: number): void {
    if(x < this.bounds.minx) { this.bounds.minx = x }
    if(x > this.bounds.maxx) { this.bounds.maxx = x }
    if(y < this.bounds.minx) { this.bounds.minx = y }
    if(y > this.bounds.maxx) { this.bounds.maxx = y }
    for(let i = 0; i < this.plots.length; i++) {
      if(x < this.plots[i].x) {
        this.plots.splice(i, 0, {x, y})
        return
      }
    }
    this.plots.push({x, y})
  }

  /**
   * clears the graph.
   * @returns {void}
   */
  public clear(): void {
    this.context.fillStyle = this.options.backgroundColor
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  /**
   * presents this graph.
   * @returns {void}
   */
  public present(): void {
    this.resolveSize()
    this.clear()
    this.renderGrid()
    this.presentPlots()    
    this.plots = []
    this.bounds = { 
      minx: -1, 
      maxx:  1, 
      miny: -1, 
      maxy:  1 
    }
  }

  private resolveSize(): void {
    const width = this.canvas.clientWidth
    const height = this.canvas.clientHeight
    this.canvas.width = width
    this.canvas.height = height
  }
  /**
   * renders the graph backing grid.
   * @returns {void}
   */
  public renderGrid(): void {

    // draw reference markers
    this.context.fillStyle = this.options.textColor
    this.context.fillText(this.bounds.minx.toString(), 6, (this.canvas.height / 2) - 6 )
    this.context.fillText(this.bounds.maxx.toString(), this.canvas.width - 10, (this.canvas.height / 2) - 6 )
    this.context.fillText(this.bounds.miny.toString(), (this.canvas.width / 2) + 6, 14)
    this.context.fillText(this.bounds.maxy.toString(), (this.canvas.width / 2) + 6, (this.canvas.height) - 8)
   

    // draw cross point.
    this.context.beginPath()
    this.context.moveTo(0, this.canvas.height / 2)
    this.context.lineTo(this.canvas.width, this.canvas.height / 2)
    this.context.moveTo(this.canvas.width / 2, 0)
    this.context.lineTo(this.canvas.width / 2, this.canvas.height)
    this.context.lineWidth   = 2
    this.context.strokeStyle = this.options.gridColor
    this.context.stroke()

    // draw grid
    this.context.beginPath()
    const offsetx = (this.canvas.width / 10)
    for(let i = 0; i < 10; i++) {
      this.context.moveTo((offsetx * i), 0)
      this.context.lineTo((offsetx * i), this.canvas.height)
    }
    const offsety = (this.canvas.height / 10)
    for(let i = 0; i < 10; i++) {
      this.context.moveTo(0, (offsety * i))
      this.context.lineTo(this.canvas.width, (offsety * i))
    }
    this.context.lineWidth = 1
    this.context.strokeStyle = this.options.gridColor
    this.context.stroke()
  }

  /**
   * renders the plots as a line loop.
   * @returns {void}
   */
  private presentPlots(): void {
    // compute the midpoint
    const midpoint = {
      x: this.bounds.minx + ((this.bounds.maxx - this.bounds.minx) * 0.5),
      y: this.bounds.miny + ((this.bounds.maxy - this.bounds.miny) * 0.5)
    }
    // map plots into a -1.0 to 1.0 range.
    const centroid = this.plots.map(plot => {
      return {
        x: (plot.x < 0.0) ? -(plot.x / this.bounds.minx) : (plot.x / this.bounds.maxx),
        y: (plot.y < 0.0) ? -(plot.y / this.bounds.miny) : (plot.y / this.bounds.maxy)
      }
    }) 
    // map centroid into 0.0 - 1.0 range
    const screenplots = centroid.map(plot => {
      return {
        x: (plot.x + 1) / 2,
        y: (plot.y + 1) / 2
      }
    })
  
    // render plots
    this.context.beginPath()
    for(let i = 0; i < screenplots.length - 1; i++) {
      const from = screenplots[i+0]
      const to   = screenplots[i+1]
      this.context.moveTo(from.x * this.canvas.width, from.y * this.canvas.height)
      this.context.lineTo(to.x   * this.canvas.width, to.y   * this.canvas.height)
    }
    this.context.lineWidth   = 2
    this.context.strokeStyle = this.options.lineColor
    this.context.stroke()
  }
}