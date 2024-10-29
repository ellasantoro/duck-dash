// @ts-check
/**
 * Author: Ella Santoro
 * Project Mentor: Alex Peseckis
 * 
 * - All sources are defined in the first page (introduction of my project when you open with live server).
 * - While sources are linked on the front cover, learning sources will be linked inline as well, and will have thorough 
 * explanations to demonstrate understanding.
 * - Code taken from myself / my own past classwork is likely not cited everywhere ; I have not been flagged before, so it should
 *   not prove to be an issue unless it gets flagged against my own work. Feel free to send me a message if any issues arise with that.
 */

//////////////////////////////////// IMPORTS ////////////////////////////////////
import * as T from "../libs/CS559-Three/build/three.module.js";
import { GrWorld } from "../libs/CS559-Framework/GrWorld.js";
import { GrObject } from "../libs/CS559-Framework/GrObject.js";
import { GLTFLoader } from '../libs/CS559-Three/examples/jsm/loaders/GLTFLoader.js';
import { Lake } from "./lake.js";
import { MedievalBuilding } from "./medievalbuilding.js";
//////////////////////////////////// VARIABLES  ////////////////////////////////////
//variables connecting to HTML - will be used for death screen, respawn button, and score keeping
// @ts-ignore
document.getElementById("respawnButton").onclick = respawn;
const youDiedDiv = document.getElementById("youDied");
let score = document.getElementsByClassName("scoreValue");
// @ts-ignore
youDiedDiv.style.display = "none";

//world creation variables:
let parentOfCanvas = document.getElementById("div1");
let planeSize = 13;
let world = new GrWorld({ where: parentOfCanvas, groundplanesize: planeSize });

//loader for GLTF Models used:
const loader = new GLTFLoader();

//score variables:
let scoreText1 = score[0];
let scoreText2 = score[1];
let scoreVal = 0;

//coin variables:
let coins = [];
let numCoins = 0;

//boolean movement variables:
let isJumping = false;
let isMoving = false;
let isFalling = false;
let isGrounded = true;
let isDead = false;
let isOnBox = false;

//textures & images:
let roughnessTexture = new T.TextureLoader().load("./textures/coin.png");
let crateTexture = new T.TextureLoader().load("./images/crate.png");
let wood = new T.TextureLoader().load("./images/wood.jpg");

//jump/walk variables:
let jumpHeight = 2.2;
let jumpSpeed = 0.7;
let gravity = 0.1;
let jumpStartY = 0;
let velocity = new T.Vector3(0, 0, 0);
let maxVelocity = 0.2;
let friction = 0.999;

//////////////////////////////////// OBJECT CLASSES ////////////////////////////////////
/**
 * This class creates the duck sprite by loading in a GLTF model. it's initial positions, scales, and rotations
 * are set in preparation for animation.
 */
class Duck extends GrObject {
    constructor() {
        let group = new T.Group();
        const loader = new GLTFLoader();
        loader.load('./model/duck/scene.gltf', function (gltf) {
            const model = gltf.scene;
            model.rotateY(Math.PI / 2);
            model.getObjectByName("MarineLLeg1_01").scale.set(0.8, 0.8, 0.8);
            model.getObjectByName("MarineRLeg1_08").scale.set(0.8, 0.8, 0.8);
            model.scale.set(0.8, 0.8, 0.8);
            model.position.set(0, -0.6, 0);
            group.add(model);
        });

        super("Duck", group);

        //variable that will be used for tracking where the duck's previous position is, this will help us to quickly teleport
        //the duck back to its previous position if its colliding into something. User wont see this explicit "teleport" it'll just
        //look like it is disallowed from entering a certain area.
        this.previousPosition = new T.Vector3();

    }
}

/**
 * This class creates the tree object for my game. It uses a GLTF model, and it accesses the material color so we can choose what tree 
 * color we want. it has a constructor so that we can set the position and scaling as well. 
 */
class Tree {
    constructor(x, y, z, color, scale) {
        let group = new T.Group();
        loader.load('./model/tree/scene.gltf', function (gltf) {
            const model = gltf.scene;
            //traverses the model GLTF file and finds every single thing in the file
            //that is a mesh, then it access that specific child and alters the material.color and sets the hex to the color
            //passed in
            model.traverse(function (child) {
                if (child.isMesh) {
                    child.material.color.setHex(color);
                }
            });
            model.position.set(0, 0, 0);
            group.add(model);
        });
        //create the trunk - didn't want to use the model's trunk so I make my own instead with wood texture and my
        //preferred color.
        let trunkGeometry = new T.CylinderGeometry(0.1, 0.3, 8);
        let trunkMaterial = new T.MeshStandardMaterial({
            color: "#785337",
            bumpMap: wood,
            bumpScale: 50,
        });
        let trunkMesh = new T.Mesh(trunkGeometry, trunkMaterial);
        trunkMesh.position.set(0, 4, 0);
        group.add(trunkMesh);
        let tipGeometry = new T.CylinderGeometry(0.08, 0.02, 2.2);
        let tipMaterial = new T.MeshStandardMaterial({
            color: "#224722",
        });
        let tipMesh = new T.Mesh(tipGeometry, tipMaterial);
        tipMesh.position.set(0, 8, 0);
        group.add(tipMesh);

        group.position.set(x, y, z);
        group.scale.set(scale, scale, scale);
        world.scene.add(group);
    }
}

