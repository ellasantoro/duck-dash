/*jshint esversion: 6 */
// @ts-check

import * as T from "../libs/CS559-Three/build/three.module.js";
import { GrWorld } from "../libs/CS559-Framework/GrWorld.js";
import { GrObject } from "../libs/CS559-Framework/GrObject.js";
import * as InputHelpers from "../libs/CS559/inputHelpers.js";
import * as Simple from "../libs/CS559-Framework/SimpleObjects.js";

/**
 *
 * @param {GrObject} obj
 * @param {number} [speed=1] - rotations per second
 */
function spinY(obj, speed = 1) {
  obj.updateCam = function (delta, timeOfDay) {
    obj.objects.forEach(obj => obj.rotateY(((speed * delta) / 1000) * Math.PI));
  };
  return obj;
}

function test() {
  let parentOfCanvas = document.getElementById("div1");
  let world = new GrWorld({ where: parentOfCanvas });

  /**
   * Some Stuff in the world to cast and receive shadows
   */
  // a high object to cast shadows on lower objects
  let gr = new T.Group();
  let mat = new T.MeshStandardMaterial({ color: "#785634" });
  let geom = new T.TorusGeometry();
  let tmesh = new T.Mesh(geom, mat);
  tmesh.rotateX(Math.PI / 2);
  tmesh.scale.set(0.5, 0.5, 0.25);
  tmesh.translateX(-2);
  gr.add(tmesh);
  gr.translateY(3);
  let highobj = new GrObject("high obj", gr);
  spinY(highobj);
  world.add(highobj);

  // some low objects to be shadowed - although these
  // should cast shadows on the ground plane
  let cube = new Simple.GrCube({ x: -3, y: 1, color: "#347278" })
  let knot = new Simple.GrTorusKnot({ x: 3, y: 1, size: 0.5, color: "#eda8c5" })
  world.add(spinY(cube));
  world.add(spinY(knot));

  /**
   * Turn on Shadows - this is the student's job in the assignment
   * Remember to:
   * - make a spotlight and turn on its shadows
   * - have objects (including the ground plane) cast / receive shadows
   * - turn on shadows in the renderer
   *
   * it's about 15 lines (with a recursive "loop" to enable shadows for all objects)
   * but you can also just turn things on as you make objects
   */

  //create the spotlight to help us with the shadows & lighting:
  let spotlight = new T.SpotLight(0xffffff, 130);
  spotlight.position.set(0, 10, 0);
  spotlight.castShadow = true;
  world.scene.add(spotlight);

  //make it so that all of the objects cast shadows - this can be done with the 
  // "loop" as well, but for some reason it created this double shadow effect, so I decided
  //to only use the loop for the receiving shadow attribute, and not the casting. since we only
  //have three objects to cast from, it doesn't require many lines of code anyway:
  knot.objects[0].castShadow = true;
  cube.objects[0].castShadow = true;
  tmesh.castShadow = true;
  //now use a loop to traverse all of the objects in the scene so that everything is
  //receiving shadows - not even just objects, but also the plane, etc.
  world.scene.traverse(obj => obj.receiveShadow = true);
  //make sure to enable shadowMap to true for the rendered as per the instructions.
  world.renderer.shadowMap.enabled = true;

  world.go();
}
test();

