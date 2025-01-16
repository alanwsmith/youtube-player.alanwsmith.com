// TODO: Figure out if there's away to tell if the
// video isn't available and send a better message
// than the youtube default one. or maybe play
// a different video all together
//
// TODO: Maybe add an end time
//
// NOTE: YouTube iframe API Reference:
// https://developers.google.com/youtube/iframe_api_reference
//
// TODO: Figure out if there's a way to make the
// text switch from play to pause as soon as the
// video itself is clicked (right now there's a
// little delay)
//
// TODO: Add icon buttons
//
// TODO: Move CSS Into component file directly
//

const componentStyles = document.createElement('style')
componentStyles.innerHTML = `
body {
  transition: all 1.2s ease-out;
}

body[data-youtube-state=playing] {
  --background-color: black;
  --primary-color: #444;
}

.youtube-button {
  background: none;
  border: 1px solid #333;
  border-radius: 0.4rem;
  color: #aaa;
  cursor: pointer;
  font-size: 1rem;
  outline: inherit;
  padding: 0;
}

.youtube-button-wrapper {
  align-items: center;
  display: flex;
  gap: 0.5rem;
  justify-content: right;
  padding-block: 0.6rem;
  min-height: 3rem;
}

.youtube-logo {
  cursor: pointer;
  position: absolute;
  width: 4rem;
  height: 4rem;
  bottom: 1rem;
  left: 1rem;
  background-image: url("data:image/svg+xml;utf8,<svg id='Layer_1' data-name='Layer 1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 176 124'><defs><style>.cls-1 {fill: white;} .cls-2 {fill: red;}</style></defs><path class='cls-2' d='M172.32,19.36c-2.02-7.62-7.99-13.62-15.56-15.66C143.04,0,88,0,88,0c0,0-55.04,0-68.76,3.7-7.57,2.04-13.54,8.04-15.56,15.66C0,33.18,0,62,0,62c0,0,0,28.82,3.68,42.64,2.02,7.62,7.99,13.62,15.56,15.66,13.73,3.7,68.76,3.7,68.76,3.7,0,0,55.04,0,68.76-3.7,7.57-2.04,13.54-8.04,15.56-15.66,3.68-13.81,3.68-42.64,3.68-42.64,0,0,0-28.82-3.68-42.64Z'/><polygon class='cls-1' points='70 88.17 116 62 70 35.83 70 88.17'/></svg>");
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  visibility: hidden;
}

.youtube-mute-button {
  width: 8ch;
}

.youtube-play-button {
  width: 7ch;
}

youtube-player {
  display: block;
}

/*
.youtube-play-icon {
  background: var(--accent-color-2);
mask-image: url("data:image/svg+xml;utf8,%3Csvg%20width%3D%2240px%22%20height%3D%2240px%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20color%3D%22%23000000%22%20stroke-width%3D%220.5%22%20style%3D%22--darkreader-inline-color%3A%20var(--darkreader-text-000000%2C%20%23e8e6e3)%3B%22%20data-darkreader-inline-color%3D%22%22%3E%3Cpath%20d%3D%22M6.90588%204.53682C6.50592%204.2998%206%204.58808%206%205.05299V18.947C6%2019.4119%206.50592%2019.7002%206.90588%2019.4632L18.629%2012.5162C19.0211%2012.2838%2019.0211%2011.7162%2018.629%2011.4838L6.90588%204.53682Z%22%20fill%3D%22%23000000%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20style%3D%22--darkreader-inline-fill%3A%20%23000000%3B%20--darkreader-inline-stroke%3A%20%23000000%3B%22%20data-darkreader-inline-fill%3D%22%22%20data-darkreader-inline-stroke%3D%22%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E%0A");
mask-size: contain;
mask-position: center;
mask-repeat: no-repeat;
  margin: 2px;
  padding: 2px;
  outline: 1px solid red;
}
*/

.youtube-playback-button {
  width: 3rem;
  height: 1.2rem;
}

/*
.youtube-playback-button[data-playback-rate="1"] {
  border: 1px solid red;
  border-radius: 0.4rem;
}
*/

.youtube-active-rate {
  border: 1px solid red;
  border-radius: 0.4rem;
}

/*
* Example of using selectors based on player state
*
youtube-player[data-state=buffering] {
  border: 1px solid green;
  border-radius: 0.4rem;
}

youtube-player[data-state=cued] {
  border: 1px solid red;
  border-radius: 0.4rem;
}

youtube-player[data-state=ended] {
  border: 1px solid red;
  border-radius: 0.4rem;
}

youtube-player[data-state=paused] {
  border: 1px solid red;
  border-radius: 0.4rem;
}

youtube-player[data-state=playing] {
  border: 1px solid red;
  border-radius: 0.4rem;
}

youtube-player[data-state=unstarted] {
  border: 1px solid red;
  border-radius: 0.4rem;
}

*/

.youtube-speed-button {
  width: 5ch;
}

.youtube-stop-button {
  width: 6ch;
}

.youtube-video-wrapper {
  border-radius: 0.6rem;
  cursor: pointer;
  height: 0;
  padding-bottom: 56.25%;
  position: relative;
}

.youtube-video-wrapper iframe {
  border-radius: 0.6rem;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  visibility: hidden;
}
`
document.head.appendChild(componentStyles)

