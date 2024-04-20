// @ts-check

import * as T from "../libs/CS559-Three/build/three.module.js";
import { GrWorld } from "../libs/CS559-Framework/GrWorld.js";
import { GrObject } from "../libs/CS559-Framework/GrObject.js";
import * as InputHelpers from "../libs/CS559/inputHelpers.js";
import { RGBA_ASTC_10x10_Format } from "three";

let parentOfCanvas = document.getElementById("div1");
let world = new GrWorld({ where: parentOfCanvas });

//load the texture for the roughness map
let roughnessTexture = new T.TextureLoader().load("./textures/coin.png");

/**
 * This class creates a coin that uses a roughness map so that the details of the drawn
 * texture is shiny and looks like a coin!
 * 
 * NOTE TO GRADER: sometimes it is hard to see how shiny it is, but if you zoom in you might be
 * able to see it even better.
 * 
 * Material map use explained: I used a texture that I created in google docs drawing feature. I 
 * basically just used the circle tool, free draw tool (for the S shape), and the line tool. I made it all
 * in black with a white background so that it would work well with a roughnessMap.
 * 
 * To see the shininess, you should look at the circles and dollar sign, as it turns it shines based on where the
 * light is hitting it, which clearly demonstrates the material map.
 */
export class Coin extends GrObject {
    constructor() {
        //coin is made out of a super short cylinder (and then rotated)
        let geometry = new T.CylinderGeometry(0.5, 0.5, 0.1);
        let mat = new T.MeshStandardMaterial({
            color: "#ad7658",
            //map the roughness and set to 1 for full roughness
            roughnessMap: roughnessTexture,
            roughness: 1,
            metalness: 0.8,
            //want the texture on both sides.
            side: T.DoubleSide
        });
        let mesh = new T.Mesh(geometry, mat);
        super("Coin", mesh);

    }
}

/**
 * this function animates the coin so that it spins ccw and
 * oscillates up and down using a sin function.
 */
function animate(time) {
    coin.objects[0].rotation.y += 0.05; //this line is responsible for the rotation of the coin
    coin.objects[0].position.y = (Math.sin(time * 0.002) * 0.2) + 2.2; //oscillates the y position up and down
    requestAnimationFrame(animate);
}

let coin = new Coin();
coin.objects[0].position.set(0, 1, 0);
coin.objects[0].rotateZ(Math.PI / 2);
world.add(coin);

//create a light, it'll help us to show off that reflectivity 
let light = new T.DirectionalLight("#e3dbbc", 1);
light.position.set(1, 1, 1);
light.target = coin.objects[0];
world.scene.add(light);

//create the "star" shaped platform that the coin is floating above using two boxes.
const platformGeometry = new T.BoxGeometry(0.8, 2, 0.8);
const material = new T.MeshPhongMaterial({
    color: "#d9cdc1",
    metalness: 0.8,
    shininess: 0.3
});
const platform1 = new T.Mesh(platformGeometry, material);
const platform2 = new T.Mesh(platformGeometry, material);

platform1.position.set(0, 0.5, 0);
platform2.position.set(0, 0.5, 0);
platform2.rotateY(Math.PI / 4);

world.scene.add(platform1);
world.scene.add(platform2);
//make sure to call the animation function to animate the coin!
animate();
world.go();