
var onSliderChange = function() {
    var newVolume = systemVolumeSlider.getValue() / 100.0
	httpClient.get("setSystemVolume?volume=" + newVolume, gotSetSystemVolumeResponse)
}

var gotSystemInfoResponse = function(responseText) {
    var response = JSON.parse(responseText)
    var volume = Math.round(response["systemVolume"])
    systemVolumeSlider.setValue(volume)
}

var gotSetSystemVolumeResponse = function(responseText) {
    if (responseText != "success")
        alert("Bad stuff: " + responseText)
}

var systemVolumeSlider = $('#systemVolumeSlider').slider()
		.on('slideStop', onSliderChange)
		.data('slider')

var HttpClient = function() {
    this.get = function(aUrl, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() {
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(anHttpRequest.responseText);
        }

        anHttpRequest.open( "GET", aUrl, true );
        anHttpRequest.send( null );
    }
}

var setAudioDevice = function(deviceName) {
    httpClient.get("setAudioDevice?audioDevice=" + deviceName, function(){})
}

var deleteAudioDevice = function(uuid) {
    delete audioDevices[uuid]
    $("#"+uuid).remove()
    saveAudioDevices()
}

var makeButton = function(uuid, deviceName) {
    return "<li class='list-item' id='"+uuid+"'>" +
               "<button type='button' class='btn btn-outline-primary m-1' onClick='setAudioDevice(\""+deviceName+"\")'>" +
                   deviceName +
               "</button>" +
               "<button type='button' class='btn btn-outline-danger m-1 btn-sm' onClick='deleteAudioDevice(\""+uuid+"\")'>" +
                   "delete" +
               "</button>" +
           "</li>"
}

function getUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function loadAudioDevices(){
    return JSON.parse(localStorage.getItem('audioDevices')) || {}
}

function saveAudioDevices(){
    localStorage.setItem('audioDevices', JSON.stringify(audioDevices))
}

$( document ).ready(function() {
    httpClient = new HttpClient()
    httpClient.get("getSystemInfo", gotSystemInfoResponse)

    audioDevices = loadAudioDevices()

    for(var uuid in audioDevices){
        $("#audioDevicesList").append(makeButton(uuid, audioDevices[uuid]))
    }

    $("#addAudioDeviceButton").click(function(){
        var deviceName = $("#addAudioDeviceTextbox").val()
        var uuid = getUUID()
        audioDevices[uuid] = deviceName
        saveAudioDevices()
        $("#audioDevicesList").append(makeButton(uuid, deviceName))
    });
});

