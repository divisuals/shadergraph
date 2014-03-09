parse = require './parse'
compile = require './compile'

class Snippet
  @index: 0
  @namespace: () -> "_sn_#{++Snippet.index}_"

  @load: (name, code) ->
    program   = parse name, code
    assembler = compile program
    new Snippet program.signatures, assembler

  constructor: (@signatures, @assembler) ->
    @namespace  = null
    @code       = null

    @main       = null
    @entry      = null

    @uniforms   = null
    @externals  = null
    @attributes = null

  clone: () ->
    new Snippet @signatures, @assembler

  apply: (uniforms, @namespace) ->
    @namespace ?= Snippet.namespace()
    @code       = @assembler @namespace

    @main       = @signatures.main
    @entry      = @namespace + @main.name

    @uniforms   = {}
    @externals  = {}
    @attributes = {}

    u = (def, name) =>   @uniforms[@namespace + (name ? def.name)] = def
    e = (def)       =>  @externals[@namespace + def.name]          = def
    a = (def)       => @attributes[def.name]                       = def

    u(def)       for def in @signatures.uniform
    e(def)       for def in @signatures.external
    a(def)       for def in @signatures.attribute
    u(def, name) for name, def of uniforms

    null

module.exports = Snippet