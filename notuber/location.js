/*Gets current location*/
var map;
var myLat = 0;
var myLng = 0;
var prevMarker;

function getMyLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(gotLocation);
    } else {
        alert("Geolocation not enabled")
    }
}

function gotLocation(position) {
    myLat = position.coords.latitude;
    myLng = position.coords.longitude;
    outputElem = document.getElementById("info");
    myLocation = new google.maps.LatLng(myLat, myLng);
    marker = new google.maps.Marker({
        position: myLocation,
        map: map,
        icon: "myicon.png",
        title: "You are here"
    });
    marker.setMap(map);
    map.setZoom(15);
    map.panTo(marker.position);
    getData();
}

/*Creates the map and puts the center of it at lat = 0, long = 0*/
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 0, lng: 0},
        zoom: 15
    });
    getMyLocation();
}

function getData() {
    /*Sends your username and location to the server*/
    var request = new XMLHttpRequest();
    var url = "https://jordan-marsh.herokuapp.com/rides";
    var params = "username=BqndCOzP0m&lat=" + myLat + "&lng=" + myLng;
    request.open("POST", url);
    /*Sends info along with request*/
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            processData(request.responseText);
        }
        if (request.readyState == 4 && request.status == 400) {
            alert("Something went wrong");
        }
    }

    request.send(params);
}

function processData(data) {
    var processedData = JSON.parse(data);
    //if i'm a passenger
    if (Object.keys(processedData) == "vehicles") {
        for (var i = 0; i < processedData.vehicles.length; i++) {
            //create object for location
            var carLocation = new google.maps.LatLng(processedData.vehicles[i].lat, processedData.vehicles[i].lng);
            //calculate distance
            var distance = (google.maps.geometry.spherical.computeDistanceBetween(carLocation, myLocation) / 1609.34);
            //create icon for the car
            icon = "car.png";
            //set icon for the car to all cars
            var carMarkers = [];
            carMarkers[i] = new google.maps.Marker({
                position: carLocation,
                icon: icon,
                map: map
            });
            //set content of info windows
            var windowContent = "username: " + processedData.vehicles[i].username + "distance: " + distance;
            carMarkers[i].info = new google.maps.InfoWindow({
                content: windowContent
            });
            google.maps.event.addListener(carMarkers[i], 'click', function () {
                if (prevMarker != null) {
                    prevMarker.info.close()
                }
                this.info.open(map, this)
                prevMarker = this
            });
        }
    }
    else {
        for (var i = 0; i < processedData.passengers.length; i++) {
            var pasLocation = new google.maps.LatLng(processedData.passengers[i].lat, processedData.passengers[i].lng);
            var distance = (google.maps.geometry.spherical.computeDistanceBetween(pasLocation, myLocation) / 1609.34);
            icon = "passengericon.png";
            var pasMarkers = [];
            pasMarkers[i] = new google.maps.Marker({
                position: pasLocation,
                icon: icon,
                map: map
            });
            var windowContent = "username: " + processedData.passengers[i].username + "distance: " + distance;
            pasMarkers[i].info = new google.maps.InfoWindow({
                content: windowContent
            });
            google.maps.event.addListener(pasMarkers[i], 'click', function () {
                if (prevMarker != null) {
                    prevMarker.info.close()
                }
                this.info.open(map, this)
                prevMarker = this
            });
        }
    }
}