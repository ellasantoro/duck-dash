uniform float time;
uniform sampler2D image;
uniform float resolution;
uniform float speed;
uniform float frequency;
uniform float amplitude;

varying vec2 vUv;

void main() {
    vec3 lightPosition = vec3(0.,-1.,70.);
    vec3 lightColor = vec3(1.,1.,1.);
    vec3 viewPosition = vec3(0.,1.,70.);
    vec2 scaledUv = (vUv + 70.0) * resolution;
    
    //create the ripple effect using speed length, and frequency from the uniforms passed in
    //uses sin and cos functions so that it oscillates, the waves are basically bouncing back and forth
    vec2 ripple = vec2(
        sin((length(scaledUv) * frequency) + (time * speed)),
        cos((length(scaledUv) * frequency) + (time * speed))
    ) * (amplitude / 1000.0);

    //mapping the image on using texture2D
    vec3 baseColor = texture2D(image, scaledUv + ripple).rgb;
    vec3 normal = normalize(vec3(ripple, 1.0));
    
    //LIGHTING:
    //taken from a past WB, calculate light using the scaled UV we calculated and the lightposition we chose previously
    vec3 lightDir = normalize(lightPosition - vec3(scaledUv, 0.0));
    
    // Calculate the view direction
    vec3 viewDir = normalize(viewPosition - vec3(scaledUv, 0.0));
    
    //reflection of the light using the reflect function
    //https://registry.khronos.org/OpenGL-Refpages/gl4/html/reflect.xhtml
    vec3 reflectDir = reflect(-lightDir, normal);
    
    //specular highlight:
    float specularStrength = 0.4; // strength of the specular highlight
    float shininess =4000.; // controls the spread of the specular highlight
    //calculate the specular just as we've done in previous WBs but use the variables we defined above
    float specular = pow(max(dot(viewDir, reflectDir), 0.0), shininess) * specularStrength;
    
    //create and set the final color (as we've done previously in WB10)
    vec3 finalColor = baseColor + specular * lightColor;
    gl_FragColor = vec4(finalColor, 1.0);
}