/**
 * This class creates the dog sprite for my game. It uses a GLTF model and is loaded using a GLTF loader in CS559 framework
 * Position and scaling is set in preparation for animation.
 */
class Dog extends GrObject {
    constructor() {
        let group = new T.Group();
        loader.load('./model/dog/scene.gltf', function (gltf) {
            const model = gltf.scene;
            model.position.set(0, -0.6, 0);
            model.scale.set(1.25, 1.25, 1.25);
            group.add(model);
        });

        super("Dog", group);
    }
}

/**
 * This class creates the crates for my game world. The duck will be able to jump on top of these. (referred to as "platforms" in my outline)
 */
export class Crate extends GrObject {
    constructor() {
        let geometry = new T.BoxGeometry(1.6, 1.6, 1.6);
        let mat = new T.MeshPhongMaterial({
            color: "#a87d56",
            map: crateTexture,
            bumpMap: crateTexture,
            bumpScale: 5,
            specular: "#6b5642",
            shininess: 2,
            side: T.DoubleSide
        });
        let mesh = new T.Mesh(geometry, mat);
        super("Platform", mesh);
    }
}

/**
 * This class creates the coin objects for my game world. we will create several of these randomly later. It has a roughness map so that the coin looks shiny
 * as it spins around (animation does not use stepWorld because of the way we have to generate them - ran into issues trying to use stepworld with that).
 */
export class Coin extends GrObject {
    constructor(x, y, z) {
        let geometry = new T.CylinderGeometry(0.5, 0.5, 0.1);
        let mat = new T.MeshStandardMaterial({
            color: "#edb337",
            roughnessMap: roughnessTexture,
            roughness: 1,
            metalness: 0.8,
            side: T.DoubleSide
        });
        let mesh = new T.Mesh(geometry, mat);
        mesh.position.set(x, y, z);
        super("Coin", mesh);

    }

}

//////////////////////////////////// CREATING ALL OBJECTS USING OBJECT CLASSES ////////////////////////////////////
//CREATING ALL OBJECTS:
//DUCK:
let duck = new Duck();
duck.objects[0].position.set(5, 0.5, 5);
world.add(duck);

//DOG:
let dog = new Dog();
dog.objects[0].position.set(-10, 0.5, -5);
world.add(dog);

//CRATES:
let crate = new Crate();
crate.objects[0].position.set(2, 0.8, -8);
//these platform boxes within the crate creation are basically boxes around the crate and we will use
//them with the intersectsBox function for three boxes, and it will help us with collision-handling for the duck.
let platformBox = new T.Box3().setFromObject(crate.objects[0]);
world.add(crate);

let crate2 = new Crate();
crate2.objects[0].position.set(-2, 0.8, -8);
let platformBox2 = new T.Box3().setFromObject(crate2.objects[0]);
world.add(crate2);

let crate2Stacked = new Crate();
crate2Stacked.objects[0].position.set(-2, 2.2, -8);
let platformBox3 = new T.Box3().setFromObject(crate2Stacked.objects[0]);
world.add(crate2Stacked);

let crate3 = new Crate();
crate3.objects[0].position.set(-9, 0.8, -1);
let platformBox4 = new T.Box3().setFromObject(crate3.objects[0]);
world.add(crate3);

let crate3Stacked = new Crate();
crate3Stacked.objects[0].position.set(-9, 2.2, -1);
let platformBox5 = new T.Box3().setFromObject(crate3Stacked.objects[0]);
world.add(crate3Stacked);

let crate4 = new Crate();
crate4.objects[0].position.set(-12, 0.8, 2);
let platformBox6 = new T.Box3().setFromObject(crate4.objects[0]);
world.add(crate4);

let crate5 = new Crate();
crate5.objects[0].position.set(11, 0.8, 3.5);
let platformBox7 = new T.Box3().setFromObject(crate5.objects[0]);
world.add(crate5);

let crate5Stacked = new Crate();
crate5Stacked.objects[0].position.set(11, 2.2, 3.5);
let platformBox8 = new T.Box3().setFromObject(crate5Stacked.objects[0]);
world.add(crate5Stacked);

let crate5StackedTwice = new Crate();
crate5StackedTwice.objects[0].position.set(11, 3.6, 3.5);
let platformBox9 = new T.Box3().setFromObject(crate5StackedTwice.objects[0]);
world.add(crate5StackedTwice);

let crate6 = new Crate();
crate6.objects[0].position.set(9, 0.8, 8);
let platformBox10 = new T.Box3().setFromObject(crate6.objects[0]);
world.add(crate6);

let crate6Stacked = new Crate();
crate6Stacked.objects[0].position.set(9, 2.2, 8);
let platformBox11 = new T.Box3().setFromObject(crate6Stacked.objects[0]);
world.add(crate6Stacked);

let crate7 = new Crate();
crate7.objects[0].position.set(6, 0.8, 10);
let platformBox12 = new T.Box3().setFromObject(crate7.objects[0]);
world.add(crate7);

//BUILDINGS: (same thing here as the crates with the buildingbox)
let building1 = new MedievalBuilding(-10, 0.2, -10, Math.PI / 4, 1, 1, 1, "brown");
let building1Box = new T.Box3().setFromObject(building1.objects[0]);
world.add(building1);

