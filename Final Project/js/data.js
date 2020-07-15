// Ids
const sunId = 0;
const mercuryId = 1;
const venusId = 2;
const earthId = 3;
const marsId = 4;
const jupiterId = 5;
const saturnId = 6;
const uranusId = 7;
const neptuneId = 8;
const plutoId = 9;
const moonId = 10;
const earthCloudId = 11;
const saturnRingId = 12;
const uranusRingId = 13;
const sunGlowId = 14;
const solarSystemId = 15;
const earthSystemId = 16;
const saturnSystemId = 17;
const uranusSystemId = 18;
const asteroidBeltId = 19;

// Planet (Sphere) segments
const planetSegments = 48;

// Orbit segments
const orbitSegments = 1024;

// Planets data
const data = [];
data[earthId] = {
    name: "Earth",
    type: "Rochy",
    size: 1,
    diameter: "12756 km",
    averageDistanceFromSun: "1 AU (150M of km)",
    density: "5.52 g/cm\u00B3",
    gravity: "9.807 m/s\u00B2",
    numberOfMoons: 1,
    distance: 50,
    revolutionRate: 365,
    rotationRate: 24,
    equatorInclination: 23.45,
    orbitInclination: 0,
    initialAngle: 285,
    orbitCenter: earthSystemId,
    groupId: earthSystemId,
    color: "img/earthColorMap.jpg",
    bump: "img/earthBumpMap.jpg",
    specular: "img/earthSpecularMap.jpg",
    cloud: "img/earthCloudMap.jpg",
    cloudTrans: "img/earthCloudMapTrans.jpg",
    lights: "img/earthLightsMap.jpg",
    icon: "img/earth.png",
    bumpScale: 0.05
};
data[sunId] = {
    name: "Sun",
    size: data[earthId].size * 15,
    rotationRate: data[earthId].rotationRate * 25.38,
    equatorInclination: 7.4166,
    diameter: "696000 km",
    density: "1.41 g/cm\u00B3",
    gravity: "274 m/s\u00B2",
    color: "img/sunColorMap.jpg",
    glow: "img/glow.png",
    icon: "img/sun.png",
    bumpScale: 0.05
};
data[mercuryId] = {
    name: "Mercury",
    type: "Rochy",
    diameter: "4880 km",
    averageDistanceFromSun: "0.39 AU (58M of km)",
    density: "5.44 g/cm\u00B3",
    gravity: "3.7 m/s\u00B2",
    numberOfMoons: 0,
    size: data[earthId].size * 0.382,
    distance: data[earthId].distance * 0.387,
    revolutionRate: data[earthId].revolutionRate * 0.241,
    rotationRate: data[earthId].rotationRate * 58.785,
    initialAngle: 215,
    equatorInclination: 0,
    orbitInclination: 7,
    orbitCenter: solarSystemId,
    color: "img/mercuryColorMap.jpg",
    bump: "img/mercuryBumpMap.jpg",
    icon: "img/mercury.png",
    bumpScale: 0.005
};
data[venusId] = {
    name: "Venus",
    type: "Rochy",
    diameter: "12104 km",
    averageDistanceFromSun: "0.72 AU (108M of km)",
    density: "5.2 g/cm\u00B3",
    gravity: "8.87 m/s\u00B2",
    numberOfMoons: 0,
    size: data[earthId].size * 0.949,
    distance: data[earthId].distance * 0.723,
    revolutionRate: data[earthId].revolutionRate * 0.6152,
    rotationRate: data[earthId].rotationRate * 243.69,
    initialAngle: 85,
    equatorInclination: 178,
    orbitInclination: 3.4,
    orbitCenter: solarSystemId,
    color: "img/venusColorMap.jpg",
    bump: "img/venusBumpMap.jpg",
    icon: "img/venus.png",
    bumpScale: 0.005
};
data[marsId] = {
    name: "Mars",
    type: "Rochy",
    diameter: "6787 km",
    averageDistanceFromSun: "1.52 AU (228M of km)",
    density: "3.93 g/cm\u00B3",
    gravity: "3.711 m/s\u00B2",
    numberOfMoons: 2,
    size: data[earthId].size * 0.532,
    distance: data[earthId].distance * 1.524,
    revolutionRate: data[earthId].revolutionRate * 1.881,
    rotationRate: data[earthId].rotationRate * 1.02595675,
    initialAngle: 200,
    equatorInclination: 23.9833,
    orbitInclination: 1.85,
    orbitCenter: solarSystemId,
    color: "img/marsColorMap.jpg",
    bump: "img/marsBumpMap.jpg",
    normal: "img/marsNormalMap.jpg",
    icon: "img/mars.png",
    bumpScale: 0.05
};
data[jupiterId] = {
    name: "Jupiter",
    type: "Gas giant",
    diameter: "142800 km",
    averageDistanceFromSun: "5.20 AU (778M of km)",
    density: "1.3 g/cm\u00B3",
    gravity: "24.97 m/s\u00B2",
    numberOfMoons: 16,
    size: data[earthId].size * 11.19,
    distance: data[earthId].distance * 5.203,
    revolutionRate: data[earthId].revolutionRate * 11.86,
    rotationRate: data[earthId].rotationRate * 0.41354,
    initialAngle: 20,
    equatorInclination: 3.0833,
    orbitInclination: 1.3,
    orbitCenter: solarSystemId,
    color: "img/jupiterColorMap.jpg",
    icon: "img/jupiter.png",
    bumpScale: 0.02
};
data[saturnId] = {
    name: "Saturn",
    type: "Gas giant",
    diameter: "120000 km",
    averageDistanceFromSun: "9.54 AU (1427M of km)",
    density: "0.69 g/cm\u00B3",
    gravity: "10.44 m/s\u00B2",
    numberOfMoons: 18,
    size: data[earthId].size * 9.26,
    distance: data[earthId].distance * 9.537,
    revolutionRate: data[earthId].revolutionRate * 29.45,
    rotationRate: data[earthId].rotationRate * 0.44401,
    initialAngle: 215,
    equatorInclination: 26.7333,
    orbitInclination: 2.4833,
    ringSegments: 500,
    orbitCenter: solarSystemId,
    groupId: saturnSystemId,
    color: "img/saturnColorMap.jpg",
    ringColor: "img/saturnRingColor.jpg",
    ringPattern: "img/saturnRingPattern.gif",
    ringId: saturnRingId,
    icon: "img/saturn.png",
    bumpScale: 0.05
};
data[saturnId].ringInnerDiameter = data[saturnId].size * 1.5;
data[saturnId].ringOuterDiameter = data[saturnId].ringInnerDiameter * 1.5;
data[uranusId] = {
    name: "Uranus",
    type: "Ice gas",
    diameter: "51800 km",
    averageDistanceFromSun: "19.19 AU (2878M of km)",
    density: "1.28 g/cm\u00B3",
    gravity: "8.87 m/s\u00B2",
    numberOfMoons: 15,
    size: data[earthId].size * 4.01,
    distance: data[earthId].distance * 19.191,
    revolutionRate: data[earthId].revolutionRate * 84.02,
    rotationRate: data[earthId].rotationRate * 0.71833,
    initialAngle: 10,
    equatorInclination: 98,
    orbitInclination: 0.7666,
    ringSegments: 500,
    orbitCenter: solarSystemId,
    groupId: uranusSystemId,
    color: "img/uranusColorMap.jpg",
    ringColor: "img/uranusRingColor.jpg",
    ringPattern: "img/uranusRingPattern.gif",
    ringId: uranusRingId,
    icon: "img/uranus.png",
    bumpScale: 0.05
};
data[uranusId].ringInnerDiameter = data[uranusId].size * 1.5;
data[uranusId].ringOuterDiameter = data[uranusId].ringInnerDiameter * 1.5;
data[neptuneId] = {
    name: "Neptune",
    type: "Ice gas",
    diameter: "49500 km",
    averageDistanceFromSun: "30.06 AU (4497M of km)",
    density: "1.64 g/cm\u00B3",
    gravity: "11.15 m/s\u00B2",
    numberOfMoons: 8,
    size: data[earthId].size * 3.88,
    distance: data[earthId].distance * 30.069,
    revolutionRate: data[earthId].revolutionRate * 164.79,
    rotationRate: data[earthId].rotationRate * 0.67125,
    initialAngle: 45,
    equatorInclination: 28.8,
    orbitInclination: 1.7666,
    orbitCenter: solarSystemId,
    color: "img/neptuneColorMap.jpg",
    icon: "img/neptune.png"
};
data[plutoId] = {
    name: "Pluto",
    type: "Rochy",
    diameter: "6000 km",
    averageDistanceFromSun: "39.44 AU (5900M of km)",
    density: "2.06 g/cm\u00B3",
    gravity: "0.62 m/s\u00B2",
    numberOfMoons: 1,
    size: data[earthId].size * 0.18,
    distance: data[earthId].distance * 39.44,
    revolutionRate: data[earthId].revolutionRate * 249.6913,
    rotationRate: data[earthId].rotationRate * 0.0065,
    initialAngle: 330,
    equatorInclination: 0,
    orbitInclination: 17.1666,
    orbitCenter: solarSystemId,
    color: "img/plutoColorMap.jpg",
    bump: "img/plutoBumpMap.jpg",
    icon: "img/pluto.png",
    bumpScale: 0.005
};
data[moonId] = {
    name: "Moon",
    diameter: "3474.2 km",
    distanceFromEarth: "384400 km",
    density: "3.34 g/cm\u00B3",
    gravity: "1.62 m/s\u00B2",
    revolutionRate: data[earthId].revolutionRate * 0.0748,
    rotationRate: data[earthId].rotationRate * 27.0321662037,
    initialAngle: 0,
    distance: data[earthId].distance * 0.04,
    size: data[earthId].size * 0.2725,
    equatorInclination: 0,
    orbitInclination: 5.25,
    orbitCenter: earthSystemId,
    color: "img/moonColorMap.jpg",
    bump: "img/moonBumpMap.jpg",
    icon: "img/moon.png",
    bumpScale: 0.002
};
data[asteroidBeltId] = {
    name: "Asteroid Belt",
    distance: (data[jupiterId].distance + data[marsId].distance)/2,
    size: 0.01,
    minOffsetY: -5,
    maxOffsetY: 5,
    minOffsetXZ: -30,
    maxOffsetXZ: 30,
    number: 20000,
    orbitCenter: solarSystemId,
    revolutionRate: (data[jupiterId].revolutionRate + data[marsId].revolutionRate)/2,
    icon: "img/asteroidBelt.png"
};
