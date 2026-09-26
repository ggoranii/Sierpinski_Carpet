var gl;
var points = [];
var bufferId;
var carpetLoc;

function square( x, y, s ) {
    var a = vec2( x, y ); // 왼쪽 아래
    var b = vec2( x + s, y ); // 오른쪽 아래
    var c = vec2( x + s, y + s ); // 오른쪽 위
    var d = vec2( x, y + s ); // 왼쪽 위
    points.push( a, b, c );
    points.push( a, c, d );
}

function divideSquare( x, y, s, count ) {
    if (count == 0) {
        square( x, y, s );
        return;
    }
    var t = s / 3;
    for ( var i = 0; i < 3; i++ ) {
        for ( var j = 0; j < 3; j++ ) {
            if ( i == 1 && j == 1 ) continue;
            divideSquare( x  + i * t, y + j * t, t, count - 1);
        }
    }
}

function draw() {
    var n = parseInt( document.getElementById( "slide").value );

    points = [];
    divideSquare( -1, -1, 2, n );

    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var bg = hexToRGB( document.getElementById( "backgroundColor" ).value );
    var fg = hexToRGB( document.getElementById( "carpetColor" ).value );
    
    gl.clearColor( bg[0], bg[1], bg[2], 1.0 );
    gl.uniform4f( carpetLoc, fg[0], fg[1], fg[2], 1.0 );

    render();
}

function hexToRGB( hex ) {
    return [ parseInt( hex.substr( 1, 2 ), 16) / 255, 
             parseInt( hex.substr( 3, 2 ), 16) / 255,
             parseInt( hex.substr( 5, 2 ), 16) / 255 
    ];
}

window.onload = function init() {
    var canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( ! gl ) { alert( " WebGL is not available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    carpetLoc = gl.getUniformLocation( program, "carpetColor" );

    var slider = document.getElementById( "slide" );
    slider.oninput = function() {
        document.getElementById( "recursionCountText" ).innerHTML = "Recursion " + slider.value;
        draw();
    };
    document.getElementById( "carpetColor" ).oninput = draw;
    document.getElementById( "backgroundColor" ).oninput = draw;

    draw();
};

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}