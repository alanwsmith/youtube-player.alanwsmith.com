// TODO: Figure out if there's away to tell if the
// video isn't available and send a better message
// than the youtube default one. or maybe play 
// a different video all together 
//
// TODO: Get available playback rates dynamically, maybe...
//
// ref: https://developers.google.com/youtube/iframe_api_reference

class YouTubePlayer extends HTMLElement {
  connectedCallback() {
    this.init();
  }

  async init() {
    this.dataset.state = "loading";
    this.videoId = this.getAttribute("video");
    this.startAt = this.getAttribute("start-at") !== null ? parseInt(this.getAttribute("start-at"), 10) : 0;
    this.loadApi();
    await this.apiLoader;
    this.videoWrapper = document.createElement("div");
    this.videoWrapper.classList.add("yt-video-wrapper");
    this.appendChild(this.videoWrapper);
    const videoEl = document.createElement('div')
    this.videoWrapper.appendChild(videoEl);
    this.player = await new Promise(resolve => {
        let player = new YT.Player(videoEl, {
            width: "640",
            height: "390",
            videoId: this.videoId,
            playerVars: {
              "playsinline": 1,
              "start": this.startAt
            },
            events: {
                "onReady": event => {
                    resolve(player);
                },
                "onStateChange": (event) => {
                  this.onPlayerStateChange.call(this, event);
                }
            }
        });
    }).then((value) => {return value});
    this.addButtons(this.player);
    // TODO: Figure out how to handle errors here. 
  }

  onPlayerStateChange(event) {
    // TODO: Figure out if there's a way to make the
    // text switch from play to pause as soon as the
    // video itself is clicked (right now there's a
    // little delay)
    const playerState = event.target.getPlayerState();
    if (playerState == -1) {
      this.dataset.state = "unstarted";
    } else if (playerState == YT.PlayerState.BUFFERING) {
      this.dataset.state = "buffering";
    } else if (playerState == YT.PlayerState.CUED) {
      this.dataset.state = "cued";
    } else if (playerState == YT.PlayerState.ENDED) {
      this.dataset.state = "ended";
      this.playButton.innerHTML = "play";
    } else if (playerState == YT.PlayerState.PAUSED) {
      this.dataset.state = "paused";
      this.playButton.innerHTML = "play";
    } else if (playerState == YT.PlayerState.PLAYING) {
      this.dataset.state = "playing";
      this.playButton.innerHTML = "pause";
    }
  }

  addButtons(player) {
    this.buttonWrapper = document.createElement("div");
    this.buttonWrapper.classList.add("yt-button-wrapper");
    this.playButton = document.createElement("button");
    this.playButton.innerHTML = "play";
    this.playButton.classList.add("yt-button");
    this.playButton.classList.add("yt-play-button");
    this.playButton.addEventListener("click", (event) => {
      this.doPlayPause.call(this, event, this.player)
    });
    this.stopButton = document.createElement("button");
    this.stopButton.innerHTML = "stop";
    this.stopButton.classList.add("yt-button");
    this.stopButton.classList.add("yt-stop-button");
    this.stopButton.addEventListener("click", (event) => {
      this.doStop.call(this, event, this.player)
    });

    this.buttonWrapper.appendChild(this.playButton);
    this.buttonWrapper.appendChild(this.stopButton);
    this.addSpeedButtons(player);

    this.muteButton = document.createElement("button");
    if (player.isMuted() === true) {
      this.muteButton.innerHTML = "unmute";
    } else {
      this.muteButton.innerHTML = "mute";
    }
    this.muteButton.classList.add("yt-button");
    this.muteButton.classList.add("yt-mute-button");
    this.muteButton.addEventListener("click", (event) => {
      this.doMuteUnmute.call(this, event, this.player)
    });
    this.buttonWrapper.appendChild(this.muteButton);
    this.appendChild(this.buttonWrapper);
  }

