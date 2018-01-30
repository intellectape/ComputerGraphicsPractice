/* GLOBAL CONSTANTS AND VARIABLES */

/* assignment specific globals */
const WIN_Z = 0; // default graphics window z coord in world space
const WIN_LEFT = 0;
const WIN_RIGHT = 1; // default left and right x coords in world space
const WIN_BOTTOM = 0;
const WIN_TOP = 1; // default top and bottom y coords in world space
const INPUT_TRIANGLES_URL = "https://ncsucgclass.github.io/prog2/triangles.json"; // triangles file loc
const INPUT_SPHERES_URL = "https://ncsucgclass.github.io/prog2/ellipsoids.json"; // ellipsoids file loc
var INPUT_LIGHTS_URL = "https://ncsucgclass.github.io/prog2/lights.json";
var eye = new vec3.fromValues(0.5, 0.5, -0.5); // default eye position in world space
var viewUp = new vec3.fromValues(0, 1, 0);
var center = new vec3.fromValues(0.5, 0.5, 1);
var lightLoc = [2, 4, -0.5];
var lightColor = [1, 1, 1];

var inputTriangles;
var triangleFirstTime = false;
var inputEllipsoids;
var ellipsoidFirstTime = false;
var additionalLight = [];

/* webgl globals */
var gl = null; // the all powerful gl object. It's all here folks!
var triangleVertexBuffer = []; // this contains vertex coordinates in triples
var triangleNormalBuffer = [];
var triangleBuffer = []; // this contains indices into triangleVertexBuffer in triples
var triangleAmbientColorBuffer = [];
var triangleDiffuseColorBuffer = [];
var triangleSpecularColorBuffer = [];
var triBufferSize = 0; // the number of indices in the triangle buffer
var vertexPositionAttrib; // where to put position for vertex shader
var vertexNormalAttrib;
var vertexAmbientColorAttrib;
var vertexDiffuseColorAttrib;
var vertexSpecularColorAttrib;
var noTransformation = false;
var ellipsoidVertexBuffers = [];
var ellipsoidNormalBuffers = [];
var ellipsoidBuffer = [];
var ellipsoidAmbientColorBuffer = [];
var ellipsoidDiffuseColorBuffer = [];
var ellipsoidSpecularColorBuffer = [];
var centerEllipsoid = [];

var shaderProgram;
var modelViewMatrix = mat4.create(); //ModelView Transformation Matrix
var projectionMatrix = mat4.create(); //Projection Matrix

var transformEllipsoid = [];
var modelEllipsoid = [];
var transformTriangle = [];
var centroidTriangle = [];
var modelTriangle = [];
var lightSourceArray = [];
var lightArray = [];
var canvasUpdate = false;
var width = 512;
var height = 512;

var ambientWeight = 0;
var diffuseWeight = 0;
var specularWeight = 0;
var nWeight = 0;
var ambientTrue = false;
var diffuseTrue = false;
var specularTrue = false;
var nTrue = false;

var updateModel = 1;

var projectionMatrixUniform;
var modelViewMatrixUniform;
var normalMatrixUniform;
var lightModelUniform;
var lightSourceUniform;
var lightLocationUniform;
var lightColorUniform;

var selectedEllipsoid = 0;
var selectedTriangle = 0;
var ellipsoidTrue = false;
var triangleTrue = false;
var up = false;
var down = false;

// ASSIGNMENT HELPER FUNCTIONS
function matrixDefaults(figureModelMatrix) {
    //setting up uniforms for th shader program
    gl.uniformMatrix4fv(projectionMatrixUniform, false, projectionMatrix);
    gl.uniformMatrix4fv(modelViewMatrixUniform, false, figureModelMatrix);

    gl.uniform3f(lightLocationUniform, lightLoc[0], lightLoc[1], lightLoc[2]);
    gl.uniform3f(lightColorUniform, lightColor[0], lightColor[1], lightColor[2]);

    var normalMatrix = mat3.create();
    mat3.fromMat4(normalMatrix, modelViewMatrix);
    mat3.invert(normalMatrix, normalMatrix);
    mat3.transpose(normalMatrix, normalMatrix);
    gl.uniformMatrix3fv(normalMatrixUniform, false, normalMatrix);
}

// get the JSON file from the passed URL
function getJSONFile(url, descr) {
    try {
        if ((typeof(url) !== "string") || (typeof(descr) !== "string"))
            throw "getJSONFile: parameter not a string";
        else {
            var httpReq = new XMLHttpRequest(); // a new http request
            httpReq.open("GET", url, false); // init the request
            httpReq.send(null); // send the request
            var startTime = Date.now();
            while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
                if ((Date.now() - startTime) > 3000)
                    break;
            } // until its loaded or we time out after three seconds
            if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE))
                throw "Unable to open " + descr + " file!";
            else
                return JSON.parse(httpReq.response);
        } // end if good params
    } // end try    
    catch (e) {
        console.log(e);
        return (String.null);
    }
} // end get input spheres

// set up the webGL environment
function setupWebGL() {

    // Get the canvas and context
    var canvas = document.getElementById("myWebGLCanvas"); // create a js canvas
    if (canvasUpdate) {
        canvas.width = width;
        canvas.height = height;
    }
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl"); // get a webgl object from it

    try {
        if (gl == null) {
            throw "unable to create gl context -- is your browser gl ready?";
        } else {
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
            gl.clearColor(0.0, 0.0, 0.0, 1.0); // use black when we clear the frame buffer
            gl.clearDepth(1.0); // use max when we clear the depth buffer
            gl.enable(gl.DEPTH_TEST); // use hidden surface removal (with zbuffering)
        }
    } // end try
    catch (e) {
        console.log(e);
    } // end catch

} // end setupWebGL

