/*jshint esversion: 6 */
// @ts-check

import * as T from "../libs/CS559-Three/build/three.module.js";
import { shaderMaterial } from "../libs/CS559-Framework/shaderHelper.js";
import { GrObject } from "../libs/CS559-Framework/GrObject.js";
let ocean = new T.TextureLoader().load("./images/ocean.jpeg");
let rock = new T.TextureLoader().load("./images/rock.jpg");

/**
 * This class creates the lake object for my town
 * 
 * NOTE: some of the code was taken from WB10 - but of course changed to fit this use case.
 * the actual shader is completely new.
 */
export class Lake extends GrObject {
    //constructor takes in x,y, and z for positioning of the lake.
    constructor(x, y, z) {
        let group = new T.Group();
        let shaderMat = shaderMaterial("./shaders/lake.vs", "./shaders/lake.fs", {
            side: T.DoubleSide,
            //add all the uniforms that are used in the shader
            uniforms: {
                //default val of time, we update this in an animation function
                time: { value: 1.0 },
                resolution: { value: 0.004 },
                speed: { value: 1.3 },
                frequency: { value: 20.5 },
                image: { value: ocean },
                amplitude: { value: 20. },
            },
        }
        );

        //CREATING THE LAKE SHAPE (using beziers):
        const lakeShape = new T.Shape();

        lakeShape.moveTo(0, 0);
        lakeShape.ellipse(0, 0, 50, 70, 0, 0, 2 * Math.PI, false);
        lakeShape.bezierCurveTo(-30, 40, -60, 50, -70, 0);
        lakeShape.bezierCurveTo(-90, -50, -60, -40, 0, -50);
        lakeShape.bezierCurveTo(20, -80, 80, -80, 50, 0);
        lakeShape.bezierCurveTo(60, 40, 30, 100, 0, 60);
        lakeShape.bezierCurveTo(-90, -50, -70, -60, -10, -70);
        lakeShape.closePath();

        const lakeGeometry = new T.ShapeGeometry(lakeShape);
        const lakeMesh = new T.Mesh(lakeGeometry, shaderMat);

        //POSITIONING THE LAKE:
        lakeMesh.rotateX(Math.PI / 2);
        lakeMesh.position.set(4, 0, 0);
        lakeMesh.scale.set(0.08, 0.08, 0.08);
        group.add(lakeMesh);

        //CREATE THE ANIMATE FUNCTION:
        let startTime = Date.now(); //the current time, will be used to calculate time elapsed

        /**
         * Function to update the time variable so that we can actually use the intended animation of the shader
         */
        function animate() {
            //calculate the new time based on the current time and the start time that we recorded above, also scale it by dividing by 800,
            //can increase or decrease that value to change how fast the animation is
            let newTime = (Date.now() - startTime) / 800;
            //make sure to update the uniform time variable for the shaders
            shaderMat.uniforms.time.value = newTime;
            //continuously call the function:
            requestAnimationFrame(animate);
        }
        //call the animate function so it continuously animates:
        animate();

        //CREATE THE ROCKS AROUND THE LAKE:
        let rockType1 = new T.SphereGeometry(0.7, 4, 4, 0, Math.PI, 0, Math.PI);
        let rockType2 = new T.SphereGeometry(0.6, 4, 4, 0, Math.PI, 0, Math.PI);
        let rockType3 = new T.SphereGeometry(0.45, 4, 4, 0, Math.PI, 0, Math.PI);
        let rockType4 = new T.SphereGeometry(0.9, 4, 4, 0, Math.PI, 0, Math.PI);
        //two types of rock materials for variation:
        let rockMaterial = new T.MeshPhongMaterial({
            color: "#bfbbb6",
            bumpMap: rock,
            bumpScale: 7,

        });

        let rockMaterial2 = new T.MeshPhongMaterial({
            color: "#a3a09d",
            bumpMap: rock,
            bumpScale: 4.5,

        });

        //creating all the rock meshes:
        let rock1 = new T.Mesh(rockType1, rockMaterial);
        rock1.rotateX(-Math.PI / 2);
        rock1.position.set(6, 0.1, -5);
        group.add(rock1);

        let rock2 = new T.Mesh(rockType2, rockMaterial2);
        rock2.rotateX(-Math.PI / 2);
        rock2.position.set(7, 0.1, -5.2);
        group.add(rock2);

        let rock3 = new T.Mesh(rockType3, rockMaterial);
        rock3.rotateX(-Math.PI / 2);
        rock3.position.set(7.8, 0.1, -4.8);
        group.add(rock3);

        let rock4 = new T.Mesh(rockType3, rockMaterial2);
        rock4.rotateX(-Math.PI / 2);
        rock4.position.set(5, 0.1, -5);
        group.add(rock4);

        let rock5 = new T.Mesh(rockType2, rockMaterial);
        rock5.rotateX(-Math.PI / 2);
        rock5.position.set(4.2, 0.1, -5.4);
        group.add(rock5);

        let rock6 = new T.Mesh(rockType4, rockMaterial);
        rock6.rotateX(-Math.PI / 2);
        rock6.position.set(2.95, 0.1, -5.8);
        group.add(rock6);

        let rock7 = new T.Mesh(rockType3, rockMaterial2);
        rock7.rotateX(-Math.PI / 2);
        rock7.position.set(1.8, 0.1, -5.6);
        group.add(rock7);

        let rock8 = new T.Mesh(rockType2, rockMaterial);
        rock8.rotateX(-Math.PI / 2);
        rock8.position.set(0.9, 0.1, -5.3);
        group.add(rock8);

        let rock9 = new T.Mesh(rockType3, rockMaterial);
        rock9.rotateX(-Math.PI / 2);
        rock9.position.set(0.1, 0.1, -4.8);
        group.add(rock9);

        let rock10 = new T.Mesh(rockType2, rockMaterial2);
        rock10.rotateX(-Math.PI / 2);
        rock10.position.set(-0.55, 0.1, -4.2);
        group.add(rock10);

        //set the group scaling and positioning based on what was passed into the constructor.
        group.scale.set(1.7, 1.4, 1.2);
        group.position.set(x, y, z);

        //make sure to call super!
        super("Lake", group);
    }
}