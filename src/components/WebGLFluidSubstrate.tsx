import { useEffect, useRef } from 'react';

const vertexShaderSource = `
  attribute vec2 a_position;
  varying vec2 v_texCoord;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    // map -1..1 to 0..1
    v_texCoord = a_position * 0.5 + 0.5;
  }
`;

const updateFragmentShaderSource = `
  precision highp float;
  varying vec2 v_texCoord;
  uniform sampler2D u_current;
  uniform vec2 u_delta;
  uniform vec2 u_mouse;
  uniform vec2 u_mouseVel;
  uniform float u_aspect;
  uniform float u_damping;
  uniform float u_force;
  uniform vec3 u_drips[10];
  uniform int u_numDrips;
  uniform float u_dripScale;
  uniform float u_dripTailLength;

  void main() {
    // Neighbor sampling
    vec2 cur = texture2D(u_current, v_texCoord).rg;
    float currentHeight = cur.r;
    float previousHeight = cur.g;

    float right = texture2D(u_current, v_texCoord + vec2(u_delta.x, 0.0)).r;
    float left = texture2D(u_current, v_texCoord + vec2(-u_delta.x, 0.0)).r;
    float top = texture2D(u_current, v_texCoord + vec2(0.0, u_delta.y)).r;
    float bottom = texture2D(u_current, v_texCoord + vec2(0.0, -u_delta.y)).r;

    // Wave equation
    float nextHeight = (right + left + top + bottom) * 0.5 - previousHeight;
    nextHeight *= u_damping; // Damping

    // Mouse interaction
    vec2 p = v_texCoord;
    p.x *= u_aspect;
    vec2 m = u_mouse;
    m.x *= u_aspect;
    float dist = distance(p, m);
    
    // Add velocity-based inertia ripples
    float force = max(0.0, 1.0 - dist * 10.0);
    nextHeight += force * length(u_mouseVel) * u_force;

    // Drips
    for(int i = 0; i < 10; i++) {
      if (i >= u_numDrips) break;
      vec2 dp = u_drips[i].xy;
      dp.x *= u_aspect;
      
      vec2 diff = p - dp;
      // Tail effect: stretch the distance vertically upwards
      if (diff.y > 0.0) {
        diff.y /= max(0.01, u_dripTailLength);
      }
      
      float dDist = length(diff);
      float dForce = max(0.0, 1.0 - dDist * (120.0 / u_dripScale));
      nextHeight += dForce * u_drips[i].z;
    }

    gl_FragColor = vec4(nextHeight, currentHeight, 0.0, 1.0);
  }
`;

