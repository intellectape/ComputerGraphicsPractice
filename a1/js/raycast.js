/** 
    Computer Graphics
    Assignment - 1
    @author Aditya Bhardwaj 
*/

/* classes */

// Color constructor
class Color {

    // Color constructor default opaque black
    constructor(r = 0, g = 0, b = 0, a = 255) {
            try {
                if ((typeof(r) !== "number") || (typeof(g) !== "number") || (typeof(b) !== "number") || (typeof(a) !== "number"))
                    throw "color component not a number";
                else if ((r < 0) || (g < 0) || (b < 0) || (a < 0))
                    throw "color component less than 0";
                else if ((r > 255) || (g > 255) || (b > 255) || (a > 255))
                    throw "color component bigger than 255";
                else {
                    this.r = r;
                    this.g = g;
                    this.b = b;
                    this.a = a;
                }
            } // end try
            catch (e) {
                console.log(e);
            }
        } // end Color constructor

    // Color change method
    change(r, g, b, a) {
            try {
                if ((typeof(r) !== "number") || (typeof(g) !== "number") || (typeof(b) !== "number") || (typeof(a) !== "number"))
                    throw "color component not a number";
                else if ((r < 0) || (g < 0) || (b < 0) || (a < 0))
                    throw "color component less than 0";
                else if ((r > 255) || (g > 255) || (b > 255) || (a > 255))
                    throw "color component bigger than 255";
                else {
                    this.r = r;
                    this.g = g;
                    this.b = b;
                    this.a = a;
                    return (this);
                }
            } // end throw
            catch (e) {
                console.log(e);
            }
        } // end Color change method

    // Color add method
    add(c) {
            try {
                if (!(c instanceof Color))
                    throw "Color.add: non-color parameter";
                else {
                    this.r += c.r;
                    this.g += c.g;
                    this.b += c.b;
                    this.a += c.a;
                    return (this);
                }
            } // end try
            catch (e) {
                console.log(e);
            }
        } // end color add

    // Color subtract method
    subtract(c) {
            try {
                if (!(c instanceof Color))
                    throw "Color.subtract: non-color parameter";
                else {
                    this.r -= c.r;
                    this.g -= c.g;
                    this.b -= c.b;
                    this.a -= c.a;
                    return (this);
                }
            } // end try
            catch (e) {
                console.log(e);
            }
        } // end color subgtract

    // Color scale method
    scale(s) {
            try {
                if (typeof(s) !== "number")
                    throw "scale factor not a number";
                else {
                    this.r *= s;
                    this.g *= s;
                    this.b *= s;
                    this.a *= s;
                    return (this);
                }
            } // end throw
            catch (e) {
                console.log(e);
            }
        } // end Color scale method

    // Color copy method
    copy(c) {
            try {
                if (!(c instanceof Color))
                    throw "Color.copy: non-color parameter";
                else {
                    this.r = c.r;
                    this.g = c.g;
                    this.b = c.b;
                    this.a = c.a;
                    return (this);
                }
            } // end try
            catch (e) {
                console.log(e);
            }
        } // end Color copy method

    // Color clone method
    clone() {
            var newColor = new Color();
            newColor.copy(this);
            return (newColor);
        } // end Color clone method

    // Send color to console
    toConsole() {
            console.log("rgba: " + this.r + " " + this.g + " " + this.b + " " + this.a);
        } // end Color toConsole

} // end color class

// Vector class
class Vector {
    constructor(x = 0, y = 0, z = 0) {
            this.set(x, y, z);
        } // end constructor

    // sets the components of a vector
    set(x, y, z) {
            try {
                if ((typeof(x) !== "number") || (typeof(y) !== "number") || (typeof(z) !== "number"))
                    throw "vector component not a number";
                else
                    this.x = x;
                this.y = y;
                this.z = z;
            } // end try
            catch (e) {
                console.log(e);
            }
        } // end vector set

    // copy the passed vector into this one
    copy(v) {
        try {
            if (!(v instanceof Vector))
                throw "Vector.copy: non-vector parameter";
            else
                this.x = v.x;
            this.y = v.y;
            this.z = v.z;
        } // end try
        catch (e) {
            console.log(e);
        }
    }

