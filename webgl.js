// main.js
async function main() {
	const canvas = document.querySelector('#gl-canvas')
	const gl = canvas.getContext('webgl')

	if (gl === null) {
		alert('Unable to initialize WebGL. Your browser or machine may not support it.')
		return
	}

	// Load shader sources
	const vertexShaderSource = await loadShaderSource('shaders/vertex.glsl')
	const fragmentShaderSource = await loadShaderSource('shaders/fragment.glsl')

	// Create shader program
	const program = createShaderProgram(gl, vertexShaderSource, fragmentShaderSource)
	gl.useProgram(program)

	const positions = [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0]

	// Create a buffer object
	const vertexBuffer = gl.createBuffer()

	// Bind the buffer object to target
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)

	// Pass the vertex data to the buffer
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

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

	// Set uniforms
	const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution')
	const zoomUniformLocation = gl.getUniformLocation(program, 'u_zoom')
	const offsetUniformLocation = gl.getUniformLocation(program, 'u_offset')

	let zoom = 0.5
	let offsetX = 0.5
	let offsetY = 0.0

	gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height)

	function updateFractal() {
		gl.uniform2f(offsetUniformLocation, offsetX, offsetY)
		gl.uniform1f(zoomUniformLocation, zoom)
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
	}

	canvas.addEventListener('wheel', (e) => {
		e.preventDefault()
		const zoomSpeed = 0.01
		const zoomFactor = e.deltaY > 0 ? 1 + zoomSpeed : 1 - zoomSpeed
		zoom *= zoomFactor
		updateFractal()
	})

	let isDragging = false
	let lastX = 0
	let lastY = 0

	canvas.addEventListener('mousedown', (e) => {
		isDragging = true
		lastX = e.clientX
		lastY = e.clientY
	})

	canvas.addEventListener('mousemove', (e) => {
		if (isDragging) {
			const deltaX = e.clientX - lastX
			const deltaY = e.clientY - lastY
			const panSpeed = 0.001 / zoom

			offsetX += deltaX * panSpeed
			offsetY -= deltaY * panSpeed

			lastX = e.clientX
			lastY = e.clientY

			updateFractal()
		}
	})

	canvas.addEventListener('mouseup', () => {
		isDragging = false
	})

	canvas.addEventListener('mouseleave', () => {
		isDragging = false
	})

	// Set clear color to black, fully opaque
	gl.clearColor(0.0, 0.0, 0.0, 1.0)

	// Clear the color buffer
	gl.clear(gl.COLOR_BUFFER_BIT)

	updateFractal()
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
