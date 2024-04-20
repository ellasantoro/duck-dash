// @ts-check

import * as T from "../libs/CS559-Three/build/three.module.js";
import { GrWorld } from "../libs/CS559-Framework/GrWorld.js";
import { GrObject } from "../libs/CS559-Framework/GrObject.js";
import * as InputHelpers from "../libs/CS559/inputHelpers.js";
let gpSize = 16;
let parentOfCanvas = document.getElementById("div1");
let world = new GrWorld({ where: parentOfCanvas, groundplanesize: gpSize });

let bumpTexture = new T.TextureLoader().load("./textures/bump.png");
bumpTexture.flipY = true;

/**
 * Class to create a brick block that just uses a normal map, not a bump map
 * image used: https://www.moddb.com/mods/scp-087-b-minecraft-edition/downloads/fixed-bricks
 */
export class Duck extends GrObject {
    constructor() {
        //create a new group since the duck will have several parts.
        let group = new T.Group();
        //create the geometries for each part of the duck: 
        let bodyGeometry = new T.SphereGeometry(0.3);
        let headGeometry = new T.SphereGeometry(0.2);
        let beakGeometry = new T.ConeGeometry(0.09, 0.2);
        let legGeometry = new T.CylinderGeometry(0.03, 0.03, 0.15);
        //create materials for the parts:
        let bodyMaterial = new T.MeshStandardMaterial({
            color: "yellow"
        })
        let beakMaterial = new T.MeshStandardMaterial({
            color: "orange"
        })
        let legMaterial = new T.MeshStandardMaterial({
            color: "#403a30"
        })
        //create the meshes for each body part:
        let body = new T.Mesh(bodyGeometry, bodyMaterial);
        let head = new T.Mesh(headGeometry, bodyMaterial);
        let beak = new T.Mesh(beakGeometry, beakMaterial);
        let leg1 = new T.Mesh(legGeometry, legMaterial);
        let leg2 = new T.Mesh(legGeometry, legMaterial);
        //place all of the duck parts relationally to each other in a way that makes sense:
        head.translateY(0.3);
        head.translateX(0.25);
        beak.rotateZ(Math.PI / 2);
        beak.rotateX(Math.PI);
        beak.translateY(0.5);
        beak.translateX(0.3);
        leg1.translateY(-0.3);
        leg1.translateZ(0.15);
        leg2.translateY(-0.3);
        leg2.translateZ(-0.15);
        //add all parts to the group:
        group.add(body);
        group.add(head);
        group.add(beak);
        group.add(leg1);
        group.add(leg2);
        super("Duck", group);
        this.previousPosition = new T.Vector3(); 
    }
}
export class Platform extends GrObject {
    constructor() {
        let geometry = new T.BoxGeometry(2, 2, 2);
        let mat = new T.MeshStandardMaterial({
            color: "#ad7658",
            roughness: 1,
            metalness: 0.8,
            side: T.DoubleSide
        });
        let mesh = new T.Mesh(geometry, mat);
        super("Platform", mesh);
    }
}

let duck = new Duck();
duck.objects[0].position.set(-1.6, 0.5, -4);
world.add(duck);

let platform = new Platform();
platform.objects[0].position.set(-3, 0.5, -8);
world.add(platform);

let light = new T.DirectionalLight("white", 3);
light.position.set(5, 10, 4);
world.scene.add(light);

let isJumping = false;
let jumpHeight = 2;
let jumpSpeed = 0.5;
let gravity = 0.5;
let jumpStartY = 0;
let velocity = new T.Vector3(0, 0, 0);
let maxVelocity = 0.2;
let friction = 1;

function onKeyDown(event) {
    switch (event.key) {
        case "w":
            velocity.z = -maxVelocity;
            duck.objects[0].rotation.y = Math.PI / 2;
            break;
        case "s":
            velocity.z = maxVelocity;
            duck.objects[0].rotation.y = -Math.PI / 2;
            break;
        case "a":
            velocity.x = -maxVelocity;
            duck.objects[0].rotation.y = Math.PI;
            break;
        case "d":
            velocity.x = maxVelocity;
            duck.objects[0].rotation.y = 0;
            break;
        case " ":
            if (!isJumping) {
                isJumping = true;
                jumpStartY = duck.objects[0].position.y;
            }
            break;
    }
}

function onKeyUp(event) {
    switch (event.key) {
        case "w":
        case "s":
            velocity.z = 0;
            break;
        case "a":
        case "d":
            velocity.x = 0;
            break;
    }
}

document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);

function checkCollision() {
    let duckBox = new T.Box3().setFromObject(duck.objects[0]);
    let platformBox = new T.Box3().setFromObject(platform.objects[0]);
    if (duckBox.intersectsBox(platformBox)) {
        duck.objects[0].position.copy(duck.previousPosition);
    }

}
function updateVelocity() {
    if (!isJumping) {
        velocity.multiplyScalar(friction);
    }

    if (Math.abs(velocity.x) < 0.01) {
        velocity.x = 0;
    }
    if (Math.abs(velocity.z) < 0.01) {
        velocity.z = 0;
    }

    duck.previousPosition.copy(duck.objects[0].position);
    duck.objects[0].position.add(velocity);

    checkCollision();

    // Check if the duck is about to fall off the platform
    if (
        duck.objects[0].position.x > gpSize || // right edge
        duck.objects[0].position.x < -gpSize|| // left edge
        duck.objects[0].position.z > gpSize || // top edge
        duck.objects[0].position.z < -gpSize // bottom edge
    ) {
        isJumping = true;
        jumpStartY = duck.objects[0].position.y;
    }
}





function updateJump() {
    if (isJumping) {
        duck.objects[0].position.y += jumpSpeed;
        if (duck.objects[0].position.y - jumpStartY >= jumpHeight) {
            isJumping = false;
        }
    } else {
        if (duck.objects[0].position.y > 0.5) {
            duck.objects[0].position.y -= gravity;
        } else {
            duck.objects[0].position.y = 0.5; // Set duck back on the ground plane
            isJumping = false;
        }
    }
}



function animate() {
    updateVelocity();
    updateJump();
    requestAnimationFrame(animate);
}
animate();
world.go();