    toConsole(prefix) {
            console.log(prefix + "[" + this.x + "," + this.y + "," + this.z + "]");
        } // end to console

    // static dot method
    static dot(v1, v2) {
            try {
                if (!(v1 instanceof Vector) || !(v2 instanceof Vector))
                    throw "Vector.dot: non-vector parameter";
                else
                    return (v1.x * v2.x + v1.y * v2.y + v1.z * v2.z);
            } // end try
            catch (e) {
                console.log(e);
                return (NaN);
            }
        } // end dot static method

    // static add method
    static add(v1, v2) {
            try {
                if (!(v1 instanceof Vector) || !(v2 instanceof Vector))
                    throw "Vector.add: non-vector parameter";
                else
                    return (new Vector(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z));
            } // end try
            catch (e) {
                console.log(e);
                return (new Vector(NaN, NaN, NaN));
            }
        } // end add static method

    // static subtract method, v1-v2
    static subtract(v1, v2) {
            try {
                if (!(v1 instanceof Vector) || !(v2 instanceof Vector))
                    throw "Vector.subtract: non-vector parameter";
                else {
                    var v = new Vector(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
                    //v.toConsole("Vector.subtract: ");
                    return (v);
                }
            } // end try
            catch (e) {
                console.log(e);
                return (new Vector(NaN, NaN, NaN));
            }
        } // end subtract static method

    // static scale method
    static scale(c, v) {
            try {
                if (!(typeof(c) === "number") || !(v instanceof Vector))
                    throw "Vector.scale: malformed parameter";
                else
                    return (new Vector(c * v.x, c * v.y, c * v.z));
            } // end try
            catch (e) {
                console.log(e);
                return (new Vector(NaN, NaN, NaN));
            }
        } // end scale static method

    // static normalize method
    static normalize(v) {
            try {
                if (!(v instanceof Vector))
                    throw "Vector.normalize: parameter not a vector";
                else {
                    var lenDenom = 1 / Math.sqrt(Vector.dot(v, v));
                    return (Vector.scale(lenDenom, v));
                }
            } // end try
            catch (e) {
                console.log(e);
                return (new Vector(NaN, NaN, NaN));
            }
        } // end scale static method

    // static division method
    static divide(v1, v2) {
        try {
            if (!(v1 instanceof Vector) || !(v2 instanceof Vector))
                throw "Vector.divie: parameter not a vector";
            else {
                var vectDivide = new Vector((v1.x / v2.x), (v1.y / v2.y), (v1.z / v2.z));
                return vectDivide;
            }
        } catch (e) {
            console.log(e);
            return (new Vector(NaN, NaN, NaN));
        }
    }

    // static multiplication method
    static multiply(v1, v2) {
        try {
            if (!(v1 instanceof Vector) || !(v2 instanceof Vector))
                throw "Vector.divie: parameter not a vector";
            else {
                var vectDivide = new Vector((v1.x * v2.x), (v1.y * v2.y), (v1.z * v2.z));
                return vectDivide;
            }
        } catch (e) {
            console.log(e);
            return (new Vector(NaN, NaN, NaN));
        }
    }
} // end Vector class


/* utility functions */
// draw a pixel at x,y using color
function drawPixel(imagedata, x, y, color) {
    try {
        if ((typeof(x) !== "number") || (typeof(y) !== "number"))
            throw "drawpixel location not a number";
        else if ((x < 0) || (y < 0) || (x >= imagedata.width) || (y >= imagedata.height))
            throw "drawpixel location outside of image";
        else if (color instanceof Color) {
            var pixelindex = (y * imagedata.width + x) * 4;
            imagedata.data[pixelindex] = color.r;
            imagedata.data[pixelindex + 1] = color.g;
            imagedata.data[pixelindex + 2] = color.b;
            imagedata.data[pixelindex + 3] = color.a;
        } else
            throw "drawpixel color is not a Color";
    } // end try
    catch (e) {
        console.log(e);
    }
} // end drawPixel

// get the input ellipsoids from the standard class URL
function getInputData(URL) {
    const INPUT_ELLIPSOIDS_URL = URL;

    // load the ellipsoids file
    var httpReq = new XMLHttpRequest(); // a new http request
    httpReq.open("GET", INPUT_ELLIPSOIDS_URL, false); // init the request
    httpReq.send(null); // send the request
    var startTime = Date.now();
    while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
        if ((Date.now() - startTime) > 3000)
            break;
    } // until its loaded or we time out after three seconds
    if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE)) {
        console.log * ("Unable to open input ellipses file!");
        return String.null;
    } else
        return JSON.parse(httpReq.response);
} // end get input ellipsoids

