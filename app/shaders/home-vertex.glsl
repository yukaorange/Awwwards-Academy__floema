attribute vec3 normal;
attribute vec2 uv;
attribute vec3 position;

#define PI 3.1415926535897932384626433832795

uniform float uSpeed;
uniform vec2 uViewportSizes;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying float speed;
varying vec2 vUv;

void main() {
  vUv = uv;

  vec4 newPosition = modelViewMatrix * vec4(position, 1.0);

  newPosition.z -= (sin(newPosition.y / uViewportSizes.y * PI + PI / 2.) * sin(newPosition.x / uViewportSizes.x * PI + PI / 2.)) * (1. + abs(uSpeed));//q newPosition / uViewportSizes => -0.5 to 0.5 ...resulting in 0 to 0 through 1.0

  speed = newPosition.z;

  gl_Position = projectionMatrix * newPosition;
}
