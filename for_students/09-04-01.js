// @ts-check

import * as T from "../libs/CS559-Three/build/three.module.js";
import { GrWorld } from "../libs/CS559-Framework/GrWorld.js";
import { GrObject } from "../libs/CS559-Framework/GrObject.js";
import * as InputHelpers from "../libs/CS559/inputHelpers.js";
//NOTE: image for fake skybox was taken from https://polyhaven.com/hdris/outdoor
let parentOfCanvas = document.getElementById("div1");
let world = new GrWorld({ where: parentOfCanvas });

/**
 * Custom object for the world (ring)
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

        super("Ring", mesh);
    }
}

/**
 * Class that creates the fake skybox using a sphere
 */
export class Background extends GrObject {
    constructor() {
        let texture = new T.TextureLoader().load("./textures/skybox.jpeg");
        let geometry = new T.SphereGeometry(1000, 100, 100);
        let mat = new T.MeshStandardMaterial({
            map: texture,
            side: T.BackSide
        });
        let mesh = new T.Mesh(geometry, mat);
        super("background", mesh)
    }
}
let ring = new customObject();
ring.objects[0].rotateX(Math.PI / 2);
ring.objects[0].position.set(0, .2, 0);
world.add(ring);

let background = new Background();
background.objects[0].position.set(0, 3, 0);
world.add(background);
world.go();