// This function will calculate the color value for the pixel
function colorCalc(worldLoc, attribs, lightVector, eye, lVect, BlinnPhong, ellipsoidNumber) {
    var difColor = new Color();
    // Normal Vector Calculation
    var normalVec = Vector.divide(Vector.subtract(worldLoc, attribs.center), Vector.multiply(attribs.A, attribs.A));
    normalVec = Vector.scale(2, normalVec);
    normalVec = Vector.normalize(normalVec);

    var NdotL = Vector.dot(lVect, normalVec); // rect in xy plane
    // Reflection Vector Calculations
    var reflectionVec = Vector.subtract(Vector.scale(2 * Vector.dot(lightVector.lightPos, normalVec), normalVec), lightVector.lightPos);
    reflectionVec = Vector.normalize(reflectionVec);
    var view = new Vector();
    view.copy(eye);
    view = Vector.subtract(view, worldLoc);
    view = Vector.normalize(view);
    var halfVect = Vector.add(view, lVect);
    halfVect = Vector.normalize(halfVect);

    var RdotV = Vector.dot(reflectionVec, view);
    var NdotH = Vector.dot(normalVec, halfVect);
    var specularRef = NdotH;
    var shadow = 1;

    if (BlinnPhong) {
        specularRef = RdotV;
    }
    // Calculations for Ambient Color
    difColor.r = Math.round(attribs.ambient[0] * 255) * lightVector.ambient[0];
    difColor.g = Math.round(attribs.ambient[1] * 255) * lightVector.ambient[1];
    difColor.b = Math.round(attribs.ambient[2] * 255) * lightVector.ambient[2];

    // Calculations for Diffuse color
    difColor.r += shadow * Math.round(attribs.diffuse[0] * 255) * lightVector.diffuse[0] * NdotL;
    difColor.g += shadow * Math.round(attribs.diffuse[1] * 255) * lightVector.diffuse[1] * NdotL;
    difColor.b += shadow * Math.round(attribs.diffuse[2] * 255) * lightVector.diffuse[2] * NdotL;

    // Calculations for Specular
    difColor.r += shadow * Math.round(attribs.specular[0] * 255) * lightVector.specular[0] * Math.pow(specularRef, attribs.n);
    difColor.g += shadow * Math.round(attribs.specular[1] * 255) * lightVector.specular[1] * Math.pow(specularRef, attribs.n);
    difColor.b += shadow * Math.round(attribs.specular[2] * 255) * lightVector.specular[2] * Math.pow(specularRef, attribs.n);

    return difColor;
} // 

// shade the pixel given pixel position and interp'd attribs
// assumes attribs contains a "diffuse" property which is a Color object
// assumes all other properties are floats
// modifies pass image data
function shadePixel(imagedata, pixX, pixY, globals, attribs, intersectionVec, eye, illuminate, checkLight, ellipsoidNumber) {
    var difColor = new Color();
    var worldLoc = intersectionVec;
    var lVect = new Vector();

    if (checkLight) {
        var inputLights = getInputData("https://ncsucgclass.github.io/prog1/lights.json");
        //var inputLights = getInputData("https://pages.github.ncsu.edu/abhardw2/cgAssignment1/lights.json");
        //var inputLights = getInputData("./lights.json");
        for (i = 0; i < inputLights.length; i++) {
            lVect = new Vector(inputLights[i].x, inputLights[i].y, inputLights[i].z);
            inputLights[i]["lightPos"] = lVect;
            lVect = Vector.subtract(lVect, worldLoc);
            lVect = Vector.normalize(lVect);
            difColor = colorCalc(worldLoc, attribs, inputLights[i], eye, lVect, illuminate, ellipsoidNumber);
        }
    } else {
        // get light vector
        lVect.copy(globals.lightPos);
        lVect = Vector.subtract(lVect, worldLoc);
        lVect = Vector.normalize(lVect);

        difColor = colorCalc(worldLoc, attribs, globals, eye, lVect, illuminate, ellipsoidNumber);
    }

    drawPixel(imagedata, pixX, pixY, difColor);
} // end shade pixel

