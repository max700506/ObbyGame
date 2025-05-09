
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);



// === Himmel (Skybox als Hintergrund) ===

const loader = new THREE.TextureLoader();

loader.load('images/sky.jpg', function(texture) {

    scene.background = texture;

});



// === Licht ===

const light = new THREE.DirectionalLight(0xffffff, 1);

light.position.set(10, 10, 10);

scene.add(light);



// === Spieler (Würfel) ===

const playerSize = 1;

const playerGeo = new THREE.BoxGeometry(playerSize, playerSize, playerSize);

const playerMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });

const player = new THREE.Mesh(playerGeo, playerMat);

player.position.set(0, playerSize / 2 + 0.25, 0);

scene.add(player);



// === Arrays ===

const platforms = [], deadlyObstacles = [], checkpoints = [], movingObstacles = [], elevators = [], lasers = [], fakePlatforms = [];

let lastCheckpoint = new THREE.Vector3(0, player.position.y, 0);



function addPlatform(x, y, z, w = 4, h = 0.5, d = 4, color = 0x00aa00) {

    const geo = new THREE.BoxGeometry(w, h, d);

    const mat = new THREE.MeshStandardMaterial({ color });

    const plat = new THREE.Mesh(geo, mat);

    plat.position.set(x, y, z);

    scene.add(plat);

    platforms.push(plat);

    return plat;

}



function addDeadlyLine(x, y, z, w = 2, h = 0.1, d = 2) {

    const geo = new THREE.BoxGeometry(w, h, d);

    const mat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000 });

    const line = new THREE.Mesh(geo, mat);

    line.position.set(x, y, z);

    scene.add(line);

    deadlyObstacles.push(line);

    return line;

}



function addElevatorPlatform(x, y, z, height = 5, speed = 0.02, w = 4, h = 0.5, d = 4) {

    const geo = new THREE.BoxGeometry(w, h, d);

    const mat = new THREE.MeshStandardMaterial({ color: 0xffa500 });

    const plat = new THREE.Mesh(geo, mat);

    plat.position.set(x, y, z);

    plat.userData = { startY: y, height, speed, dir: 1 };

    elevators.push(plat);

    scene.add(plat);

    platforms.push(plat);

    return plat;

}



function addLaserTower(x, y, z, h = 4) {

    const geo = new THREE.CylinderGeometry(0.3, 0.3, h, 8);

    const mat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000 });

    const tower = new THREE.Mesh(geo, mat);

    tower.position.set(x, y + h / 2, z);

    scene.add(tower);

    lasers.push(tower);

    deadlyObstacles.push(tower);

    return tower;

}



function addCheckpoint(x, y, z, size = 4) {

    const geo = new THREE.CylinderGeometry(size / 2, size / 2, 0.2, 16);

    const mat = new THREE.MeshStandardMaterial({ color: 0x0000ff });

    const cp = new THREE.Mesh(geo, mat);

    cp.position.set(x, y + 0.1, z);

    scene.add(cp);

    checkpoints.push(cp);

    return cp;

}



function addFakePlatform(x, y, z, w = 4, h = 0.5, d = 4, color = 0x222222) {

    const geo = new THREE.BoxGeometry(w, h, d);

    const mat = new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.6 });

    const fake = new THREE.Mesh(geo, mat);

    fake.position.set(x, y, z);

    scene.add(fake);

    return fake;

}





function addRealFakePlatform(x, y, z, w = 4, h = 0.5, d = 4, color = 0x222222, opacity = 0.6) {

    const geo = new THREE.BoxGeometry(w, h, d);

    const mat = new THREE.MeshStandardMaterial({ color, transparent: true, opacity });

    const plat = new THREE.Mesh(geo, mat);

    plat.position.set(x, y, z);

    scene.add(plat);

    platforms.push(plat); // Kollision aktiv

    return plat;

}



function addMovingObstacle(x, y, z) {

    const geo = new THREE.BoxGeometry(4, 0.2, 0.2);

    const mat = new THREE.MeshStandardMaterial({ color: 0xffff00 });

    const obstacle = new THREE.Mesh(geo, mat);

    obstacle.userData.origin = new THREE.Vector3(x, y, z);

    scene.add(obstacle);

    movingObstacles.push(obstacle);

    return obstacle;

}



function addSphere(x, y, z, r = 1) {

    const geo = new THREE.SphereGeometry(r, 16, 16);

    const mat = new THREE.MeshStandardMaterial({ color: 0x00ffff });

    const sphere = new THREE.Mesh(geo, mat);

    sphere.position.set(x, y + r, z);

    scene.add(sphere);

    platforms.push(sphere);

    return sphere;

}



function addCheckpointGroup(x, y, z) {

    const platform = addPlatform(x, y, z,12,0.5,12);

    const checkpoint = addCheckpoint(x, y + 0.5, z);

    return { platform, checkpoint };

}



// === Hindernisstrecke (Obby) ===

