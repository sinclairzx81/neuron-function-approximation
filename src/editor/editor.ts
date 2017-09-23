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

export type EditorChangeFunction = (text: string) => void

export class Editor {
  private editor:   AceAjax.Editor
  private onchange: EditorChangeFunction[]
  private handle:   number
  private content:  string
  constructor(private element: HTMLElement) {
    this.onchange = []
    this.content  = ""
    this.editor = ace.edit(element)
    this.editor.getSession().setUseWorker(false);
    this.editor.setTheme  ("ace/theme/monokai");
    this.editor.getSession().setMode("ace/mode/javascript")
    this.editor.setFontSize("16px")
    this.editor.setShowPrintMargin(false)
    this.editor.$blockScrolling = Infinity
    this.handle = setInterval(() => {
      const current = this.editor.getValue()
      if(this.content !== current) {
        this.onchange.forEach(func => func(current))
        this.content = current
      }
    }, 1)
  }
  /**
   * sets the content for this editor.
   * @param {string} text the content to set.
   * @returns {void}
   */
  public set(text: string): void {
    this.editor.setValue(text)
    this.editor.selection.clearSelection()
  }

  /**
   * gets the content for this editor.
   * @returns {string}
   */
  public get(): string {
    return this.editor.getValue()
  }

  /**
   * subscribes to change events on this editor.
   * @param {EditorChangeFunction} func the change listener.
   * @returns {void}
   */
  public change(func: EditorChangeFunction): void {
    this.onchange.push(func)
  }
}