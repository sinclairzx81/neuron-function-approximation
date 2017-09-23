# neuron: function approximation

An experiment using neural networks to approximate pure functions [demo](https://sinclairzx81.github.io/neuron-function-approximation/)

### overview

This project is a experiment to approximate pure functions using neural networks. The project
provides a small interactive scripting interface allowing end users to script single parameter 
functions ```x' = f(x)``` and a secondary scripting interface for tweaking the network 
parameters. The function ```f(x)``` output is clamped between a -1 and 1 range with the network
activation set to ```tanh``` end to end.

The goal of this project is to test how well neuron can approximate the given function ```f(x)``` by
observing its input and output where input ```x``` is also between a -1 to 1 range.

###  building the project

clone this repository and run the following. This will start a small http server on port 5000.

```
npm install
npm start
```