class YouTubePlayer extends HTMLElement {
  connectedCallback() {
    this.videoId = this.getAttribute('video')
    this.fastForwardAmount = 10
    this.rewindAmount = 12
    this.buildStructure()
    this.init()
  }

  // addButtons(player) {
  //   this.playButton = document.createElement('button')
  //   this.playButton.innerHTML = '&nbsp;'
  //   this.playButton.classList.add('youtube-button')
  //   this.playButton.classList.add('youtube-play-button')
  //   this.playButton.classList.add('youtube-play-icon')
  //   this.playButton.addEventListener('click', (event) => {
  //     this.doPlayPause.call(this, event, this.player)
  //   })
  //   this.stopButton = document.createElement('button')
  //   this.stopButton.innerHTML = 'stop'
  //   this.stopButton.classList.add('youtube-button')
  //   this.stopButton.classList.add('youtube-stop-button')
  //   this.stopButton.addEventListener('click', (event) => {
  //     this.doStop.call(this, event, this.player)
  //   })
  //   this.buttonWrapper.appendChild(this.playButton)
  //   this.buttonWrapper.appendChild(this.stopButton)
  //   this.addSpeedButtons(player)
  //   this.muteButton = document.createElement('button')
  //   if (player.isMuted() === true) {
  //     this.muteButton.innerHTML = 'unmute'
  //   } else {
  //     this.muteButton.innerHTML = 'mute'
  //   }
  //   this.muteButton.classList.add('youtube-button')
  //   this.muteButton.classList.add('youtube-mute-button')
  //   this.muteButton.addEventListener('click', (event) => {
  //     this.doMuteUnmute.call(this, event, this.player)
  //   })
  //   this.buttonWrapper.appendChild(this.muteButton)
  //   this.ytLogo.style.visibility = 'visible'
  // }
  //

  addFastForwardButton() {
    this.fastForwardButton = document.createElement("button")
    this.fastForwardButton.classList.add("youtube-rewind-button")
    this.fastForwardButton.innerHTML = ">>"
    this.fastForwardButton.addEventListener("click", (event) => {
      this.handleFastForwardButtonClick.call(this, event)
    })
    this.buttonWrapper.appendChild(this.fastForwardButton)
  }

  addMuteButton() {
    this.muteButton = document.createElement("button")
    this.muteButton.classList.add("youtube-mute-button")
    this.muteButton.innerHTML = "mute"
    this.muteButton.addEventListener("click", (event) => {
      this.handleMuteButtonClick.call(this, event)
    })
    this.buttonWrapper.appendChild(this.muteButton)
  } 

  addRewindButton() {
    this.rewindButton = document.createElement("button")
    this.rewindButton.classList.add("youtube-rewind-button")
    this.rewindButton.innerHTML = "<<"
    this.rewindButton.addEventListener("click", (event) => {
      this.handleRewindButtonClick.call(this, event)
    })
    this.buttonWrapper.appendChild(this.rewindButton)
  }

  //addSpeedButtons(player) {
  //  this.speedButtons = []
  //  // TODO: remove the strings and just add a
  //  // data-speed attribute that can be used
  //  // for selecting
  //  //
  //  // TODO: Add a data-speed to the main
  //  // player that can be used for selection too
  //  const speeds = [
  //    [1, '1'],
  //    [1.5, '1-5'],
  //    [2, '2'],
  //    [2.5, '2-5'],
  //    [3, '3'],
  //    [4, '4']
  //  ]
  //  speeds.forEach((speed) => {
  //    const speedButton = document.createElement('button')
  //    speedButton.classList.add('youtube-button')
  //    speedButton.classList.add('youtube-speed-button')
  //    speedButton.innerHTML = `${speed[0]}x`
  //    speedButton.dataset.speed = speed[0]
  //    speedButton.addEventListener('click', (event) => {
  //      this.adjustSpeed.call(this, event, player)
  //    })
  //    this.speedButtons.push(speedButton)
  //  })
  //  this.speedButtons.forEach((speedButton) => {
  //    this.buttonWrapper.appendChild(speedButton)
  //  })
  //}