function buildObstacleSet(startZ) {

    let z = startZ;



    addPlatform(0, 0, 0, 12, 0.5, 12);



    addPlatform(0,0,-10);

    addPlatform(0,0,-17.5);

    addPlatform(0,0,-25);

    addPlatform(0,0,-32.5);



    addPlatform(0,0,-42.5, 12, 0.5, 12);

    addCheckpoint(0,0.5,-42.5);



    addSphere(0,0,-50);

    addSphere(0,0,-55);

    addSphere(0,0,-60);

    addSphere(0,0,-65);



    addPlatform(0,0,-72.5, 12, 0.5, 12);

    addCheckpoint(0,0.5,-72.5);



    addPlatform(-19,0,-72.5, 24, 0.5, 8);

    addDeadlyLine(-10,0.5,-72.5,0.5,0.5,8);

    addDeadlyLine(-13,0.5,-72.5,0.5,0.5,8);

    addDeadlyLine(-16,0.5,-72.5,0.5,0.5,8);

    addDeadlyLine(-19,0.5,-72.5,0.5,0.5,8);

    addDeadlyLine(-22,0.5,-72.5,0.5,0.5,8);

    addDeadlyLine(-25,0.5,-72.5,0.5,0.5,8);

    addDeadlyLine(-28,0.5,-72.5,0.5,0.5,8);



    addPlatform(-38,0,-72.5, 12, 0.5, 12);

    addCheckpoint(-38,0.5,-72.5);



    addFakePlatform(5,1,0);

    addRealFakePlatform(-5,1,0);



    addElevatorPlatform(0,1,10,9, 0.02)

    addMovingObstacle(0,3,0)

    addLaserTower(0,1,3)



}







buildObstacleSet(0);



// === Steuerung ===

const keys = {};

window.addEventListener("keydown", (e) => keys[e.key.toLowerCase()] = true);

window.addEventListener("keyup", (e) => keys[e.key.toLowerCase()] = false);



const jumpButton = document.createElement("button");

jumpButton.innerText = "SPRINGEN";

Object.assign(jumpButton.style, {

    position: "absolute", bottom: "20px", right: "20px", padding: "20px",

    fontSize: "20px", zIndex: 10

});

document.body.appendChild(jumpButton);



let velocity = { x: 0, y: 0, z: 0 };

let onGround = false;

let camAngle = 0;

const camDist = 10;



function checkCheckpoints() {

    const playerBox = new THREE.Box3().setFromObject(player);

    for (let cp of checkpoints) {

        const cpBox = new THREE.Box3().setFromObject(cp);

        if (playerBox.intersectsBox(cpBox)) {

            lastCheckpoint.copy(cp.position);

        }

    }

}



function checkGroundCollision() {

    const playerBox = new THREE.Box3().setFromObject(player);

    for (let plat of platforms) {

        const platBox = new THREE.Box3().setFromObject(plat);

        if (playerBox.intersectsBox(platBox)) {

            const yDiff = playerBox.min.y - platBox.max.y;

            if (yDiff > -0.2 && velocity.y <= 0) {

                player.position.y = platBox.max.y + playerSize / 2;

                velocity.y = 0;

                return true;

            }

        }

    }

    return false;

}



function checkDeadlyCollision() {

    const playerBox = new THREE.Box3().setFromObject(player);

    for (let d of deadlyObstacles.concat(movingObstacles)) {

        const dBox = new THREE.Box3().setFromObject(d);

        if (playerBox.intersectsBox(dBox)) return true;

    }

    return false;

}



jumpButton.addEventListener("click", () => {

    if (onGround) {

        velocity.y = 0.2;

        onGround = false;

    }

});



function animate() {

    requestAnimationFrame(animate);



    if (keys["arrowleft"]) camAngle += 0.03;

    if (keys["arrowright"]) camAngle -= 0.03;



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



    if ((keys[" "] || keys["space"]) && onGround) {

        velocity.y = 0.2;

        onGround = false;

    }



    velocity.y -= 0.01;

    player.position.y += velocity.y;



    onGround = checkGroundCollision();

    checkCheckpoints();



   



    if (checkDeadlyCollision() || player.position.y < -10) {

        player.position.set(lastCheckpoint.x, lastCheckpoint.y, lastCheckpoint.z);

        velocity = { x: 0, y: 0, z: 0 };

    }



    elevators.forEach(e => {

        e.position.y += e.userData.speed * e.userData.dir;

        if (e.position.y > e.userData.startY + e.userData.height || e.position.y < e.userData.startY)

            e.userData.dir *= -1;

    });





    for (let mo of movingObstacles) {

        mo.rotation.y += 0.05;

        mo.position.x = mo.userData.origin.x + Math.sin(Date.now() * 0.005) * 2;

    }



    camera.position.x = player.position.x + Math.sin(camAngle) * camDist;

    camera.position.z = player.position.z + Math.cos(camAngle) * camDist;

    camera.position.y = player.position.y + 5;

    camera.lookAt(player.position);



    renderer.render(scene, camera);

}



animate()
