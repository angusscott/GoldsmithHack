(function () {

    var dataset = [5, 7, 1, 10, 11, 20, 15, 1, 20],
        duration = 30,
        interval = duration/dataset.length,
        volumes = [],
        speeds = [];

    function linearScale(x, outmin, outmax) {
        var a = Math.min(Math.min.apply(null, dataset), 0),
            b = Math.max.apply(null, dataset),
            c = outmin,
            d = outmax;
        return(c*(x-a)/(b-a) + d*(x-a)/(b-a));
    };

    for (var i=0; i<dataset.length; i++) {
        volumes.push(linearScale(dataset[i], 0.01, 0.3));
        speeds.push(linearScale(dataset[i], 0.5, 3.0));
    };

    function searchTracks(query) {
        $.ajax({
            url: 'https://api.spotify.com/v1/search',
            data: {
                q: query,
                type: 'track'
            },
            success: function (response) {
                if (response.tracks.items.length) {
                    var track = response.tracks.items[0];
                    var previewUrl = track.preview_url;
                    // audio.src = track.preview_url;
                    var context = new (window.AudioContext || window.webkitAudioContext) ();
                    var request = new XMLHttpRequest();
                    request.open('GET', previewUrl, true);
                    request.responseType = 'arraybuffer';
                    request.onload = function() {
                        var undecodedAudio = request.response;
                        context.decodeAudioData(undecodedAudio, function (buffer) {
                            var sourceBuffer = context.createBufferSource(),
                                startTime = context.currentTime,
                                masterVolume = context.createGain();
                            sourceBuffer.buffer = buffer;
                            sourceBuffer.connect(masterVolume);
                            masterVolume.connect(context.destination);
                            var timepoint = startTime;
                            for (var i = 0; i < dataset.length; i++) {
                                masterVolume.gain.linearRampToValueAtTime(volumes[i], timepoint);
                                sourceBuffer.playbackRate.linearRampToValueAtTime(speeds[i], timepoint);
                                timepoint = timepoint + interval;
                            };

                            sourceBuffer.start(startTime);
                        });
                    }
                    request.send();
                }
            }
        });
    }

    function playSong(songName, artistName) {
        var query = songName;
        if (artistName) {
            query += ' artist:' + artistName;
        }

        searchTracks(query);
    }

    $( "#randomise" ).click(function() {
        playSong("Sandstorm", "Darude");
    });

    $("#playmusic").click(function () {
        var track = $("#inputTrack").val()
        var artist = $("#inputArtist").val()
        playSong(track, artist);
    });

})();