// This function is used for the calculation of the determinent
function determinentCalc(t, ellipsoidNumber, D, A, eye, center, currentEllipsoid) {
    // Calculating a, b, c values for the equation
    var a = Vector.dot(Vector.divide(D, A), Vector.divide(D, A));
    var b = 2 * (Vector.dot(Vector.divide(D, A), Vector.divide(Vector.subtract(eye, center), A)));
    var c = Vector.dot(Vector.divide(Vector.subtract(eye, center), A), Vector.divide(Vector.subtract(eye, center), A)) - 1;

    // d: determinent calculated
    // root: root for the determinent
    // root1 and root2: roots in case of multiple roots of the equation
    var d = b * b - 4 * a * c;
    if (d == 0) {
        var root = -b / (2 * a);
        //console.log(root);
        if (root > 1) {
            if (root < t) {
                t = root;
                ellipsoidNumber = e;
                //console.log(t + ' ' + ellipsoidNumber);
            }
        }
    } else if (d > 0) {
        var root1 = (-b + Math.sqrt(d)) / (2 * a);
        var root2 = (-b - Math.sqrt(d)) / (2 * a);

        if (root1 > 1 && root2 < 1) {
            var root = root1;
            //console.log(root);
            if (root < t) {
                t = root;
                ellipsoidNumber = currentEllipsoid;
            }
        } else if (root1 < 1 && root2 > 1) {
            var root = root2;
            if (root < t) {
                t = root;
                ellipsoidNumber = currentEllipsoid;
            }
        } else if (root1 > 1 && root2 > 1) {
            var root = Math.min(root1, root2);
            if (root < t) {
                t = root;
                ellipsoidNumber = currentEllipsoid;
            }
        }
    }
    return { tVal: t, ellNum: ellipsoidNumber };
}

// This function is used for the drawing the ellipsoid
function drawEllipsoid(context, globals, imagedata, illuminate, checkLight, eyeVec) {
    var inputEllipsoids = getInputData("https://ncsucgclass.github.io/prog1/ellipsoids.json");
    var w = context.canvas.width;
    var h = context.canvas.height;
    var newEye = eyeVec;
    /**
     * Ray: E + t(P-E) = E + Dt
     * Equation of Ellipse: ((S-C)/A)•((S-C)/A) = 1
     * Equation of Shadow Ray: D/A•D/A t2 + 2 D/A•(E-C)/A t + (E-C)/A•(E-C)/A - 1 = 0
     * or at^2 + bt + c = 0
     * a = D/A•D/A, b = 2 D/A•(E-C)/A, c = (E-C)/A•(E-C)/A - 1
     * t = (1/2a) (-b ± discriminant½)
     * E : eye
     * center: center
     * A : radius
     */

    if (inputEllipsoids != String.null) {
        var eye = new Vector();
        if (eyeVec == undefined) {
            eye = new Vector(0.5, 0.5, -0.5);
        } else {
            eye.copy(newEye);
        }
        var viewUp = new Vector(0, 1, 0);
        var lookAt = new Vector(0, 0, 1);
        var n = inputEllipsoids.length; // the number of input ellipsoids

        var normalVector = new Vector(0, 0, 0);

        for (var px = 0; px < 1; px += (1 / w)) {
            for (var py = 0; py < 1; py += (1 / h)) {
                // t: nearest pixel in front of the eye.
                // ellipsoidNumber: The ellipsoid nearest to eye
                var t = Infinity;
                var ellipsoidNumber = Infinity;
                // pVector: Pixel Vector
                var pVector = new Vector(px, py, 0);
                // D is the difference between the pixel vector and the eye. 
                var D = Vector.subtract(pVector, eye);

                for (var e = 0; e < inputEllipsoids.length; e++) {
                    //ellipsoidRadius = inputEllipsoids[ep].r;
                    var A = new Vector(inputEllipsoids[e].a, inputEllipsoids[e].b, inputEllipsoids[e].c);
                    inputEllipsoids[e]["A"] = A;
                    var center = new Vector(inputEllipsoids[e].x, inputEllipsoids[e].y, inputEllipsoids[e].z);
                    inputEllipsoids[e]["center"] = center;

                    var calcT_ElN = determinentCalc(t, ellipsoidNumber, D, A, eye, center, e);
                    t = calcT_ElN.tVal;
                    ellipsoidNumber = calcT_ElN.ellNum;
                }
                if (t != Infinity && ellipsoidNumber != Infinity) {
                    // Intersection with Eye
                    var intersectionVec = Vector.add(eye, Vector.scale(t, Vector.subtract(pVector, eye))); // world
                    shadePixel(imagedata, Math.floor(px * w), h - Math.floor(py * h), globals, inputEllipsoids[ellipsoidNumber], intersectionVec, eye, illuminate, checkLight, ellipsoidNumber);
                }
            }
        }
    }
}

