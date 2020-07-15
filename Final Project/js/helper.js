const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Get month name from number
function getMonthName(month) {
    return monthNames[month];
}

var _RingGeometry = function (innerRadius, outerRadius, thetaSegments) {

	THREE.Geometry.call(this);

	var normal = new THREE.Vector3(0, 0, 1);

	for(var i = 0; i < thetaSegments; i++) {
		var angleLo	= (i / thetaSegments) * Math.PI * 2;
		var angleHi	= ((i+1) / thetaSegments) * Math.PI * 2;

		var vertex1	= new THREE.Vector3(innerRadius * Math.cos(angleLo), innerRadius * Math.sin(angleLo), 0);
		var vertex2	= new THREE.Vector3(outerRadius * Math.cos(angleLo), outerRadius * Math.sin(angleLo), 0);
		var vertex3	= new THREE.Vector3(innerRadius * Math.cos(angleHi), innerRadius * Math.sin(angleHi), 0);
		var vertex4	= new THREE.Vector3(outerRadius * Math.cos(angleHi), outerRadius * Math.sin(angleHi), 0);

		this.vertices.push(vertex1);
		this.vertices.push(vertex2);
		this.vertices.push(vertex3);
		this.vertices.push(vertex4);

		var vertexIdx = i * 4;

		// Create the first triangle
		var face = new THREE.Face3(vertexIdx + 0, vertexIdx + 1, vertexIdx + 2, normal);
		var uvs = [];

		var uv = new THREE.Vector2(0, 0);
		uvs.push(uv);
		var uv = new THREE.Vector2(1, 0);
		uvs.push(uv);
		var uv = new THREE.Vector2(0, 1);
		uvs.push(uv);

		this.faces.push(face);
		this.faceVertexUvs[0].push(uvs);

		// Create the second triangle
		var face = new THREE.Face3(vertexIdx + 2, vertexIdx + 1, vertexIdx + 3, normal);
		var uvs = [];

		var uv = new THREE.Vector2(0, 1);
		uvs.push(uv);
		var uv = new THREE.Vector2(1, 0);
		uvs.push(uv);
		var uv = new THREE.Vector2(1, 1);
		uvs.push(uv);

		this.faces.push(face);
		this.faceVertexUvs[0].push(uvs);
	}

	this.computeFaceNormals();
	this.boundingSphere = new THREE.Sphere(new THREE.Vector3(), outerRadius);

};
_RingGeometry.prototype = Object.create(THREE.Geometry.prototype);

// Increment date
function incrementDate() {
    let increment = 864000; // 1/100 of a day, 86400000 milliseconds = 1 day (1 x 24 x 60 x 60 x 1000)
    date.setTime(date.getTime() + increment * speedFactor); // Increment in milliseconds
    setDate(date);
}

// Set date
function setDate() {
    $("#currentDate").val(getMonthName(date.getMonth()) + " " + date.getDate() + ", " + date.getFullYear());
    $("#currentTime").val(date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds());
}

// Create stars (A cube with the same texture on the 6 inner faces)
function createBackground() {
    let cubeFaces = [];
	for (let i = 0; i < wallpapers.length; i++) {
	    for (let j = 0; j < 6; j++) cubeFaces[j] = wallpapers[i]; // Stars texture
	    backgrounds[i] = new THREE.CubeTextureLoader().load(cubeFaces);
	    backgrounds[i].format = THREE.RGBFormat;
	}
	scene.background = backgrounds[0];
}

// Ambient music
function ambientMusic() {
    // Load sounds
    audioLoader = new THREE.AudioLoader();

    for (let i = 0; i < tracks.length; i++) {
        // Create tracks and put it in global audio source array
        sounds[i] = new THREE.Audio(audioListener);

        audioLoader.load(tracks[i], function(buffer) {
        	sounds[i].setBuffer(buffer);
        	sounds[i].setLoop(true);
        	sounds[i].setVolume(volume);
            // Start firts track
            if (i == 0) {
                sound = sounds[0];
                sound.play();
            }
        });
    }
}
