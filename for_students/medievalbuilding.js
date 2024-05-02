/*jshint esversion: 6 */
// @ts-check
import * as T from "../libs/CS559-Three/build/three.module.js";
import { GrObject } from "../libs/CS559-Framework/GrObject.js";

//images & textures used:
let baseTexture = new T.TextureLoader().load("./images/stoneWindows.png");
let wallTexture = new T.TextureLoader().load("./images/medievalWall1.jpeg");
let woodTexture = new T.TextureLoader().load("./images/wood.jpg");
let roofOutlookTexture = new T.TextureLoader().load("./images/roofOutlook.png");
let roofTexture = new T.TextureLoader().load("./images/roof.jpeg");

/**
 * This class creates a medieval building object for my town (taken frm p2)
 */
export class MedievalBuilding extends GrObject {
    //constructor takes in an x,y,z position, as well as a rotation angle, scale factors for
    //all 3 axes, and a roofColor so that we can have some variation even if we use multiple instances of this object
    constructor(x, y, z, angle, scalex, scaley, scalez, roofColor) {
        let group = new T.Group();
        //MATERIALS (these are used throughout the file, all defined here)
        let baseMaterial = new T.MeshStandardMaterial({
            color: "#e0c9b8",
            map: baseTexture,
            bumpMap: baseTexture,
            bumpScale: 2
        });

        let wallMaterial = new T.MeshStandardMaterial({
            color: "#d9bfad",
            map: wallTexture,
            bumpMap: wallTexture,
            bumpScale: 2,
        });

        let poleMaterial = new T.MeshStandardMaterial({
            color: "#63422b",
            bumpMap: woodTexture,
            bumpScale: 10,
        });

        let roofMaterial = new T.MeshStandardMaterial({
            map: roofTexture,
            bumpMap: roofTexture,
            color: roofColor,
            bumpScale: 5,
        });

        let roofOutlookMaterial = new T.MeshStandardMaterial({
            color: "#d9bfad",
            map: roofOutlookTexture,
            bumpMap: roofOutlookTexture,
            bumpScale: 2,
        });

        //BASE (cobblestone base under the walls)
        let baseGeometry = new T.BoxGeometry(4, 3, 4);
        let base = new T.Mesh(baseGeometry, baseMaterial);
        group.add(base);

        //WALLS 
        let wallGeometry = new T.BoxGeometry(4.7, 4, 4.7);
        let wall = new T.Mesh(wallGeometry, wallMaterial);
        wall.position.set(0, 3.2, 0);
        group.add(wall);

        //POLES (the little wood logs that outline the base)
        let poleGeometry = new T.CylinderGeometry(0.2, 0.2, 3);
        let pole = new T.Mesh(poleGeometry, poleMaterial);
        pole.position.set(-2, 0, 2);
        group.add(pole);

        let pole2 = new T.Mesh(poleGeometry, poleMaterial);
        pole2.position.set(2, 0, 2);
        group.add(pole2);

        let pole3 = new T.Mesh(poleGeometry, poleMaterial);
        pole3.position.set(2, 0, -2);
        group.add(pole3);

        let pole4 = new T.Mesh(poleGeometry, poleMaterial);
        pole4.position.set(-2, 0, -2);
        group.add(pole4);

        let horizontalPoleGeometry = new T.CylinderGeometry(0.2, 0.2, 4.5);
        let horizontalPole1 = new T.Mesh(horizontalPoleGeometry, poleMaterial);
        horizontalPole1.rotateZ(Math.PI / 2);
        horizontalPole1.position.set(0, 1, 2.3);
        group.add(horizontalPole1);

        let horizontalPole2 = new T.Mesh(horizontalPoleGeometry, poleMaterial);
        horizontalPole2.rotateZ(Math.PI / 2);
        horizontalPole2.position.set(0, 1, -2.3);
        group.add(horizontalPole2);

        let horizontalPole3 = new T.Mesh(horizontalPoleGeometry, poleMaterial);
        horizontalPole3.rotateZ(Math.PI / 2);
        horizontalPole3.rotateX(Math.PI / 2);
        horizontalPole3.position.set(-2.3, 1, 0);
        group.add(horizontalPole3);

        let horizontalPole4 = new T.Mesh(horizontalPoleGeometry, poleMaterial);
        horizontalPole4.rotateZ(Math.PI / 2);
        horizontalPole4.rotateX(Math.PI / 2);
        horizontalPole4.position.set(2.3, 1, 0);
        group.add(horizontalPole4);

        //ROOF:
        //roof portion 1
        const vertices1 = new Float32Array([
            //ALL TRIANGLES ARE BUILT IN CCW DIRECTION
            //right rectangle
            0, 1.8, 0.6, //top left
            0.57, 0.935, 0.57, //bottom left
            0.57, 0.935, -1, //bottom right

            0.57, 0.935, -1, //bottom right
            0, 1.8, -1, //top right
            0, 1.8, 0.6, //top left

            //left rectangle
            -0.57, 0.935, -1, //bottom left
            -0.57, 0.935, 0.57, //bottom right
            0, 1.8, 0.6, //top right

            0, 1.8, 0.6, //top right
            0, 1.8, -1, //top left
            -0.57, 0.935, -1, //bottom left

            //left side (slanted)
            0.6, 1.07, 0.2, //bottom right
            0.6, 1.47, -0.2, //top right
            -0.6, 1.47, -0.2, //top left

            -0.6, 1.47, -0.2,//top left
            -0.6, 1.07, 0.2, //bottom left
            0.6, 1.07, 0.2, //bottom right

            //right side (slanted):
            -0.6, 1.07, -0.6, //bottom right
            -0.6, 1.47, -0.2, //top right
            0.6, 1.47, -0.2, //top left

            0.6, 1.47, -0.2, //top left
            0.6, 1.07, -0.6, //bottom left
            -0.6, 1.07, -0.6, //bottom right

        ]);

        //texture mapping for roof portion 1
        const uv1 = new Float32Array([
            //right rectangle:
            0, 1,
            0, 0,
            1, 0,

            1, 0,
            1, 1,
            0, 1,

            //left rectangle
            0, 0,
            1, 0,
            1, 1,

            1, 1,
            0, 1,
            0, 0,

            //left side:
            1, 0,
            1, 1,
            0, 1,

            0, 1,
            0, 0,
            1, 0,

            //right side:
            0, 0,
            0, 1,
            1, 1,

            1, 1,
            1, 0,
            0, 0,

        ]);

        //vertices for the outlooks of the roof
        const vertices2 = new Float32Array([
            //front
            0, 1.8, 0.6, //top
            -0.6, 1, 0.6, //left
            0.6, 1, 0.6, //right
            //back
            0, 1.8, -1, //top
            0.6, 1, -1, //left
            -0.6, 1, -1, //right
        ]);

        //texture mapping for the outlooks of the roof
        const uv2 = new Float32Array([
            //front - facing outwards, shouldn't have mapping
            0.5, 0.95,
            0.92, 0.05,
            0.075, 0.05,

            //back - facing outwards
            0.5, 0.95,
            0.075, 0.05,
            0.92, 0.05,
        ]);

        //vertices for the dormers of the roof
        const vertices3 = new Float32Array([
            //front:
            0.6, 1.47, -0.2, //top
            0.6, 1.07, 0.2, //left
            0.6, 1.07, -0.6, //right
            //front (on the other side):
            -0.6, 1.47, -0.2, //top
            -0.6, 1.07, -0.6, //right
            -0.6, 1.07, 0.2, //left
        ]);

        //texture mapping for the dormers of the roof
        const uv3 = new Float32Array([
            //front - facing outwards, shouldn't have mapping
            0.5, 0.95,
            0.92, 0.05,
            0.075, 0.05,

            //back - facing outwards
            0.5, 0.95,
            0.075, 0.05,
            0.92, 0.05,
        ]);

        //create the geometries using all of the vertices and uvs we just defined
        let roofGeometry = new T.BufferGeometry();
        roofGeometry.setAttribute("position", new T.BufferAttribute(vertices1, 3));
        roofGeometry.setAttribute("uv", new T.BufferAttribute(uv1, 2));
        roofGeometry.computeVertexNormals();

        let outlookGeometry = new T.BufferGeometry();
        outlookGeometry.setAttribute("position", new T.BufferAttribute(vertices2, 3));
        outlookGeometry.setAttribute("uv", new T.BufferAttribute(uv2, 2));
        outlookGeometry.computeVertexNormals();

        let dormerGeometry = new T.BufferGeometry();
        dormerGeometry.setAttribute("position", new T.BufferAttribute(vertices3, 3));
        dormerGeometry.setAttribute("uv", new T.BufferAttribute(uv3, 2));
        dormerGeometry.computeVertexNormals();

        //main roof portion
        let roof = new T.Mesh(roofGeometry, roofMaterial);
        roof.scale.set(5, 6, 3);
        roof.position.set(0, -0.9, 0.5);
        group.add(roof);

        //outlooks for the roof
        let roofOutlook = new T.Mesh(outlookGeometry, roofOutlookMaterial);
        roofOutlook.scale.set(4.5, 6, 3);
        roofOutlook.position.set(0, -0.9, 0.5);
        group.add(roofOutlook);

        //dormers for the roof
        let roofDormer = new T.Mesh(dormerGeometry, roofOutlookMaterial);
        roofDormer.scale.set(5, 6, 3.1);
        roofDormer.position.set(0, -0.9, 0.5);
        group.add(roofDormer);

        //set the group position/rotation/scale based on the input from the constructor
        group.scale.set(scalex, scaley, scalez);
        group.rotateY(angle);
        group.position.set(x, y + 1.1, z);

        //remember to call super!
        super("Medieval House - Style 2", group);
    }
}