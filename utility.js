export function drawMandelbrot(canvas) {
	const ctx = canvas.getContext('2d')
	const width = canvas.width
	const height = canvas.height

	// Define Mandelbrot set bounds
	const mandelbrotMinX = -1.5
	const mandelbrotMaxX = 1.5
	const mandelbrotMinY = -1.5
	const mandelbrotMaxY = 1.5
	const maxIterations = 30

	// Create image data for the canvas
	const imageData = ctx.createImageData(width, height)

	for (let px = 0; px < width; px++) {
		for (let py = 0; py < height; py++) {
			// Map pixel (px, py) to Mandelbrot coordinates (x0, y0)
			const x0 = mandelbrotMinX + (px / width) * (mandelbrotMaxX - mandelbrotMinX)
			const y0 = mandelbrotMinY + (py / height) * (mandelbrotMaxY - mandelbrotMinY)

			// Compute Mandelbrot iteration
			let x = 0
			let y = 0
			let iteration = 0
			while (x * x + y * y <= 4 && iteration < maxIterations) {
				const xtemp = x * x - y * y + x0
				y = 2 * x * y + y0
				x = xtemp
				iteration++
			}

			// Color based on the number of iterations
			const color = iteration === maxIterations ? 0 : Math.floor((iteration / maxIterations) * 255)
			const pixelIndex = (py * width + px) * 4
			imageData.data[pixelIndex] = color // Red
			imageData.data[pixelIndex + 1] = color // Green
			imageData.data[pixelIndex + 2] = color // Blue
			imageData.data[pixelIndex + 3] = 255 // Alpha
		}
	}

	// Draw the fractal on the canvas
	ctx.putImageData(imageData, 0, 0)
}
