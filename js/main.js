window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('image-input').addEventListener('change', e => {
        const file = e.target.files[0];
        const blobURL = window.URL.createObjectURL(file);
        loadTexture(blobURL);
        e.target.remove();
    });
});

function loadTexture(url) {
    const loader = new THREE.TextureLoader();
    loader.load(url, texture => {
        main(texture);
    });
}

function main(texture) {
    new WebVRPolyfill();

    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;

    const camera = new THREE.PerspectiveCamera(75, winWidth / winHeight, 1, 2000);

    const scene = new THREE.Scene();

    const imgWidth = texture.image.width;
    const imgHeight = texture.image.height;
    const r = imgWidth / Math.PI / 2;
    const theta = Math.atan(imgHeight / 2 / r);
    const phiStart = 0;
    const phiLength = Math.PI * 2;
    const thetaStart = Math.PI / 2 - theta;
    const thetaLength = theta * 2;
    const geometry = new THREE.SphereBufferGeometry(500, 60, 40, phiStart, phiLength, thetaStart, thetaLength);
    geometry.scale(-1, 1, 1);
    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({map: texture}));
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(winWidth, winHeight);
    renderer.vr.enabled = true;
    document.getElementById('out').appendChild(renderer.domElement);

    document.getElementById('out').appendChild(THREE.WEBVR.createButton(renderer));

    renderer.setAnimationLoop(tick);

    let frame = 0;

    function tick() {
        frame++;

        renderer.render(scene, camera);
    }
}