// setup the webGL shaders
function setupShaders() {

    // define fragment shader in essl using es6 template strings
    var fShaderCode = `
            precision mediump float;
    
            varying vec3 vTransformedNormal;
            varying vec4 vPosition;

            struct light_Sources {
                vec3 _position;
                vec3 _ambient;
                vec3 _diffuse;
                vec3 _specular;
            };
            uniform light_Sources lightArray[lightArrayLength];

            uniform vec3 lightPos;
            uniform vec3 lightColor;
            uniform int selectLightSource;
            uniform int lighting;  // to enable and disable lighting
            
    
            varying vec4 _diffuseColorVector;
            varying vec4 _ambientColorVector;
            varying vec4 _specularColorVector;
    
            void main(void) {
                if (selectLightSource != 1) {
                    vec3 vertPos = vec3(vPosition) / vPosition.a;
                    vec3 normal = normalize(vTransformedNormal);
                    vec3 normalizedLight = normalize(lightPos - vPosition.xyz);
        
                    float lambertian = max(dot(normal, normalizedLight), 0.0);
                    float specular = 0.0;
        
                    if (lambertian > 0.0) {
                        vec3 viewDir = normalize(-vertPos);
                        
                        if (lighting != 1){
                            // this is blinn phong
                            vec3 halfDir = normalize(normalizedLight - vertPos);
                            float specAngle = max(dot(halfDir, normal), 0.0);
                            specular = pow(specAngle, _specularColorVector.a);
                        }
                        else {
                            vec3 reflectDir = reflect(-normalizedLight, normal);
                            float specAngle = max(dot(reflectDir, viewDir), 0.0);
                            // note that the exponent is different here
                            specular = pow(specAngle, _specularColorVector.a);
                        }
                    }
                    gl_FragColor = vec4(_diffuseColorVector.rgb * lightColor * lambertian , _diffuseColorVector.a) +
                                    vec4(_ambientColorVector.rgb * lightColor, _ambientColorVector.a) +
                                    vec4(_specularColorVector.rgb * lightColor * specular, _specularColorVector.a);
                
                }
                else {
                    for (int i = 0; i < lightArrayLength; i++) {
                        vec3 vertPos = vec3(vPosition) / vPosition.a;
                        vec3 normal = normalize(vTransformedNormal);
                        vec3 normalizedLight = normalize(lightArray[i]._position - vPosition.xyz);
            
                        float lambertian = max(dot(normal, normalizedLight), 0.0);
                        float specular = 0.0;
            
                        if (lambertian > 0.0) {
                            vec3 viewDir = normalize(-vertPos);
                            
                            if (lighting != 1){
                                // this is blinn phong
                                vec3 halfDir = normalize(normalizedLight - vertPos);
                                float specAngle = max(dot(halfDir, normal), 0.0);
                                specular = pow(specAngle, _specularColorVector.a);
                            }
                            else {
                                vec3 reflectDir = reflect(-normalizedLight, normal);
                                float specAngle = max(dot(reflectDir, viewDir), 0.0);
                                // note that the exponent is different here
                                specular = pow(specAngle, _specularColorVector.a);
                            }
                        }
                        gl_FragColor = vec4(_diffuseColorVector.rgb * lightArray[i]._diffuse * lambertian , _diffuseColorVector.a) +
                                        vec4(_ambientColorVector.rgb * lightArray[i]._ambient, _ambientColorVector.a) +
                                        vec4(_specularColorVector.rgb * lightArray[i]._specular * specular, _specularColorVector.a);
                    
                    }
                }
            }
        `;
    fShaderCode = "#define lightArrayLength " + lightArray.length + "\n" + fShaderCode;
    // define vertex shader in essl using es6 template strings
    var vShaderCode = `
            attribute vec3 vertexPosition;
            attribute vec3 vertexNormal;
            attribute vec4 vertexAmbientColor;
            attribute vec4 vertexDiffuseColor;
            attribute vec4 vertexSpecularColor;
    
            uniform mat4 modelMatrix;
            uniform mat4 projectionMatrix;
            uniform mat3 normalMatrix;
    
            varying vec4 _diffuseColorVector;
            varying vec4 _ambientColorVector;
            varying vec4 _specularColorVector;
    
            varying vec3 vTransformedNormal;
            varying vec4 vPosition;
            
    
            void main(void) {
                vPosition = modelMatrix * vec4(vertexPosition, 1.0);
                gl_Position = projectionMatrix * vPosition;
                vTransformedNormal = normalMatrix * vertexNormal;
    
                _diffuseColorVector = vertexDiffuseColor;
                _ambientColorVector = vertexAmbientColor;
                _specularColorVector = vertexSpecularColor;
            }
        `;

    try {

        var fShader = gl.createShader(gl.FRAGMENT_SHADER); // create frag shader
        gl.shaderSource(fShader, fShaderCode); // attach code to shader
        gl.compileShader(fShader); // compile the code for gpu execution

        // console.log("vertex shader: "+vShaderCode);
        var vShader = gl.createShader(gl.VERTEX_SHADER); // create vertex shader
        gl.shaderSource(vShader, vShaderCode); // attach code to shader
        gl.compileShader(vShader); // compile the code for gpu execution

        if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) { // bad frag shader compile
            throw "error during fragment shader compile: " + gl.getShaderInfoLog(fShader);
            gl.deleteShader(fShader);
        } else if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) { // bad vertex shader compile
            throw "error during vertex shader compile: " + gl.getShaderInfoLog(vShader);
            gl.deleteShader(vShader);
        } else { // no compile errors
            shaderProgram = gl.createProgram(); // create the single shader program
            gl.attachShader(shaderProgram, fShader); // put frag shader in program
            gl.attachShader(shaderProgram, vShader); // put vertex shader in program
            gl.linkProgram(shaderProgram); // link program into gl context

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { // bad program link
                throw "error during shader program linking: " + gl.getProgramInfoLog(shaderProgram);
            } else { // no shader program link errors
                gl.useProgram(shaderProgram); // activate shader program (frag and vert)
                // get pointer to vertex shader input
                vertexPositionAttrib = gl.getAttribLocation(shaderProgram, "vertexPosition");
                gl.enableVertexAttribArray(vertexPositionAttrib); // input to shader from array

                vertexNormalAttrib = gl.getAttribLocation(shaderProgram, "vertexNormal");
                gl.enableVertexAttribArray(vertexNormalAttrib);

                // get pointer to fragment shader input
                vertexAmbientColorAttrib = gl.getAttribLocation(shaderProgram, "vertexAmbientColor");
                gl.enableVertexAttribArray(vertexAmbientColorAttrib); // input to sahder from array
                vertexDiffuseColorAttrib = gl.getAttribLocation(shaderProgram, "vertexDiffuseColor");
                gl.enableVertexAttribArray(vertexDiffuseColorAttrib); // input to sahder from array
                vertexSpecularColorAttrib = gl.getAttribLocation(shaderProgram, "vertexSpecularColor");
                gl.enableVertexAttribArray(vertexSpecularColorAttrib); // input to sahder from array

                projectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
                modelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelMatrix");
                normalMatrixUniform = gl.getUniformLocation(shaderProgram, "normalMatrix");

                lightModelUniform = gl.getUniformLocation(shaderProgram, "lighting");
                lightSourceUniform = gl.getUniformLocation(shaderProgram, "selectLightSource");
                lightLocationUniform = gl.getUniformLocation(shaderProgram, "lightPos");
                lightColorUniform = gl.getUniformLocation(shaderProgram, "lightColor");

                // Randomly given light sources:
                for (var i = 0; i < lightArray.length; i++) {
                    lightSourceArray[i] = {
                        _position: gl.getUniformLocation(shaderProgram, "lightArray[" + i + "]._position"),
                        _ambient: gl.getUniformLocation(shaderProgram, "lightArray[" + i + "]._ambient"),
                        _diffuse: gl.getUniformLocation(shaderProgram, "lightArray[" + i + "]._diffuse"),
                        _specular: gl.getUniformLocation(shaderProgram, "lightArray[" + i + "]._specular")
                    };
                }


            } // end if no shader program link errors
        } // end if no compile errors
    } // end try 
    catch (e) {
        console.log(e);
    } // end catch
} // end setup shaders

