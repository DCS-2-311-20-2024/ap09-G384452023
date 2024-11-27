//
// 応用プログラミング 第9,10回 自由課題 (ap0901.js)
// G38445-2023 佐藤弘斗
//
// 
import GUI from 'ili-gui';
import { makeMetalRobot } from './robotのコピー.js'
import * as THREE from "three";
import { GLTFLoader } from "three/addons";
// ３Ｄページ作成関数の定義
//コース作成
export const origin = new THREE.Vector3();
export const controlPoints = [
  [ 10,40],
  [ 40,0],
  [ 20,-30],
  [ -40,0],
  
]

function init() {
  const cameraParam = { // カメラの設定値
    fov: 50, // 視野角
    x: 15,
    y: 30,
    z: 60
  };

  // シーン作成
  const scene = new THREE.Scene();

  // 座標軸の設定
  const axes = new THREE.AxesHelper(18);
  scene.add(axes);
  // axes.visible = false;


  // 平面の設定
  const planeGeometry = new THREE.PlaneGeometry(50, 50);
  const planeMaterial = new THREE.MeshLambertMaterial({ color: 0x007030});
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -0.5 * Math.PI;
  plane.position.set(0,-0.01,0)
  plane.receiveShadow = true;
  scene.add(plane);

  

  // コース(描画)
    //制御点を補間して曲線を作る
  const course = new THREE.CatmullRomCurve3(
      controlPoints.map((p) => {
          return (new THREE.Vector3()).set(
              p[0]/2,
              0,
              p[1]/2
          );
      }), true
  )
  //曲線から100ヶ所を取り出し、円を並べる
  const points = course.getPoints(100);
  points.forEach((point)=>{
      const road = new THREE.Mesh(
          new THREE.CircleGeometry(1,16),
          new THREE.MeshLambertMaterial({
              color:"gray",
          })
      )
      road.rotateX(-Math.PI/2);
      road.position.set(
          point.x,
          0,
          point.z
      );
      scene.add(road);
  });

  // 金属製ロボットの追加
  // const metalRobot = makeMetalRobot();
  // scene.add(metalRobot);

  // 光源の設定
  const spotLight = new THREE.SpotLight(0xffffff, 2500);
  spotLight.position.set(-10, 30, 10);
  spotLight.castShadow = true;
  scene.add(spotLight);

  // カメラの設定
  const camera = new THREE.PerspectiveCamera(
    cameraParam.fov, window.innerWidth/window.innerHeight, 0.1, 1000);

  // レンダラの設定
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setClearColor( 0x406080 );
  renderer.shadowMap.enabled = true;
  document.getElementById("output")
    .appendChild(renderer.domElement);

  // 描画関数の定義
  function render() {
    camera.fov = cameraParam.fov;
    camera.position.x = cameraParam.x;
    camera.position.y = cameraParam.y;
    camera.position.z = cameraParam.z;
    camera.lookAt(0, 5, 0);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }

  // カメラのコントローラ
  const gui = new GUI();
  gui.add(cameraParam, "fov", 10, 100).onChange(render);
  gui.add(cameraParam, "x", -40, 40).onChange(render);
  gui.add(cameraParam, "y", -40, 40).onChange(render);
  gui.add(cameraParam, "z", -40, 40).onChange(render);

  // 描画
  render();
}

// 3Dページ作成関数の呼び出し
init();
