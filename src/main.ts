import * as THREE from 'three';
import { WEBVR } from 'three/examples/jsm/vr/WebVR.js';
import WebVRPolyfill from 'webvr-polyfill'

interface disposable {
    dispose(): void;
}

let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let mesh: THREE.Mesh;
let disposables: disposable[];

window.addEventListener('DOMContentLoaded', () => {
    registerEvents();
    initVR();
});
window.addEventListener('resize', resize);

function registerEvents() {
    document.getElementById('image-input').addEventListener('change', e => {
        const file = (e.target as HTMLInputElement).files[0];
        const blobURL = window.URL.createObjectURL(file);
        showVR(blobURL);
    });
    document.getElementById('close-button').addEventListener('click', () => {
        closeVR();
    });
}

function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

function initVR() {
    new WebVRPolyfill();

    camera = new THREE.PerspectiveCamera(75, 1);
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer();
    renderer.vr.enabled = true;

    resize();

    const container = document.getElementById('container');
    container.appendChild(renderer.domElement);
    container.appendChild(WEBVR.createButton(renderer, null));
}

function showVR(url: string) {
    document.getElementById('image-input').style.display = 'none';
    document.getElementById('container').style.display = 'block';

    const loader = new THREE.TextureLoader();
    loader.load(url, texture => {
        const [thetaStart, thetaLength] = getTheta(texture.image.width, texture.image.height);
        const geometry = new THREE.SphereBufferGeometry(500, 60, 40, 0, Math.PI * 2, thetaStart, thetaLength);
        geometry.scale(-1, 1, 1);

        const material = new THREE.MeshBasicMaterial({map: texture});
        mesh = new THREE.Mesh(geometry, material);

        camera.fov = THREE.Math.radToDeg(thetaLength);
        camera.updateProjectionMatrix();

        scene.add(mesh);
        disposables = [geometry, material, texture];
        renderer.setAnimationLoop(() => renderer.render(scene, camera));
    });
}

function closeVR() {
    document.getElementById('image-input').style.display = 'inline';
    document.getElementById('container').style.display = 'none';

    scene.remove(mesh);
    for (const d of disposables) {
        d.dispose();
    }
    renderer.setAnimationLoop(null);
}

function getTheta(width: number, height: number): [number, number] {
    const r = width / Math.PI / 2;
    const theta = Math.atan(height / 2 / r);
    const thetaStart = Math.PI / 2 - theta;
    const thetaLength = theta * 2;

    return [thetaStart, thetaLength];
}
