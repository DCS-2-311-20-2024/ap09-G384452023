//
// 応用プログラミング 第9,10回 自由課題 (ap0901.js)
// G38445-2023 佐藤弘斗
//
// 
import GUI from 'ili-gui';
import { makeMetalRobot } from './robotのコピー.js';
import { makeCBRobot } from './robotのコピー.js';
import * as THREE from "three";
import { GLTFLoader } from "three/addons";

// 3Dページ作成関数の定義
export const origin = new THREE.Vector3();
export const controlPoints = [
  [10, 40],
  [20, 10],
  [40, 0],
  [20, -30],
  [-20, -20],
  [-40, 0],
  [-20, 30]
];

function init() {
  const cameraParam = { // カメラの設定値
    fov: 50,
    x: 15,
    y: 30,
    z: 60
  };

  // シーン作成
  const scene = new THREE.Scene();

  // 座標軸の設定
  const axes = new THREE.AxesHelper(18);
  scene.add(axes);

  // 平面の設定
  const planeGeometry = new THREE.PlaneGeometry(50, 50);
  const planeMaterial = new THREE.MeshLambertMaterial({ color: 0x007030 });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -0.5 * Math.PI;
  plane.position.set(0, -0.01, 0);
  plane.receiveShadow = true;
  scene.add(plane);

  // コース(描画)
  const course = new THREE.CatmullRomCurve3(
    controlPoints.map((p) => {
      return (new THREE.Vector3()).set(
        p[0] / 2,
        0,
        p[1] / 2
      );
    }), true
  );

  const points = course.getPoints(100);
  points.forEach((point) => {
    const road = new THREE.Mesh(
      new THREE.CircleGeometry(1, 16),
      new THREE.MeshLambertMaterial({
        color: "gray",
      })
    );
    road.rotateX(-Math.PI / 2);
    road.position.set(
      point.x,
      0,
      point.z
    );
    scene.add(road);
  });

  const clock = new THREE.Clock();
  const carPosition = new THREE.Vector3();
  const carTarget = new THREE.Vector3();

  const robots = {
    metalRobot: makeMetalRobot(),
    CBRobot: makeCBRobot(),
  };

  // 初期ロボットをシーンに追加
  let activeRobot = robots.metalRobot;
  scene.add(activeRobot);

  function switchRobot(type) {
    scene.remove(activeRobot);
    activeRobot = robots[type];
    scene.add(activeRobot);
  }

  function render() {
    const time = (clock.getElapsedTime() / 20);
    course.getPointAt(time % 1, carPosition);
    activeRobot.position.copy(carPosition);
    course.getPointAt((time + 0.01) % 1, carTarget);
    activeRobot.lookAt(carTarget);
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  // 光源の設定
  const spotLight = new THREE.SpotLight(0xffffff, 2500);
  spotLight.position.set(-10, 30, 10);
  spotLight.castShadow = true;
  scene.add(spotLight);

  // カメラの設定
  const camera = new THREE.PerspectiveCamera(
    cameraParam.fov, window.innerWidth / window.innerHeight, 0.1, 1000
  );
  camera.position.set(cameraParam.x, cameraParam.y, cameraParam.z);
  camera.lookAt(0, 5, 0);

  // レンダラの設定
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x406080);
  renderer.shadowMap.enabled = true;
  document.getElementById("output")
    .appendChild(renderer.domElement);

  // GUIの設定
  const gui = new GUI();
  gui.add(cameraParam, "fov", 10, 100).onChange(() => {
    camera.fov = cameraParam.fov;
    camera.updateProjectionMatrix();
  });
  gui.add(cameraParam, "x", -40, 40).onChange(() => camera.position.set(cameraParam.x, cameraParam.y, cameraParam.z));
  gui.add(cameraParam, "y", -40, 40).onChange(() => camera.position.set(cameraParam.x, cameraParam.y, cameraParam.z));
  gui.add(cameraParam, "z", -40, 40).onChange(() => camera.position.set(cameraParam.x, cameraParam.y, cameraParam.z));

  // ロボット切り替え用のGUI
  const robotOptions = { type: "metalRobot" };
  gui.add(robotOptions, "type", ["metalRobot", "CBRobot"]).onChange((value) => {
    switchRobot(value);
  });

  render();
}

// 3Dページ作成関数の呼び出し
init();