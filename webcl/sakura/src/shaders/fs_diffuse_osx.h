#version 150 core
in vec3 Color;
in vec3 Normal;
uniform mat4 modelMatrix;
uniform vec3 worldLightPos;
out vec4 fragCol;

void main()
{
    vec3 worldNormal = (modelMatrix * vec4(Normal, 0.0)).xyz;
    
    //multiply the dot product to get more intense white when fully lit
    vec3 diff = max( 0.0, dot(normalize(worldNormal), -normalize(worldLightPos) ) *1.2) * Color;
    
    fragCol = vec4(diff + Color*0.25, 1.0);
}