function checkFirstTime(trueValue, figureType) {
    if (figureType == 'triangles' && !trueValue) {
        inputTriangles = getJSONFile(INPUT_TRIANGLES_URL, "triangles");
        for (var index = 0; index < inputTriangles.length; index++) {
            transformTriangle[index] = mat4.create();
            modelTriangle[index] = mat4.create();
        }

    }
    if (figureType == 'ellipsoids' && !trueValue) {
        inputEllipsoids = getJSONFile(INPUT_SPHERES_URL, "spheres");
        for (var index = 0; index < inputEllipsoids.length; index++) {
            transformEllipsoid[index] = mat4.create();
            modelEllipsoid[index] = mat4.create();
        }
    }
}

// Loading lights from sources
function loadLight() {
    lightArray = getJSONFile(INPUT_LIGHTS_URL, "lights");
}

// Setting light uniforms
function setLights(shaderUniform, lightArr) {
    gl.uniform3f(shaderUniform._position, lightArr.x, lightArr.y, lightArr.z);
    gl.uniform3fv(shaderUniform._ambient, lightArr.ambient);
    gl.uniform3fv(shaderUniform._diffuse, lightArr.diffuse);
    gl.uniform3fv(shaderUniform._specular, lightArr.specular);
}

// Connecting light sources to the array
function connectLight() {
    for (var i = 0; i < lightArray.length; i++) {
        setLights(lightSourceArray[i], lightArray[i]);
    }
}

// read triangles in, load them into webgl buffers
function loadTriangles(selectedIndex) {
    // Checking if the Triangle have been uploaded before or not
    checkFirstTime(triangleFirstTime, 'triangles');

    if (inputTriangles != String.null) {
        triangleFirstTime = true;
        for (var whichSet = 0; whichSet < inputTriangles.length; whichSet++) {
            var whichSetVert; // index of vertex in current triangle set
            var whichSetTri; // index of triangle in current triangle set
            var coordArray = []; // 1D array of vertex coords for WebGL
            var indexArray = []; // 1D array of vertex indices for WebGL
            var normalsArray = []; // 1D array of normala for WebGL
            var vtxToAdd = []; // vtx coords to add to the coord array
            var normals = [];
            var triToAdd = [];
            var ambientColorArray = [],
                diffuseColorArray = [],
                specularColorArray = [];
            var ambient, diffuse, specular;
            ambient = [inputTriangles[whichSet].material.ambient[0], inputTriangles[whichSet].material.ambient[1], inputTriangles[whichSet].material.ambient[2]];
            diffuse = [inputTriangles[whichSet].material.diffuse[0], inputTriangles[whichSet].material.diffuse[1], inputTriangles[whichSet].material.diffuse[2]];
            specular = [inputTriangles[whichSet].material.specular[0], inputTriangles[whichSet].material.specular[1], inputTriangles[whichSet].material.specular[2], inputTriangles[whichSet].material.n];

            if (whichSet == selectedIndex) {
                if (ambientTrue) {
                    ambient[0] += ambientWeight;
                    ambient[1] += ambientWeight;
                    ambient[2] += ambientWeight;
                } else if (diffuseTrue) {
                    diffuse[0] += diffuseWeight;
                    diffuse[1] += diffuseWeight;
                    diffuse[2] += diffuseWeight;
                } else if (specularTrue) {
                    specular[0] += specularWeight;
                    specular[1] += specularWeight;
                    specular[2] += specularWeight;
                } else if (nTrue) {
                    specular[3] += nWeight;
                }
            }
            centroidTriangle[whichSet] = [0, 0, 0];
            // set up the vertex coord array
            for (whichSetVert = 0; whichSetVert < inputTriangles[whichSet].vertices.length; whichSetVert++) {
                vtxToAdd = inputTriangles[whichSet].vertices[whichSetVert];
                normals = inputTriangles[whichSet].normals[whichSetVert];
                coordArray.push(vtxToAdd[0], vtxToAdd[1], vtxToAdd[2]);
                normalsArray.push(normals[0], normals[1], normals[2]);
                centroidTriangle[whichSet][0] += vtxToAdd[0];
                centroidTriangle[whichSet][1] += vtxToAdd[1];
                centroidTriangle[whichSet][2] += vtxToAdd[2];
                ambientColorArray.push(ambient[0], ambient[1], ambient[2], 1.0);
                diffuseColorArray.push(diffuse[0], diffuse[1], diffuse[2], 1.0);
                specularColorArray.push(specular[0], specular[1], specular[2], specular[3]);

            } // end for vertices in set
            centroidTriangle[whichSet][0] /= inputTriangles[whichSet].vertices.length;
            centroidTriangle[whichSet][1] /= inputTriangles[whichSet].vertices.length;
            centroidTriangle[whichSet][2] /= inputTriangles[whichSet].vertices.length;

            // set up the triangle index array, adjusting indices across sets
            for (whichSetTri = 0; whichSetTri < inputTriangles[whichSet].triangles.length; whichSetTri++) {
                triToAdd = inputTriangles[whichSet].triangles[whichSetTri];
                indexArray.push(triToAdd[0], triToAdd[1], triToAdd[2]);
            } // end for triangles in set

            // send the vertex coords to webGL
            triangleVertexBuffer[whichSet] = gl.createBuffer(); // init empty vertex coord buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBuffer[whichSet]); // activate that buffer
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coordArray), gl.STATIC_DRAW); // coords to that buffer
            triangleVertexBuffer[whichSet].itemSize = 3;
            triangleVertexBuffer[whichSet].numItems = coordArray.length / 3;

            // send the normal data to webGL
            triangleNormalBuffer[whichSet] = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer[whichSet]);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalsArray), gl.STATIC_DRAW); // coords to that buffer
            triangleNormalBuffer[whichSet].itemSize = 3;
            triangleNormalBuffer[whichSet].numItems = normalsArray.length / 3;

            // send the triangle indices to webGL
            triangleBuffer[whichSet] = gl.createBuffer(); // init empty triangle index buffer
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer[whichSet]); // activate that buffer
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexArray), gl.STATIC_DRAW); // indices to that buffer
            triangleBuffer[whichSet].itemSize = 1;
            triangleBuffer[whichSet].numItems = indexArray.length;

            triangleAmbientColorBuffer[whichSet] = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, triangleAmbientColorBuffer[whichSet]);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ambientColorArray), gl.STATIC_DRAW);
            triangleAmbientColorBuffer[whichSet].itemSize = 4;
            triangleAmbientColorBuffer[whichSet].numItems = ambientColorArray.length / 4;

            triangleDiffuseColorBuffer[whichSet] = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, triangleDiffuseColorBuffer[whichSet]);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(diffuseColorArray), gl.STATIC_DRAW);
            triangleDiffuseColorBuffer[whichSet].itemSize = 4;
            triangleDiffuseColorBuffer[whichSet].numItems = diffuseColorArray.length / 4;

            triangleSpecularColorBuffer[whichSet] = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, triangleSpecularColorBuffer[whichSet]);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(specularColorArray), gl.STATIC_DRAW);
            triangleSpecularColorBuffer[whichSet].itemSize = 4;
            triangleSpecularColorBuffer[whichSet].numItems = specularColorArray.length / 4;
        } // end for each triangle set 

    } // end if triangles found
} // end load triangles

