// TODO: Figure out if there's away to tell if the
// video isn't available and send a better message
// than the youtube default one. or maybe play 
// a different video all together 

class YouTubePlayer extends HTMLElement {
  connectedCallback() {
    this.init();
  }

  async init() {
    this.videoId = this.getAttribute("video");
    this.startSeconds = this.getAttribute("start") !== null ? parseInt(this.getAttribute("start"), 10) : 0;
    this.loadApi();
    await this.apiLoader;
    const videoPlaceholderEl = document.createElement('div')
    this.append(videoPlaceholderEl);
    this.player = await new Promise(resolve => {
        let player = new YT.Player(videoPlaceholderEl, {
            width: "320",
            height: "195",
            videoId: this.videoId,
            playerVars: {
              "playsinline": 1,
              "start": this.startSeconds
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
      // unstarted
    } else if (playerState == YT.PlayerState.BUFFERING) {
      // buffering 
    } else if (playerState == YT.PlayerState.CUED) {
      // cued
    } else if (playerState == YT.PlayerState.ENDED) {
      this.playButton.innerHTML = "Play";
    } else if (playerState == YT.PlayerState.PAUSED) {
      this.playButton.innerHTML = "Play";
    } else if (playerState == YT.PlayerState.PLAYING) {
      this.playButton.innerHTML = "Pause";
    }
  }

  addButtons(player) {
    this.buttonWrapper = document.createElement("div");
    this.buttonWrapper.classList.add("yt-button-wrapper");
    this.playButton = document.createElement("button");
    this.playButton.innerHTML = "Play";
    this.playButton.classList.add("yt-play-button");
    this.playButton.addEventListener("click", (event) => {
      this.doPlayPause.call(this, event, this.player)
    });
    this.stopButton = document.createElement("button");
    this.stopButton.innerHTML = "Stop";
    this.stopButton.classList.add("yt-stop-button");
    this.stopButton.addEventListener("click", (event) => {
      this.doStop.call(this, event, this.player)
    });
    this.buttonWrapper.appendChild(this.playButton);
    this.buttonWrapper.appendChild(this.stopButton);
    this.appendChild(this.buttonWrapper);
    this.addSpeedButtons(player);
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
    speeds.forEach((speed, speedIndex) => {
      this.speedButtons[speedIndex] = document.createElement("button");
      this.speedButtons[speedIndex].classList.add("yt-speed-button");
      this.speedButtons[speedIndex].innerHTML = `${speed[0]}x`;
      this.buttonWrapper.appendChild(this.speedButtons[speedIndex]);
    });
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
      this.playButton.innerHTML = "Pause";
      // TODO: Figure out how to shift focus to
      // the player so keyboard controls work
    } else {
      player.pauseVideo();
      this.playButton.innerHTML = "Play";
      // TODO: adjust this so it doesn't flash
      // play when clicking to different parts
      // of the video
    }
  }

  doStop(event, player) {
    this.playButton.innerHTML = "Play";
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
