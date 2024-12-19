precision highp float;
uniform vec2 u_resolution;
uniform vec2 u_offset;
uniform float u_zoom;
uniform float u_iterations;
uniform int u_colorMode;
uniform vec2 u_juliaConstant;

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {

	// get pixel coordinates and nomalize them

	vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);

	uv = uv / u_zoom - u_offset;

	// z, a complex number
	vec2 z = uv;
	vec2 c = u_juliaConstant;

	float iterations = 0.0;
	float maxIterations = u_iterations; // Non-constant uniform value

	const float MAX_LOOP = 1000.0; // Fixed maximum loop count

	for (float n = 0.0; n < MAX_LOOP; n += 1.0) {
		if (n >= maxIterations) break;

		z = vec2(
			z.x * z.x - z.y * z.y + c.x, // a^2 - b^2 + c.x
			2.0 * z.x * z.y + c.y        // 2ab + c.y
		);

		// Check if the magnitude exceeds the escape threshold
		if (dot(z, z) > 4.0) {
			break;
		}

		iterations = n; // Store iteration count
	}

	float smooth_iter = float(iterations) + 1.0 - log2(log2(dot(z, z)));
    smooth_iter = clamp(smooth_iter, 0.0, float(maxIterations));
                
    // Create a colorful visualization
    float hue = smooth_iter / float(maxIterations);
    vec3 color = hsv2rgb(vec3(hue, 0.8, iterations < maxIterations ? 1.0 : 0.0));
                
    gl_FragColor = vec4(color, 1.0);


	gl_FragColor = vec4(color, 1.0);






	

}