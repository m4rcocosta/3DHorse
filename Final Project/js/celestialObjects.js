// Planets array
var celestialObjects = [];

// Orbits array
var orbits = [];

// Light of the sunId
var sunLight;

// Ambient light
var ambientLight;

// Create orbit for the planets and moon
function createOrbit(Id) {
	let orbitGeometry = new THREE.CircleGeometry(data[Id].distance, orbitSegments);
    orbitGeometry.vertices.shift(); // Remove center vertex
    let orbitMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff
    });

    orbits[Id] = new THREE.LineLoop(orbitGeometry, orbitMaterial);
    orbits[Id].rotation.x = THREE.Math.degToRad(90);
	if(inclinedOrbit) orbits[Id].rotation.y = THREE.Math.degToRad(data[Id].orbitInclination);
    orbits[Id].name = "orbit"; // Used for ignoring if focus on it
    if (Id != moonId) celestialObjects[solarSystemId].add(orbits[Id]); // Sun as orbit center of planets
    else celestialObjects[data[Id].orbitCenter].add(orbits[Id]); // Earth as orbit center of moon
}

function createEarthCloudMaterial() {
    // Create destination canvas
	let canvasResult = document.createElement("canvas");
	canvasResult.width = 1024;
	canvasResult.height = 512;
	let contextResult = canvasResult.getContext("2d");

	// Load Earth cloud map
	let imageMap = new Image();
	imageMap.addEventListener("load", function() {

		// Create dataMap ImageData for Earth cloud map
		let canvasMap = document.createElement("canvas");
		canvasMap.width = imageMap.width;
		canvasMap.height = imageMap.height;
		let contextMap = canvasMap.getContext("2d");
		contextMap.drawImage(imageMap, 0, 0);
		let dataMap = contextMap.getImageData(0, 0, canvasMap.width, canvasMap.height);

		// Load Earth cloud map trans
		let imageTrans = new Image();
		imageTrans.addEventListener("load", function(){
			// Create dataTrans ImageData for Earth cloud map trans
			let canvasTrans = document.createElement("canvas");
			canvasTrans.width = imageTrans.width;
			canvasTrans.height = imageTrans.height;
			let contextTrans = canvasTrans.getContext("2d");
			contextTrans.drawImage(imageTrans, 0, 0);
			let dataTrans = contextTrans.getImageData(0, 0, canvasTrans.width, canvasTrans.height);
			// Merge dataMap + dataTrans into dataResult
			let dataResult = contextMap.createImageData(canvasMap.width, canvasMap.height);
			for (let y = 0, offset = 0; y < imageMap.height; y++){
				for (let x = 0; x < imageMap.width; x++, offset += 4){
					dataResult.data[offset+0] = dataMap.data[offset+0];
					dataResult.data[offset+1] = dataMap.data[offset+1];
					dataResult.data[offset+2] = dataMap.data[offset+2];
					dataResult.data[offset+3] = 255 - dataTrans.data[offset+0];
				}
			}
			// Update texture with result
			contextResult.putImageData(dataResult,0,0)
			earthCloudMaterial.map.needsUpdate = true;
		})
		imageTrans.src	= data[earthId].cloudTrans;
	}, false);
	imageMap.src = data[earthId].cloud;
	let earthCloudMaterial = new THREE.MeshPhongMaterial({
		map: new THREE.Texture(canvasResult),
		side: THREE.DoubleSide,
		transparent: true,
        depthWrite: false,
		opacity: 0.8
	});
	return earthCloudMaterial;
}

// Create Earth cloud
function createEarthCloud() {
    let earthCloudGeometry = new THREE.SphereGeometry(data[earthId].size, planetSegments, planetSegments);
	let earthCloudMaterial = createEarthCloudMaterial();
	celestialObjects[earthCloudId] = new THREE.Mesh(earthCloudGeometry, earthCloudMaterial);
    celestialObjects[earthCloudId].scale.set(1.02, 1.02, 1.02);
    celestialObjects[earthCloudId].name = "Earth"; // Set Earth name
    celestialObjects[earthCloudId].receiveShadow = true; // Receive shadow
    celestialObjects[earthCloudId].myId = earthId; // Set Earth Id
}

