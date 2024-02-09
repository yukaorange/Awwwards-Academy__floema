precision mediump float;

uniform float uAlpha;
uniform sampler2D tMap;

varying vec2 vUv;
varying vec4 vPosition;

void main() {
  vec4 texture = texture2D(tMap, vUv);

  gl_FragColor = texture;

  gl_FragColor.a = (1.0 - abs(vPosition.x * 1. / 6.)) * uAlpha;

}
