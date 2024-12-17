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

	float iterations = 0.0;
	float maxIterations = u_iterations; // Non-constant uniform value

	const float MAX_LOOP = 20000.0; // Fixed maximum loop count

	for (float n = 0.0; n < MAX_LOOP; n += 1.0) {
		if (n >= maxIterations) break;

		z = vec2(
			z.x * z.x - z.y * z.y + c.x, // a^2 - b^2 + c.x
			2.0 * z.x * z.y + c.y        // 2ab + c.y
		);

		// Check if the magnitude exceeds the escape threshold
		if (dot(z, z) > 4.0) {
			iterations = n; // Store iteration count
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

		color = vec3(1.0, 1.0 - exp(-length(z)), 1.0 - exp(-length(z)));
	
	} else if (u_colorMode == 2) {
		// Measure instability of the orbit
		float instability = length(z);

		// Black for stable points
		if (iterations >= maxIterations) {
			color = vec3(0.0, 0.0, 0.0);
		} else {
			// Use normalized value to interpolate between colors
			float r = 0.5 + 0.5 * sin(6.2831 * normalized + 0.0); // Red gradient
			float g = 0.5 + 0.5 * sin(6.2831 * normalized + 2.0); // Green gradient
			float b = 0.5 + 0.5 * sin(6.2831 * normalized + 4.0); // Blue gradient

			color = vec3(r, g, b);
		}

	} else if (u_colorMode == 3) {
		// Distance estimation
		float distance = 0.5 * log(length(z)) / length(vec2(2.0 * z.x * z.y, z.x * z.x - z.y * z.y));
		float shading = 1.0 - exp(-distance * 10.0);
		color = vec3(shading) * vec3(0.0, 0.5, 1.0); // Adjust color scheme here
	}

	gl_FragColor = vec4(color, 1.0);






	

}