let building2 = new MedievalBuilding(5.5, 0.2, -10, Math.PI / 2, 0.6, 0.8, 1, "#915e2f");
let building2Box = new T.Box3().setFromObject(building2.objects[0]).expandByScalar(0.09);
world.add(building2);

//LAKE:
let lake = new Lake(5.5, 0.1, -5);
lake.objects[0].rotateY(-Math.PI / 8);
lake.objects[0].scale.set(0.8, 0.8, 0.8);
world.add(lake);

//TREES:
world.scene.add(new Tree(12, 0, 10, 0x2b4f2f, 0.8));
world.scene.add(new Tree(10, 0, 12, 0x2b5724, 0.6));
world.scene.add(new Tree(-12, 0, -7, 0x2b5724, 0.8));
world.scene.add(new Tree(-11, 0, -6, 0x233d1f, 0.5));
world.scene.add(new Tree(12, 0, -12, 0x2b5724, 1.2));
world.scene.add(new Tree(10, 0, -11, 0x233d1f, 0.8));
world.scene.add(new Tree(0, 0, -11, 0x233d1f, 0.8));
world.scene.add(new Tree(-10, 0, 12, 0x233d1f, 0.8));
world.scene.add(new Tree(-12, 0, 11, 0x2b5724, 1));

//LIGHTING:
let light = new T.DirectionalLight("white", 3);
light.position.set(5, 10, 4);
world.scene.add(light);

let ambientLight = new T.AmbientLight(0x404040, 5);
world.scene.add(ambientLight);

//SKYBOX:
let environmentmap = [
    './images/px.png',
    './images/nx.png',
    './images/py.png',
    './images/ny.png',
    './images/pz.png',
    './images/nz.png'
];

//create the texture loader, use the above environment map array of images.
let textureLoader = new T.CubeTextureLoader();
let skybox = textureLoader.load(environmentmap);

//set the scene to the skybox we created
world.scene.background = skybox;

//////////////////////////////////// ANIMATION ////////////////////////////////////
/**
 * the MAIN animation function - we have other animation functions that are CALLED here, and we will pass in delta values
 * if necessary from the main function to the sub-functions.
 * 
 * Note: the other animation functions can be found below this function in the order that they are listed here in case that helps
 * you navigate to different functions.
 * @param {*} delta 
 */
function animate(delta) {
    //duck & dog movements:
    animateDuckLegs(delta);
    animateDogLegs(delta);
    updateDogPosition(dog, duck);
    updateDogRotation();
    updateVelocity();
    updateJump();

    //coin animations:
    checkCoinCollection(duck);
    animateCoins(delta);

    //this code was super short so I didn't want to make a whole function for it, it basically checks if the duck is on the ground
    //or not, we use this to prevent double jumping later. The flag just needs to be constantly set, so that's why its in an animation function.
    if (duck.objects[0].position.y <= 0.5) {
        isGrounded = true;

    } else {
        isGrounded = false;
    }
    //make sure to call the animation frame repeatedly so that all of these functions will repeatedly be called as well!
    requestAnimationFrame(animate);

}

/**
 * This function is responsible for the duck walking animation - it will only rotate the legs from the GLTF model when the user is actually
 * moving the duck. We know whether or not the duck is moving based on the isMoving flag that is set in the keyDown function (and updated in
 * the keyUp function)
 * 
 * @param {*} delta 
 */
function animateDuckLegs(delta) {
    //if the isMoving flag is set to true, then we know the user is moving the duck, so we should animate its legs
    if (isMoving) {
        //variables for calculations:
        const walkSpeed = 2;
        const rotAmplitude = Math.PI / 10;

        //finding the nodes in the GLTF file. Basically, I googled how to do this, and found this forum (https://discourse.threejs.org/t/accessing-gltf-nodes-by-name/22378),
        //along with other subdiscussions under that. It gave me this function getObjectByName, and it helped me know what to look for. I went into the scene.GLTF function, and
        //used command-f to search for leg. I had to test a few things but eventually gained access to the right thing. Then I just saved it to these right and left leg
        //variables for convenience.
        let leftLegNode = duck.objects[0].getObjectByName("MarineLLeg1_01");
        let rightLegNode = duck.objects[0].getObjectByName("MarineRLeg1_08");

        //rotate the legs using our variables defined above and using a function of time (delta), sin will oscillate the legs back and forth
        //we need to negate one of the legs because legs dont move the same direction at the same time, so it should be opposite movements to
        //create a walking movement.
        const leftLegWalk = rotAmplitude * Math.sin(delta / 100 * walkSpeed);
        const rightLegWalk = -rotAmplitude * Math.sin(delta / 100 * walkSpeed);

        //apply the rotations - had to use the if()'s because it kept throwing errors, probably because "possibly null", so using this format
        //is what helped me fix it. Inside of them, we just add the calculated rotations to the leg node Z rotation.
        if (leftLegNode) {
            leftLegNode.rotation.z += leftLegWalk;
        }
        if (rightLegNode) {
            rightLegNode.rotation.z += rightLegWalk;
        }
    }
}

/**
 * This function animates the dog legs. It differs from the duck because the duck only animates legs when the user moves it. The dog will always be moving,
 * and thus always needs to have the animated legs.
 */
