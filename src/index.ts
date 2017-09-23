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

import { Graph2D }                              from "./graphics/graph"
import { Editor }                               from "./editor/index"
import { createFunction, createNetwork, clamp } from "./common/index"
import { Network, Tensor, Trainer }             from "./network/index"

//--------------------------------------------------------
// page elements
//--------------------------------------------------------
const function_editor = new Editor(document.getElementById("function-editor") as HTMLElement)
const network_editor  = new Editor(document.getElementById("network-editor") as HTMLElement)
const function_graph  = new Graph2D(document.getElementById("function-canvas") as HTMLCanvasElement, {lineColor: "blue"})
const network_graph   = new Graph2D(document.getElementById("network-canvas") as HTMLCanvasElement, {lineColor: "red"})
const network_error   = document.getElementById("network-error") as HTMLDivElement
function_editor.set('const f = x => x')
network_editor.set(`const f = () => new Trainer(new Network([
  new Tensor(1,  "tanh"),
  new Tensor(16, "tanh"),
  new Tensor(16, "tanh"),
  new Tensor(16, "tanh"),
  new Tensor(1,  "tanh")
]), {
  momentum: 0.5,
  step: 0.05
})`)

let user_function: any = null
let network: any       = null

//--------------------------------------------------------
// handle updates
//--------------------------------------------------------
const update = () => {
  try {
    // load updated parameters
    const updated_function = x => clamp( createFunction(function_editor.get())(x), -1, 1)
    const updated_network  = createNetwork(network_editor.get(), Network, Trainer, Tensor)
    // function graph
    for(let i = -1; i < 1; i+= 0.01) {
      function_graph.plot(i, updated_function(i))
    }
    function_graph.present()
    user_function = updated_function
    network       = updated_network()
  } catch(error) {
    // ignore
  }
}

function_editor.change(() => update())
network_editor.change(() => update())

update()
setInterval(() => {
  // train network with user function.
  for(let i = -1; i < 1; i+= 0.01) {
    network.backward([i], [user_function(i)])
  }
  
  // propagate the network, record error.
  const errors = []
  for(let i = -1; i < 1; i+= 0.01) {
    const actual = network.forward([i])
    network_graph.plot(i, network.forward([i])[0])
    const error = network.error(actual, [user_function(i)])
    errors.push(error)
  }

  // render the graph
  network_graph.present()

  // update with network error
  network_error.innerHTML = `error ` + errors.reduce((acc, error) => acc + error, 0) / errors.length

}, 1)






 