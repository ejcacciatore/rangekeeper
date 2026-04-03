'use client';

import { useEffect, useRef, useState } from 'react';

export default function HeroShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      setIsSupported(false);
      console.warn('WebGL not supported, falling back to CSS gradient');
      return;
    }

    // Set canvas size
    const setCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for performance
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Vertex shader
    const vertexShaderSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment shader - Dark energy grid effect
    const fragmentShaderSource = `
      precision mediump float;
      uniform float time;
      uniform vec2 resolution;

      #define GREEN vec3(0.0, 1.0, 0.255) // #00FF41

      float grid(vec2 uv, float scale) {
        vec2 grid = fract(uv * scale);
        float line = min(
          smoothstep(0.0, 0.05, grid.x) * smoothstep(1.0, 0.95, grid.x),
          smoothstep(0.0, 0.05, grid.y) * smoothstep(1.0, 0.95, grid.y)
        );
        return 1.0 - line;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        uv = uv * 2.0 - 1.0;
        uv.x *= resolution.x / resolution.y;

        // Animated grid
        vec2 gridUv = uv + vec2(time * 0.05, time * 0.03);
        float g1 = grid(gridUv, 8.0) * 0.3;
        float g2 = grid(gridUv * 1.5 + time * 0.1, 4.0) * 0.2;

        // Pulsing energy effect
        float dist = length(uv);
        float pulse = sin(dist * 10.0 - time * 2.0) * 0.5 + 0.5;
        pulse *= exp(-dist * 0.8);

        // Combine effects
        float intensity = g1 + g2 + pulse * 0.3;
        vec3 color = GREEN * intensity;

        // Fade edges
        float vignette = 1.0 - smoothstep(0.5, 1.5, dist);
        color *= vignette;

        gl_FragColor = vec4(color, intensity * 0.6);
      }
    `;

    // Compile shader
    function compileShader(source: string, type: number) {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

    if (!vertexShader || !fragmentShader) {
      setIsSupported(false);
      return;
    }

    // Create program
    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      setIsSupported(false);
      return;
    }

    gl.useProgram(program);

    // Set up geometry
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Get uniform locations
    const timeLocation = gl.getUniformLocation(program, 'time');
    const resolutionLocation = gl.getUniformLocation(program, 'resolution');

    // Render loop
    let animationId: number;
    const startTime = Date.now();

    function render() {
      if (!gl || !canvas) return;

      const time = (Date.now() - startTime) / 1000;

      gl.uniform1f(timeLocation, time);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationId = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', setCanvasSize);
    };
  }, [prefersReducedMotion]);

  if (!isSupported || prefersReducedMotion) {
    // Fallback: CSS gradient
    return (
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 65, 0.15) 0%, transparent 50%)',
        }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-40"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
