(function () {
  var main = null;
  var modules = {
      "require": {
          factory: undefined,
          dependencies: [],
          exports: function (args, callback) { return require(args, callback); },
          resolved: true
      }
  };
  function define(id, dependencies, factory) {
      return main = modules[id] = {
          dependencies: dependencies,
          factory: factory,
          exports: {},
          resolved: false
      };
  }
  function resolve(definition) {
      if (definition.resolved === true)
          return;
      definition.resolved = true;
      var dependencies = definition.dependencies.map(function (id) {
          return (id === "exports")
              ? definition.exports
              : (function () {
                  if(modules[id] !== undefined) {
                    resolve(modules[id]);
                    return modules[id].exports;
                  } else {
                    try {
                      return require(id);
                    } catch(e) {
                      throw Error("module '" + id + "' not found.");
                    }
                  }
              })();
      });
      definition.factory.apply(null, dependencies);
  }
  function collect() {
      Object.keys(modules).map(function (key) { return modules[key]; }).forEach(resolve);
      return (main !== null) 
        ? main.exports
        : undefined
  }

  define("graphics/graph", ["require", "exports"], function (require, exports) {
      "use strict";
      exports.__esModule = true;
      var Graph2D = (function () {
          function Graph2D(canvas, options) {
              this.canvas = canvas;
              this.options = options;
              this.options = this.options || {};
              this.options.backgroundColor = this.options.backgroundColor || "#FFF";
              this.options.lineColor = this.options.lineColor || "#000";
              this.options.textColor = this.options.textColor || "#000";
              this.options.gridColor = this.options.gridColor || "#777";
              this.context = canvas.getContext("2d");
              this.bounds = { minx: -1, maxx: 1, miny: -1, maxy: 1 };
              this.plots = [];
          }
          Graph2D.prototype.plot = function (x, y) {
              if (x < this.bounds.minx) {
                  this.bounds.minx = x;
              }
              if (x > this.bounds.maxx) {
                  this.bounds.maxx = x;
              }
              if (y < this.bounds.minx) {
                  this.bounds.minx = y;
              }
              if (y > this.bounds.maxx) {
                  this.bounds.maxx = y;
              }
              for (var i = 0; i < this.plots.length; i++) {
                  if (x < this.plots[i].x) {
                      this.plots.splice(i, 0, { x: x, y: y });
                      return;
                  }
              }
              this.plots.push({ x: x, y: y });
          };
          Graph2D.prototype.clear = function () {
              this.context.fillStyle = this.options.backgroundColor;
              this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
          };
          Graph2D.prototype.present = function () {
              this.resolveSize();
              this.clear();
              this.renderGrid();
              this.presentPlots();
              this.plots = [];
              this.bounds = {
                  minx: -1,
                  maxx: 1,
                  miny: -1,
                  maxy: 1
              };
          };
          Graph2D.prototype.resolveSize = function () {
              var width = this.canvas.clientWidth;
              var height = this.canvas.clientHeight;
              this.canvas.width = width;
              this.canvas.height = height;
          };
          Graph2D.prototype.renderGrid = function () {
              this.context.fillStyle = this.options.textColor;
              this.context.fillText(this.bounds.minx.toString(), 6, (this.canvas.height / 2) - 6);
              this.context.fillText(this.bounds.maxx.toString(), this.canvas.width - 10, (this.canvas.height / 2) - 6);
              this.context.fillText(this.bounds.miny.toString(), (this.canvas.width / 2) + 6, 14);
              this.context.fillText(this.bounds.maxy.toString(), (this.canvas.width / 2) + 6, (this.canvas.height) - 8);
              this.context.beginPath();
              this.context.moveTo(0, this.canvas.height / 2);
              this.context.lineTo(this.canvas.width, this.canvas.height / 2);
              this.context.moveTo(this.canvas.width / 2, 0);
              this.context.lineTo(this.canvas.width / 2, this.canvas.height);
              this.context.lineWidth = 2;
              this.context.strokeStyle = this.options.gridColor;
              this.context.stroke();
              this.context.beginPath();
              var offsetx = (this.canvas.width / 10);
              for (var i = 0; i < 10; i++) {
                  this.context.moveTo((offsetx * i), 0);
                  this.context.lineTo((offsetx * i), this.canvas.height);
              }
              var offsety = (this.canvas.height / 10);
              for (var i = 0; i < 10; i++) {
                  this.context.moveTo(0, (offsety * i));
                  this.context.lineTo(this.canvas.width, (offsety * i));
              }
              this.context.lineWidth = 1;
              this.context.strokeStyle = this.options.gridColor;
              this.context.stroke();
          };
          Graph2D.prototype.presentPlots = function () {
              var _this = this;
              var midpoint = {
                  x: this.bounds.minx + ((this.bounds.maxx - this.bounds.minx) * 0.5),
                  y: this.bounds.miny + ((this.bounds.maxy - this.bounds.miny) * 0.5)
              };
              var centroid = this.plots.map(function (plot) {
                  return {
                      x: (plot.x < 0.0) ? -(plot.x / _this.bounds.minx) : (plot.x / _this.bounds.maxx),
                      y: (plot.y < 0.0) ? -(plot.y / _this.bounds.miny) : (plot.y / _this.bounds.maxy)
                  };
              });
              var screenplots = centroid.map(function (plot) {
                  return {
                      x: (plot.x + 1) / 2,
                      y: (plot.y + 1) / 2
                  };
              });
              this.context.beginPath();
              for (var i = 0; i < screenplots.length - 1; i++) {
                  var from = screenplots[i + 0];
                  var to = screenplots[i + 1];
                  this.context.moveTo(from.x * this.canvas.width, from.y * this.canvas.height);
                  this.context.lineTo(to.x * this.canvas.width, to.y * this.canvas.height);
              }
              this.context.lineWidth = 2;
              this.context.strokeStyle = this.options.lineColor;
              this.context.stroke();
          };
          return Graph2D;
      }());
      exports.Graph2D = Graph2D;
  });
  define("editor/editor", ["require", "exports"], function (require, exports) {
      "use strict";
      exports.__esModule = true;
      var Editor = (function () {
          function Editor(element) {
              var _this = this;
              this.element = element;
              this.onchange = [];
              this.content = "";
              this.editor = ace.edit(element);
              this.editor.getSession().setUseWorker(false);
              this.editor.setTheme("ace/theme/monokai");
              this.editor.getSession().setMode("ace/mode/javascript");
              this.editor.setFontSize("16px");
              this.editor.setShowPrintMargin(false);
              this.editor.$blockScrolling = Infinity;
              this.handle = setInterval(function () {
                  var current = _this.editor.getValue();
                  if (_this.content !== current) {
                      _this.onchange.forEach(function (func) { return func(current); });
                      _this.content = current;
                  }
              }, 1);
          }
          Editor.prototype.set = function (text) {
              this.editor.setValue(text);
              this.editor.selection.clearSelection();
          };
          Editor.prototype.get = function () {
              return this.editor.getValue();
          };
          Editor.prototype.change = function (func) {
              this.onchange.push(func);
          };
          return Editor;
      }());
      exports.Editor = Editor;
  });
  define("editor/index", ["require", "exports", "editor/editor"], function (require, exports, editor_1) {
      "use strict";
      exports.__esModule = true;
      exports.Editor = editor_1.Editor;
  });
  define("common/range", ["require", "exports"], function (require, exports) {
      "use strict";
      exports.__esModule = true;
      exports.range = function (from, to, step) {
          var buf = [];
          for (var i = from; i < to; i += step) {
              buf.push(i);
          }
          return buf;
      };
  });
  define("common/tanh", ["require", "exports"], function (require, exports) {
      "use strict";
      exports.__esModule = true;
      exports.tanh = function (x) { return (Math.exp(x) - Math.exp(-x)) / (Math.exp(x) + Math.exp(-x)); };
  });
  define("common/clamp", ["require", "exports"], function (require, exports) {
      "use strict";
      exports.__esModule = true;
      exports.clamp = function (x, min, max) {
          if (x < min)
              x = min;
          if (x > max)
              x = max;
          return x;
      };
  });
  define("common/function", ["require", "exports"], function (require, exports) {
      "use strict";
      exports.__esModule = true;
      exports.createFunction = function (code) {
          var func = new Function("x", "\n    \n    " + code + "\n    \n    return f(x)\n  ");
          return function (x) { return func(x); };
      };
      exports.createNetwork = function (code, network, trainer, tensor) {
          var func = new Function("Network", "Trainer", "Tensor", "\n    \n    " + code + "\n\n    return f(Network, Trainer, Tensor)\n  ");
          return function () { return func(network, trainer, tensor); };
      };
  });
  define("common/index", ["require", "exports", "common/range", "common/tanh", "common/clamp", "common/function"], function (require, exports, range_1, tanh_1, clamp_1, function_1) {
      "use strict";
      exports.__esModule = true;
      exports.range = range_1.range;
      exports.tanh = tanh_1.tanh;
      exports.clamp = clamp_1.clamp;
      exports.createFunction = function_1.createFunction;
      exports.createNetwork = function_1.createNetwork;
  });
  define("network/matrix", ["require", "exports"], function (require, exports) {
      "use strict";
      exports.__esModule = true;
      var Matrix = (function () {
          function Matrix(inputs, outputs) {
              this.inputs = inputs;
              this.outputs = outputs;
              this.data = new Float64Array(this.inputs * this.outputs);
          }
          Matrix.prototype.get = function (i, o) {
              return this.data[i + (o * this.inputs)];
          };
          Matrix.prototype.set = function (i, o, value) {
              this.data[i + (o * this.inputs)] = value;
          };
          return Matrix;
      }());
      exports.Matrix = Matrix;
  });
  define("network/tensor", ["require", "exports"], function (require, exports) {
      "use strict";
      exports.__esModule = true;
      var select = function (type) {
          switch (type) {
              case "identity": return {
                  activate: function (x) { return x; },
                  derive: function (x) { return 1; }
              };
              case "tanh": return {
                  activate: function (x) { return (Math.exp(x) - Math.exp(-x)) / (Math.exp(x) + Math.exp(-x)); },
                  derive: function (x) { return (1 - (x * x)); }
              };
              case "binary-step": return {
                  activate: function (x) { return (x >= 0) ? 1 : 0; },
                  derive: function (x) { return (x >= 0) ? 1 : 0; }
              };
              case "relu": return {
                  activate: function (x) { return (x >= 0) ? x : 0; },
                  derive: function (x) { return (x >= 0) ? 1 : 0; }
              };
              default: throw Error("unknown activation");
          }
      };
      var Tensor = (function () {
          function Tensor(units, activation, bias) {
              if (activation === void 0) { activation = "identity"; }
              if (bias === void 0) { bias = 1.0; }
              this.data = new Float64Array(units + 1);
              this.data[this.data.length - 1] = bias;
              this.activation = select(activation);
          }
          return Tensor;
      }());
      exports.Tensor = Tensor;
  });
  define("network/network", ["require", "exports", "network/matrix"], function (require, exports, matrix_1) {
      "use strict";
      exports.__esModule = true;
      var Network = (function () {
          function Network(tensors) {
              this.tensors = tensors;
              this.output = new Array(this.tensors[this.tensors.length - 1].data.length - 1);
              this.matrices = new Array(this.tensors.length - 1);
              for (var i = 0; i < this.tensors.length - 1; i++) {
                  this.matrices[i] = new matrix_1.Matrix(this.tensors[i + 0].data.length, this.tensors[i + 1].data.length - 1);
              }
              this.kernels = new Array(this.matrices.length);
              for (var i = 0; i < this.kernels.length; i++) {
                  this.kernels[i] = {
                      input: this.tensors[i + 0],
                      output: this.tensors[i + 1],
                      matrix: this.matrices[i]
                  };
              }
          }
          Network.prototype.memory = function () {
              var tensors = this.tensors.reduce(function (acc, t) { return acc + (t.data.byteLength); }, 0);
              var matrices = this.matrices.reduce(function (acc, m) { return acc + (m.data.byteLength); }, 0);
              return tensors + matrices;
          };
          Network.prototype.inputs = function () {
              return (this.tensors[0].data.length - 1);
          };
          Network.prototype.outputs = function () {
              return (this.tensors[this.tensors.length - 1].data.length - 1);
          };
          Network.prototype.forward = function (input) {
              for (var i = 0; i < input.length; i++) {
                  this.kernels[0].input.data[i] = input[i];
              }
              for (var k = 0; k < this.kernels.length; k++) {
                  var kernel = this.kernels[k];
                  for (var o = 0; o < kernel.matrix.outputs; o++) {
                      var sum = 0;
                      for (var i = 0; i < kernel.matrix.inputs; i++) {
                          sum += kernel.matrix.get(i, o) * kernel.input.data[i];
                      }
                      kernel.output.data[o] = kernel.output.activation.activate(sum);
                  }
              }
              for (var o = 0; o < this.output.length; o++) {
                  this.output[o] = this.kernels[this.kernels.length - 1].output.data[o];
              }
              return this.output;
          };
          return Network;
      }());
      exports.Network = Network;
  });
  define("network/random", ["require", "exports"], function (require, exports) {
      "use strict";
      exports.__esModule = true;
      var Random = (function () {
          function Random(seed) {
              this.seed = seed;
              this.seed = this.seed === undefined ? 1 : this.seed;
              this.a = 1103515245;
              this.c = 12345;
              this.m = Math.pow(2, 31);
          }
          Random.prototype.next = function () {
              this.seed = (this.a * this.seed + this.c) % this.m;
              return this.seed / this.m;
          };
          return Random;
      }());
      exports.Random = Random;
  });
  define("network/trainer", ["require", "exports", "network/matrix", "network/random"], function (require, exports, matrix_2, random_1) {
      "use strict";
      exports.__esModule = true;
      var Trainer = (function () {
          function Trainer(network, options) {
              this.network = network;
              this.options = options;
              this.options = this.options || {};
              this.options.seed = this.options.seed || 0;
              this.options.step = this.options.step || 0.15;
              this.options.momentum = this.options.momentum || 0.5;
              this.random = new random_1.Random(this.options.seed);
              this.deltas = new Array(this.network.matrices.length);
              for (var i = 0; i < this.network.matrices.length; i++) {
                  this.deltas[i] = new matrix_2.Matrix(this.network.matrices[i].inputs, this.network.matrices[i].outputs);
              }
              this.gradients = new Array(this.network.tensors.length);
              for (var i = 0; i < this.network.tensors.length; i++) {
                  this.gradients[i] = new Float64Array(this.network.tensors[i].data.length);
              }
              for (var m = 0; m < this.network.matrices.length; m++) {
                  for (var o = 0; o < this.network.matrices[m].outputs; o++) {
                      for (var i = 0; i < this.network.matrices[m].inputs; i++) {
                          var rand = (this.random.next() - 0.5) * (1 / Math.sqrt(this.network.matrices[m].inputs));
                          this.network.matrices[m].set(i, o, rand);
                      }
                  }
              }
              this.kernels = new Array(this.network.kernels.length);
              for (var i = 0; i < this.network.kernels.length; i++) {
                  this.kernels[i] = {
                      matrix: {
                          matrix: this.network.matrices[i],
                          deltas: this.deltas[i]
                      },
                      input: {
                          tensor: this.network.tensors[i + 0],
                          grads: this.gradients[i + 0]
                      },
                      output: {
                          tensor: this.network.tensors[i + 1],
                          grads: this.gradients[i + 1]
                      }
                  };
              }
          }
          Trainer.prototype.forward = function (input) {
              return this.network.forward(input);
          };
          Trainer.prototype.error = function (input, expect) {
              var actual = this.network.forward(input);
              return Math.sqrt(actual.reduce(function (acc, value, index) {
                  var delta = (expect[index] - value);
                  return (acc + (delta * delta));
              }, 0) / actual.length);
          };
          Trainer.prototype.backward = function (input, expect) {
              var actual = this.network.forward(input);
              var kernel = this.kernels[this.kernels.length - 1];
              for (var o = 0; o < kernel.matrix.matrix.outputs; o++) {
                  var delta = (expect[o] - kernel.output.tensor.data[o]);
                  kernel.output.grads[o] = (delta * kernel.output.tensor.activation.derive(kernel.output.tensor.data[o]));
              }
              for (var k = this.kernels.length - 1; k > -1; k--) {
                  var kernel_1 = this.kernels[k];
                  for (var i = 0; i < kernel_1.matrix.matrix.inputs; i++) {
                      var delta = 0;
                      for (var o = 0; o < kernel_1.matrix.matrix.outputs; o++) {
                          delta += kernel_1.matrix.matrix.get(i, o) * kernel_1.output.grads[o];
                      }
                      kernel_1.input.grads[i] = (delta * kernel_1.input.tensor.activation.derive(kernel_1.input.tensor.data[i]));
                  }
              }
              for (var k = this.kernels.length - 1; k > -1; k--) {
                  var kernel_2 = this.kernels[k];
                  for (var i = 0; i < kernel_2.matrix.matrix.inputs; i++) {
                      for (var o = 0; o < kernel_2.matrix.matrix.outputs; o++) {
                          var old_delta = kernel_2.matrix.deltas.get(i, o);
                          var new_delta = (this.options.step * kernel_2.input.tensor.data[i] * kernel_2.output.grads[o]) + (this.options.momentum * old_delta);
                          var new_weight = kernel_2.matrix.matrix.get(i, o) + new_delta;
                          kernel_2.matrix.matrix.set(i, o, new_weight);
                          kernel_2.matrix.deltas.set(i, o, new_delta);
                      }
                  }
              }
              return Math.sqrt(actual.reduce(function (acc, value, index) {
                  var delta = (expect[index] - value);
                  return (acc + (delta * delta));
              }, 0) / actual.length);
          };
          return Trainer;
      }());
      exports.Trainer = Trainer;
  });
  define("network/index", ["require", "exports", "network/network", "network/tensor", "network/trainer"], function (require, exports, network_1, tensor_1, trainer_1) {
      "use strict";
      exports.__esModule = true;
      exports.Network = network_1.Network;
      exports.Tensor = tensor_1.Tensor;
      exports.Trainer = trainer_1.Trainer;
  });
  define("index", ["require", "exports", "graphics/graph", "editor/index", "common/index", "network/index"], function (require, exports, graph_1, index_1, index_2, index_3) {
      "use strict";
      exports.__esModule = true;
      var function_editor = new index_1.Editor(document.getElementById("function-editor"));
      var network_editor = new index_1.Editor(document.getElementById("network-editor"));
      var function_graph = new graph_1.Graph2D(document.getElementById("function-canvas"), { lineColor: "blue" });
      var network_graph = new graph_1.Graph2D(document.getElementById("network-canvas"), { lineColor: "red" });
      var network_error = document.getElementById("network-error");
      function_editor.set('const f = x => x');
      network_editor.set("const f = () => new Trainer(new Network([\n  new Tensor(1,  \"tanh\"),\n  new Tensor(16, \"tanh\"),\n  new Tensor(16, \"tanh\"),\n  new Tensor(16, \"tanh\"),\n  new Tensor(1,  \"tanh\")\n]), {\n  momentum: 0.5,\n  step: 0.05\n})");
      var user_function = null;
      var network = null;
      var update = function () {
          try {
              var updated_function = function (x) { return index_2.clamp(index_2.createFunction(function_editor.get())(x), -1, 1); };
              var updated_network = index_2.createNetwork(network_editor.get(), index_3.Network, index_3.Trainer, index_3.Tensor);
              for (var i = -1; i < 1; i += 0.01) {
                  function_graph.plot(i, updated_function(i));
              }
              function_graph.present();
              user_function = updated_function;
              network = updated_network();
          }
          catch (error) {
          }
      };
      function_editor.change(function () { return update(); });
      network_editor.change(function () { return update(); });
      update();
      setInterval(function () {
          for (var i = -1; i < 1; i += 0.01) {
              network.backward([i], [user_function(i)]);
          }
          var errors = [];
          for (var i = -1; i < 1; i += 0.01) {
              var actual = network.forward([i]);
              network_graph.plot(i, network.forward([i])[0]);
              var error = network.error(actual, [user_function(i)]);
              errors.push(error);
          }
          network_graph.present();
          network_error.innerHTML = "error " + errors.reduce(function (acc, error) { return acc + error; }, 0) / errors.length;
      }, 1);
  });
  
  return collect(); 
})();