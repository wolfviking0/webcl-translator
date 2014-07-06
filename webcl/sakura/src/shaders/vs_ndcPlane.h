#version 150 core
in vec3 position;
in vec2 texcoord;
out vec3 pos;
out vec2 uv;
uniform vec2 screenSize;

void main()
{
    gl_Position = vec4(position,1.0);
    pos = position;
    uv = texcoord;
}