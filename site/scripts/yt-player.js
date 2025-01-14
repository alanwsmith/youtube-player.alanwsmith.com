// TODO: Figure out if there's away to tell if the
// video isn't available and send a better message
// than the youtube default one. or maybe play
// a different video all together
//
// TODO: Maybe add an end time
//
// TODO: Get available playback rates dynamically, maybe...
//
// YouTube iframe API Reference:
// https://developers.google.com/youtube/iframe_api_reference
//
// TODO: Figure out if there's a way to make the
// text switch from play to pause as soon as the
// video itself is clicked (right now there's a
// little delay)

class YouTubePlayer extends HTMLElement {
  connectedCallback() {
    this.videoId = this.getAttribute('video')
    this.buildStructure()
    this.init()
  }

  // addButtons(player) {
  //   this.playButton = document.createElement('button')
  //   this.playButton.innerHTML = '&nbsp;'
  //   this.playButton.classList.add('yt-button')
  //   this.playButton.classList.add('yt-play-button')
  //   this.playButton.classList.add('yt-play-icon')
  //   this.playButton.addEventListener('click', (event) => {
  //     this.doPlayPause.call(this, event, this.player)
  //   })
  //   this.stopButton = document.createElement('button')
  //   this.stopButton.innerHTML = 'stop'
  //   this.stopButton.classList.add('yt-button')
  //   this.stopButton.classList.add('yt-stop-button')
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
  //   this.muteButton.classList.add('yt-button')
  //   this.muteButton.classList.add('yt-mute-button')
  //   this.muteButton.addEventListener('click', (event) => {
  //     this.doMuteUnmute.call(this, event, this.player)
  //   })
  //   this.buttonWrapper.appendChild(this.muteButton)
  //   this.ytLogo.style.visibility = 'visible'
  // }
  //

  addMuteButton() {
    this.muteButton = document.createElement("button")
    this.muteButton.classList.add("yt-mute-button")
    this.muteButton.innerHTML = "mute"
    this.muteButton.addEventListener("click", (event) => {
      this.handleMuteButtonClick.call(this, event)
    })
    this.buttonWrapper.appendChild(this.muteButton)
  } 

  addRewindButton() {
    this.rewindButton = document.createElement("button")
    this.rewindButton.classList.add("yt-rewind-button")
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
  //    speedButton.classList.add('yt-button')
  //    speedButton.classList.add('yt-speed-button')
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
      playbackButton.classList.add('yt-playback-button')
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
    this.videoWrapper.classList.add('yt-video-wrapper')
    this.appendChild(this.videoWrapper)
    this.videoEl = document.createElement('div')
    this.videoWrapper.appendChild(this.videoEl)
    this.videoWrapper.style.backgroundImage = `url("https://i.ytimg.com/vi/${this.videoId}/hqdefault.jpg")`
    this.videoWrapper.style.backgroundSize = 'cover'
    this.videoWrapper.style.backgroundPosition = 'center'
    this.videoWrapper.style.backgroundRepeat = 'no-repeat'
    this.buttonWrapper = document.createElement('div')
    this.buttonWrapper.classList.add('yt-button-wrapper')
    this.appendChild(this.buttonWrapper)
    this.ytLogo = document.createElement('div')
    this.ytLogo.addEventListener("click", (event) => {
      this.handleYtLogoClick.call(this, event)
    })
    this.ytLogo.classList.add('yt-logo')
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
      document.body.dataset.ytState = 'unstated'
    } else if (playerState == YT.PlayerState.BUFFERING) {
      this.dataset.state = 'buffering'
      document.body.dataset.ytState = 'buffering'
    } else if (playerState == YT.PlayerState.CUED) {
      this.dataset.state = 'cued'
      document.body.dataset.ytState = 'cued'
    } else if (playerState == YT.PlayerState.ENDED) {
      this.updateButtonStyles()
      this.player.g.style.visibility = 'hidden'
      this.ytLogo.style.visibility = 'visible'
      this.dataset.state = 'ended'
      document.body.dataset.ytState = 'ended'
    } else if (playerState == YT.PlayerState.PAUSED) {
      this.updateButtonStyles()
      this.dataset.state = 'paused'
      document.body.dataset.ytState = 'paused'
    } else if (playerState == YT.PlayerState.PLAYING) {
      this.updateButtonStyles()
      this.player.g.style.visibility = 'visible'
      this.ytLogo.style.visibility = 'hidden'
      this.dataset.state = 'playing'
      document.body.dataset.ytState = 'playing'
    }
  }

  handleRewindButtonClick(event) {
    this.player.seekTo(
      Math.max(
        0, this.player.getCurrentTime() - 7
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
    const playbackButtonNodes = document.querySelectorAll(".yt-playback-button")
    const playbackButtonEls = [...playbackButtonNodes]
    playbackButtonEls.forEach((playbackButton) => {
      if (
        this.player.getPlaybackRate() === playbackButton.playbackRate
        && this.player.getPlayerState() === 1
      ) {
        playbackButton.classList.add("yt-active-rate")
      } else {
        playbackButton.classList.remove("yt-active-rate")
      }
    })
  }

}

customElements.define('yt-player', YouTubePlayer)
