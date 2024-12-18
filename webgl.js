async function main() {
	const canvas = document.querySelector('#gl-canvas')
	canvas.width = window.innerWidth
	canvas.height = window.innerHeight
	const gl = canvas.getContext('webgl')

	if (gl === null) {
		alert('Unable to initialize WebGL. Your browser or machine may not support it.')
		return
	}

	// Configuration for different shaders
	const shaderConfigs = {
		mandelbrot: {
			vertex: 'shaders/brot_vert.glsl',
			fragment: 'shaders/brot_frag.glsl',
		},
		julia: {
			vertex: 'shaders/julia_vert.glsl',
			fragment: 'shaders/julia_frag.glsl',
		},
		mandelbulb: {
			vertex: 'shaders/bulb_vert.glsl',
			fragment: 'shaders/bulb_frag.glsl',
		},
	}

	// Shared state
	let currentShaderConfig = null
	let zoom = 0.5
	let offsetX = 0.5
	let offsetY = 0.0
	let iterations = 30
	let colorMode = 0

	// Julia specific state
	let juliaCx = 0.0
	let juliaCy = 0.0

	// Julia crosshair canvas setup
	const juliaCrosshairCanvas = document.getElementById('julia-crosshair')
	const juliaCrosshairCtx = juliaCrosshairCanvas.getContext('2d')
	const crosshairXSpan = document.getElementById('crosshair-x')
	const crosshairYSpan = document.getElementById('crosshair-y')

	function drawJuliaCrosshair() {
		const width = juliaCrosshairCanvas.width
		const height = juliaCrosshairCanvas.height

		// Clear canvas
		juliaCrosshairCtx.clearRect(0, 0, width, height)

		// Draw crosshair
		const x = (juliaCx + 1.5) * (width / 3)
		const y = (juliaCy + 1.5) * (height / 3)

		juliaCrosshairCtx.beginPath()
		juliaCrosshairCtx.strokeStyle = 'white'
		juliaCrosshairCtx.moveTo(x, 0)
		juliaCrosshairCtx.lineTo(x, height)
		juliaCrosshairCtx.moveTo(0, y)
		juliaCrosshairCtx.lineTo(width, y)
		juliaCrosshairCtx.stroke()

		// Update text coordinates
		crosshairXSpan.textContent = juliaCx.toFixed(2)
		crosshairYSpan.textContent = juliaCy.toFixed(2)
	}

	// Function to load shader source
	async function loadShaderSource(url) {
		try {
			const response = await fetch(url)
			if (!response.ok) {
				throw new Error(`Failed to load shader from ${url}: ${response.statusText}`)
			}
			return await response.text()
		} catch (error) {
			console.error(`Error loading shader source from ${url}:`, error)
			throw error
		}
	}

	// Function to create a shader
	function createShader(gl, type, source) {
		const shader = gl.createShader(type)
		gl.shaderSource(shader, source)
		gl.compileShader(shader)

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			const error = gl.getShaderInfoLog(shader)
			console.error('Shader compilation error:', error)
			gl.deleteShader(shader)
			throw new Error(`Shader compilation failed: ${error}`)
		}

		return shader
	}

	// Function to create shader program
	function createShaderProgram(gl, vertexShaderSource, fragmentShaderSource) {
		try {
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
				const error = gl.getProgramInfoLog(program)
				console.error('Shader program linking error:', error)
				gl.deleteProgram(program)
				throw new Error(`Shader program linking failed: ${error}`)
			}

			return program
		} catch (error) {
			console.error('Error creating shader program:', error)
			throw error
		}
	}

	// Function to set up shader program and buffers
	async function initializeShaders(shaderKey) {
		try {
			console.log(`Initializing ${shaderKey} shader`)

			// Load shader sources
			const vertexShaderSource = await loadShaderSource(shaderConfigs[shaderKey].vertex)
			const fragmentShaderSource = await loadShaderSource(shaderConfigs[shaderKey].fragment)

			// Create shader program
			const program = createShaderProgram(gl, vertexShaderSource, fragmentShaderSource)
			gl.useProgram(program)

			// Set up vertex buffer
			const positions = [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0]
			const vertexBuffer = gl.createBuffer()
			gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

			// Set up attribute
			const positionAttributeLocation = gl.getAttribLocation(program, 'a_Position')
			gl.enableVertexAttribArray(positionAttributeLocation)
			gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)

			// Add Julia constant uniform for Julia shader
			const juliaConstant = shaderKey === 'julia' ? gl.getUniformLocation(program, 'u_juliaConstant') : null

			const uniforms = {
				resolution: gl.getUniformLocation(program, 'u_resolution'),
				zoom: gl.getUniformLocation(program, 'u_zoom'),
				offset: gl.getUniformLocation(program, 'u_offset'),
				iterations: gl.getUniformLocation(program, 'u_iterations'),
				colorMode: gl.getUniformLocation(program, 'u_colorMode'),
				juliaConstant: juliaConstant,
			}

			// Set resolution uniform (doesn't change between shaders)
			gl.uniform2f(uniforms.resolution, canvas.width, canvas.height)

			return { program, uniforms }
		} catch (error) {
			console.error(`Failed to initialize ${shaderKey} shader:`, error)
			throw error
		}
	}

	// Initial shader setup
	currentShaderConfig = await initializeShaders('mandelbrot')

	// Render function
	function updateFractal() {
		if (!currentShaderConfig) return

		const { uniforms } = currentShaderConfig

		// Set uniforms
		gl.uniform2f(uniforms.offset, offsetX, offsetY)
		gl.uniform1f(uniforms.zoom, zoom)
		gl.uniform1f(uniforms.iterations, iterations)
		gl.uniform1i(uniforms.colorMode, colorMode)

		// Add Julia constant uniform if exists
		if (uniforms.juliaConstant) {
			gl.uniform2f(uniforms.juliaConstant, juliaCx, juliaCy)
		}

		// Clear and draw
		gl.clearColor(0.0, 0.0, 0.0, 1.0)
		gl.clear(gl.COLOR_BUFFER_BIT)
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
	}

	// Button event listeners
	async function switchShader(shaderKey) {
		try {
			// Stop any ongoing operations
			gl.useProgram(null)

			// Initialize new shader
			currentShaderConfig = await initializeShaders(shaderKey)

			// Update fractal with current parameters
			updateFractal()
		} catch (error) {
			console.error(`Error switching to ${shaderKey} shader:`, error)
			alert(`Failed to switch to ${shaderKey} shader. Check console for details.`)
		}
	}

	// Attach event listeners to buttons
	document.getElementById('button1').addEventListener('click', () => switchShader('mandelbrot'))
	document.getElementById('button2').addEventListener('click', () => switchShader('julia'))
	document.getElementById('button3').addEventListener('click', () => switchShader('mandelbulb'))

	// Other event listeners (iterations, color mode, etc.)

	// Add Julia crosshair interaction
	let isJuliaDragging = false

	juliaCrosshairCanvas.addEventListener('mousedown', () => {
		isJuliaDragging = true
	})

	juliaCrosshairCanvas.addEventListener('mousemove', (e) => {
		if (isJuliaDragging) {
			const rect = juliaCrosshairCanvas.getBoundingClientRect()
			const x = e.clientX - rect.left
			const y = e.clientY - rect.top

			// Convert to normalized coordinates (-1.5 to 1.5)
			juliaCx = x / (rect.width / 3) - 1.5
			juliaCy = y / (rect.height / 3) - 1.5

			drawJuliaCrosshair()

			// Update Julia shader if currently selected
			if (currentShaderConfig && currentShaderConfig.uniforms) {
				gl.uniform2f(currentShaderConfig.uniforms.juliaConstant, juliaCx, juliaCy)
				updateFractal()
			}
		}
	})

	juliaCrosshairCanvas.addEventListener('mouseup', () => {
		isJuliaDragging = false
	})

	juliaCrosshairCanvas.addEventListener('mouseleave', () => {
		isJuliaDragging = false
	})

	document.getElementById('iterations').addEventListener('input', (e) => {
		iterations = parseInt(e.target.value)
		updateFractal()
	})

	//julia slider
	document.getElementById('julia-iterations').addEventListener('input', (e) => {
		iterations = parseInt(e.target.value)
		updateFractal()
	})

	document.getElementById('colormode').addEventListener('change', (e) => {
		colorMode = parseInt(e.target.value)
		updateFractal()
	})

	// Zoom and pan event listeners
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

	window.addEventListener('resize', () => {
		const canvas = document.getElementById('gl-canvas')
		canvas.width = window.innerWidth
		canvas.height = window.innerHeight
		// You'll need to update your WebGL viewport here as well
		gl.viewport(0, 0, canvas.width, canvas.height)
		// Re-render your scene
		updateFractal()
	})

	// Initial render
	updateFractal()
}

// Call main to start the WebGL program
main()
