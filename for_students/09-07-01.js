/*jshint esversion: 6 */
// @ts-check

import * as T from "../libs/CS559-Three/build/three.module.js";
import { GrWorld } from "../libs/CS559-Framework/GrWorld.js";
import { GrObject } from "../libs/CS559-Framework/GrObject.js";
import * as InputHelpers from "../libs/CS559/inputHelpers.js";

//PLEASE NOTE: the image used for the skybox was taken from https://polyhaven.com/hdris/outdoor 
let parentOfCanvas = document.getElementById("div1");
let world = new GrWorld({ where: parentOfCanvas});

//same as my past work - use the images to create an array of images, then use those for the cubeloader so we can create
//an environment map for the skybox / reflective object.
let environmentmap = [
  './textures/px.png',
  './textures/nx.png',
  './textures/py.png',
  './textures/ny.png',
  './textures/pz.png',
  './textures/nz.png'
]

let textureLoader = new T.CubeTextureLoader();
let skybox = textureLoader.load(environmentmap);
//make sure to set the background to the skybox so that we have a skybox environment.
world.scene.background = skybox;

//PLEASE NOTE: this line of code was taken from one of the examples because I could not get the cube render to work. I realized I
//must have been missing something because I could not get the cubeCamera to work using this line of code WITHOUT generateMipMaps / linearmipmap
const cubeRenderer = new T.WebGLCubeRenderTarget(128, { generateMipmaps: true, minFilter: T.LinearMipmapLinearFilter });
//create the cube camera using the renderer we just made!
let cubeCamera = new T.CubeCamera(1.5, 1000, cubeRenderer);

/**
 * Create a new sphere that is reflective of its environment using an environment map - use the cubecam as the
 * envMap as the instructions specify
 */
export class reflectiveSphere extends GrObject {
  constructor() {
    let group = new T.Group();
    let geometry = new T.SphereGeometry(1);
    let material = new T.MeshStandardMaterial({
      metalness: 1,
      roughness: 0,
      //specified in instructions - use the cubecam as the envmap - this allows for not only the image to
      //be reflected, but for the objects around like  the plane or the duck to be visible as well.
      envMap: cubeCamera.renderTarget.texture
    });

    //create a new instance of the sphere, and add cam and sphere to the world.
    let sphere = new T.Mesh(geometry, material);
    group.add(cubeCamera);
    group.add(sphere);
    super("sphere", group);
  }

  //NOTE: THE FOLLOWING 2 LINES ARE TAKEN FROM THE EXAMPLE:
  //i knew we had to update the camera using .update, but I was placing it in the wrong place, and I didn't
  //know what to pass into the function, so I decided to check out the example since I was struggling with it. 
  //the reason why we call it here in the constructor is because we want to set up the inital state of reflection,
  // also, the reason why this actually animates is because of the update() function)
  updateCam() {
    cubeCamera.update(world.renderer, world.scene);
  }
}
//create the sphere:
let sphere = new reflectiveSphere();
sphere.objects[0].position.set(0, 1, 0);
world.add(sphere);
//add light:
const light = new T.DirectionalLight("#bfa27c", 3);
light.position.set(-10, 10, 0);
world.scene.add(light);


/**
 * This class creates a duck object that we will use as the object reflecting in the sphere.
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
  }
}
/**
 * This function spins the duck around the sphere
 * 
 * @param {*} obj 
 * @param {*} speed 
 * @returns obj w/ new position
 * 
 * NOTE: THE FOLLOWING FUNCTION HAS CHATGPT INFLUENCE. Please see comments for explanation / demonstrating
 * understanding.
 */
function moveDuck(obj) {
  let angle = 0;
  //obj.updateCam is used here (chatGPT's idea - I just tried to animate like a normal animation loop which
  //proved to be unsuccessful). The reason why we have to use obj.updateCam is because this is actually how we define a
  //custom update function for the Duck object - it behaves very similarly to how we updateCam in the constructor as well, as
  //defined in the project writeup. pass in delta like a normal animation so that we can use it to make the duck move as a function of time
  obj.updateCam = function (delta) {
    //so we want to update the angle as time passes, we will pass this into a sin or cos function so that it will
    //oscillate between values. this is essentially responsibile for angular displacement, and has been used in several of our
    //projects in the past.
    angle += (delta / 1000) * Math.PI * 2;
    //here is another idea from chatGPT - I was having troubles actually getting the loop to work because I was not using this format -
    //we use a for each loop so that we are updating the positions of EVERYTHING that the duck has - not just separate parts of the duck, we 
    //want to move the entire group.
    obj.objects.forEach(object => {
      //for each part of the duck, we want to change the position so that it moves forward. however, it can't just move forward
      //in a straight line, it needs to move forward in a circular manner, which is why we are using sin and cos with the 
      //aforementioned angle calculation. the "2" represents the radius of the circle in which the duck is traveling.
      object.position.set(Math.sin(angle) * 2, 0.4, Math.cos(angle) * 2);
    });

    //so the above loop was responsible for updating the position, which essentially makes the duck run in a circle, but only face
    //one way while doing so. so again, we will use the same format of for each loop, but this time, rotate the duck so that it looks like
    //it is running face first as it travels along the circle. to do so, we just update the y-axis rotation using the angle we calculated before.
    //I used Math.PI / 100 to help determine the speed at which it is rotating, this was found completely through visual input until I decided the timing
    //of turning and running matched up.
    obj.objects.forEach(object => {
      object.rotation.y = Math.PI / 100 + angle;
    });

  };
  //return the object that we just moved! the updateCam function within this is what helps us to continuously animate this object, so no need to call
  //something like request animation frame.
  return obj;
}

//create the duck and add to the world!
let duck = new Duck();
duck.objects[0].position.set(0, 1, 2);

//start the duck animation:
moveDuck(duck);
world.add(duck);
world.go();
