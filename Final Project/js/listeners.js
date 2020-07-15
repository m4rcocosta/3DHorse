// Cursor variables
var mouseDown = false;
var tooltipping = false;

// Capture the object selected with mouse
function captureObject(point) {
    // Normalize mouse coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Capture the clicked object
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(scene.children, true);

    // Analize the result
    for (let i = 0; i < intersects.length; i++)
        if (intersects[i].object.name != "orbit" && intersects[i].object.name != "Sun Glow") {
            if ($("#asteroidBeltCheckbox").is(":checked")) {
                if (point) point.coord = intersects[i].point; // Funct called by showInfoPlanet
                return intersects[i].object; // Found object that is not an orbit or sun glow
            }
            else {
                if (intersects[i].object.name != "Asteroid Belt") {
                    if (point) point.coord = intersects[i].point; // Funct called by showInfoPlanet
                    return intersects[i].object; // Found object that is not an orbit, sun glow or asteroid belt
                }
            }
        }
    return null; // There are no element or only orbits
}

// Focus camera over a selected planet
function dblclickPlanet(event) {
    // Capture the object
    var targetElement = captureObject(null); // Null if it's not object or it's orbit or sun glow

    // Focus camera on it
    if (targetElement && targetElement.name != celestialObjects[asteroidBeltId].name && targetElement.name != celestialObjects[moonId].name) {
        followPlanetId = targetElement.myId;
        if (data[followPlanetId].hasOwnProperty("groupId")) followPlanetId = data[followPlanetId].groupId;
        followPlanet(followPlanetId);
        goToObject(followPlanetId);
        $("#cameraSelect").val(targetElement.myId);
        $("#cameraSelect").formSelect();
    }
}

// Function to move the camera near the object
function goToObject(Id) {
    if (Id == sunId) {
        camera.position.set(celestialObjects[Id].position.x + 30, celestialObjects[Id].position.y + 15, celestialObjects[Id].position.z + 30);
        camera.zoom = 3.0;
    }
    else {
        camera.position.set(celestialObjects[Id].position.x + 25, celestialObjects[Id].position.y + 12.5, celestialObjects[Id].position.z + 25);
        camera.zoom = 3.0;
    }
}

// Function to update target object
function followPlanet(Id) {
    controls.target.set(celestialObjects[Id].position.x, celestialObjects[Id].position.y, celestialObjects[Id].position.z);
    controls.update();
}

// Function to show planet infos in a tooltip
function showInfoPlanet(event) {
    // Capture the object
    var point = {coord:null};
    var targetElement = captureObject(point); // Null if it's not object or it's orbit or sun glow

    // Show tooltip
    if (targetElement) {
        $("#tooltip").css({
            display: "block",
            opacity: 0.0
        });
        tooltipping = true;
        var canvasHalfWidth = renderer.domElement.offsetWidth / 2;
        var canvasHalfHeight = renderer.domElement.offsetHeight / 2;

        var tooltipPosition = point.coord.clone().project(camera);
        tooltipPosition.x = (tooltipPosition.x * canvasHalfWidth) + canvasHalfWidth + renderer.domElement.offsetLeft;
        tooltipPosition.y = -(tooltipPosition.y * canvasHalfHeight) + canvasHalfHeight + renderer.domElement.offsetTop;

        var tootipWidth = $("#tooltip")[0].offsetWidth;
        var tootipHeight = $("#tooltip")[0].offsetHeight;

        $("#tooltip").css({
            left: `${tooltipPosition.x - tootipWidth/2}px`,
            top: `${tooltipPosition.y - tootipHeight - 70}px`
        });

        let currentId = targetElement.myId;

        $("#tooltip").html("<div style='float:left;padding-top:10px;padding-left:10px;'><img src='" + data[currentId].icon + "' width=50></div> <h4 style='size:20pt;'>" + targetElement.name + "</h4>");
        if(data[currentId].hasOwnProperty("rotationRate")) $("#tooltip").append("</br>Rotation: " + data[currentId].rotationRate.toFixed(2) + " hours");
        if(data[currentId].hasOwnProperty("revolutionRate")) $("#tooltip").append("</br>Revolution: " + data[currentId].revolutionRate.toFixed(2) + " days");
        if(data[currentId].hasOwnProperty("equatorInclination")) $("#tooltip").append("</br>Axis inclination: " + data[currentId].equatorInclination.toFixed(2) + "°");
        if(data[currentId].hasOwnProperty("orbitInclination")) $("#tooltip").append("</br>Orbit inclination: " + data[currentId].orbitInclination.toFixed(2) + "°");
        if(data[currentId].hasOwnProperty("type")) $("#tooltip").append("</br>Type: " + data[currentId].type);
        if(data[currentId].hasOwnProperty("diameter")) $("#tooltip").append("</br>Diameter: " + data[currentId].diameter);
        if(data[currentId].hasOwnProperty("averageDistanceFromSun")) $("#tooltip").append("</br>Average distance from sun: " + data[currentId].averageDistanceFromSun);
        if(data[currentId].hasOwnProperty("distanceFromEarth")) $("#tooltip").append("</br>Distance from Earth: " + data[currentId].distanceFromEarth);
        if(data[currentId].hasOwnProperty("density")) $("#tooltip").append("</br>Density: " + data[currentId].density);
        if(data[currentId].hasOwnProperty("gravity")) $("#tooltip").append("</br>Gravity: " + data[currentId].gravity);
        if(data[currentId].hasOwnProperty("numberOfMoons")) $("#tooltip").append("</br>Number of moons: " + data[currentId].numberOfMoons);

        setTimeout(function() {
            $("#tooltip").css({
                opacity: 1.0
            });
        }, 25);
    }
    else {
        $("#tooltip").css({
            display: "none"
        });
        tooltipping = false;
    }
}