const renderFragmentShaderSource = `
  precision highp float;
  varying vec2 v_texCoord;
  uniform sampler2D u_water;
  uniform vec2 u_delta;
  uniform float u_aspect;
  uniform vec2 u_resolution;
  uniform vec3 u_themeColor;
  uniform float u_luminosity;

  void main() {
    float dx = texture2D(u_water, v_texCoord + vec2(u_delta.x, 0.0)).r - texture2D(u_water, v_texCoord - vec2(u_delta.x, 0.0)).r;
    float dy = texture2D(u_water, v_texCoord + vec2(0.0, u_delta.y)).r - texture2D(u_water, v_texCoord - vec2(0.0, u_delta.y)).r;
    
    vec3 normal = normalize(vec3(-dx * 0.5, -dy * 0.5, 1.0));
    
    // Liquid shading
    vec3 lightDir = normalize(vec3(0.5, 0.5, 1.0));
    float diffuse = max(dot(normal, lightDir), 0.0);
    
    // Specular highlight
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 halfDir = normalize(lightDir + viewDir);
    float specular = pow(max(dot(normal, halfDir), 0.0), 64.0);

    // Color gradient based on normal magnitude (depth)
    float flow = length(vec2(dx, dy)) * 5.0; // amplify for visibility
    vec3 baseCol = vec3(0.015, 0.015, 0.015) * u_luminosity; // dark background
    vec3 deepCol = u_themeColor * 0.8 * u_luminosity; // main fluid uses the theme color
    vec3 highlight = mix(u_themeColor, vec3(1.0), 0.6) * u_luminosity; // highlight based on theme color
    
    vec3 finalColor = mix(baseCol, deepCol, min(flow * 3.0, 1.0));
    finalColor += highlight * specular * 1.8;
    finalColor += diffuse * (u_themeColor * 0.2);

    // Grid pattern substrate
    vec2 gridCoord = v_texCoord * u_resolution * 0.015;
    float grid = max(
      step(0.95, fract(gridCoord.x + normal.x * 2.0)),
      step(0.95, fract(gridCoord.y + normal.y * 2.0))
    );
    finalColor += grid * (u_themeColor * 0.15) * u_luminosity;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}

export interface WebGLFluidSubstrateProps {
  damping?: number;
  forceMultiplier?: number;
  dripIntensity?: number;
  themeColorHex?: string;
  luminosity?: number;
  dripScale?: number;
  dripTailLength?: number;
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16) / 255.0,
    parseInt(result[2], 16) / 255.0,
    parseInt(result[3], 16) / 255.0
  ] : [0.0, 0.85, 0.1];
}

export default function WebGLFluidSubstrate({ 
  damping = 0.83, 
  forceMultiplier = 240.0,
  dripIntensity = 0.15,
  themeColorHex = "#9C81C8",
  luminosity = 0.3,
  dripScale = 1.0,
  dripTailLength = 1.0
}: WebGLFluidSubstrateProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // use refs for reactive values in the animation loop
  const dampingRef = useRef(damping);
  const forceRef = useRef(forceMultiplier);
  const dripRef = useRef(dripIntensity);
  const themeColorRef = useRef(hexToRgb(themeColorHex));
  const luminosityRef = useRef(luminosity);
  const dripScaleRef = useRef(dripScale);
  const dripTailLengthRef = useRef(dripTailLength);

  useEffect(() => {
    dampingRef.current = damping;
    forceRef.current = forceMultiplier;
    dripRef.current = dripIntensity;
    themeColorRef.current = hexToRgb(themeColorHex);
    luminosityRef.current = luminosity;
    dripScaleRef.current = dripScale;
    dripTailLengthRef.current = dripTailLength;
  }, [damping, forceMultiplier, dripIntensity, themeColorHex, luminosity, dripScale, dripTailLength]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
    if (!gl) return;

    // Extensions required for float / half-float textures
    gl.getExtension('OES_texture_float');
    gl.getExtension('OES_texture_float_linear');
    const extHalf = gl.getExtension('OES_texture_half_float');
    gl.getExtension('OES_texture_half_float_linear');
    gl.getExtension('WEBGL_color_buffer_float');
    gl.getExtension('EXT_color_buffer_half_float');

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const updateProgram = createProgram(gl, vertexShaderSource, updateFragmentShaderSource)!;
    const renderProgram = createProgram(gl, vertexShaderSource, renderFragmentShaderSource)!;

    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    function createFBO(w: number, h: number) {
      const tex = gl!.createTexture();
      gl!.bindTexture(gl!.TEXTURE_2D, tex);
      
      // Determine the best type for the texture (prefer HALF_FLOAT, fallback to FLOAT, or UNSIGNED_BYTE as last resort)
      const type = extHalf ? extHalf.HALF_FLOAT_OES : gl!.FLOAT;
      
      gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, w, h, 0, gl!.RGBA, type, null);
      
      // Use NEAREST to ensure it is always framebuffer-completable even without _linear extensions on some devices
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.NEAREST);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.NEAREST);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);

      const fbo = gl!.createFramebuffer();
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
      gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, tex, 0);

      if (gl!.checkFramebufferStatus(gl!.FRAMEBUFFER) !== gl!.FRAMEBUFFER_COMPLETE) {
        // Fallback to UNSIGNED_BYTE if float/half-float aren't supported as render targets (e.g. some Safari on iOS)
        gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, w, h, 0, gl!.RGBA, gl!.UNSIGNED_BYTE, null);
      }

      // Initialize with zeros
      gl!.viewport(0, 0, w, h);
      gl!.clearColor(0, 0, 0, 0);
      gl!.clear(gl!.COLOR_BUFFER_BIT);

      return { tex, fbo };
    }

    // Ping pong FBOs for simulation state
    // Downscale for simulation performance (e.g., 512x512 max or half window size)
    const simW = Math.min(w / 2, 512);
    const simH = Math.min(h / 2, 512);
    
    let fboA = createFBO(simW, simH);
    let fboB = createFBO(simW, simH);

    const mouse = { x: -10, y: -10 };
    const mouseVel = { x: 0, y: 0 };
    let lastMouse = { x: -10, y: -10 };

    const handlePointerMove = (clientX: number, clientY: number) => {
      const x = clientX / window.innerWidth;
      const y = 1.0 - (clientY / window.innerHeight);
      if (lastMouse.x !== -10) {
        mouseVel.x = (x - lastMouse.x) * 2.0;
        mouseVel.y = (y - lastMouse.y) * 2.0;
      }
      mouse.x = x;
      mouse.y = y;
      lastMouse = { x, y };
    };

    const handleMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchMove, { passive: true });

    let animationFrameId: number;
    const drips: { x: number, y: number, vy: number, force: number }[] = [];

    const tick = () => {
      if (Math.random() < dripRef.current * 0.2) {
        drips.push({
           x: Math.random(),
           y: 1.1, 
           vy: -0.002 - Math.random() * 0.006, // Slower, honey-like moving speed
           force: 30.0 + Math.random() * 100.0
        });
      }

      // update drips
      for(let i = drips.length - 1; i >= 0; i--) {
        drips[i].y += drips[i].vy;
        if (drips[i].y < -0.1) {
          drips.splice(i, 1);
        }
      }

      // 1. Update Simulation
      gl.viewport(0, 0, simW, simH);
      gl.useProgram(updateProgram);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fboA.fbo);

      const aPosUpd = gl.getAttribLocation(updateProgram, 'a_position');
      gl.enableVertexAttribArray(aPosUpd);
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
      gl.vertexAttribPointer(aPosUpd, 2, gl.FLOAT, false, 0, 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, fboB.tex);
      gl.uniform1i(gl.getUniformLocation(updateProgram, 'u_current'), 0);
      
      gl.uniform2f(gl.getUniformLocation(updateProgram, 'u_delta'), 1.0 / simW, 1.0 / simH);
      gl.uniform2f(gl.getUniformLocation(updateProgram, 'u_mouse'), mouse.x, mouse.y);
      gl.uniform2f(gl.getUniformLocation(updateProgram, 'u_mouseVel'), mouseVel.x, mouseVel.y);
      gl.uniform1f(gl.getUniformLocation(updateProgram, 'u_aspect'), window.innerWidth / window.innerHeight);

      gl.uniform1f(gl.getUniformLocation(updateProgram, 'u_damping'), dampingRef.current);
      gl.uniform1f(gl.getUniformLocation(updateProgram, 'u_force'), forceRef.current);
      gl.uniform1f(gl.getUniformLocation(updateProgram, 'u_dripScale'), dripScaleRef.current);
      gl.uniform1f(gl.getUniformLocation(updateProgram, 'u_dripTailLength'), dripTailLengthRef.current);

      const numDrips = Math.min(drips.length, 10);
      gl.uniform1i(gl.getUniformLocation(updateProgram, 'u_numDrips'), numDrips);
      const dripsData = new Float32Array(30);
      for (let i = 0; i < numDrips; i++) {
        dripsData[i * 3 + 0] = drips[i].x;
        dripsData[i * 3 + 1] = drips[i].y;
        dripsData[i * 3 + 2] = drips[i].force;
      }
      gl.uniform3fv(gl.getUniformLocation(updateProgram, 'u_drips'), dripsData);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // Dampen velocity for next frame
      mouseVel.x *= 0.8;
      mouseVel.y *= 0.8;

      // 2. Render to Screen
      gl.viewport(0, 0, w, h);
      gl.useProgram(renderProgram);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      const aPosRend = gl.getAttribLocation(renderProgram, 'a_position');
      gl.enableVertexAttribArray(aPosRend);
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
      gl.vertexAttribPointer(aPosRend, 2, gl.FLOAT, false, 0, 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, fboA.tex);
      gl.uniform1i(gl.getUniformLocation(renderProgram, 'u_water'), 0);
      
      gl.uniform2f(gl.getUniformLocation(renderProgram, 'u_delta'), 1.0 / simW, 1.0 / simH);
      gl.uniform1f(gl.getUniformLocation(renderProgram, 'u_aspect'), window.innerWidth / window.innerHeight);
      gl.uniform2f(gl.getUniformLocation(renderProgram, 'u_resolution'), w, h);
      gl.uniform3fv(gl.getUniformLocation(renderProgram, 'u_themeColor'), new Float32Array(themeColorRef.current));
      gl.uniform1f(gl.getUniformLocation(renderProgram, 'u_luminosity'), luminosityRef.current);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // Swap FBOs
      const temp = fboA;
      fboA = fboB;
      fboB = temp;

      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      gl.deleteBuffer(quadBuffer);
      gl.deleteTexture(fboA.tex);
      gl.deleteTexture(fboB.tex);
      gl.deleteFramebuffer(fboA.fbo);
      gl.deleteFramebuffer(fboB.fbo);
      gl.deleteProgram(updateProgram);
      gl.deleteProgram(renderProgram);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.9,
      }}
    />
  );
}
