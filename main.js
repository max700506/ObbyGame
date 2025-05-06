// === Szene, Kamera, Renderer ===
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// === Himmel (Skybox als Hintergrund) ===
const loader = new THREE.TextureLoader();
loader.load('sky.jpg', function(texture) {
scene.background = texture;
});

// === Licht ===
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light);

// === Spieler ===
const playerSize = 1;
const playerGeo = new THREE.BoxGeometry(playerSize, playerSize, playerSize);
const playerMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const player = new THREE.Mesh(playerGeo, playerMat);
// Korrekte Startposition: Oberkante auf Plattformhöhe
player.position.set(0, playerSize / 2 + 0.25, 0);
scene.add(player);

// === Plattformen ===
const platforms = [];
function addPlatform(x, y, z) {
const geo = new THREE.BoxGeometry(4, 0.5, 4);
const mat = new THREE.MeshStandardMaterial({ color: 0x00aa00 });
const plat = new THREE.Mesh(geo, mat);
plat.position.set(x, y, z);
scene.add(plat);
platforms.push(plat);
}
addPlatform(0, 0, 0);
addPlatform(5, 1, -5);
addPlatform(10, 2, -10);
addPlatform(15, 3, -15);

// === Steuerung ===
const keys = {};
window.addEventListener("keydown", (e) => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", (e) => keys[e.key.toLowerCase()] = false);

// === Touch-Springbutton ===
const jumpButton = document.createElement("button");
jumpButton.innerText = "JUMP";
Object.assign(jumpButton.style, {
position: "absolute", bottom: "20px", right: "20px", padding: "20px",
fontSize: "20px", zIndex: 10
});
document.body.appendChild(jumpButton);

// === Bewegung & Physik ===
let velocity = { x: 0, y: 0, z: 0 };
let onGround = false;
let camAngle = 0;
const camDist = 10;

// === Kollision (bessere Erkennung von oben) ===
function checkGroundCollision() {
const playerBox = new THREE.Box3().setFromObject(player);
for (let plat of platforms) {
const platBox = new THREE.Box3().setFromObject(plat);
if (playerBox.intersectsBox(platBox)) {
// Nur oben landen, nicht Seitenkollision
const yDiff = playerBox.min.y - platBox.max.y;
if (yDiff > -0.1 && velocity.y <= 0) {
player.position.y = platBox.max.y + playerSize / 2;
velocity.y = 0;
return true;
}
}
}
return false;
}

// === Touchspringen
jumpButton.addEventListener("click", () => {
if (onGround) {
velocity.y = 0.2;
onGround = false;
}
});

// === Animation
function animate() {
requestAnimationFrame(animate);

// Kamera-Rotation (linke/rechte Pfeiltasten)
if (keys["arrowleft"]) camAngle += 0.03;
if (keys["arrowright"]) camAngle -= 0.03;

// Richtung basierend auf Kamera
const speed = 0.1;
const forward = new THREE.Vector3(Math.sin(camAngle), 0, Math.cos(camAngle));
const right = new THREE.Vector3(forward.z, 0, -forward.x);
let dx = 0, dz = 0;

if (keys["s"]) { dx += forward.x * speed; dz += forward.z * speed; }
if (keys["w"]) { dx -= forward.x * speed; dz -= forward.z * speed; }
if (keys["a"]) { dx -= right.x * speed; dz -= right.z * speed; }
if (keys["d"]) { dx += right.x * speed; dz += right.z * speed; }

player.position.x += dx;
player.position.z += dz;

// Springen (Leertaste)
if ((keys[" "] || keys["space"]) && onGround) {
velocity.y = 0.2;
onGround = false;
}

// Schwerkraft
velocity.y -= 0.01;
player.position.y += velocity.y;

// Plattform-Kollision
onGround = checkGroundCollision();

// Fall-Reset
if (player.position.y < -10) {
player.position.set(0, playerSize / 2 + 0.25, 0);
velocity = { x: 0, y: 0, z: 0 };
}

// Kamera rotiert im Kreis um den Spieler
camera.position.x = player.position.x + Math.sin(camAngle) * camDist;
camera.position.z = player.position.z + Math.cos(camAngle) * camDist;
camera.position.y = player.position.y + 5;
camera.lookAt(player.position);

renderer.render(scene, camera);
}
animate();
