 var dataset = [5, 7, 1, 10, 11, 3, 15, 1, 20],
        duration = 30, // total playback, in seconds
        interval = duration/dataset.length;

    function linearScale(x, outmin, outmax) {
        var a = Math.min(Math.min.apply(null, dataset), 0),
            b = Math.max.apply(null, dataset),
            c = outmin,
            d = outmax;
        return(c*(x-a)/(b-a) + d*(x-a)/(b-a));
    };

    // Output range limits
    var volmin = 0.05,
        volmax = 0.3,
        spdmin = 0.5,
        spdmax = 3.0;

    function searchTracks(query) {
        var volumes = [],
            speeds = [];
        for (var i=0; i<dataset.length; i++) {
            volumes.push(linearScale(dataset[i], volmin, volmax));
            speeds.push(linearScale(dataset[i], spdmin, spdmax));
        };
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
                                masterVolume = context.createGain(),
                                biquadFilter = context.createBiquadFilter();
                            sourceBuffer.buffer = buffer;
                            sourceBuffer.connect(masterVolume);
                            masterVolume.connect(context.destination);
                            // biquadFilter.connect(context.destination);
                            // biquadFilter.Q.value = 1; // makes quality rubbish
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
        var u = Math.random();
        if(Math.random()>0.5) {
            console.log('Playing Darude');
            playSong("Sandstorm", "Darude");
            $("#inputTrack").val("Sandstorm");
            $("#inputArtist").val("Darude");
        } else {
            console.log('Playing Rick Astley');
            playSong("Never Gonna Give You Up", "Rick Astley);
            $("#inputTrack").val("Never Gonna Give You Up");
            $("#inputArtist").val("Rick Astley");
        };
    });

    $("#playmusic").click(function () {
        var track = $("#inputTrack").val()
        var artist = $("#inputArtist").val()
        playSong(track, artist);
    });
