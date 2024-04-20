// @ts-check

import * as T from "../libs/CS559-Three/build/three.module.js";
import { GrWorld } from "../libs/CS559-Framework/GrWorld.js";
import { GrObject } from "../libs/CS559-Framework/GrObject.js";
import * as InputHelpers from "../libs/CS559/inputHelpers.js";
import { SimpleGroundPlane } from "../libs/CS559-Framework/GroundPlane.js";
let parentOfCanvas = document.getElementById("div1");
//set groundplane to false since we don't know how to make it reflect the plane yet
let world = new GrWorld({ where: parentOfCanvas, groundplane: false });

//set environment map to an array of all of our pictures (same ones as we used in 09-04-02.js,
//the following code is taken from my last workbook (that I made myself))
let environmentmap = [
    './textures/px.png',
    './textures/nx.png',
    './textures/py.png',
    './textures/ny.png',
    './textures/pz.png',
    './textures/nz.png'
]

//create the texture loader, and load the environment map using .load
let textureLoader = new T.CubeTextureLoader();
let skybox = textureLoader.load(environmentmap);
let textureLoader2 = new T.TextureLoader();
let blockTexture = textureLoader2.load('./textures/pane.png');
/**
 * This class creates a reflective cube using box geometry, and using an environment map that is the same as
 * its background, so that it creates a reflecting property. 
 * 
 * Explanation of why env map is appropriate:
 * environment maps are appropriate for cubes because when we use a cube texture loader,
 * we provide an image for each face of the cube which helps to show the environment
 * from all different directions/perspectives. This way, all of the reflections on each
 * side is reflecting the surrounding, and is thus appropriate here.
 * 
 * 
 * The cube also combines environment map with another map type, bump map. I wanted
 * to create a minecraft glass block, so I used an image of the face of a glass block, and only
 * wanted to use the bump map to show the texture of the glass while still using the reflectivity
 * property of the environment map. 
 */
export class glassBlock extends GrObject {
    constructor() {
        let geometry = new T.BoxGeometry(3, 3, 3);
        let mat = new T.MeshStandardMaterial({
            //map the skybox (reflectivity)
            envMap: skybox,
            //map the bump texture (glass block)
            bumpMap: blockTexture,
            //wanted the texture to portrude outward, so use negative val
            bumpScale: -1,
            roughness: 0,
            metalness: 1,
        });
        let mesh = new T.Mesh(geometry, mat);
        super("sphere", mesh);
    }
}

//set the background to the skybox since we want the object and background to be the same to demonstrate
//reflectiveness
world.scene.background = skybox;
let glass = new glassBlock();
glass.objects[0].rotateX(Math.PI / 2);
glass.objects[0].position.set(0, .8, 0);
world.add(glass);
world.go();