// Listener for window resizing
$(window).on("resize", function(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Listener for double click over a planet
$("#container").on("dblclick", dblclickPlanet);

// Listener for hover on a planet
$("#container").on("mousemove", showInfoPlanet);

// Listener for ambient music
$("#music-button").on("click", function(event) {
    if (sound.isPlaying) {
        sound.pause();
        $("#music-button").html("<i class='material-icons'>volume_up</i>");
    }
    else {
        sound.play();
        $("#music-button").html("<i class='material-icons'>volume_off</i>");
    }
});

/** Listeners for sidebar menu **/

// Listener for play/stop animation
$("#playButton").on("click", function(event) {
    if (play) {
        play = false;
        $("#playButton").html("<i class='material-icons left'>play_circle_filled</i>Play Animation");
        if ($("#rotationCheckbox").is(":checked")) $("#rotationCheckbox").click();
        if ($("#revolutionCheckbox").is(":checked")) $("#revolutionCheckbox").click();
        $("#rotationCheckbox").attr("disabled", "true");
        $("#revolutionCheckbox").attr("disabled", "true");
    }
    else {
        play = true;
        $("#playButton").html("<i class='material-icons left'>pause_circle_filled</i>Pause Animation");
        $("#rotationCheckbox").removeAttr("disabled");
        $("#revolutionCheckbox").removeAttr("disabled");
        $("#rotationCheckbox").click();
        $("#revolutionCheckbox").click();
    }
});

// Listener for play/stop rotation movement
$("#rotationCheckbox").on("change", function(event) {
    if (event.target.checked) playRotationMovement = true;
    else playRotationMovement= false;
});

// Listener for play/stop revolution movement
$("#revolutionCheckbox").on("change", function(event) {
    if (event.target.checked) playRevolutionMovement = true;
    else playRevolutionMovement= false;
});

// Listener for show/hide orbits
$("#orbitVisibilityCheckbox").on("change", function(event) {
    if (event.target.checked) for (let i = mercuryId; i <= moonId; i++) orbits[i].visible = true;
    else for (let i = mercuryId; i <= moonId; i++) orbits[i].visible = false;
});

// Listener for incline/not incline orbits
$("#orbitInclinationCheckbox").on("change", function(event) {
    if (event.target.checked) {
        inclinedOrbit = true;
        for (let i = mercuryId; i <= moonId; i++) orbits[i].rotation.y = THREE.Math.degToRad(data[i].orbitInclination);
    }
    else {
        inclinedOrbit = false;
        for (let i = mercuryId; i <= moonId; i++) orbits[i].rotation.y = 0;
    }
});

// Listener for modify current date
$("#setDate").on("change", function(event) {
    if (play) $("#playButton").click();
    let newDate = $("#setDate").val();
    let dateString = newDate + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    date = new Date(dateString);
    setDate();
    for (let i = mercuryId; i <= moonId; i++) revolutionMovement(i);
});

// Listener for modify current time
$("#setTime").on("change", function(event) {
    if (play) $("#playButton").click();
    let newTime = $("#setTime").val();
    let dateString = getMonthName(date.getMonth()) + " " + date.getDate() + ", " + date.getFullYear() + " " + newTime + ":" + date.getSeconds();
    date = new Date(dateString);
    setDate();
    for (let i = mercuryId; i <= moonId; i++) revolutionMovement(i);
});

// Listener for modify speedFactor value
$("#speedSlider").on("input", function(event) {
    speedFactor = event.target.value;
    $("#speedText").html("Speed: " + speedFactor + "x");
});

// Listener for modify far value
$("#farSlider").on("input", function(event) {
    far = parseFloat(event.target.value);
    camera.far = far;
    camera.updateProjectionMatrix();
    $("#farText").html("Far: " + far);
});

// Listener for move camera on a selected planet
$("#cameraSelect").on("change", function(event) {
    let planetId = $("#cameraSelect").val();
    if (data[planetId].hasOwnProperty("groupId")) planetId = data[planetId].groupId;
    followPlanetId = planetId;
    followPlanet(followPlanetId);
    goToObject(followPlanetId);
});

// Listener for follow/not follow the target planet
$("#followPlanetCheckbox").on("change", function(event) {
    if (event.target.checked) cameraFollowsPlanet = true;
    else cameraFollowsPlanet = false;
});

// Listener for rotate/not rotate the camera on the target planet
$("#rotateCameraCheckbox").on("change", function(event) {
    if (event.target.checked) controls.autoRotate = true;
    else controls.autoRotate = false;
});

// Listener for show/hide Earth clouds
$("#earthCloudCheckbox").on("change", function(event) {
    if (event.target.checked) celestialObjects[earthId].add(celestialObjects[earthCloudId]);
    else celestialObjects[earthId].remove(celestialObjects[earthCloudId]);
});

// Listener for turn on/off Earth lights
$("#earthLightsCheckbox").on("change", function(event) {
    if (event.target.checked) celestialObjects[earthId].material = new THREE.MeshMatcapMaterial({
        map: textureLoader.load(data[earthId].lights)
    });
    else celestialObjects[earthId].material = new THREE.MeshPhongMaterial({
        map: textureLoader.load(data[earthId].color),
        bumpMap: textureLoader.load(data[earthId].bump),
        bumpScale: data[earthId].bumpScale,
        specularMap: textureLoader.load(data[earthId].specular),
        specular: new THREE.Color("grey")
    });
});

// Listener for show/hide asteroid belt
$("#asteroidBeltCheckbox").on("change", function(event) {
    if (event.target.checked) celestialObjects[solarSystemId].add(celestialObjects[asteroidBeltId]);
    else celestialObjects[solarSystemId].remove(celestialObjects[asteroidBeltId]);
});

// Listener for turn on/off ambient light
$("#ambientLightCheckbox").on("change", function(event) {
    if (event.target.checked) scene.add(ambientLight);
    else scene.remove(ambientLight);
});

// Listener for turn on/off sun light
$("#sunLightCheckbox").on("change", function(event) {
    if (event.target.checked) scene.add(sunLight);
    else scene.remove(sunLight);
});

// Listener for show/hide sun glow
$("#sunGlowCheckbox").on("change", function(event) {
    if (event.target.checked) celestialObjects[sunId].add(celestialObjects[sunGlowId]);
    else celestialObjects[sunId].remove(celestialObjects[sunGlowId]);
});

// Listener for modify sun light intensity value
$("#sunLightSlider").on("input", function(event) {
    let intensity = parseFloat(event.target.value);
    sunLight.intensity = intensity;
    $("#sunLightText").html("Sun light intensity: " + intensity);
});

// Listener for modify ambient light intensity value
$("#ambientLightSlider").on("input", function(event) {
    let intensity = parseFloat(event.target.value);
    ambientLight.intensity = intensity;
    $("#ambientLightText").html("Ambient light intensity: " + intensity);
});

// Listener for modify background
$("#backgroundSelect").on("change", function(event) {
    let background = $("#backgroundSelect").val();
    scene.background = backgrounds[background];
});

// Listener for modify sound track
$("#trackSelect").on("change", function(event) {
    let track = $("#trackSelect").val();
    sound.stop();
    sound = sounds[track];
    sound.setVolume(volume);
    sound.play();
});

// Listener for modify sound volume
$("#volumeSlider").on("input", function(event) {
    volume = parseFloat(event.target.value);
    sound.setVolume(volume);
    $("#volumeText").html("Volume: " + volume);
});

// Listener for initialize materialize components
$(document).ready(function() {
    $(".sidenav").sidenav({edge: "right"});
    $("select").formSelect();
    $(".tap-target").tapTarget();
    $(".datepicker").datepicker({
        container: $("#container"),
        yearRange: 50,
        format: "mmmm d, yyyy"
    });
    $(".timepicker").timepicker({container: "#container", twelveHour: false});
});

// Listener for initial loading page
$(window).on("load", function() {
    $("#loading").css("display", "none"); // Hide chargement
	render(); // Render starts when window has been loaded
});

// Cursor listeners
$("#container").on("mousemove", function() {
    if (mouseDown) $("#container").css("cursor", "move");
    else if (tooltipping )$("#container").css("cursor", "pointer");
    else $("#container").css("cursor", "default");
});

$("#container").on("mousedown", function() {
    mouseDown = true;
});

$("#container").on("mouseup", function() {
    mouseDown = false;
});
