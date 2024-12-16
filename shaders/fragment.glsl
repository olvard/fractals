precision mediump float;
uniform vec2 u_resolution;
uniform vec2 u_offset;
uniform float u_zoom;
uniform float u_iterations;

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

	if (iterations == maxIterations){
		gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
	} else {
		gl_FragColor = vec4(normalized, normalized, normalized, 1.0);
	}
	

}