  addSpeedButtons(player) {
    this.speedButtons = []
    const speeds = [
      [1, "1"],
      [1.5, "1-5"],
      [2, "2"],
      [2.5, "2-5"],
      [3, "2"],
    ];
    speeds.forEach((speed) => {
      const speedButton = document.createElement("button");
      speedButton.classList.add("yt-button");
      speedButton.classList.add("yt-speed-button");
      speedButton.innerHTML = `${speed[0]}x`;
      speedButton.dataset.speed = speed[0];
      speedButton.addEventListener("click", (event) => {
        this.adjustSpeed.call(this, event, player);
      });
      this.speedButtons.push(speedButton);
    });
    this.speedButtons.forEach((speedButton) => {
      this.buttonWrapper.appendChild(speedButton);
    });
  }

  adjustSpeed(event, player) {
    const speed = parseFloat(event.target.dataset.speed);
    player.setPlaybackRate(speed);
  }

  doMuteUnmute(event, player) {
    if (player.isMuted() === true) {
      player.unMute();
      this.muteButton.innerHTML = "mute";
    } else {
      player.mute();
      this.muteButton.innerHTML = "unmute";
    }
  }

  doPlayPause(event, player) {
    const buttonEl = event.target;
    const playerState = player.getPlayerState();
    // The docs don't list a YT.PlayerState.UNSTARTED
    // flag so using the explicit `-1` instead
    if (
      playerState == -1 ||
      playerState == YT.PlayerState.ENDED ||
      playerState == YT.PlayerState.PAUSED ||
      playerState == YT.PlayerState.BUFFERING ||
      playerState == YT.PlayerState.CUED
    ) {
      player.playVideo();
      this.playButton.innerHTML = "pause";
      // TODO: Figure out how to shift focus to
      // the player so keyboard controls work
    } else {
      player.pauseVideo();
      this.playButton.innerHTML = "play";
      // TODO: adjust this so it doesn't flash
      // play when clicking to different parts
      // of the video
    }
  }

  doStop(event, player) {
    this.playButton.innerHTML = "play";
    player.stopVideo();
  }

  loadApi() {
    // this if is from Paul Irish's embed, not sure why 
    // the OR condition with window.YT.Player is there since
    // it seems like the window.YT would always hit first
    if (window.YT || (window.YT && window.YT.Player)) {
      return;
    }

    this.apiLoader = new Promise((res, rej) => {
        var el = document.createElement('script');
        el.src = 'https://www.youtube.com/iframe_api';
        el.async = true;
        el.onload = _ => {
            YT.ready(res);
        };
        el.onerror = rej;
        this.append(el);
    });
  }
}

customElements.define('yt-player', YouTubePlayer);

/*
var tag = document.createElement("script")
tag.src = "https://www.youtube.com/iframe_api"
var firstScriptTag = document.getElementsByTagName("script")[0]
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
const ytPlayers = []
function onYouTubeIframeAPIReady() {
  ytPlayers[0] = new YT.Player("ytPlayer-1", {
    height: "195",
    width: "320",
    videoId: "_YUzQa_1RCE",
    playerVars: {
      "playsinline": 1
    },
    events: {
      "onReady": onPlayerReady,
      "onStateChange": onPlayerStateChange
    }
  })
}

function onPlayerReady(event) {
  console.log("ytPlayer: ready")
  addYtButtons(event.target)
}

function onPlayerStateChange(event) {
  if (event.data == -1) {
    console.log("ytPlayer: unstarted")
  } else if (playerState == 0) {
    console.log("ytPlayer: ended")
  } else if (playerState == 1) {
    console.log("ytPlayer: playing")
  } else if (playerState == 2) {
    console.log("ytPlayer: paused")
  } else if (playerState == 3) {
    console.log("ytPlayer: buffering")
  } else if (playerState == 5) {
    console.log("ytPlayer: cued")
  }
}

function addYtButtons(player) {
  const playerEl = player.g
  const playerWrapper = playerEl.parentElement
  const buttonWrapperEl = document.createElement("div")
  const playButtonEl = document.createElement("button")
  playButtonEl.innerHTML = "Play"
  playButtonEl.addEventListener("click", (event, playerEl) => { playVideo(event, playerEl) })
  buttonWrapperEl.appendChild(playButtonEl)
  playerWrapper.appendChild(buttonWrapperEl)
}

function playVideo(event, playerEl) {
  console.log(event)
  console.log(playerEl)
}
*/
