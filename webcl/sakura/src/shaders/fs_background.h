#version 150 core
in vec3 pos;
in vec2 uv;
out vec4 fragCol;
uniform vec2 screenSize;

void main()
{
    vec2 coord = -1.0 + 2.0 * pos.xy / (screenSize.y/float(screenSize.x));
    float d = max(0.1,min(1.0,1.0/(length(vec2(1.2,1.2)-coord) / 1.1)));
    fragCol = vec4(d*1.2, d,d*1.2,1.0);
}