function loadEllipsoids(selectedIndex) {
    // Checking if the Ellipsoid have been uploaded before or not
    checkFirstTime(ellipsoidFirstTime, 'ellipsoids');

    if (inputEllipsoids != String.null) {
        ellipsoidFirstTime = true;
        for (var index = 0; index < inputEllipsoids.length; index++) {
            var vertexPosition = [];
            var indexValues = [];
            var normalsArray = [];

            var ambientColorArray = [],
                diffuseColorArray = [],
                specularColorArray = [];
            var ambient, diffuse, specular;

            var latitudeBands = 20;
            var longitudeBands = 20;

            var radius = [inputEllipsoids[index].a, inputEllipsoids[index].b, inputEllipsoids[index].c];
            var centerEl = [inputEllipsoids[index].x, inputEllipsoids[index].y, inputEllipsoids[index].z];
            centerEllipsoid[index] = centerEl;

            ambient = [inputEllipsoids[index].ambient[0], inputEllipsoids[index].ambient[1], inputEllipsoids[index].ambient[2]];
            diffuse = [inputEllipsoids[index].diffuse[0], inputEllipsoids[index].diffuse[1], inputEllipsoids[index].diffuse[2]];
            specular = [inputEllipsoids[index].specular[0], inputEllipsoids[index].specular[1], inputEllipsoids[index].specular[2], inputEllipsoids[index].n];
            if (index === selectedIndex) {
                radius[0] *= 1.2;
                radius[1] *= 1.2;
                radius[2] *= 1.2;
                if (ambientTrue) {
                    ambient[0] += ambientWeight;
                    ambient[1] += ambientWeight;
                    ambient[2] += ambientWeight;
                }
                if (diffuseTrue) {
                    diffuse[0] += diffuseWeight;
                    diffuse[1] += diffuseWeight;
                    diffuse[2] += diffuseWeight;
                    console.log(diffuse);
                }
                if (specularTrue) {
                    specular[0] += specularWeight;
                    specular[1] += specularWeight;
                    specular[2] += specularWeight;
                    console.log(specular);
                }
                if (nTrue) {
                    specular[3] += nWeight;
                    console.log(specular[3]);
                }
            }

            for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
                var theta = latNumber * Math.PI / latitudeBands;
                var sinTheta = Math.sin(theta);
                var cosTheta = Math.cos(theta);

                for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
                    var phi = longNumber * 2 * Math.PI / longitudeBands;
                    var sinPhi = Math.sin(phi);
                    var cosPhi = Math.cos(phi);

                    var x = cosPhi * sinTheta;
                    var y = cosTheta;
                    var z = sinPhi * sinTheta;

                    normalsArray.push(x, y, z);
                    vertexPosition.push((radius[0] * x) + centerEl[0], (radius[1] * y) + centerEl[1], (radius[2] * z) + centerEl[2]);

                    ambientColorArray.push(ambient[0], ambient[1], ambient[2], 1.0);
                    diffuseColorArray.push(diffuse[0], diffuse[1], diffuse[2], 1.0);
                    specularColorArray.push(specular[0], specular[1], specular[2], specular[3]);
                }
            }

            for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
                for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
                    var first = (latNumber * (longitudeBands + 1)) + longNumber;
                    var second = first + longitudeBands + 1;
                    indexValues.push(first, second, first + 1);
                    indexValues.push(second, second + 1, first + 1);
                }
            }

            // send the vertex coords to webGL
            ellipsoidVertexBuffers[index] = gl.createBuffer(); // init empty vertex coord buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, ellipsoidVertexBuffers[index]); // activate that buffer
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPosition), gl.STATIC_DRAW); // coords to that buffer
            ellipsoidVertexBuffers[index].itemSize = 3;
            ellipsoidVertexBuffers[index].numItems = vertexPosition.length / 3;

            ellipsoidNormalBuffers[index] = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, ellipsoidNormalBuffers[index]);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalsArray), gl.STATIC_DRAW);
            ellipsoidNormalBuffers[index].itemSize = 3;
            ellipsoidNormalBuffers[index].numItems = normalsArray.length / 3;

            // send the triangle indices to webGL
            ellipsoidBuffer[index] = gl.createBuffer(); // init empty triangle index buffer
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ellipsoidBuffer[index]); // activate that buffer
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexValues), gl.STATIC_DRAW); // indices to that buffer
            ellipsoidBuffer[index].itemSize = 1;
            ellipsoidBuffer[index].numItems = indexValues.length;

            ellipsoidAmbientColorBuffer[index] = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, ellipsoidAmbientColorBuffer[index]);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ambientColorArray), gl.STATIC_DRAW);
            ellipsoidAmbientColorBuffer[index].itemSize = 4;
            ellipsoidAmbientColorBuffer[index].numItems = ambientColorArray.length / 4;

            ellipsoidDiffuseColorBuffer[index] = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, ellipsoidDiffuseColorBuffer[index]);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(diffuseColorArray), gl.STATIC_DRAW);
            ellipsoidDiffuseColorBuffer[index].itemSize = 4;
            ellipsoidDiffuseColorBuffer[index].numItems = diffuseColorArray.length / 4;

            ellipsoidSpecularColorBuffer[index] = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, ellipsoidSpecularColorBuffer[index]);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(specularColorArray), gl.STATIC_DRAW);
            ellipsoidSpecularColorBuffer[index].itemSize = 4;
            ellipsoidSpecularColorBuffer[index].numItems = specularColorArray.length / 4;
        }
    }
}

function loadFigures(selectedValue, figure, colortype) {
    if (figure == 'ellipsoid') {
        loadTriangles();
        if (colortype == 'ambient') {
            console.log(selectedValue + ' ' + figure + ' ' + colortype + ' ' + ambientWeight);
            loadEllipsoids(selectedValue);
        } else if (colortype == 'diffuse') {
            console.log(selectedValue + ' ' + figure + ' ' + colortype + ' ' + diffuseWeight);
            loadEllipsoids(selectedValue);
        } else if (colortype == 'specular') {
            console.log(selectedValue + ' ' + figure + ' ' + colortype + ' ' + specularWeight);
            loadEllipsoids(selectedValue);
        } else if (colortype == 'nweight') {
            console.log(selectedValue + ' ' + figure + ' ' + colortype + ' ' + nWeight);
            loadEllipsoids(selectedValue);
        } else {
            loadEllipsoids(selectedValue);
        }

    } else if (figure == 'triangle') {
        if (colortype == 'ambient') {
            loadTriangles(selectedValue);
        } else if (colortype == 'diffuse') {
            loadTriangles(selectedValue);
        } else if (colortype == 'specular') {
            loadTriangles(selectedValue);
        } else if (colortype == 'nweight') {
            loadTriangles(selectedValue);
        } else {
            loadTriangles(selectedValue);
        }
        loadEllipsoids();
    } else {
        loadTriangles();
        loadEllipsoids();
    }
}

