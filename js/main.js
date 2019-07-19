let camera, scene, renderer, mesh;
let disposables = [];

window.addEventListener('DOMContentLoaded', () => {
    registerEvents();
    initVR();
});

function registerEvents() {
    document.getElementById('image-input').addEventListener('change', e => {
        const file = e.target.files[0];
        const blobURL = window.URL.createObjectURL(file);
        showVR(blobURL);
    });
    document.getElementById('close-button').addEventListener('click', e => {
        closeVR();
    });
}

function initVR() {
    new WebVRPolyfill();

    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;

    camera = new THREE.PerspectiveCamera(75, winWidth / winHeight, 1, 2000);

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(winWidth, winHeight);
    renderer.vr.enabled = true;

    const container = document.getElementById('container');
    container.appendChild(renderer.domElement);
    container.appendChild(THREE.WEBVR.createButton(renderer));
}

function showVR(url) {
    document.getElementById('image-input').style.display = 'none';
    document.getElementById('container').style.display = 'block';

    const loader = new THREE.TextureLoader();
    loader.load(url, texture => {
        const [thetaStart, thetaLength] = getTheta(texture.image.width, texture.image.height);
        const geometry = new THREE.SphereBufferGeometry(500, 60, 40, 0, Math.PI * 2, thetaStart, thetaLength);
        geometry.scale(-1, 1, 1);

        const material = new THREE.MeshBasicMaterial({map: texture});
        mesh = new THREE.Mesh(geometry, material);

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

function getTheta(width, height) {
    const r = width / Math.PI / 2;
    const theta = Math.atan(height / 2 / r);
    const thetaStart = Math.PI / 2 - theta;
    const thetaLength = theta * 2;

    return [thetaStart, thetaLength];
}