function animateDogLegs(delta) {
    //as with the duck, create variables that we can use in our calculation.
    const walkSpeed = 2.5;
    const rotAmplitude = Math.PI / 20;

    //again, similar to the duck, we need to extract the nodes from the GLTF file so we can use them here to animate 
    //used the same process to find the correct node, had to do a lot of trial and error for these, there are LOTS of nodes with leg in the 
    //title in the dog GLTF file, but eventually found that the hip portion is what can help me to rotate during animation.
    let leftBackLegNode = dog.objects[0].getObjectByName("Dog_r_HindLeg_HipSHJnt_38");
    let rightBackLegNode = dog.objects[0].getObjectByName("Dog_l_HindLeg_HipSHJnt_32");

    //calculate the animation movement using our variables above (same format as the duck oscillations, just different values in the variables)
    //see explanation in animateDuckLegs for why we negate.
    const leftLegWalk = rotAmplitude * Math.sin(delta / 100 * walkSpeed);
    const rightLegWalk = -rotAmplitude * Math.sin(delta / 100 * walkSpeed);

    //repeat same process, the dog has four legs so we need to do all 4. see explanations above for how to find these nodes.
    let leftFrontLegNode = dog.objects[0].getObjectByName("Dog_l_FrontLeg_HipSHJnt_4");
    let rightFrontLegNode = dog.objects[0].getObjectByName("Dog_r_FrontLeg_HipSHJnt_10");

    //see duck explanation for why I needed to use these if statements before adding the rotations.
    //the legs on the left side of the dog's body should be moving in the same direction, and same with the
    //legs on the right side of the dog's body. the left side should be moving in opposite direction from the right side,
    //which is what is demonstrated in the code below.
    if (leftBackLegNode) {
        leftBackLegNode.rotation.y += leftLegWalk;
    }
    if (rightBackLegNode) {
        rightBackLegNode.rotation.y += rightLegWalk;
    }

    if (leftFrontLegNode) {
        leftFrontLegNode.rotation.x += leftLegWalk;
    }
    if (rightFrontLegNode) {
        rightFrontLegNode.rotation.x += rightLegWalk;
    }

}

/**
 * Function to animate the dog's position
 * 
 * @param {*} dog 
 * @param {*} duck 
 */
function updateDogPosition(dog, duck) {
    //create variables we will use in calculations
    let dogSpeed = 0.08;

    let dogPosition = dog.objects[0].position;
    //use a direction vector for the duck's position (we will need this to figure out which way the dog should be moving since
    //the dog is following the user-controlled duck). I didn't want to take into account the duck's y position because then the dog
    // starts floating up to the duck when the duck jumps onto crates and stuff, which I didn't want. So instead, we just create a simple
    //vector3 that takes in the duck's x and y pos for the x and y params, and just a simple 0.5 (ground level for the dog/duck) for the y.
    let duckPosition = new T.Vector3(duck.objects[0].position.x, 0.5, duck.objects[0].position.z);

    //now we can calculate the direction vector using our previously created duck vector, and the dog's current position, this will help us
    //to make the dog move to the right direction so that it follows the duck.

    //create the new vector, and then use subVectors() which will calculate the vector from the dog's current position to the duck's current position
    //by subtracting the dogs coordinates from the duck's cordinates. Then we have to make sure to normalize this vector so that it turns into a unit vector,
    //if we didn't do this, then it would not preserve the direction / distance / speed.
    //Please note that I had to google how to use the direction vector, and I found these functions at the following links:
    //https://stackoverflow.com/questions/40488945/get-direction-between-two-3d-vectors-using-three-js
    //https://threejs.org/docs/#api/en/math/Vector3.subVectors
    let direction = new T.Vector3();
    direction.subVectors(duckPosition, dogPosition);
    direction.normalize();

    //finally, we will just multiply direction by speed (we just use the multiplyScalar function, as I've learned from how to create the boxes 
    //in three.js (expandByScalar, multiplyByScalar, etc)).
    //and then of course we add the direction to the dog position (instead of having to do each x,y,z dog position added to each x,y,z direction,
    //we can actually just use the add function, also in three's docs linked above). Adding it is what actually updates the dog's position.
    direction.multiplyScalar(dogSpeed);
    dogPosition.add(direction);
}

/**
 * This function updates the dog's rotation, so that it is facing the direction that it is moving.
 */
function updateDogRotation() {
    //use variables for dog and duck current position for convenience, so we don't have to type the whole thing out every time.
    let dogPosition = dog.objects[0].position;
    let duckPosition = duck.objects[0].position;

    //see explanations above for subvectors and direction in the updateDogPosition function, we do the same thing here.
    let direction = new T.Vector3();
    direction.subVectors(duckPosition, dogPosition);

    //now we can calculate the target angle / how much we need to rotate by by using atan2. we will use
    //the vector we just calculated above (which is the direction vector). atan2 returns the angle between the x-axis
    //and the point x,y. We use x and z from direction vector because it gives us the angle in the horizontal plane, and thats how
    //we want the dog to rotate, not in any other way. this targetAngle is actually how we make the dog face the right way (once
    //we apply it of course!)
    let targetAngle = Math.atan2(direction.x, direction.z);


    //now we can get the current angle of the dog as we prepare to rotate the dog from its current angle to its
    //new target angle (this will help for convenience and for code readability).
    let currAngle = dog.objects[0].rotation.y;

    //the following code helps the dog to turn smoothly, if the dog's needed rotation is greater than PI,
    //then that means the amount we have to rotate is more than 180 degrees, meaning the other direction would be less than 180 degrees,
    // so we should subtract 2PI to wrap around, this will find the shorter path (it makes for a less awkward looking turn)
    let neededRotation = targetAngle - currAngle;
    if (neededRotation > Math.PI) {
        neededRotation -= 2 * Math.PI;
        //and similarly, if its less than -Math.PI, it has to again rotate more than 180, and it isn't the shortest path so we need to do the
        //opposite of above and add 2PI to wrap around and make the path shorter.
    } else if (neededRotation < -Math.PI) {
        neededRotation += 2 * Math.PI;
    }

    //now we just need to apply the above calculations and take into account speed (i chose 0.1), and then of course apply the angle to the y rotation of the dog!
    let rotationChange = neededRotation * 0.1;
    dog.objects[0].rotation.y = currAngle + rotationChange;
}