// renderFigure the loaded model
function renderTriangles() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers

    mat4.perspective(projectionMatrix, Math.PI / 2, gl.viewportWidth / gl.viewportHeight, 0.5, 50.0);
    mat4.lookAt(modelViewMatrix, eye, center, viewUp);

    for (var i = 0; i < inputTriangles.length; i++) {
        // vertex buffer: activate and feed into vertex shader
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBuffer[i]); // activate
        gl.vertexAttribPointer(vertexPositionAttrib, triangleVertexBuffer[i].itemSize, gl.FLOAT, false, 0, 0); // feed

        //color buffer:
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleAmbientColorBuffer[i]);
        gl.vertexAttribPointer(vertexAmbientColorAttrib, triangleAmbientColorBuffer[i].itemSize, gl.FLOAT, false, 0, 0); // feed
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleDiffuseColorBuffer[i]);
        gl.vertexAttribPointer(vertexDiffuseColorAttrib, triangleDiffuseColorBuffer[i].itemSize, gl.FLOAT, false, 0, 0); // feed
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleSpecularColorBuffer[i]);
        gl.vertexAttribPointer(vertexSpecularColorAttrib, triangleSpecularColorBuffer[i].itemSize, gl.FLOAT, false, 0, 0); // feed

        //triangle normal buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer[i]); // activate
        gl.vertexAttribPointer(vertexNormalAttrib, triangleNormalBuffer[i].itemSize, gl.FLOAT, false, 0, 0); // feed

        // triangle buffer: activate and renderFigure
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer[i]); // activate
        mat4.multiply(modelTriangle[i], modelViewMatrix, transformTriangle[i]);
        matrixDefaults(modelTriangle[i]);
        gl.drawElements(gl.TRIANGLES, triangleBuffer[i].numItems, gl.UNSIGNED_SHORT, 0); // renderFigure
    }

} // end renderFigure triangles

function renderEllipsoids() {
    for (var i = 0; i < inputEllipsoids.length; i++) {
        // vertex buffer: activate and feed into vertex shader
        gl.bindBuffer(gl.ARRAY_BUFFER, ellipsoidVertexBuffers[i]); // activate
        gl.vertexAttribPointer(vertexPositionAttrib, ellipsoidVertexBuffers[i].itemSize, gl.FLOAT, false, 0, 0); // feed

        //color buffer for sphere
        gl.bindBuffer(gl.ARRAY_BUFFER, ellipsoidAmbientColorBuffer[i]);
        gl.vertexAttribPointer(vertexAmbientColorAttrib, ellipsoidAmbientColorBuffer[i].itemSize, gl.FLOAT, false, 0, 0); // feed
        gl.bindBuffer(gl.ARRAY_BUFFER, ellipsoidDiffuseColorBuffer[i]);
        gl.vertexAttribPointer(vertexDiffuseColorAttrib, ellipsoidDiffuseColorBuffer[i].itemSize, gl.FLOAT, false, 0, 0); // feed
        gl.bindBuffer(gl.ARRAY_BUFFER, ellipsoidSpecularColorBuffer[i]);
        gl.vertexAttribPointer(vertexSpecularColorAttrib, ellipsoidSpecularColorBuffer[i].itemSize, gl.FLOAT, false, 0, 0); // feed

        //normal buffer for sphere
        gl.bindBuffer(gl.ARRAY_BUFFER, ellipsoidNormalBuffers[i]); // activate
        gl.vertexAttribPointer(vertexNormalAttrib, ellipsoidNormalBuffers[i].itemSize, gl.FLOAT, false, 0, 0); // feed

        // triangle buffer: activate and renderFigure
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ellipsoidBuffer[i]); // activate
        mat4.multiply(modelEllipsoid[i], modelViewMatrix, transformEllipsoid[i]);
        matrixDefaults(modelEllipsoid[i]);
        gl.drawElements(gl.TRIANGLES, ellipsoidBuffer[i].numItems, gl.UNSIGNED_SHORT, 0); // renderFigure
    }
}

//Function to handle key inputs
function handleKeyDown(e) {

    if (e.key == "ArrowUp") {
        ellipsoidTrue = true;
        triangleTrue = false;
        ambientWeight = 0;
        diffuseWeight = 0;
        specularWeight = 0;
        if (selectedEllipsoid == inputEllipsoids.length) {
            selectedEllipsoid = 0;
        }
        selectedEllipsoid++;
        selectedEllipsoid %= inputEllipsoids.length;
        loadFigures(selectedEllipsoid, 'ellipsoid');
        renderFigure();
    }
    if (e.key == "ArrowDown") {
        ellipsoidTrue = true;
        triangleTrue = false;
        ambientWeight = 0;
        diffuseWeight = 0;
        specularWeight = 0;
        if (selectedEllipsoid == 0) {
            selectedEllipsoid = inputEllipsoids.length;
        }
        selectedEllipsoid--;
        selectedEllipsoid %= inputEllipsoids.length;
        loadFigures(selectedEllipsoid, 'ellipsoid');
        renderFigure();
    }
    if (e.key == "ArrowRight") { // Triangle Event
        triangleTrue = true;
        ellipsoidTrue = false;
        ambientWeight = 0;
        diffuseWeight = 0;
        specularWeight = 0;
        if (selectedTriangle == inputTriangles.length) {
            selectedTriangle = 0;
        }
        selectedTriangle++;
        selectedTriangle %= inputTriangles.length;
        for (whichSetVert = 0; whichSetVert < inputTriangles[selectedTriangle].vertices.length; whichSetVert++) {
            var translateVector = [centroidTriangle[selectedTriangle][0], centroidTriangle[selectedTriangle][1], centroidTriangle[selectedTriangle][2]];
            var negTranslateVector = [-centroidTriangle[selectedTriangle][0], -centroidTriangle[selectedTriangle][1], -centroidTriangle[selectedTriangle][2]];
            var scalingVector = [1.2, 1.2, 1.2];
            mat4.translate(transformTriangle[selectedTriangle], transformTriangle[selectedTriangle], translateVector);
            mat4.scale(transformTriangle[selectedTriangle], transformTriangle[selectedTriangle], scalingVector);
            mat4.translate(transformTriangle[selectedTriangle], transformTriangle[selectedTriangle], negTranslateVector);
        }
        for (var whichSet = 0; whichSet < inputTriangles.length; whichSet++) {
            if (whichSet != selectedTriangle) {
                transformTriangle[whichSet] = mat4.create();
            }
        }

        renderFigure();
    }
    if (e.key == "ArrowLeft") { // Triangle Event
        triangleTrue = true;
        ellipsoidTrue = false;
        ambientWeight = 0;
        diffuseWeight = 0;
        specularWeight = 0;
        if (selectedTriangle == 0) {
            selectedTriangle = inputTriangles.length;
        }
        selectedTriangle--;
        selectedTriangle %= inputTriangles.length;
        for (whichSetVert = 0; whichSetVert < inputTriangles[selectedTriangle].vertices.length; whichSetVert++) {
            var translateVector = [centroidTriangle[selectedTriangle][0], centroidTriangle[selectedTriangle][1], centroidTriangle[selectedTriangle][2]];
            var negTranslateVector = [-centroidTriangle[selectedTriangle][0], -centroidTriangle[selectedTriangle][1], -centroidTriangle[selectedTriangle][2]];
            var scalingVector = [1.2, 1.2, 1.2];
            mat4.translate(transformTriangle[selectedTriangle], transformTriangle[selectedTriangle], translateVector);
            mat4.scale(transformTriangle[selectedTriangle], transformTriangle[selectedTriangle], scalingVector);
            mat4.translate(transformTriangle[selectedTriangle], transformTriangle[selectedTriangle], negTranslateVector);
        }
        for (var whichSet = 0; whichSet < inputTriangles.length; whichSet++) {
            if (whichSet != selectedTriangle) {
                transformTriangle[whichSet] = mat4.create();
            }
        }
        renderFigure();
    }
    if (e.key == " ") {
        triangleTrue = false;
        ellipsoidTrue = false;
        ambientWeight = 0;
        diffuseWeight = 0;
        specularWeight = 0;
        selectedTriangle = -1;
        selectedEllipsoid = -1;
        for (var whichSet = 0; whichSet < inputTriangles.length; whichSet++) {
            if (whichSet != selectedTriangle) {
                transformTriangle[whichSet] = mat4.create();
            }
        }
        renderFigure();
    }

}