// Create sun
function createSun() {
    // Solar system group
    celestialObjects[solarSystemId] = new THREE.Group();
    scene.add(celestialObjects[solarSystemId]);

    // Earth system group
    celestialObjects[earthSystemId] = new THREE.Group();
    celestialObjects[earthSystemId].position.set(data[earthId].distance, 0, 0);
    celestialObjects[solarSystemId].add(celestialObjects[earthSystemId]);

    // The sun is a light source
    sunLight = new THREE.PointLight("rgb(255, 220, 180)", 1.5);
    sunLight.castShadow = true;
    sunLight.shadow.bias = 0.0001;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    scene.add(sunLight);

    // Create Sun
    let sunGeometry = new THREE.SphereGeometry(data[sunId].size, 48, 48 );
    let sunMaterial = new THREE.MeshBasicMaterial({
        map: textureLoader.load(data[sunId].color) // Color texture
    });
    celestialObjects[sunId] = new THREE.Mesh(sunGeometry, sunMaterial);
    celestialObjects[sunId].name = data[sunId].name;
    celestialObjects[sunId].myId = sunId;
    celestialObjects[sunId].receiveShadow = false;
    celestialObjects[sunId].castShadow = false;
    celestialObjects[solarSystemId].add(celestialObjects[sunId]);

    // Create the glow of the sun.
    let spriteMaterial = new THREE.SpriteMaterial({
        map: textureLoader.load(data[sunId].glow), // Glow texture
        color: 0xffffee,
        transparent: true,
        blending: THREE.AdditiveBlending
    });
    celestialObjects[sunGlowId] = new THREE.Sprite(spriteMaterial);
    celestialObjects[sunGlowId].name = "Sun Glow";
    celestialObjects[sunGlowId].scale.set(70, 70, 1.0);
    celestialObjects[sunId].add(celestialObjects[sunGlowId]); // This centers the glow at the sun.
}

// Create planet
function createPlanet(Id) {
    let planetGeometry = new THREE.SphereGeometry(data[Id].size, planetSegments, planetSegments);
    let planetMaterial = new THREE.MeshPhongMaterial({
        map: textureLoader.load(data[Id].color) // Color texture
    });

    // Bump texture
    if (data[Id].hasOwnProperty("bump")) {
        planetMaterial.bumpMap = textureLoader.load(data[Id].bump);
        planetMaterial.bumpScale = data[Id].bumpScale;
    }

    // Specular texture
    if (data[Id].hasOwnProperty("specular")) {
        planetMaterial.specularMap = textureLoader.load(data[Id].specular);
        planetMaterial.specular = new THREE.Color("grey");
    }

    // Normal texture
    if (data[Id].hasOwnProperty("normal")) planetMaterial.normalMap = textureLoader.load(data[Id].normal);

    celestialObjects[Id] = new THREE.Mesh(planetGeometry, planetMaterial);

    // Eclipse (Both solar and lunar)
    if (Id == earthId || Id == moonId) {
        celestialObjects[Id].receiveShadow = true;
        celestialObjects[Id].castShadow = true;
    }

    celestialObjects[Id].name = data[Id].name; // Used for not ignoring if focus on it
    celestialObjects[Id].myId = Id; // Id of celestial object
    celestialObjects[Id].rotation.x = THREE.Math.degToRad(data[Id].equatorInclination); // Axis inclination

    // Create rings of Saturn and Uranus
    if (data[Id].hasOwnProperty("ringId")) {
        celestialObjects[data[Id].groupId] = new THREE.Group();
        celestialObjects[data[Id].groupId].add(celestialObjects[Id]);
        celestialObjects[Id].castShadow = true;	// Saturn and Uranus shadow their rings
        createRing(Id);
        celestialObjects[data[Id].groupId].position.set(data[Id].distance, 0, 0);
        celestialObjects[data[Id].orbitCenter].add(celestialObjects[data[Id].groupId]);
    }
    else {
        if (Id != earthId) celestialObjects[Id].position.set(data[Id].distance, 0, 0);
        celestialObjects[data[Id].orbitCenter].add(celestialObjects[Id]);
    }

    // Draws its orbit
    createOrbit(Id);
}

// Create ring
function createRing(Id) {
    let ringGeometry = new THREE.BufferGeometry().fromGeometry(new _RingGeometry(data[Id].ringInnerDiameter, data[Id].ringOuterDiameter, data[Id].ringSegments));
    let ringMaterial = new THREE.MeshPhongMaterial({
        map: textureLoader.load(data[Id].ringColor), // Color texture
        alphaMap: textureLoader.load(data[Id].ringPattern), // Pattern texture
        side: THREE.DoubleSide,
		shadowSide: THREE.DoubleSide,
		transparent: true,
		opacity: 0.8
    });
    celestialObjects[data[Id].ringId] = new THREE.Mesh(ringGeometry, ringMaterial);
    celestialObjects[data[Id].ringId].rotation.x = THREE.Math.degToRad(90) + THREE.Math.degToRad(data[Id].equatorInclination); // Axis inclination
    celestialObjects[data[Id].ringId].name = "Rings of " + data[Id].name; // Used for not ignoring if focus on it
    celestialObjects[data[Id].ringId].myId = Id; // Set planet Id
    celestialObjects[data[Id].ringId].receiveShadow = true; // Rings are shadowed from their planet
    celestialObjects[data[Id].groupId].add(celestialObjects[data[Id].ringId]);
}