// This is function to color Triangle Pixels
function shadeTrianglePixel(imagedata, pixX, pixY, globals, attribs, lightVector, intersectionVec) {

    var difColor = new Color();
    var worldLoc = new Vector(intersectionVec); // assume rect at z=0
    var lVect = new Vector();

    // Normal Vector Calculation
    var normalVec = Vector.divide(Vector.subtract(worldLoc, attribs.center), Vector.multiply(attribs.A, attribs.A));
    normalVec = Vector.scale(2, normalVec);
    normalVec = Vector.normalize(normalVec);

    // get light vector
    lVect.copy(globals.lightPos);
    lVect = Vector.subtract(lVect, worldLoc);
    lVect = Vector.normalize(lVect);
    var NdotL = Vector.dot(lVect, new Vector(0, 0, 1)); // rect in xy plane

    // Calculations for Ambient Color
    difColor.r = Math.round(attribs.ambient[0] * 255) * lightVector.ambient[0];
    difColor.g = Math.round(attribs.ambient[1] * 255) * lightVector.ambient[1];
    difColor.b = Math.round(attribs.ambient[2] * 255) * lightVector.ambient[2];

    // Calculations for Diffuse color
    difColor.r += shadow * Math.round(attribs.diffuse[0] * 255) * lightVector.diffuse[0] * NdotL;
    difColor.g += shadow * Math.round(attribs.diffuse[1] * 255) * lightVector.diffuse[1] * NdotL;
    difColor.b += shadow * Math.round(attribs.diffuse[2] * 255) * lightVector.diffuse[2] * NdotL;

    // Calculations for Specular
    difColor.r += shadow * Math.round(attribs.specular[0] * 255) * lightVector.specular[0] * Math.pow(specularRef, attribs.n);
    difColor.g += shadow * Math.round(attribs.specular[1] * 255) * lightVector.specular[1] * Math.pow(specularRef, attribs.n);
    difColor.b += shadow * Math.round(attribs.specular[2] * 255) * lightVector.specular[2] * Math.pow(specularRef, attribs.n);


    drawPixel(imagedata, pixX, pixY, difColor);
}
// This function is used for calculation of the Triangle
function drawTriangle(context, imagedata, eyeVec) {
    var inputTriangle = getInputData("https://ncsucgclass.github.io/prog1/triangles.json");
    var newEye = eyeVec;

    if (inputTriangle != String.null) {
        var c = new Color(0, 0, 0, 0); // the color at the pixel: black
        var w = context.canvas.width;
        var h = context.canvas.height;
        var n = inputTriangle.length;
        var eye = new Vector();
        if (eyeVec == undefined) {
            eye = new Vector(0.5, 0.5, -0.5);
        } else {
            eye.copy(newEye);
        }
        //console.log("number of ellipsoids: " + n);

        for (var px = 0; px < 1; px += (1 / w)) {
            for (var py = 0; py < 1; py += (1 / h)) {
                var t = Infinity;
                var triangleNumber = Infinity;
                // pVector: Pixel Vector
                var pVector = new Vector(px, py, 0);
                // D is the difference between the pixel vector and the eye. 
                var diffVec = Vector.subtract(pVector, eye);
                for (var tl = 0; tl < inputTriangle[2].triangles.length; tl++) {
                    var A = new Vector(inputTriangle[1].vertices[inputTriangle[2].triangles[tl][0]][0], inputTriangle[1].vertices[inputTriangle[2].triangles[tl][0]][1], inputTriangle[1].vertices[inputTriangle[2].triangles[tl][0]][2]);
                    var B = new Vector(inputTriangle[1].vertices[inputTriangle[2].triangles[tl][1]][0], inputTriangle[1].vertices[inputTriangle[2].triangles[tl][1]][1], inputTriangle[1].vertices[inputTriangle[2].triangles[tl][1]][2]);
                    var C = new Vector(inputTriangle[1].vertices[inputTriangle[2].triangles[tl][2]][0], inputTriangle[1].vertices[inputTriangle[2].triangles[tl][2]][1], inputTriangle[1].vertices[inputTriangle[2].triangles[tl][2]][2]);

                    /*var A = Vector.subtract(triangleA, triangleC);
                    var B = Vector.subtract(triangleB, triangleC);
                    var C = Vector.scale(-1, diffVec);
                    var D = Vector.subtract(triangleC, eye);*/

                    var DetA = math.det([
                        [A.x - B.x, A.x - C.x, diffVec.x],
                        [A.y - B.y, A.y - C.y, diffVec.y],
                        [A.z - B.z, A.z - C.z, diffVec.z]
                    ]);

                    var DetA1 = math.det([
                        [A.x - eye.x, A.x - C.x, diffVec.x],
                        [A.y - eye.y, A.y - C.y, diffVec.y],
                        [A.z - eye.z, A.z - C.z, diffVec.z]
                    ]);

                    var DetA2 = math.det([
                        [A.x - B.x, A.x - eye.x, diffVec.x],
                        [A.y - B.y, A.y - eye.y, diffVec.y],
                        [A.z - B.z, A.z - eye.z, diffVec.z]
                    ]);

                    var DetA3 = math.det([
                        [A.x - B.x, A.x - C.x, A.x - eye.x],
                        [A.y - B.y, A.y - C.y, A.y - eye.y],
                        [A.z - B.z, A.z - C.z, A.z - eye.z]
                    ]);


                    var beta = DetA1 / DetA;
                    var gamma = DetA1 / DetA;
                    var tao = DetA3 / DetA;
                    //console.log(tao);
                    if ((0 < beta && 0 < gamma && beta + gamma < 1)) {
                        if (tao < t && tao >= 0) {
                            t = tao;
                            triangleNumber = tl;
                        }
                    }
                }
                if (t != Infinity && triangleNumber != Infinity) {
                    drawPixel(imagedata, px, py, c);
                }
            }
        }
    }
}

