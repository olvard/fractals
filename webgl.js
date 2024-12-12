// main.js
async function main() {
	const canvas = document.querySelector('#gl-canvas')
	const gl = canvas.getContext('webgl')

	if (gl === null) {
		alert('Unable to initialize WebGL. Your browser or machine may not support it.')
		return
	}

	// Load shader sources
	const vertexShaderSource = await loadShaderSource('vertex.glsl')
	const fragmentShaderSource = await loadShaderSource('fragment.glsl')

	// Create shader program
	const program = createShaderProgram(gl, vertexShaderSource, fragmentShaderSource)
	gl.useProgram(program)

	// Define the geometry
	const vertices = new Float32Array([
		-0.5,
		-0.5, // First vertex
		0.5,
		-0.5, // Second vertex
		0.0,
		0.5, // Third vertex
	])

	// Create a buffer object
	const vertexBuffer = gl.createBuffer()

	// Bind the buffer object to target
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)

	// Pass the vertex data to the buffer
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

	// Get the attribute location
	const positionAttributeLocation = gl.getAttribLocation(program, 'a_Position')

	// Enable the attribute
	gl.enableVertexAttribArray(positionAttributeLocation)

	// Tell the attribute how to get data out of positionBuffer
	gl.vertexAttribPointer(
		positionAttributeLocation,
		2, // 2 components per iteration
		gl.FLOAT, // the data is 32bit floats
		false, // don't normalize the data
		0, // 0 = move forward size * sizeof(type) each iteration to get the next position
		0 // start at the beginning of the buffer
	)

	// Set clear color to black, fully opaque
	gl.clearColor(0.0, 0.0, 0.0, 1.0)

	// Clear the color buffer
	gl.clear(gl.COLOR_BUFFER_BIT)

	// Draw the triangle
	gl.drawArrays(gl.TRIANGLES, 0, 3)
}

// Utility function to load shader source
async function loadShaderSource(url) {
	const response = await fetch(url)
	return await response.text()
}

// Utility function to create a shader
function createShader(gl, type, source) {
	const shader = gl.createShader(type)
	gl.shaderSource(shader, source)
	gl.compileShader(shader)

	// Check compilation status
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader))
		gl.deleteShader(shader)
		return null
	}

	return shader
}

// Utility function to create the shader program
function createShaderProgram(gl, vertexShaderSource, fragmentShaderSource) {
	// Create shaders
	const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
	const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

	// Create the shader program
	const program = gl.createProgram()
	gl.attachShader(program, vertexShader)
	gl.attachShader(program, fragmentShader)
	gl.linkProgram(program)

	// Check linking status
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program))
		return null
	}

	return program
}

// Call main to start the WebGL program
main()