/**
 * This function updates the duck's velocity (its actually what moves the duck when the user keys down. in the key down fucntion we update what the velocity is,
 * and in the main animation function we are constantly calling updateVelocity, so that is why position is updated here) - it basically has some edge cases, and 
 * has to take into account friction (over time), it also updates position, abd checks for collisions since we are changing position, we always
 * have to check if we are colliding with something if position is being altered.
 */
function updateVelocity() {
    //add friction  - multiplying by a scalar affects speed, so this fricton variable will determine how much its slowing down over time when changes are made,
    //like the duck changes direction or is starting/finishing a movement. It helps with smoother animation and with movement "realism" if you could call it that!
    velocity.multiplyScalar(friction);

    //update position based on velocity (see function header for explanation)
    duck.previousPosition.copy(duck.objects[0].position);
    duck.objects[0].position.add(velocity);

    //as mentioned in header, whenever we're updating position we HAVE to check for collisions based on the new position, or else collisions might be
    //handled late, or worse, not at all.
    checkCollision();

    //ensure that the duck can only walk on the plane and not walk on air when it goes out of the plane boundaries. we won't actually make the duck start falling here,
    //but we will set the isFalling flag to true and handle it somewhere else.
    if (
        duck.objects[0].position.x > planeSize ||
        duck.objects[0].position.x < -planeSize ||
        duck.objects[0].position.z > planeSize ||
        duck.objects[0].position.z < -planeSize
    ) {
        isFalling = true;
        //we also set the starting jump Y position here because we will need to know where the jump (if user tries to jump) should start. we will use this later,
        //and it will help us in ensuring that the duck can jump appropriately (i.e. not jump too high, not double jump unless explicitly permitted like if its near a tall
        //stack of crates, etc.)
        jumpStartY = duck.objects[0].position.y;
    }
}

/**
 * this function will handle the jumping and falling motions and flags for the duck.
 */
function updateJump() {
    //if the duck is jumping, we need to increase its y until it reaches the jump height. we have to check for
    //is falling here too because i noticed if you're falling off the platform but hit the space bar, the duck floats up to
    //infinity, so we need to make sure to only have jump functionality if the duck is NOT falling.
    if (isJumping && !isFalling) {
        //increase y pos based on jump speed we defined in the start of the file. make sure it doesnt go past jumpHeight, and if it does,
        //set the isJumping flag to false so that it won't increase y position anymore. 
        duck.objects[0].position.y += jumpSpeed;
        if (duck.objects[0].position.y - jumpStartY >= jumpHeight) {
            isJumping = false;
        }
        //if its not jumping, then we will deal with the isFalling condition.
    } else if (isFalling) {
        //if its falling, we want it to fall off of the platform, i just used the same speed as jump speed, but it doesn't need to be.
        duck.objects[0].position.y -= jumpSpeed;
        //the following code is responsible for how long the duck falls for before returning to its spawn position. this isn't actually going to kill the
        //duck, it will just decrement score and respawn it automatically.
        //so i chose for the duck to fall until y=-30 because i liked the amount of time it took.
        if (duck.objects[0].position.y < -30) {
            //now we will update score. falling off will decrement your score by 2, but there are no negative points in my game,
            //so we will only decrement score by 2 if it has a value of >=2 already. if it has 1 point, then we will just set to 0, and otherwise,
            //it'll just be 0 and we dont need to change anything.
            if (scoreVal >= 2) {
                scoreVal -= 2;
            } else if (scoreVal == 1) {
                scoreVal = 0;
            }
            //make sure to update the HTML to reflect the score:
            scoreText1.innerText = "" + scoreVal;
            scoreText2.innerText = "" + scoreVal;

            //respawn the duck by the lake
            duck.objects[0].position.set(5, 0.5, 0);
        }
        //make sure to set isFalling flag to false once we've completed the entire falling motion.
        isFalling = false;
        //if its not falling or jumping, but the y position is greater than 0.5, then we want it to be falling off of a crate
        //if it's actually ON a crate, it wont be affected because of the way being on the crate is handled. if the duck is at a y
        //position less than 0.5, then we can just ensure its grounded by setting it to 0.5, and for safety make isJumping set to false!
    } else {
        if (duck.objects[0].position.y > 0.5) {
            duck.objects[0].position.y -= gravity;
        } else {
            duck.objects[0].position.y = 0.5;
            isJumping = false;
        }
    }
}

/**
 * This function checks if a coin has been collected by the duck (or should have been), and then updates the world by
 * removing the coin from the world and incrementing score. 
 * 
 * @param {*} duck 
 */
