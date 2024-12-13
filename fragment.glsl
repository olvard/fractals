precision mediump float;
uniform vec2 u_resolution;

void main() {

	// get pixel coordinates
	vec2 uv = gl_FragCoord.xy / u_resolution.xy;

	// z, a complex number
	vec2 z = vec2(0.0, 0.0);
	// c, a constant complex number that corresponts to the pixel coordinates
	vec2 c = uv;

	// iterate the mandelbrot function
	float iterations = 0.0;
	const float maxIterations = 300.0;

	for(float n = 0.0; n < maxIterations; n++){
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