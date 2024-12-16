precision highp float;

uniform vec2 u_resolution;   // Screen resolution
uniform vec2 u_offset;       // Offset for zooming/panning
uniform float u_zoom;        // Zoom level
uniform int u_iterations;    // Max iterations

#define ESCAPE_RADIUS 2.0      // Escape radius
#define MAX_ITERATIONS 1000    // Maximum iterations
#define NUM_SAMPLES 16         // Number of samples per pixel (accumulating escape points)

// Pseudo-random number generator (for randomness in the initial `c` values)
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Map from screen coordinates to Mandelbrot coordinates
vec2 mapToMandelbrot(vec2 coord) {
    return coord / u_zoom - u_offset;
}

void main() {
    // Normalize screen coordinates to [-1, 1]
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);

    // Initialize color accumulator
    vec3 color = vec3(0.0);

    // Iterate over a fixed grid of points in the Mandelbrot set
    for (int i = 0; i < NUM_SAMPLES; i++) {
        // Generate random `c` within the Mandelbrot space (making sure it stays within bounds)
        vec2 c = vec2(
            random(uv + float(i)) * 3.5 - 2.5,  // X: [-2.5, 1]
            random(uv - float(i)) * 2.0 - 1.0   // Y: [-1, 1]
        );

        vec2 z = vec2(0.0, 0.0); // Start at the origin
        bool escaped = false;     // Track if the point escapes
        for (int n = 0; n < MAX_ITERATIONS; n++) {
            // Mandelbrot iteration: z = z^2 + c
            z = vec2(
                z.x * z.x - z.y * z.y + c.x,
                2.0 * z.x * z.y + c.y
            );

            // Check for escape condition
            if (length(z) > ESCAPE_RADIUS) {
                // Map the escape point to screen space
                vec2 escapePoint = (z + u_offset) * u_zoom;

                // Only accumulate if the escape point is within the screen space
                if (escapePoint.x >= -1.0 && escapePoint.x <= 1.0 && escapePoint.y >= -1.0 && escapePoint.y <= 1.0) {
                    // Use iteration count for coloring (intensity)
                    float intensity = float(n) / float(MAX_ITERATIONS);
                    // Accumulate color based on the iteration count (escaped earlier = brighter color)
                    color += vec3(
                        intensity, 
                        intensity * 0.5, 
                        intensity * 0.25
                    );
                }
                escaped = true;
                break; // Stop iterating once the point escapes
            }
        }
    }

    // Normalize the color to smooth out the noise and ensure visibility
    color /= float(NUM_SAMPLES);  // This can be adjusted to increase or decrease brightness

    // Apply gamma correction for final output to brighten the image
    gl_FragColor = vec4(pow(color, vec3(1.2)), 1.0); // Slight gamma correction to brighten
}
