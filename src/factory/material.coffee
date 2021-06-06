debug = false
Visualize = require '../visualize'

tick = () ->
  now = +new Date
  return (label) ->
    delta = +new Date() - now
    console.log label, delta + " ms"
    delta

class Material
  constructor: (vertex, fragment) ->
    @vertex   = vertex
    @fragment = fragment
    @tock = tick() if debug

  build: (options) -> @link options
  link: (options = {}) ->
    uniforms   = {}
    varyings   = {}
    attributes = {}
    options.userData = {}

    vertex   = @vertex  .link 'main'
    fragment = @fragment.link 'main'

    for shader in [vertex, fragment]
      (uniforms[key]   = value) for key, value of shader.uniforms
      (varyings[key]   = value) for key, value of shader.varyings
      (attributes[key] = value) for key, value of shader.attributes
    # Move custom attributes to material's userData
    options.vertexShader            = vertex  .code
    options.userData.vertexGraph    = vertex  .graph
    options.fragmentShader          = fragment.code
    options.userData.fragmentGraph  = fragment.graph
    options.userData.attributes     = attributes
    options.uniforms                = uniforms
    options.userData.varyings       = varyings
    options.userData.inspect        = () ->
      Visualize.inspect 'Vertex Shader', vertex, 'Fragment Shader', fragment.graph

    @tock 'Material build' if debug

    options

  inspect: () ->
    Visualize.inspect 'Vertex Shader', @vertex, 'Fragment Shader', @fragment.graph

module.exports = Material
