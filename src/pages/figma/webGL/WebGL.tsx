import React, { useEffect, useRef } from "react";
const vertexShaderSource = `#version 300 es
#pragma vscode_glsllint_stage: vert

void main()
{
    gl_PointSize = 150.0;
    gl_Position = vec4(0.0, 0.0, 0.0, 2.0);
}`;

const fragmentShaderSource = `#version 300 es
#pragma vscode_glsllint_stage: frag

precision mediump float;

out vec4 fragColor;

void main()
{
    fragColor = vec4(1.0, 1.0, 0.0, 1.0);
}`;

const WebGL = () => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<any | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.width = window.innerWidth;
    ref.current.height = window.innerHeight;

    const gl: WebGL2RenderingContext | null = ref.current.getContext("webgl2");
    if (!gl) {
      return;
    }

    glRef.current = gl;
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    const program: any = gl.createProgram();

    const vertexShader: any = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
    gl.attachShader(program, vertexShader);

    const fragmentShader: any = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.log(gl.getShaderInfoLog(vertexShader));
      console.log(gl.getShaderInfoLog(fragmentShader));
    }

    gl.useProgram(program);

    gl.drawArrays(gl.POINTS, 0, 1);
  }, []);

  return <canvas ref={ref}></canvas>;
};

export default WebGL;