/* main -- here is where execution begins after window load */
function main(illuminate, width, height, checkLight, eyeVector) {
    //console.log(eyeVector);
    // Get the canvas and context
    var canvas = document.getElementById("viewport");
    canvas.width = width.value;
    canvas.height = height.value;
    var context = canvas.getContext("2d");
    var globals = {
        lightPos: new Vector(-1, 3, -0.5), // light over left upper rect
        ambient: [1, 1, 1],
        diffuse: [1, 1, 1],
        specular: [1, 1, 1]
    };
    var w = context.canvas.width;
    var h = context.canvas.height;
    var imagedata = context.createImageData(w, h);
    // Create the image

    drawEllipsoid(context, globals, imagedata, illuminate, checkLight, eyeVector);

    context.putImageData(imagedata, 0, 0);
}

// This function takes input from the form and implement the functionality in the canvas
function applyForm() {
    var checkIlluminate = document.getElementById("illuminate");
    var checkLights = document.getElementById("lights");

    var width = document.getElementById("canvasWidth");
    var height = document.getElementById("canvasHeight");

    var updateEyeLoc = new Vector(Number(document.getElementById("eyeX").value), Number(document.getElementById("eyeY").value), Number(document.getElementById("eyeZ").value));

    main(checkIlluminate.checked, width, height, checkLights.checked, updateEyeLoc);
    return false;

}

// Loading content in the canvas using the onload function
window.onload = function() {
    var width = document.getElementById("canvasWidth");
    var height = document.getElementById("canvasHeight");
    var eyeV = new Vector(Number(document.getElementById("eyeX").value), Number(document.getElementById("eyeY").value), Number(document.getElementById("eyeZ").value));

    main(false, width, height, false, eyeV);
}