function checkCoinCollection(duck) {
    //for loop to ensure we are checking for every coin that is in the world.
    for (let i = 0; i < coins.length; i++) {
        //this box method is used throughout the entire project. as mentioned in other sections, it creates a box around the object,
        //and we can use it with the function intersectsBox to see if objects' boxes are intersecting each other. This can be very helpful for
        //collisions. I noticed that the coins were VERY hard to pick up because of how small their boxes were, so I decided to expand it by a scalar
        //using the expandByScalar function (found in THREE docs), so that the box is bigger and can more easily be collided with. 
        let coinBox = new T.Box3().setFromObject(coins[i].objects[0]).expandByScalar(0.8);
        //make a duckbox too so we can see if these two are intersecting each other.
        const duckBox = new T.Box3().setFromObject(duck.objects[0]);

        //now lets use our boxes and check if they are intersecting each other!
        if (duckBox.intersectsBox(coinBox)) {
            //if the two are intersecting, we want to remove the specific coin we identified from the world as we want it to be collected.
            world.scene.remove(coins[i].objects[0]);
            //then we want to update our numCoins variable because we use it to identify how many coins are currently in the world. i have implemented
            //a maximum number of coins that can be in the world at one time, so ensuring this variable is up to date is crucial.
            numCoins--;
            //along with removing from the world, we want to remove from the list as well so it isn't accidentally identified and so it doesnt crowd up the list
            coins.splice(i, 1);
            //increment the score since we've collected a coin, and make sure to update the HTML so it reflects the correct score.
            scoreVal++;
            scoreText1.innerText = "" + scoreVal;
            scoreText2.innerText = "" + scoreVal;
        }
    }
}

/**
 * Function to animate the coins so they are oscillating up and down and rotating around like spinning coins.
 * 
 * @param {*} delta 
 */
function animateCoins(delta) {
    //do the animation for every coin in the world
    for (let i = 0; i < coins.length; i++) {
        //rotate the coin by its y rotation, and oscillate up and down using sin and a function of time.
        coins[i].objects[0].rotation.y += 0.05;
        coins[i].objects[0].position.y += Math.sin(delta * 0.002) * 0.01;
    }
}

/**
 * This function helps to respawn the whole world after a death has occured and the user clicks the respawn button. it gets called when the user
 * clicks the button, which you can see at the very top of the file. 
 */
function respawn() {
    //get rid of the you died screen
    //@ts-ignore
    youDiedDiv.style.display = "none";
    //reset camera, duck, and dog positions
    world.camera.position.set(6.5, 13, 26);
    duck.objects[0].position.set(5, 0.5, 5);
    dog.objects[0].position.set(-10, 0.5, -5);
    //reset the score variable and the HTML that shows the score.
    scoreVal = 0;
    scoreText1.innerText = "" + scoreVal;
    scoreText2.innerText = "" + scoreVal;
    //remove all the coins if any have spawned while the user was dead
    for (let i = 0; i < coins.length; i++) {
        world.scene.remove(coins[i].objects[0]);
    }
    //update the isDead flag
    isDead = false;

}

/**
 * This function handles the collisions between the duck and crates/buildings
 */
function checkCollision() {
    const duckBox = new T.Box3().setFromObject(duck.objects[0]);
    //expand the box only in specific dimensions
    const expansionVector = new T.Vector3(0.5, 0.05, 0.8);
    duckBox.expandByVector(expansionVector);
    //if the duck intersects one of the boxes, we should set the onBox flag to true, and we should use the position.copy method and the variable we defined in the duck class
    //to ensure the duck does not go inside of the crate (see more explanation in the duck class when i make the previous position variable).
    if (duckBox.intersectsBox(platformBox) || duckBox.intersectsBox(platformBox2) || duckBox.intersectsBox(platformBox3) || duckBox.intersectsBox(platformBox4) || duckBox.intersectsBox(platformBox5) || duckBox.intersectsBox(platformBox6) || duckBox.intersectsBox(platformBox7) || duckBox.intersectsBox(platformBox8) || duckBox.intersectsBox(platformBox9) || duckBox.intersectsBox(platformBox10) || duckBox.intersectsBox(platformBox11) || duckBox.intersectsBox(platformBox12)) {
        duck.objects[0].position.copy(duck.previousPosition);
        isOnBox = true;
        //if the duck is on the tier one crates (no stacks), then we want the duck to be at the y position 2.5
    } else if ((duck.objects[0].position.x >= 1.3 && duck.objects[0].position.x <= 3.3 && duck.objects[0].position.z >= -9.3 && duck.objects[0].position.z <= -6.7) ||
        (duck.objects[0].position.x >= -12.7 && duck.objects[0].position.x <= -10.7 && duck.objects[0].position.z >= 0.7 && duck.objects[0].position.z <= 3.3) ||
        (duck.objects[0].position.x >= 5.3 && duck.objects[0].position.x <= 7.3 && duck.objects[0].position.z >= 8.7 && duck.objects[0].position.z <= 11.3)) {
        //the reason why we use max is to take into account the duck might be jumping, and we want the duck to be able to jump off of the platform and not just be "capped"
        //at these heights.
        duck.objects[0].position.y = Math.max(2.4, duck.objects[0].position.y);

        //if the duck is on a small stack of crates, we want the y position to be at 3.8
    } else if ((duck.objects[0].position.x >= -3.3 && duck.objects[0].position.x <= -1.2 && duck.objects[0].position.z >= -9.3 && duck.objects[0].position.z <= -6.7) ||
        (duck.objects[0].position.x >= -9.7 && duck.objects[0].position.x <= -7.7 && duck.objects[0].position.z >= -2.3 && duck.objects[0].position.z <= 0.3) ||
        (duck.objects[0].position.x >= 8 && duck.objects[0].position.x <= 10.3 && duck.objects[0].position.z >= 6.6 && duck.objects[0].position.z <= 9.5)) {

        duck.objects[0].position.y = Math.max(3.8, duck.objects[0].position.y);

        //if the duck is on a tall stack of crates, we want the y position to be at 5.2
    } else if ((duck.objects[0].position.x >= 10.1 && duck.objects[0].position.x <= 12.3 && duck.objects[0].position.z >= 2.2 && duck.objects[0].position.z <= 4.1)) {
        duck.objects[0].position.y = Math.max(5.2, duck.objects[0].position.y);

        //if its none of these, we know the duck is not on a box, so we should set the appropriate flag just in case it isn't already set.
    } else {
        isOnBox = false;
    }

    //collision handling for the duck and the buildings (we made the building boxes when we made the buildings). same thing as above.
    if (duckBox.intersectsBox(building1Box) || duckBox.intersectsBox(building2Box)) {
        //preventing the duck from going inside of the building:
        duck.objects[0].position.copy(duck.previousPosition);
    }

    //checking for if the duck is colliding with the dog. simply used position for this as I found the boxes were finicky. used a tolerance for 0.2 so the collision trigger
    //isn't too sensitive. make sure to take into account x and z position (didn't want to take into account y position if it was above 2.5, i.e. the dog cant eat the duck if its on a crate of stack 2 or higher)
    if (Math.abs(duck.objects[0].position.x - dog.objects[0].position.x) <= 0.6 && Math.abs(duck.objects[0].position.z - dog.objects[0].position.z) <= 0.5 && duck.objects[0].position.y <= 2.5) {
        //if the collision happens, the duck has died, and we should display the you died message.
        isDead = true;
        displayYouDiedMessage();
    }

}