  addPlaybackButtons() {
    this.playbackRates.forEach((playbackRate) => {
      const playbackButton = document.createElement('button')
      playbackButton.classList.add('youtube-playback-button')
      playbackButton.playbackRate = playbackRate
      playbackButton.innerHTML = `${playbackRate}x`
      playbackButton.addEventListener("click", (event) => {
        this.handlePlaybackButtonClick.call(this, event)
      })
      this.buttonWrapper.appendChild(playbackButton)
    })
  }

  // adjustSpeed(event, player) {
  //   const speed = parseFloat(event.target.dataset.speed)
  //   player.setPlaybackRate(speed)
  // }

  // applyInit() {
  //   this.addButtons(this.player)
  //   this.videoWrapper.addEventListener('click', () => {
  //     this.player.playVideo()
  //   })
  // }

  buildStructure() {
    this.videoWrapper = document.createElement('div')
    this.videoWrapper.classList.add('youtube-video-wrapper')
    this.appendChild(this.videoWrapper)
    this.videoEl = document.createElement('div')
    this.videoWrapper.appendChild(this.videoEl)
    this.videoWrapper.style.backgroundImage = `url("https://i.ytimg.com/vi/${this.videoId}/maxresdefault.jpg")`
    this.videoWrapper.style.backgroundSize = 'cover'
    this.videoWrapper.style.backgroundPosition = 'center'
    this.videoWrapper.style.backgroundRepeat = 'no-repeat'
    this.buttonWrapper = document.createElement('div')
    this.buttonWrapper.classList.add('youtube-button-wrapper')
    this.appendChild(this.buttonWrapper)
    this.ytLogo = document.createElement('div')
    this.ytLogo.addEventListener("click", (event) => {
      this.handleYtLogoClick.call(this, event)
    })
    this.ytLogo.classList.add('youtube-logo')
    this.videoWrapper.appendChild(this.ytLogo)
  }

  // doMuteUnmute(event, player) {
  //   if (player.isMuted() === true) {
  //     player.unMute()
  //     this.muteButton.innerHTML = 'mute'
  //   } else {
  //     player.mute()
  //     this.muteButton.innerHTML = 'unmute'
  //   }
  // }

  // doPlayPause(event, player) {
  //   const buttonEl = event.target
  //   const playerState = player.getPlayerState()
  //   // The docs don't list a YT.PlayerState.UNSTARTED
  //   // flag so using the explicit `-1` instead
  //   if (
  //     playerState == -1 ||
  //     playerState == YT.PlayerState.ENDED ||
  //     playerState == YT.PlayerState.PAUSED ||
  //     playerState == YT.PlayerState.BUFFERING ||
  //     playerState == YT.PlayerState.CUED
  //   ) {
  //     player.playVideo()
  //     // this.playButton.innerHTML = 'pause'
  //     // TODO: Figure out how to shift focus to
  //     // the player so keyboard controls work
  //   } else {
  //     player.pauseVideo()
  //     // this.playButton.innerHTML = 'play'
  //     // TODO: adjust this so it doesn't flash
  //     // play when clicking to different parts
  //     // of the video
  //   }
  // }

  // doStop(event, player) {
  //   // this.playButton.innerHTML = 'play'
  //   this.player.g.style.visibility = 'hidden'
  //   this.ytLogo.style.visibility = 'visible'
  //   player.stopVideo()
  // }

  getPlaybackRates() {
    this.playbackRates = []
    let targetRates = [0.5, 1, 1.5, 2, 3]
    this.player.getAvailablePlaybackRates().forEach((playbackRate) => {
      if (targetRates.includes(playbackRate)) {
        this.playbackRates.push(playbackRate)
      }
    })
  }

  handleFastForwardButtonClick(event) {
    this.player.seekTo(
      Math.min(
        this.player.getCurrentTime() + this.fastForwardAmount,
        this.player.getDuration() 
      )
    )
  }

  handleMuteButtonClick(event) {
    if (this.player.isMuted() === true) {
      this.muteButton.innerHTML = "mute"
      this.player.unMute()
    } else {
      this.muteButton.innerHTML = "unmute"
      this.player.mute()
    }
  }