// Create asteroid belt
function createAsteroidBelt() {
    // Values as variables to not made code too difficult to read
    const asteroidSize = data[asteroidBeltId].size;
    const distance = data[asteroidBeltId].distance;
    const minOffsetY = data[asteroidBeltId].minOffsetY;
    const maxOffsetY = data[asteroidBeltId].maxOffsetY;
    const minOffsetXZ = data[asteroidBeltId].minOffsetXZ;
    const maxOffsetXZ = data[asteroidBeltId].maxOffsetXZ;

    // Create an invisible torus only to make working showInfoPlanet when move on it
    let torusAsteroid = new THREE.Mesh(new THREE.TorusGeometry(distance, maxOffsetY, planetSegments, planetSegments), new THREE.MeshBasicMaterial({
        transparent: true,  // Make torus transparent
        opacity: 0.0        // Make torus transparent
    }));
    torusAsteroid.rotation.x = THREE.Math.degToRad(90);
    torusAsteroid.name = data[asteroidBeltId].name;
    torusAsteroid.myId = asteroidBeltId;
    celestialObjects[solarSystemId].add(torusAsteroid);

    const asteroidCount = data[asteroidBeltId].number;
    let asteroidsGeometry = new THREE.Geometry();

    // Create the individual particles
    for (let i = 0; i < asteroidCount; i++) {
        // Create a particle with random position
        let asteroidDistance = distance + THREE.Math.randFloat(minOffsetXZ, maxOffsetXZ);
        let angle = THREE.Math.randFloat(0, THREE.Math.degToRad(360));
        let coord = new THREE.Vector3();

        coord.x = Math.cos(angle) * asteroidDistance;
        coord.y = THREE.Math.randFloat(minOffsetY, maxOffsetY);
        coord.z = Math.sin(angle) * asteroidDistance;

        // Insert asteroid
        asteroidsGeometry.vertices.push(coord);
    }

    asteroidsGeometry.morphAttributes = {};     // Used to fix updateMorphAttribute bug

    celestialObjects[asteroidBeltId] = new THREE.Points(asteroidsGeometry, new THREE.PointsMaterial({ size: asteroidSize }));
    celestialObjects[asteroidBeltId].name = data[asteroidBeltId].name;
    celestialObjects[asteroidBeltId].myId = asteroidBeltId;
    celestialObjects[solarSystemId].add(celestialObjects[asteroidBeltId]);
}

// Move planet
function movePlanet(Id) {
    // Rotation motion
    if (playRotationMovement) rotationMovement(Id);

    // Orbit motion
    if (playRevolutionMovement && Id != sunId) revolutionMovement(Id);
}

function rotationMovement(Id) {
    // Rotation angle
    let theta = THREE.Math.degToRad(360) * (date.getTime() / (data[Id].rotationRate * 3600000)); // Cast rotationRate in milliseconds

    celestialObjects[Id].rotation.y = theta;
    if (Id == earthId) celestialObjects[earthCloudId].rotation.y = theta/2;
    if (data[Id].hasOwnProperty("ringId")) celestialObjects[data[Id].ringId].rotation.z = theta;
}

function revolutionMovement(Id) {
    // Revolution angle
    let theta = (THREE.Math.degToRad(360) / (data[Id].revolutionRate * 86400000)) * date.getTime(); // theta = wt, cast revolutionRate in milliseconds
	let alpha = THREE.Math.degToRad(data[Id].orbitInclination);
	let phi = THREE.Math.degToRad(data[Id].initialAngle);

    let currentId = Id;
    if (data[Id].hasOwnProperty("groupId")) currentId = data[Id].groupId;
    celestialObjects[currentId].position.x = -data[Id].distance * Math.cos(theta + phi); // x = -R*Cos(wt + phi) (minus for Anti-clockwise)
	celestialObjects[currentId].position.y = 0; // y = 0
    celestialObjects[currentId].position.z = data[Id].distance * Math.sin(theta + phi); // z = R*Sin(wt + phi)

	// Inclined orbit
	if (inclinedOrbit) {
		celestialObjects[currentId].position.x *= Math.cos(alpha); // x = -R*Cos(wt + phi)*Cos(alpha)
		celestialObjects[currentId].position.y = -data[Id].distance * Math.cos(theta + phi) * Math.sin(alpha); // y = -R*Cos(wt + phi)*Sin(alpha)
	}
}
