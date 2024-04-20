// @ts-check

import * as T from "../libs/CS559-Three/build/three.module.js";
import { GrWorld } from "../libs/CS559-Framework/GrWorld.js";
import { GrObject } from "../libs/CS559-Framework/GrObject.js";
import * as InputHelpers from "../libs/CS559/inputHelpers.js";

let parentOfCanvas = document.getElementById("div1");
let world = new GrWorld({ where: parentOfCanvas });
world.go();

//load the texture
let texture = new T.TextureLoader().load("./textures/painting.png");
texture.flipY = false; //makes sure its the right way up

/**
 * This class creates an object that represents a picture I took of a painting from
 * the Norton Simon museum from home. It might be hard to see, but if you zoom in you
 * can see that the texture is mapped to the front, and all of the sides (see frame design).
 */
export class Painting extends GrObject {
    constructor() {
        const positions = new Float32Array([
            //back
            0, 0, 0,
            0.6, 0, 0,
            0.6, 0, 0.79,
            0, 0, 0.79,
            //front
            0, 0.05, 0,
            0.6, 0.05, 0,
            0.6, 0.05, 0.79,
            0, 0.05, 0.79,
            //left side
            0, 0, 0,
            0, 0, 0.79,
            0, 0.05, 0.79,
            0, 0.05, 0,
            //top edge
            0, 0, 0,
            0.6, 0, 0,
            0.6, 0.05, 0.10,
            0, 0.05, 0,
            //right side
            0.6, 0, 0,
            0.6, 0, 0.79,
            0.6, 0.05, 0.79,
            0.6, 0.05, 0,
            //bottom edge
            0, 0, 0.79,
            0.6, 0, 0.79,
            0.6, 0.05, 0.79,
            0, 0.05, 0.79,

        ]);
        const normals = new Float32Array([
            //back
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            //front
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            //left side
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            //top edge
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            //right side
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            //bottom edge
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1
        ]);
        const uvs = new Float32Array([
            //back
            -1, -1,
            -1, -1,
            -1, -1,
            -1, -1,
            //front
            0, 0,
            1, 0,
            1, 1,
            0, 1,
            //left side
            0.92, 0.95,
            0.92, 0.05,
            1, 0.05,
            1, 0.95,
            //top edge
            0.8, 0.96,
            0.2, 0.96,
            0.2, 1,
            0.8, 1,
            //right side
            1, 0.05,
            1, 0.95,
            0.92, 0.95,
            0.92, 0.05,

            //bottom edge
            0.2, 0.96,
            0.8, 0.96,
            0.8, 1,
            0.2, 1
        ]);

        let geometry = new T.BufferGeometry();
        geometry.setAttribute("position", new T.BufferAttribute(positions, 3));
        geometry.setAttribute("normal", new T.BufferAttribute(normals, 3));
        geometry.setAttribute("uv", new T.BufferAttribute(uvs, 2));
        geometry.setIndex([
            0, 1, 2,
            0, 2, 3,
            6, 5, 4,
            7, 6, 4,
            8, 10, 9,
            8, 11, 10,
            12, 13, 14,
            12, 14, 15,
            16, 17, 18,
            16, 18, 19,
            20, 22, 21,
            20, 23, 22
        ]);

        let material = new T.MeshStandardMaterial({
            color: "#d6bb98", //"stain" it with a very light orange so that it looks more gold
            map: texture,
            side: T.DoubleSide
        });
        let mesh = new T.Mesh(geometry, material);
        super("Painting", mesh);

    }

}
let painting = new Painting();
//setting the position so its upright and the right direction / position
painting.objects[0].rotateZ(Math.PI / 2);
painting.objects[0].rotateY(-Math.PI / 2);
painting.objects[0].scale.set(3, 3, 3);
painting.objects[0].position.set(0, 2.4, 0);
//add the painting to the world
world.add(painting);
world.go();