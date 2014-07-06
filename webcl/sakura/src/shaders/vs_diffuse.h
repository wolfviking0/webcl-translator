#version 150 core
uniform mat4 MVP;
uniform mat4 modelMatrix;
in vec3 position;
in vec3 normal;
uniform vec3 worldLightPos;

out vec3 Color;
out vec3 Normal;

void main()
{
    Normal = normal;
    Color = vec3(1.0,0.75,0.75);
    gl_Position = MVP * vec4(position, 1.0);
}