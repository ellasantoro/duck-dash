varying vec2 vUv;

//copied from previous WB
void main() {  
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1 );

}