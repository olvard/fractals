
precision highp float;

uniform vec2 u_resolution;
uniform float u_zoom;
uniform vec2 u_offset;
uniform float u_iterations;
uniform int u_colorMode;
uniform float u_angle;
uniform int u_power;

const float MIN_DIST = 0.001;
const float MAX_DIST = 100.0;


mat3 rotateY(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat3(
        c, 0.0, s,
        0.0, 1.0, 0.0,
        -s, 0.0, c
    );
}

float mandelbulbDE(vec3 pos) {

    pos = rotateY(u_angle) * pos; // Rotate the fractal space
    vec3 z = pos;
    float dr = 1.0;
    float r = 0.0;

	const int POWER = 20;
    
    for (int i = 0; i < POWER; i++) {
		if (i >= u_power) break;

        r = length(z);
        if (r > 2.0) break;
        
        float theta = acos(z.z/r);
        float phi = atan(z.y, z.x);
        dr = pow(r, float(u_power)-1.0) * float(u_power) * dr + 1.0;
        
        float zr = pow(r, float(u_power));
        theta = theta * float(u_power);
        phi = phi * float(u_power);
        
        z = zr * vec3(
            sin(theta) * cos(phi),
            sin(theta) * sin(phi),
            cos(theta)
        );
        z += pos;
    }
    return 0.5 * log(r) * r / dr;
}

float rayMarch(vec3 ro, vec3 rd) {
    float depth = 0.0;

	const int maxIterations = 1000;
	int iterations = int(u_iterations);
    
    for (int i = 0; i < maxIterations; i++) {
		if (i >= iterations) break;
        vec3 pos = ro + depth * rd;
        float dist = mandelbulbDE(pos);
        
        if (dist < MIN_DIST) return depth;
        depth += dist;
        if (depth >= MAX_DIST) break;
    }
    
    return MAX_DIST;
}

vec3 getColor(float dist, vec3 pos) {
    if (dist >= MAX_DIST) return vec3(0.0);
    
    vec3 normal = normalize(pos);
    float light = dot(normal, normalize(vec3(1.0, 1.0, 1.0)));
    
    vec3 color;

	color = vec3(0.5 + 0.5 * cos(3.0 + dist * 10.0),
					0.5 + 0.5 * cos(3.0 + dist * 10.0 + 2.0),
					0.5 + 0.5 * cos(3.0 + dist * 10.0 + 4.0));


    
    
    return color;
}

void main() {
    vec2 uv = (gl_FragCoord.xy / u_resolution.xy) * 2.0 - 1.0;

  	uv = uv / u_zoom - u_offset;

    vec3 rayOrigin = vec3(-1, -3, 4.0);
    vec3 rayDir = normalize(vec3(uv, -1.0));
    
    float dist = rayMarch(rayOrigin, rayDir);
    vec3 pos = rayOrigin + dist * rayDir;
    
    gl_FragColor = vec4(getColor(dist, pos), 1.0);
}