function handleKeyPress(e) {

    if (e.key == 'A') { // A key
        console.log("A Key");
        center[0] -= 0.01;
        renderFigure();
    }
    if (e.key == 'D') { // D key
        console.log("D Key");
        center[0] += 0.01;
        renderFigure();
    }
    if (e.key == 'a') { // translate left X
        console.log("a key");
        center[0] -= 0.01;
        eye[0] -= 0.01;
        renderFigure();
    }
    if (e.key == 'd') { // translate right X
        console.log("d key");
        center[0] += 0.01;
        eye[0] += 0.01;
        renderFigure();
    }
    if (e.key == 'q') { // translate up Y
        console.log("q key");
        center[1] -= 0.01;
        eye[1] -= 0.01;
        renderFigure();
    }
    if (e.key == 'e') { // translate down Y
        console.log("e key");
        center[1] += 0.01;
        eye[1] += 0.01;
        renderFigure();
    }
    if (e.key == 'w') { // translate forward Z
        console.log("w key");
        center[2] -= 0.01;
        eye[2] -= 0.01;
        renderFigure();
    }
    if (e.key == 's') { // translate backward Z
        console.log("s key");
        center[2] += 0.01;
        eye[2] += 0.01;
        renderFigure();
    }
    if (e.key == 'W') { // W Key
        console.log("W key");
        center[1] += 0.01;
        renderFigure();
    }
    if (e.key == 'S') { // S Key
        console.log("S key");
        center[1] -= 0.01;
        renderFigure();
    }
    if (e.key == 'b') { // Blinn Phong Model/Phong Model
        console.log("b key");
        if (updateModel == 1) {
            updateModel = 0;
            gl.uniform1i(lightModelUniform, updateModel);
        } else {
            updateModel = 1;
            gl.uniform1i(lightModelUniform, updateModel);
        }
        loadFigures();
        renderFigure();

    }
    if (e.key == 'n') { // N Value 
        diffuseWeight = 0;
        specularWeight = 0;
        ambientWeight = 0;
        nWeight += 1;
        nTrue = true;
        ambientTrue = false;
        diffuseTrue = false;
        specularTrue = false;
        if (nWeight > 20) {
            nWeight = 0;
        }
        if (ellipsoidTrue) {
            loadFigures(selectedEllipsoid, 'ellipsoid', 'nweight');
        } else if (triangleTrue) {
            loadFigures(selectedTriangle, 'triangle', 'nweight');
        }
        renderFigure();
    }
    if (e.key == '1') { // Ambient
        diffuseWeight = 0;
        specularWeight = 0;
        ambientWeight += 0.1;
        nTrue = false;
        ambientTrue = true;
        diffuseTrue = false;
        specularTrue = false;
        if (ambientWeight > 1) {
            ambientWeight = 0;
        }
        if (ellipsoidTrue) {
            loadFigures(selectedEllipsoid, 'ellipsoid', 'ambient');
        } else if (triangleTrue) {
            loadFigures(selectedTriangle, 'triangle', 'ambient');
        }
        renderFigure();
    }
    if (e.key == '2') { // Diffuse
        ambientWeight = 0;
        specularWeight = 0;
        diffuseWeight += 0.1;
        nTrue = false;
        ambientTrue = false;
        diffuseTrue = true;
        specularTrue = false;
        if (diffuseWeight > 1) {
            diffuseWeight = 0;
        }
        if (ellipsoidTrue) {
            loadFigures(selectedEllipsoid, 'ellipsoid', 'diffuse');
        } else if (triangleTrue) {
            loadFigures(selectedTriangle, 'triangle', 'diffuse');
        }
        renderFigure();
    }
    if (e.key == '3') { // Specular
        ambientWeight = 0;
        diffuseWeight = 0;
        specularWeight += 0.1;
        nTrue = false;
        ambientTrue = false;
        diffuseTrue = false;
        specularTrue = true;
        if (specularWeight > 1) {
            specularWeight = 0;
        }
        if (ellipsoidTrue) {
            loadFigures(selectedEllipsoid, 'ellipsoid', 'specular');
        } else if (triangleTrue) {
            loadFigures(selectedTriangle, 'triangle', 'specular');
        }
        renderFigure();
    }
    if (e.key == 'k') { // Translate left X
        console.log("k key");
        var translateVector = [0.01, 0, 0];
        if (triangleTrue) {
            mat4.translate(transformTriangle[selectedTriangle], transformTriangle[selectedTriangle], translateVector);
            noTransformation = true;
        } else if (ellipsoidTrue) {
            mat4.translate(transformEllipsoid[selectedEllipsoid], transformEllipsoid[selectedEllipsoid], translateVector);
        }

        renderFigure();
    }
    if (e.key == ';') { // Translate right X
        console.log("; key");
        var translateVector = [-0.01, 0, 0];
        if (triangleTrue) {
            mat4.translate(transformTriangle[selectedTriangle], transformTriangle[selectedTriangle], translateVector);
        } else if (ellipsoidTrue) {
            mat4.translate(transformEllipsoid[selectedEllipsoid], transformEllipsoid[selectedEllipsoid], translateVector);
        }
        renderFigure();
    }
    if (e.key == 'o') { // Translate forward Z
        console.log("o key");
        var translateVector = [0, 0, 0.01];
        if (triangleTrue) {
            mat4.translate(transformTriangle[selectedTriangle], transformTriangle[selectedTriangle], translateVector);
            noTransformation = true;
        } else if (ellipsoidTrue) {
            mat4.translate(transformEllipsoid[selectedEllipsoid], transformEllipsoid[selectedEllipsoid], translateVector);
        }
        renderFigure();
    }
    if (e.key == 'l') { // Translate backward Z
        console.log("l key");
        var translateVector = [0, 0, -0.01];
        if (triangleTrue) {
            mat4.translate(transformTriangle[selectedTriangle], transformTriangle[selectedTriangle], translateVector);
            noTransformation = true;
        } else if (ellipsoidTrue) {
            mat4.translate(transformEllipsoid[selectedEllipsoid], transformEllipsoid[selectedEllipsoid], translateVector);
        }
        renderFigure();
    }
    if (e.key == 'i') { // Translate up Y
        console.log("i key");
        var translateVector = [0, 0.01, 0];
        if (triangleTrue) {
            mat4.translate(transformTriangle[selectedTriangle], transformTriangle[selectedTriangle], translateVector);
            noTransformation = true;
        } else
        if (ellipsoidTrue) {
            mat4.translate(transformEllipsoid[selectedEllipsoid], transformEllipsoid[selectedEllipsoid], translateVector);
        }
        renderFigure();
    }
    if (e.key == 'p') { // Translate down Y
        console.log("p key");
        var translateVector = [0, -0.01, 0];
        if (triangleTrue) {
            mat4.translate(transformTriangle[selectedTriangle], transformTriangle[selectedTriangle], translateVector);
            noTransformation = true;
        } else if (ellipsoidTrue) {
            mat4.translate(transformEllipsoid[selectedEllipsoid], transformEllipsoid[selectedEllipsoid], translateVector);
        }
        renderFigure();
    }
    if (e.key == 'K') { // K Key
        console.log("K key");
        var rotateDegree = Math.PI / 180;
        if (triangleTrue) {
            var translateVector = [centroidTriangle[selectedTriangle][0], centroidTriangle[selectedTriangle][1], centroidTriangle[selectedTriangle][2]];
            var negTranslateVector = [-centroidTriangle[selectedTriangle][0], -centroidTriangle[selectedTriangle][1], -centroidTriangle[selectedTriangle][2]];
            mat4.translate(transformTriangle[selectedTriangle], transformTriangle[selectedTriangle], translateVector);
            mat4.rotateY(transformTriangle[selectedTriangle], transformTriangle[selectedTriangle], rotateDegree);
            mat4.translate(transformTriangle[selectedTriangle], transformTriangle[selectedTriangle], negTranslateVector);

            noTransformation = true;
        } else if (ellipsoidTrue) {
            var translateVector = [centerEllipsoid[selectedEllipsoid][0], centerEllipsoid[selectedEllipsoid][1], centerEllipsoid[selectedEllipsoid][2]];
            var negTranslateVector = [-centerEllipsoid[selectedEllipsoid][0], -centerEllipsoid[selectedEllipsoid][1], -centerEllipsoid[selectedEllipsoid][2]];
            mat4.translate(transformEllipsoid[selectedEllipsoid], transformEllipsoid[selectedEllipsoid], translateVector);
            mat4.rotateY(transformEllipsoid[selectedEllipsoid], transformEllipsoid[selectedEllipsoid], rotateDegree);
            mat4.translate(transformEllipsoid[selectedEllipsoid], transformEllipsoid[selectedEllipsoid], negTranslateVector);
        }
        renderFigure();
    }
    if (e.key == ':') { // : Key
        console.log(": key");
        var rotateDegree = -Math.PI / 180;
        if (triangleTrue) {

            var translateVector = [centroidTriangle[selectedTriangle][0], centroidTriangle[selectedTriangle][1], centroidTriangle[selectedTriangle][2]];
            var negTranslateVector = [-centroidTriangle[selectedTriangle][0], -centroidTriangle[selectedTriangle][1], -centroidTriangle[selectedTriangle][2]];
            mat4.translate(transformTriangle[selectedTriangle], transformTriangle[selectedTriangle], translateVector);
            mat4.rotateY(transformTriangle[selectedTriangle], transformTriangle[selectedTriangle], rotateDegree);
            mat4.translate(transformTriangle[selectedTriangle], transformTriangle[selectedTriangle], negTranslateVector);

            noTransformation = true;
        } else if (ellipsoidTrue) {
            var translateVector = [centerEllipsoid[selectedEllipsoid][0], centerEllipsoid[selectedEllipsoid][1], centerEllipsoid[selectedEllipsoid][2]];
            var negTranslateVector = [-centerEllipsoid[selectedEllipsoid][0], -centerEllipsoid[selectedEllipsoid][1], -centerEllipsoid[selectedEllipsoid][2]];
            mat4.translate(transformEllipsoid[selectedEllipsoid], transformEllipsoid[selectedEllipsoid], translateVector);
            mat4.rotateY(transformEllipsoid[selectedEllipsoid], transformEllipsoid[selectedEllipsoid], rotateDegree);
            mat4.translate(transformEllipsoid[selectedEllipsoid], transformEllipsoid[selectedEllipsoid], negTranslateVector);

        }
        renderFigure();
    }
    if (e.key == 'O') { // O Key
        console.log("O key");
        var rotateDegree = Math.PI / 180;
        if (triangleTrue) {
            var translateVector = [centroidTriangle[selectedTriangle][0], centroidTriangle[selectedTriangle][1], centroidTriangle[selectedTriangle][2]];
            var negTranslateVector = [-centroidTriangle[selectedTriangle][0], -centroidTriangle[selectedTriangle][1], -centroidTriangle[selectedTriangle][2]];
            var scalingVector = [1.2, 1.2, 1.2];
            mat4.translate(transformTriangle[selectedTriangle], transformTriangle[selectedTriangle], translateVector);
            mat4.rotateX(transformTriangle[selectedTriangle], transformTriangle[selectedTriangle], rotateDegree);
            mat4.translate(transformTriangle[selectedTriangle], transformTriangle[selectedTriangle], negTranslateVector);
            noTransformation = true;
        } else if (ellipsoidTrue) {
            var translateVector = [centerEllipsoid[selectedEllipsoid][0], centerEllipsoid[selectedEllipsoid][1], centerEllipsoid[selectedEllipsoid][2]];
            var negTranslateVector = [-centerEllipsoid[selectedEllipsoid][0], -centerEllipsoid[selectedEllipsoid][1], -centerEllipsoid[selectedEllipsoid][2]];
            mat4.translate(transformEllipsoid[selectedEllipsoid], transformEllipsoid[selectedEllipsoid], translateVector);
            mat4.rotateX(transformEllipsoid[selectedEllipsoid], transformEllipsoid[selectedEllipsoid], rotateDegree);
            mat4.translate(transformEllipsoid[selectedEllipsoid], transformEllipsoid[selectedEllipsoid], negTranslateVector);

        }
        renderFigure();
    }
    if (e.key == 'L') { // L Key
        console.log("L key");
        var rotateDegree = -Math.PI / 180;
        if (triangleTrue) {

            var translateVector = [centroidTriangle[selectedTriangle][0], centroidTriangle[selectedTriangle][1], centroidTriangle[selectedTriangle][2]];
            var negTranslateVector = [-centroidTriangle[selectedTriangle][0], -centroidTriangle[selectedTriangle][1], -centroidTriangle[selectedTriangle][2]];
            var scalingVector = [1.2, 1.2, 1.2];
            mat4.translate(transformTriangle[selectedTriangle], transformTriangle[selectedTriangle], translateVector);
            mat4.rotateX(transformTriangle[selectedTriangle], transformTriangle[selectedTriangle], rotateDegree);
            mat4.translate(transformTriangle[selectedTriangle], transformTriangle[selectedTriangle], negTranslateVector);
            noTransformation = true;
        } else if (ellipsoidTrue) {
            var translateVector = [centerEllipsoid[selectedEllipsoid][0], centerEllipsoid[selectedEllipsoid][1], centerEllipsoid[selectedEllipsoid][2]];
            var negTranslateVector = [-centerEllipsoid[selectedEllipsoid][0], -centerEllipsoid[selectedEllipsoid][1], -centerEllipsoid[selectedEllipsoid][2]];
            mat4.translate(transformEllipsoid[selectedEllipsoid], transformEllipsoid[selectedEllipsoid], translateVector);
            mat4.rotateX(transformEllipsoid[selectedEllipsoid], transformEllipsoid[selectedEllipsoid], rotateDegree);
            mat4.translate(transformEllipsoid[selectedEllipsoid], transformEllipsoid[selectedEllipsoid], negTranslateVector);

        }
        renderFigure();
    }
    if (e.key == 'I') { // I Key
        console.log("I key");
        var rotateDegree = Math.PI / 180;
        if (triangleTrue) {
            var translateVector = [centroidTriangle[selectedTriangle][0], centroidTriangle[selectedTriangle][1], centroidTriangle[selectedTriangle][2]];
            var negTranslateVector = [-centroidTriangle[selectedTriangle][0], -centroidTriangle[selectedTriangle][1], -centroidTriangle[selectedTriangle][2]];
            var scalingVector = [1.2, 1.2, 1.2];
            mat4.translate(transformTriangle[selectedTriangle], transformTriangle[selectedTriangle], translateVector);
            mat4.rotateZ(transformTriangle[selectedTriangle], transformTriangle[selectedTriangle], rotateDegree);
            mat4.translate(transformTriangle[selectedTriangle], transformTriangle[selectedTriangle], negTranslateVector);
            noTransformation = true;
        } else if (ellipsoidTrue) {
            var translateVector = [centerEllipsoid[selectedEllipsoid][0], centerEllipsoid[selectedEllipsoid][1], centerEllipsoid[selectedEllipsoid][2]];
            var negTranslateVector = [-centerEllipsoid[selectedEllipsoid][0], -centerEllipsoid[selectedEllipsoid][1], -centerEllipsoid[selectedEllipsoid][2]];
            mat4.translate(transformEllipsoid[selectedEllipsoid], transformEllipsoid[selectedEllipsoid], translateVector);
            mat4.rotateZ(transformEllipsoid[selectedEllipsoid], transformEllipsoid[selectedEllipsoid], rotateDegree);
            mat4.translate(transformEllipsoid[selectedEllipsoid], transformEllipsoid[selectedEllipsoid], negTranslateVector);

        }
        renderFigure();
    }
    if (e.key == 'P') { // P Key
        console.log("P key");
        var rotateDegree = -Math.PI / 180;
        if (triangleTrue) {
            //mat4.multiply(transformTriangle[selectedTriangle], mat4.fromRotation(mat4.create(), rotateDegree, [0, 0, -1]), transformTriangle[selectedTriangle]);
            var translateVector = [centroidTriangle[selectedTriangle][0], centroidTriangle[selectedTriangle][1], centroidTriangle[selectedTriangle][2]];
            var negTranslateVector = [-centroidTriangle[selectedTriangle][0], -centroidTriangle[selectedTriangle][1], -centroidTriangle[selectedTriangle][2]];
            var scalingVector = [1.2, 1.2, 1.2];
            mat4.translate(transformTriangle[selectedTriangle], transformTriangle[selectedTriangle], translateVector);
            mat4.rotateZ(transformTriangle[selectedTriangle], transformTriangle[selectedTriangle], rotateDegree);
            mat4.translate(transformTriangle[selectedTriangle], transformTriangle[selectedTriangle], negTranslateVector);
            noTransformation = true;
        } else if (ellipsoidTrue) {
            var translateVector = [centerEllipsoid[selectedEllipsoid][0], centerEllipsoid[selectedEllipsoid][1], centerEllipsoid[selectedEllipsoid][2]];
            var negTranslateVector = [-centerEllipsoid[selectedEllipsoid][0], -centerEllipsoid[selectedEllipsoid][1], -centerEllipsoid[selectedEllipsoid][2]];
            mat4.translate(transformEllipsoid[selectedEllipsoid], transformEllipsoid[selectedEllipsoid], translateVector);
            mat4.rotateZ(transformEllipsoid[selectedEllipsoid], transformEllipsoid[selectedEllipsoid], rotateDegree);
            mat4.translate(transformEllipsoid[selectedEllipsoid], transformEllipsoid[selectedEllipsoid], negTranslateVector);
        }
        renderFigure();
    }
}

