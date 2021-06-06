Graph   = require '../graph'
Block   = require './block'

###
  Join multiple disconnected nodes
###
class Join extends Block
  constructor: (nodes) ->
    super()
    @nodes     = nodes
    @node      = new Graph.Node @, @makeOutlets?() ? {}

  clone: () ->
    new Join @nodes

  makeOutlets: () -> []

  call: (program, depth) ->
    for node in @nodes
      block = node.owner
      block.call program, depth

  export: (layout, depth) ->
    for node in @nodes
      block = node.owner
      block.export layout, depth

module.exports = Join