  handlePlaybackButtonClick(event) {
    if (this.player.getPlayerState() === 1) {
      if (this.player.getPlaybackRate() === event.target.playbackRate) {
        this.player.pauseVideo()
      } else {
        this.player.setPlaybackRate(event.target.playbackRate)
      }
    } else {
      this.player.setPlaybackRate(event.target.playbackRate)
      this.player.playVideo()
    }
  }

  handlePlaybackRateChange(event) {
    this.updateButtonStyles()
  }

  handlePlayerStateChange(event) {
    const playerState = event.target.getPlayerState()
    if (playerState == -1) {
      this.dataset.state = 'unstarted'
      document.body.dataset.youtubeState = 'unstated'
    } else if (playerState == YT.PlayerState.BUFFERING) {
      this.dataset.state = 'buffering'
      document.body.dataset.youtubeState = 'buffering'
    } else if (playerState == YT.PlayerState.CUED) {
      this.dataset.state = 'cued'
      document.body.dataset.youtubeState = 'cued'
    } else if (playerState == YT.PlayerState.ENDED) {
      this.updateButtonStyles()
      this.player.g.style.visibility = 'hidden'
      this.ytLogo.style.visibility = 'visible'
      this.dataset.state = 'ended'
      document.body.dataset.youtubeState = 'ended'
    } else if (playerState == YT.PlayerState.PAUSED) {
      this.updateButtonStyles()
      this.dataset.state = 'paused'
      document.body.dataset.youtubeState = 'paused'
    } else if (playerState == YT.PlayerState.PLAYING) {
      this.updateButtonStyles()
      this.player.g.style.visibility = 'visible'
      this.ytLogo.style.visibility = 'hidden'
      this.dataset.state = 'playing'
      document.body.dataset.youtubeState = 'playing'
    }
  }

  handleRewindButtonClick(event) {
    this.player.seekTo(
      Math.max(
        0, this.player.getCurrentTime() - this.rewindAmount
      )
    )
  }

  handleVideoWrapperClick(event) {
    this.ytLogo.style.visibility = "hidden"
    this.player.playVideo()
  }

  handleYtLogoClick(event) {
    this.ytLogo.style.visibility = "hidden"
    this.player.playVideo()
  }

  async init() {
    this.startAt =
      this.getAttribute('start-at') !== null
        ? parseInt(this.getAttribute('start-at'), 10)
        : 0
    this.loadApi()
    await this.apiLoader
    this.player = await new Promise((resolve) => {
      let player = new YT.Player(this.videoEl, {
        width: '640',
        height: '390',
        videoId: this.videoId,
        playerVars: {
          playsinline: 1,
          start: this.startAt,
        },
        events: {
          onReady: (event) => {
            resolve(player)
          },
          onStateChange: (event) => {
            this.handlePlayerStateChange.call(this, event)
          },
          onPlaybackRateChange: (event) => {
            this.handlePlaybackRateChange.call(this, event)
          }
        },
      })
    }).then((value) => {
      return value
    })
    // TODO: Figure out how to handle errors here.
    this.addRewindButton()
    this.getPlaybackRates()
    this.addPlaybackButtons()
    this.addFastForwardButton()
    this.addMuteButton()
    this.ytLogo.style.visibility = "visible"
    this.videoWrapper.addEventListener("click", (event) => {
      this.handleVideoWrapperClick.call(this, event)
    })
  }

  loadApi() {
    // this if is from Paul Irish's embed, not sure why
    // the OR condition with window.YT.Player is there since
    // it seems like the window.YT would always hit first
    if (window.YT || (window.YT && window.YT.Player)) {
      return
    }
    this.apiLoader = new Promise((res, rej) => {
      var el = document.createElement('script')
      el.src = 'https://www.youtube.com/iframe_api'
      el.async = true
      el.onload = (_) => {
        YT.ready(res)
      }
      el.onerror = rej
      this.append(el)
    })
  }

  updateButtonStyles() {
    const playbackButtonNodes = document.querySelectorAll(".youtube-playback-button")
    const playbackButtonEls = [...playbackButtonNodes]
    playbackButtonEls.forEach((playbackButton) => {
      if (
        this.player.getPlaybackRate() === playbackButton.playbackRate
        && this.player.getPlayerState() === 1
      ) {
        playbackButton.classList.add("youtube-active-rate")
      } else {
        playbackButton.classList.remove("youtube-active-rate")
      }
    })
  }

}

customElements.define('youtube-player', YouTubePlayer)