//to renderFigure the objects
function renderFigure() {
    renderTriangles();
    renderEllipsoids();
}

//clear of the highlights
function resetRender() {
    selectedEllipsoid = 0;
    selectedTriangle = 0;

    eye = [0.5, 0.5, -0.5];
    center = [0.5, 0.5, 1];
    viewUp = [0, 1, 0];

    loadFigures();
    renderFigure();
}

//clearing off the transformation
function resetTransform() {
    for (var whichSet = 0; whichSet < inputTriangles.length; whichSet++) {
        transformTriangle[whichSet] = mat4.create();
        modelTriangle[whichSet] = mat4.create();
    }

    for (var index = 0; index < inputEllipsoids.length; index++) {
        transformEllipsoid[index] = mat4.create();
        modelEllipsoid[index] = mat4.create();
    }

    resetRender();
}

/* MAIN -- HERE is where execution begins after window load */
function updateData() {
    width = document.getElementById("canvasWidth").value;
    height = document.getElementById("canvasHeight").value;
    var lightOn = document.getElementById("selectLight").checked;
    if (lightOn) {
        gl.uniform1i(lightSourceUniform, 1);
        loadFigures();
        renderFigure();
    } else {
        main();
    }
    canvasUpdate = true;
    return false;
}

function main() {
    loadLight();

    setupWebGL(); // set up the webGL environment
    setupShaders(); // setup the webGL shader
    connectLight();
    loadFigures();
    document.onkeydown = handleKeyDown;
    document.onkeypress = handleKeyPress;
    renderFigure();

} // end main