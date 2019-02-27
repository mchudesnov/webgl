export default "@export clay.deferred.chunk.light_head\nuniform sampler2D gBufferTexture1;\nuniform sampler2D gBufferTexture2;\nuniform sampler2D gBufferTexture3;\nuniform vec2 windowSize: WINDOW_SIZE;\nuniform vec4 viewport: VIEWPORT;\nuniform mat4 viewProjectionInv;\n#ifdef DEPTH_ENCODED\n@import clay.util.decode_float\n#endif\n@end\n@export clay.deferred.chunk.gbuffer_read\n vec2 uv = gl_FragCoord.xy / windowSize;\n vec2 uv2 = (gl_FragCoord.xy - viewport.xy) / viewport.zw;\n vec4 texel1 = texture2D(gBufferTexture1, uv);\n vec4 texel3 = texture2D(gBufferTexture3, uv);\n if (dot(texel1.rgb, vec3(1.0)) == 0.0) {\n discard;\n }\n float glossiness = texel1.a;\n float metalness = texel3.a;\n vec3 N = texel1.rgb * 2.0 - 1.0;\n float z = texture2D(gBufferTexture2, uv).r * 2.0 - 1.0;\n vec2 xy = uv2 * 2.0 - 1.0;\n vec4 projectedPos = vec4(xy, z, 1.0);\n vec4 p4 = viewProjectionInv * projectedPos;\n vec3 position = p4.xyz / p4.w;\n vec3 albedo = texel3.rgb;\n vec3 diffuseColor = albedo * (1.0 - metalness);\n vec3 specularColor = mix(vec3(0.04), albedo, metalness);\n@end\n@export clay.deferred.chunk.light_equation\nfloat D_Phong(in float g, in float ndh) {\n float a = pow(8192.0, g);\n return (a + 2.0) / 8.0 * pow(ndh, a);\n}\nfloat D_GGX(in float g, in float ndh) {\n float r = 1.0 - g;\n float a = r * r;\n float tmp = ndh * ndh * (a - 1.0) + 1.0;\n return a / (3.1415926 * tmp * tmp);\n}\nvec3 F_Schlick(in float ndv, vec3 spec) {\n return spec + (1.0 - spec) * pow(1.0 - ndv, 5.0);\n}\nvec3 lightEquation(\n in vec3 lightColor, in vec3 diffuseColor, in vec3 specularColor,\n in float ndl, in float ndh, in float ndv, in float g\n)\n{\n return ndl * lightColor\n * (diffuseColor + D_Phong(g, ndh) * F_Schlick(ndv, specularColor));\n}\n@end";