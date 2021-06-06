Snippet  = require './snippet'
link     = require './link'

debug = false

###
  Program linkage layout

  Entry points are added to its dependency graph
  Callbacks are linked either with a go-between function
  or a #define if the signatures are identical.
###
class Layout

  constructor: (language, graph) ->
    @language = language
    @graph    = graph
    @links    = []
    @includes = []
    @modules  = {}
    @visits   = {}

  # Link up a given named external to this module's entry point
  callback: (node, module_, priority, name, external) ->
    @links.push {node, module_, priority, name, external}

  # Include this module of code
  include: (node, module_, priority) ->
    if (m = @modules[module_.namespace])?
      m.priority = Math.max priority, m.priority
    else
      @modules[module_.namespace] = true
      @includes.push {node, module_, priority}

  # Visit each namespace at most once to avoid infinite recursion
  visit: (namespace) ->
    debug && console.log 'Visit', namespace, !@visits[namespace]
    return false if @visits[namespace]
    @visits[namespace] = true

  # Compile queued ops into result
  link: (module_) ->
    data          = link @language, @links, @includes, module_
    snippet       = new Snippet
    snippet[key]  = data[key] for key of data
    snippet.graph = @graph
    snippet


module.exports = Layout