/**
 * Function to display the ending screen.
 */
function displayYouDiedMessage() {
    //check the isDead flag that will be set to true if the duck and dog collide. we need this because we will continously call this function until respawn is hit
    if (isDead === true) {
        //if this is the case, we want to set the style to be visible (before the display style was none)
        //@ts-ignore
        youDiedDiv.style.display = "block";
        //this makes the camera fall down below the whole world for a cool ending screen effect. the world doesn't actually stop - but see the respawn
        //function to see how new games are created. i could do world.stop() or anything like that with the GR function, so this was my work around.
        world.camera.position.set(world.camera.position.x, world.camera.position.y - 0.05, world.camera.position.z + 0.05);
        //continuously call this function so that the above line of code looks like its actually falling and doesn't just do one iteration of camera positional changes.
        //it will stop calling once isDead is set to false, which happens in the respawn function when respawn is clicked.
        requestAnimationFrame(displayYouDiedMessage);
    }
}

/**
 * This function generates coins onto the platform in random positions for the duck to collect - maximum 7 coins at a time in the world.
*/
//setTimeout is like an alarm that will call the function given every x amount of settings, x being an amount of time you pass in. that is all I had
//previously (which does work, just wasn't exactly what i wanted). this version sets the timer with my value 4000 that I had before, but it also uses Math.random() * 1000,
//which gives the timer an extra delay of a random number anywhere between 0 and 1000 milliseconds. this makes the coin spawning more random, but still controlled since its a
//small interval.
setTimeout(() => { setInterval(generateRandomCoin, 4000); }, Math.random() * 1000);
function generateRandomCoin() {
    //create random positions for the coin, but make sure its within bounds so that it only lands on the plane, otherwise they would just be floating
    //in the sky.
    let x = Math.random() * (planeSize * 2) - planeSize;
    let z = Math.random() * (planeSize * 2) - planeSize;
    //y is default 0, unless it lands on a crate, then it will be the height of the crate.
    let y = 0;
    //only add the coins if there are less than or equal to 6 coins on the plane, this means that there can only be a max of 7 coins
    //in the world at a time.
    if (numCoins <= 6) {
        //the following if statements will properly set the y position by determining whether its in a crate's space or not.
        if (Math.abs(x - crate.objects[0].position.x) <= 1 && Math.abs(z - crate.objects[0].position.z) <= 1) {
            y = 2;
        } else {
            y = 0.8
        }
        if (Math.abs(x - crate2Stacked.objects[0].position.x) <= 1 && Math.abs(z - crate2Stacked.objects[0].position.z) <= 1) {
            y = 4;
        } else {
            y = 0.8
        }
        //now we have all the values we need, and we know that there are <= 6 coins on the plane, so we can go ahead and add our new coin
        //to the list (which we use later for deleting the coin from the world if its collected), and of course add to the world too! We also
        //need to update the numCoins tracker variable because we use it to make sure we only have 7 or less coins at one time (it floods the plane 
        //with coins otherwise).
        let newCoin = new Coin(x, y, z);
        newCoin.objects[0].rotateZ(Math.PI / 2);
        numCoins++;
        coins.push(newCoin);
        world.add(newCoin);
    }
}

/**
 * This event function tracks if the user presses the WASD / space keys and reacts accordingly
 * 
 * @param {*} event 
 */
