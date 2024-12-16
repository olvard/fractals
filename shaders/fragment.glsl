precision mediump float;
uniform vec2 u_resolution;
uniform vec2 u_offset;
uniform float u_zoom;
uniform float u_iterations;
uniform int u_colorMode;

void main() {

	// get pixel coordinates and nomalize them

	vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);

	uv = uv / u_zoom - u_offset;

	// z, a complex number
	vec2 z = vec2(0.0, 0.0);
	// c, a constant complex number that corresponts to the pixel coordinates
	vec2 c = uv;

	// iterate the mandelbrot function
	float iterations = 0.0;
	float maxIterations = u_iterations;

	for(float n = 0.0; n < 1000.0; n++){
		if (n >= maxIterations) break;
		// z = z^2 + c
		z = vec2(
		z.x * z.x - z.y * z.y + c.x, //a^2 - b^2 + c.x
		2.0 * z.x * z.y + c.y //2ab + c.y
		);
		// if the magnitude of z is greater than 2, break
		if(length(z) > 2.0){
			iterations = n; // store the number of iterations
			break;
		}
	}

	float normalized = iterations / maxIterations;

	vec3 color;

	if(u_colorMode == 0){
		if (iterations == maxIterations){
			color = vec3(0.0, 0.0, 0.0);
		} else {
			color = vec3(normalized, normalized, normalized);
		}
	} else if (u_colorMode == 1) {
		// smooth coloring
		float smoothedIterations = iterations - log2(log2(length(z))) + 4.0;
		float normalized = smoothedIterations / maxIterations;
		color = vec3(0.5 + 0.5 * cos(6.2831 * (normalized + vec3(0.0, 0.5, 1.0))));
	} else if (u_colorMode == 2) {
		// hue shifting
		float hue = normalized; // Use normalized escape time for hue
		color = vec3(0.5 + 0.5 * cos(6.2831 * hue + vec3(0.0, 0.33, 0.67))); // Hue shifting
	} else if (u_colorMode == 3) {
		// distance estimation
		float distance = 0.5 * log(length(z)) / length(vec2(2.0 * z.x * z.y, z.x * z.x - z.y * z.y));
		float shading = 1.0 - exp(-distance * 10.0);
		color = vec3(shading) * vec3(0.0, 0.5, 1.0); // Adjust color scheme here
	}

	gl_FragColor = vec4(color, 1.0);





	

}