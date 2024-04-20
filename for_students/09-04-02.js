// @ts-check

import * as T from "../libs/CS559-Three/build/three.module.js";
import { GrWorld } from "../libs/CS559-Framework/GrWorld.js";
import { GrObject } from "../libs/CS559-Framework/GrObject.js";
import * as InputHelpers from "../libs/CS559/inputHelpers.js";
//NOTE: image for skybox was taken from https://polyhaven.com/hdris/outdoor
let parentOfCanvas = document.getElementById("div1");
let world = new GrWorld({ where: parentOfCanvas });

/**
 * This class creates a custom object for the world
 */
export class customObject extends GrObject {
    constructor() {
        let geometry = new T.TorusGeometry(0.8, 0.3);
        let mat = new T.MeshStandardMaterial({
            color: "#f5d0e9",
            roughness: 0.2,
            side: T.DoubleSide
        });
        let mesh = new T.Mesh(geometry, mat);
        super("ring", mesh);
    }
}

/**
 * use 6 images using the tool linked in the workbook so that we can use
 * the cube texture loader for an environment map.
 */
let environmentmap = [
    './textures/px.png',
    './textures/nx.png',
    './textures/py.png',
    './textures/ny.png',
    './textures/pz.png',
    './textures/nz.png'
]
//create the texture loader, use the above environment map array of images.
let textureLoader = new T.CubeTextureLoader();
let skybox = textureLoader.load(environmentmap);
let object = new customObject();
object.objects[0].rotateX(Math.PI / 2);
object.objects[0].position.set(0, .2, 0);
world.add(object);
//set the scene to the skybox we created
world.scene.background = skybox;

world.go();
