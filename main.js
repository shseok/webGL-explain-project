/*
    MIT License

    Copyright (c) 2020 Hyeonseok Shin

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/

var gl;
let drag = false;
let original_x;
let original_y;

const { mat2, mat3, mat4, vec2, vec3, vec4 } = glMatrix;
// Now we can use function without glMatrix.~~~

function testGLError(functionLastCalled) {
    /* gl.getError returns the last error that occurred using WebGL for debugging */
    var lastError = gl.getError();

    if (lastError != gl.NO_ERROR) {
        alert(functionLastCalled + " failed (" + lastError + ")");
        return false;
    }
    return true;
}

function initialiseGL(canvas) {
    try {
        // Try to grab the standard context. If it fails, fallback to experimental
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    catch (e) {
    }
    function Downward(e) {

        drag = true;
        original_x = e.pageX;
        original_y = e.pageY;
        e.preventDefault();
    }

    function Upward(e) {
        drag = false;
    };

    function Moving(e) {
        if (!drag) return false;

        var gap_x = e.pageX - original_x;
        var gap_y = e.pageY - original_y;

        yRot += gap_x * 3 / canvas.width;
        xRot += gap_y * 3 / canvas.height;

        original_x = e.pageX;
        original_y = e.pageY;

        e.preventDefault();
    };

    canvas.addEventListener("mousedown", Downward, false);
    canvas.addEventListener("mouseup", Upward, false);
    canvas.addEventListener("mouseout", Upward, false);
    canvas.addEventListener("mousemove", Moving, false);
    if (!gl) {
        alert("Unable to initialise WebGL. Your browser may not support it");
        return false;
    }
    return true;
}

var shaderProgram;

var vertexData = [
    // Backface (RED/WHITE) -> z = 0.5
    -0.5, -0.5, -0.5, 1.0, 0.0, 0.0, 1.0,
    0.5, 0.5, -0.5, 1.0, 0.0, 0.0, 1.0,
    0.5, -0.5, -0.5, 1.0, 0.0, 0.0, 1.0,
    -0.5, -0.5, -0.5, 1.0, 0.0, 0.0, 1.0,
    -0.5, 0.5, -0.5, 1.0, 0.0, 0.0, 1.0,
    0.5, 0.5, -0.5, 1.0, 0.0, 0.0, 1.0,
    // Front 
    -0.5, -0.5, 0.5, 1.0, 1.0, 0.0, 1.0,
    0.5, 0.5, 0.5, 1.0, 0.5, 1.0, 1.0,
    0.5, -0.5, 0.5, 1.0, 1.0, 1.0, 1.0,
    -0.5, -0.5, 0.5, 1.0, 1.0, 1.0, 1.0,
    -0.5, 0.5, 0.5, 1.0, 0.5, 1.0, 1.0,
    0.5, 0.5, 0.5, 1.0, 1.0, 0.0, 1.0,
    // LEFT (GREEN/WHITE) -> z = 0.5
    -0.5, -0.5, -0.5, 0.0, 1.0, 0.0, 1.0,
    -0.5, 0.5, 0.5, 0.0, 1.0, 0.0, 1.0,
    -0.5, 0.5, -0.5, 0.0, 1.0, 0.0, 1.0,
    -0.5, -0.5, -0.5, 0.0, 1.0, 0.0, 1.0,
    -0.5, -0.5, 0.5, 0.0, 1.0, 0.0, 1.0,
    -0.5, 0.5, 0.5, 0.0, 1.0, 1.0, 1.0,
    // RIGHT (YELLOW/WHITE) -> z = 0.5
    0.5, -0.5, -0.5, 1.0, 1.0, 0.0, 1.0,
    0.5, 0.5, 0.5, 1.0, 1.0, 0.0, 1.0,
    0.5, 0.5, -0.5, 1.0, 1.0, 0.0, 1.0,
    0.5, -0.5, -0.5, 1.0, 1.0, 0.0, 1.0,
    0.5, -0.5, 0.5, 1.0, 1.0, 0.0, 1.0,
    0.5, 0.5, 0.5, 1.0, 1.0, 0.0, 1.0,
    // BOTTON (MAGENTA/WHITE) -> z = 0.5
    -0.5, -0.5, -0.5, 1.0, 0.0, 1.0, 1.0,
    0.5, -0.5, 0.5, 1.0, 0.0, 1.0, 1.0,
    0.5, -0.5, -0.5, 1.0, 0.0, 1.0, 1.0,
    -0.5, -0.5, -0.5, 1.0, 0.0, 1.0, 1.0,
    -0.5, -0.5, 0.5, 1.0, 0.0, 1.0, 1.0,
    0.5, -0.5, 0.5, 1.0, 0.0, 1.0, 1.0,
    // TOP (BLUE/WHITE) -> z = 0.5
    -0.5, 0.5, -0.5, 0.0, 0.0, 1.0, 1.0,
    0.5, 0.5, 0.5, 0.0, 0.0, 1.0, 1.0,
    0.5, 0.5, -0.5, 0.0, 0.0, 1.0, 1.0,
    -0.5, 0.5, -0.5, 0.0, 0.0, 1.0, 1.0,
    -0.5, 0.5, 0.5, 0.0, 0.0, 1.0, 1.0,
    0.5, 0.5, 0.5, 0.0, 0.0, 1.0, 1.0
];

function initialiseBuffer() {

    gl.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

    return testGLError("initialiseBuffers");
}

function initialiseShaders() {

    var fragmentShaderSource = `
			varying highp vec4 col; 
			void main(void) 
			{ 
				gl_FragColor = col;
			}`;

    gl.fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(gl.fragShader, fragmentShaderSource);
    gl.compileShader(gl.fragShader);
    // Check if compilation succeeded
    if (!gl.getShaderParameter(gl.fragShader, gl.COMPILE_STATUS)) {
        alert("Failed to compile the fragment shader.\n" + gl.getShaderInfoLog(gl.fragShader));
        return false;
    }

    // Vertex shader code
    var vertexShaderSource = `
			attribute highp vec4 myVertex; 
			attribute highp vec4 myColor;
            uniform mediump mat4 mMatrix;
			uniform mediump mat4 vMatrix;
			uniform mediump mat4 pMatrix;
			varying  highp vec4 col;
			void main(void)  
			{ 
				gl_Position = pMatrix * vMatrix * mMatrix * myVertex;
				gl_PointSize = 8.0;
				col = myColor; 
			}`;

    gl.vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(gl.vertexShader, vertexShaderSource);
    gl.compileShader(gl.vertexShader);
    // Check if compilation succeeded
    if (!gl.getShaderParameter(gl.vertexShader, gl.COMPILE_STATUS)) {
        alert("Failed to compile the vertex shader.\n" + gl.getShaderInfoLog(gl.vertexShader));
        return false;
    }

    // Create the shader program
    gl.programObject = gl.createProgram();
    // Attach the fragment and vertex shaders to it
    gl.attachShader(gl.programObject, gl.fragShader);
    gl.attachShader(gl.programObject, gl.vertexShader);
    // Bind the custom vertex attribute "myVertex" to location 0
    gl.bindAttribLocation(gl.programObject, 0, "myVertex");
    gl.bindAttribLocation(gl.programObject, 1, "myColor");
    // Link the program
    gl.linkProgram(gl.programObject);
    // Check if linking succeeded in a similar way we checked for compilation errors
    if (!gl.getProgramParameter(gl.programObject, gl.LINK_STATUS)) {
        alert("Failed to link the program.\n" + gl.getProgramInfoLog(gl.programObject));
        return false;
    }

    gl.useProgram(gl.programObject);

    return testGLError("initialiseShaders");
}

var xRot = 0.0;
var yRot = 0.0;
var zRot = 0.0;
var speedRot = 0.01;

flag_animation = 0;
function toggleAnimation() {
    flag_animation ^= 1;
    console.log("flag_animation=", flag_animation);
}

function speed_plus() {
    speedRot = speedRot * 1.1;
}

function speed_minus() {
    speedRot = speedRot / 1.1;
}

var draw_mode = 4; // 4 Triangles, 3 line_strip 0-Points

function fn_draw_mode(a) {
    draw_mode = a;
}
var mMatrix;
var vMatrix;
var pMatrix;

function renderScene() {

    gl.clearColor(0.2, 0.8, 1.0, 1.0);
    gl.clearDepth(1.0);										// Added for depth Test 
    // gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);		// Added for depth Test 
    gl.enable(gl.DEPTH_TEST);								// Added for depth Test 

    var mMatrixLocation = gl.getUniformLocation(gl.programObject, "mMatrix");
    var vMatrixLocation = gl.getUniformLocation(gl.programObject, "vMatrix");
    var pMatrixLocation = gl.getUniformLocation(gl.programObject, "pMatrix");
    mMatrix = mat4.create();
    vMatrix = mat4.create();
    pMatrix = mat4.create();

    mat4.ortho(pMatrix, -1, 1, -1, 1, -1, 1);
    // mat4.perspective(pMatrix, 3.14 / 4.0, canvas.width / canvas.height, 2, 5);  // fov로 본다! 좁게보면(-) 크게 가까이 보이고 넓게보면(+) 멀리서보는 현상
    // mat4.lookAt(vMatrix, [0, 0, 3], [0, 0, 0], [0, 1, 0]);
    mat4.scale(mMatrix, mMatrix, [0.5, 0.5, 0.5]);
    mat4.rotateX(mMatrix, mMatrix, xRot);
    mat4.rotateY(mMatrix, mMatrix, yRot);
    // mat4.rotateZ(transformationMatrix, transformationMatrix, zRot);

    if (flag_animation == 1) {
        //xRot = xRot + speedRot;	
        yRot = yRot + speedRot;
        zRot = zRot + speedRot;
    }
    gl.uniformMatrix4fv(mMatrixLocation, gl.FALSE, mMatrix);
    gl.uniformMatrix4fv(vMatrixLocation, gl.FALSE, vMatrix);
    gl.uniformMatrix4fv(pMatrixLocation, gl.FALSE, pMatrix);

    if (!testGLError("gl.uniformMatrix4fv")) {
        return false;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 28, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, gl.FALSE, 28, 12);

    if (!testGLError("gl.vertexAttribPointer")) {
        return false;
    }

    gl.drawArrays(draw_mode, 0, 36);
    var saveMat = mat4.create();
    mat4.copy(saveMat, mMatrix);
    for (var i = 0; i < 8; i++) {

        mat4.rotateY(mMatrix, mMatrix, i * 6.28 / 8.0 + yRot * 3.0);
        mat4.translate(mMatrix, mMatrix, [1.0, 0.0, 0.0]);
        mat4.scale(mMatrix, mMatrix, [0.2, 0.2, 0.2]);
        mat4.rotateY(mMatrix, mMatrix, yRot * 7.0);
        gl.uniformMatrix4fv(mMatrixLocation, gl.FALSE, mMatrix);
        gl.drawArrays(draw_mode, 0, 36);
        mat4.copy(mMatrix, saveMat);
    }

    if (!testGLError("gl.drawArrays")) {
        return false;
    }

    return true;
}

function main() {
    var canvas = document.getElementById("tutorial1");

    if (!initialiseGL(canvas)) {
        return;
    }

    if (!initialiseBuffer()) {
        return;
    }

    if (!initialiseShaders()) {
        return;
    }

    // renderScene();
    // Render loop
    requestAnimFrame = (function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000, 60);
            };
    })();

    (function renderLoop() {
        if (renderScene()) {
            // Everything was successful, request that we redraw our scene again in the future
            requestAnimFrame(renderLoop);
        }
    })();
}