function onKeyDown(event) {
    switch (event.key) {
        //if w is pressed, we want the velocity to move backwards on the z plane, and we want the duck
        //to face the right direction so we set the rotation. we also set the isMoving flag to true
        case "w":
            velocity.z = -maxVelocity;
            duck.objects[0].rotation.y = Math.PI / 2;
            isMoving = true;
            break;

        //if s is pressed, we want the velocity to move forwards on the z plane, and we want the duck
        //to face the right direction so we set the rotation. we also set the isMoving flag to true
        case "s":
            velocity.z = maxVelocity;
            duck.objects[0].rotation.y = -Math.PI / 2;
            isMoving = true;
            break;

        //if a is pressed, we want the velocity to move negatively on the x plane, and we want the duck
        //to face the right direction so we set the rotation. we also set the isMoving flag to true
        case "a":
            velocity.x = -maxVelocity;
            duck.objects[0].rotation.y = Math.PI;
            isMoving = true;
            break;

        //if d is pressed, we want the velocity to move positively on the x plane, and we want the duck
        //to face the right direction so we set the rotation. we also set the isMoving flag to true
        case "d":
            velocity.x = maxVelocity;
            duck.objects[0].rotation.y = 0;
            isMoving = true;
            break;

        //if space is pressed, we want to set the isJumping flag to true, but we only want to do so if we 
        //know that the duck isnt already jumping, and that its either grounded or on a box because we want to
        //disallow double jumps because then the user can just always avoid the dog by just flying wherever they want.
        case " ":
            if (!isJumping && (isGrounded || isOnBox)) {
                isJumping = true;
                jumpStartY = duck.objects[0].position.y;
            }
            break;
    }
}

/**
 * this event function handles functionality for if a user lifts their finger off of a key
 * 
 * @param {*} event 
 */
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

    //if the velocities are zero then its not moving, so we can set the isMoving flag to fall, which is used in other
    //parts of this project.
    if (velocity.x === 0 && velocity.z === 0) {
        isMoving = false;
    }
}


//function to make the dog jump backwards if you click on it
function makeDogJumpBack() {
    //creating a raycaster and mouse vector - could not get anything to work until i found raycaster on this forum
    //https://stackoverflow.com/questions/70455746/three-js-click-event-with-raycaster-and-perspective-camera
    const raycaster = new T.Raycaster();
    const mouse = new T.Vector2();

    //defining an onclick event function for when the dog gets clicked on
    function onClick(event) {
        //the positions of the mouse, basically takes the client X and Y and determines its relative position
        //based on the entire screen (not 2d though, so we use renderer instead)
        mouse.x = (event.clientX / world.renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / world.renderer.domElement.clientHeight) * 2 + 1;

        //taken from the forum, set from camera allows you to set the ray from the camera position and the mouse coordinates
        raycaster.setFromCamera(mouse, world.camera);
        //this line of code (also from forum, adjusted for my use) determines what the raycaster intersects - it computes the intersections
        //we are using the dog object and we set the recursive flag to true which basically checks all the child objects in the object given.
        //i dont think it really matters here because its a model, but im not sure so i just left it as true.
        const intersects = raycaster.intersectObjects([dog.objects[0]], true);

        //now if the intersects is > 0 that means that we have intersected the dog, and we can do our desired action
        if (intersects.length > 0) {
            //the following lines of code determines which direction we should move because we want the dog to move backwards,
            //but depending on the direction we are travelling in, the "backwards" direction could mean different things.
            //create a vector along the z axis - positive or negative will determine whether the dog jumps forwards or backwards. -1
            //is backward. 
            const backward = new T.Vector3(0, 0, -1);
            //now we use the applyQuaternion function, i couldnt get it to nicely move backward, and apparently its because the eulers
            //angles suffer when we try and just do it with normal rotation calculations
            //learned how to do it here: https://discourse.threejs.org/t/move-object-in-direction-indicated-by-a-vector/44722
            //learned about quaternions: https://eater.net/quaternions/
            //basically quaternions are a construct that use complex numbers. the thing is, we know complex numbers as 
            //xi + yj format, but the quaternions actually have 4 of those components total. there is a scalar portion (one component), and a
            //vector part (3 of the components). it uses that format for rotation. the reason why this is beneficial over the normal rotations (aka
            //euler rotations, as we've learned in class) is that euler angles suffer from something called gimbal lock, which is when rotation degrees of freedom
            //are lost (I'm pretty sure Young Wu actually demo-ed that implicitly once). it also has smoother interpolation. so, in this specific code,
            //we apply the quaternion angle, and it's really nice because all we ahve to do is pass in the object with a .quaternion angle extension which just
            //applies the quaternion angle to the backwards vector (defines the direction like i mentiioned earlier) and that way we have the correct direction, and the
            //correct angle! 
            backward.applyQuaternion(dog.objects[0].quaternion);
            //lastly, we multiply by scalar, which just defines how far back the dog is going to jump. I chose 3, but any value here could work.
            backward.multiplyScalar(3);
            //and lastly, update the dog position based on all of these calculations we did!
            dog.objects[0].position.add(backward);
        }
    }

    //make sure to add listener for mousedown and lead it to our onClick function.
    window.addEventListener("mousedown", onClick);
}
//call the makeDogJumpBack function to put it in action!
makeDogJumpBack();

//listeners for the two functions above (event functions).
document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);

//@ts-ignore
animate();
world.go();

