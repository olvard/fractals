precision highp float;
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

	float iterations = 0.0;
	float maxIterations = u_iterations; 

	const float MAX_LOOP = 1000.0; 

	for (float n = 0.0; n < MAX_LOOP; n++) {
		if (n >= maxIterations) break;

		z = vec2(
			z.x * z.x - z.y * z.y + c.x, // a^2 - b^2 + c.x
			2.0 * z.x * z.y + c.y        // 2ab + c.y
		);

		// Check if the magnitude exceeds the escape threshold
		if (dot(z, z) > 4.0) {
			iterations = n; 
			break;
		}
	}

	// Stable points
	if (dot(z, z) <= 4.0) {
		iterations = maxIterations;
	}

	float normalized = iterations / maxIterations;

	vec3 color = vec3(0.0); // Default to black

	if (u_colorMode == 0) {

		if (iterations >= maxIterations) {
			color = vec3(0.0, 0.0, 0.0);
		} else {
			color = vec3(normalized, normalized, normalized);
		}

	} else if (u_colorMode == 1) {

		//color based on the number of iterations and unstable points

		if (iterations >= maxIterations) {
			color = vec3(0.0, 0.0, 0.0);
		} else {
			color = vec3(
				0.5 + 0.5 * cos(3.0 + normalized * 10.0),
				0.5 + 0.5 * cos(3.0 + normalized * 10.0 + 2.0),
				0.5 + 0.5 * cos(3.0 + normalized * 10.0 + 4.0)
			);
		}
	}

	gl_FragColor = vec4(color, 1.0);






	

}