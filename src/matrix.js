SVG.Matrix = SVG.invent({
  // Initialize
  create: function(source) {
    var i, base = arrayToMatrix([1, 0, 0, 1, 0, 0])

    // ensure source as object
    source = source && source.node && source.node.getCTM ?
      source.node.getCTM() :
    typeof source === 'string' ?
      stringToMatrix(source) :
    arguments.length == 6 ?
      arrayToMatrix([].slice.call(arguments)) :
    typeof source === 'object' ?
      source : base

    // merge source
    for (i = abcdef.length - 1; i >= 0; i--)
      this[abcdef[i]] = typeof source[abcdef[i]] === 'number' ?
        source[abcdef[i]] : base[abcdef[i]]
    
  }
  
  // Add methods
, extend: {
    // Extract individual transformations
    extract: function() {
      // find delta transform points
      var px    = deltaTransformPoint(this, 0, 1)
        , py    = deltaTransformPoint(this, 1, 0)
        , skewX = 180 / Math.PI * Math.atan2(px.y, px.x) - 90
  
      return {
        // translation
        x:        this.e
      , y:        this.f
        // skew
      , skewX:    -skewX
      , skewY:    180 / Math.PI * Math.atan2(py.y, py.x)
        // scale
      , scaleX:   Math.sqrt(this.a * this.a + this.b * this.b)
      , scaleY:   Math.sqrt(this.c * this.c + this.d * this.d)
        // rotation
      , rotation: skewX
      }
    }
    // Clone matrix
  , clone: function() {
      return new SVG.Matrix(this)
    }
    // Morph one matrix into another
  , morph: function(matrix) {
      // store new destination
      this.destination = new SVG.Matrix(matrix)

      return this
    }
    // Get morphed matrix at a given position
  , at: function(pos) {
      // make sure a destination is defined
      if (!this.destination) return this

      // calculate morphed matrix at a given position
      return new SVG.Matrix({
        a: this.a + (this.destination.a - this.a) * pos
      , b: this.b + (this.destination.b - this.b) * pos
      , c: this.c + (this.destination.c - this.c) * pos
      , d: this.d + (this.destination.d - this.d) * pos
      , e: this.e + (this.destination.e - this.e) * pos
      , f: this.f + (this.destination.f - this.f) * pos
      })
    }
    // Multiplies by given matrix
  , multiply: function(matrix) {
      return new SVG.Matrix(this.native().multiply(parseMatrix(matrix).native()))
    }
    // Adds given matrix
  , add: function(matrix) {
      matrix = parseMatrix(matrix)

      return new SVG.Matrix({
        a: this.a + matrix.a - 1
      , b: this.b + matrix.b
      , c: this.c + matrix.c
      , d: this.d + matrix.d - 1
      , e: this.e + matrix.e
      , f: this.f + matrix.f
      })
    }
    // Inverses matrix
  , inverse: function() {
      return new SVG.Matrix(this.native().inverse())
    }
    // Translate matrix
  , translate: function(x, y) {
      return new SVG.Matrix(this.native().translate(x || 0, y || 0))  
    }
    // Scale matrix
  , scale: function(x, y, cx, cy) {
      // support universal scale
      if (arguments.length == 1 || arguments.length == 3)
        y = x
      if (arguments.length == 3) {
        cy = cx
        cx = y
      }

      return this.around(cx, cy, new SVG.Matrix(x, 0, 0, y, 0, 0))
    }
    // Rotate matrix
  , rotate: function(r, cx, cy) {
      // convert degrees to radians
      r = SVG.utils.radians(r)
      
      return this.around(cx, cy, new SVG.Matrix(Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0))
    }
    // Flip matrix on x or y, at a given offset
  , flip: function(a, o) {
      return a == 'x' ? this.scale(-1, 1, o, 0) : this.scale(1, -1, 0, o)
    }
    // Skew
  , skew: function(x, y, cx, cy) {
      return this.around(cx, cy, this.native().skewX(x || 0).skewY(y || 0))
    }
    // Transform around a center point
  , around: function(cx, cy, matrix) {
      return this
        .multiply(new SVG.Matrix(1, 0, 0, 1, cx || 0, cy || 0))
        .multiply(matrix)
        .multiply(new SVG.Matrix(1, 0, 0, 1, -cx || 0, -cy || 0))
    }
    // Convert to native SVGMatrix
  , native: function() {
      // create new matrix
      var matrix = SVG.parser.draw.node.createSVGMatrix()
  
      // update with current values
      for (var i = abcdef.length - 1; i >= 0; i--)
        matrix[abcdef[i]] = this[abcdef[i]]

      return matrix
    }
    // Convert matrix to string
  , toString: function() {
      return 'matrix(' + this.toArray().join() + ')'
    }
    // Convert matrix to array
  , toArray: function() {
      return [this.a, this.b, this.c, this.d, this.e, this.f]
    }
  }

  // Define parent
, parent: SVG.Element

  // Add parent method
, construct: {
    // Get current matrix
    ctm: function() {
      return new SVG.Matrix(this)
    }
  
  }

})