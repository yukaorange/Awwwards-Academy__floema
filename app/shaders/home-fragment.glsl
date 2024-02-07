precision mediump float;

uniform float uAlpha;
uniform sampler2D tMap;

varying float speed;
varying vec2 vUv;


void main() {
  vec4 texture = texture2D(tMap, vUv);

  gl_FragColor = texture;
  gl_FragColor.a = uAlpha;

}