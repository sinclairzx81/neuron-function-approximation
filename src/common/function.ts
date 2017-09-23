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

/**
 * creates a new function.
 * @param {string} code the code for this function.
 * @returns {(x: number) => number}
 */
export const createFunction = (code: string) => {
  const func = new Function("x", `
    
    ${code}
    
    return f(x)
  `)
  return (x: number) => func(x)
}


/**
 * creates a new function.
 * @param {string} code the code for this function.
 * @returns {(x: number) => number}
 */
export const createNetwork = (code: string, network: any, trainer: any, tensor: any) => {
  const func = new Function("Network", "Trainer", "Tensor", `
    
    ${code}

    return f(Network, Trainer, Tensor)
  `)
  return () => func(network, trainer, tensor)
}

