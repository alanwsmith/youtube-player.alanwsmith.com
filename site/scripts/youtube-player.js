class YouTubePlayer extends HTMLElement {

  static activeInstance = null
  static instances = {}
  static timeout = null

  static handleEnded(instance) {
    console.log(`handleEnded: ${instance.uuid}`)
    this.activeInstance = instance.uuid
    if (instance.uuid == this.activeInstance) {
      document.body.dataset.youtubePlayerState = 'ended'
      instance.doEnded()
    }
    for (const uuid in this.instances) {
      if (uuid !== instance.uuid) {
        this.instances[uuid].doRemoveFade()
      }
    }
  }

  static handlePause(instance) {
    console.log(`handlePause: ${instance.uuid}`)
    if (instance.uuid == this.activeInstance) {
      // This is in a timeout because fast 
      // forwarding and rewinding videos sends
      // a pause event before sending another play
      // event. without this everything does
      // a quick unfade and then fade back. The
      // little delay before fading back in when
      // it should is less distracting than the
      // in/out when moving in the video
      this.timeout = setTimeout(() => {
        instance.doPauseOnActivePlayer()
        document.body.dataset.youtubePlayerState = 'paused'
        for (const uuid in this.instances) {
          if (uuid !== instance.uuid) {
            this.instances[uuid].doRemoveFade()
          }
        }
      }, 500)
    }
  }

  static registerInstance(instance) {
    this.instances[instance.uuid] = instance
  }

  static removeInstance(instance) {
    delete this.instances[instance.uuid]
  }

  static switchActivePlayer(instance) {
    console.log(`switchActivePlayer: ${instance.uuid}`)
    // This clears the pause timeout which
    // is necessary to prevent short changes
    // when fast forwarding and rewinding
    if (this.timeout !== null) {
      clearTimeout(this.timeout)
      this.timeout = null
    }
    this.activeInstance = instance.uuid
    document.body.dataset.youtubePlayerState = 'playing'
    for (const uuid in this.instances) {
      if (uuid === instance.uuid) {
        this.instances[uuid].doPlaying()
      } else {
        this.instances[uuid].doPauseAndFade()
      }
    }
  }

  constructor() {
    super()
    this.uuid = self.crypto.randomUUID()
    this.attrs = {
      "fast-forward-time": 10,
      "rewind-time": 12,
      "start": 0,
    }
    this.colors = {
      "base-background": "var(--youtube-player-base-background, #aaa)",
      "base-foreground": "var(--youtube-player-base-background, black)",
      "base-border": "var(--youtube-player-base-background, black)",
      "hover-background": "var(--youtube-player-hover-background, black)",
      "hover-foreground": "var(--youtube-player-hover-background, #aaa)",
      "hover-border": "var(--youtube-player-hover-background, #aaa)",
    }
    this.parts = {}

    // this.timer = null
    this.attachShadow({mode: 'open'})
  }

  doEnded() {
    this.parts.background.classList.remove('playing')
    this.parts.background.classList.add('stopped')
    this.parts.background.classList.remove('faded')
    // const shader = this.shadowRoot.querySelector('.shader')
    // const wrapper = this.shadowRoot.querySelector('.wrapper')
    this.parts.shader.classList.add('hidden')
    this.parts.wrapper.classList.add('hidden')
  }

  doPlaying() {
    this.parts.background.classList.add('playing')
    this.parts.background.classList.remove('stopped')
    this.parts.background.classList.remove('faded')
    // const wrapper = this.shadowRoot.querySelector('.wrapper')
    this.parts.wrapper.classList.remove('hidden')
    // const playerEl = this.shadowRoot.querySelector('#player')
    this.parts.player.classList.remove('dark')
    let shaderUpdate = setTimeout(() => {
      // const shader = this.shadowRoot.querySelector('.shader')
      this.parts.shader.classList.remove('dark-shader-over-background')
      this.parts.shader.classList.remove('hidden')
    }, 1000)
  }

  doPauseOnActivePlayer() {
    this.parts.background.classList.remove('faded')
    this.parts.background.classList.remove('playing')
    this.parts.background.classList.add('stopped')
  }




  // TODO: Start with the highest quality and 
  // keep searching until you find one
  async getBackgroundImage() {
    const backgroundUrl = `https://i.ytimg.com/vi/${this.attrs.video}/hqdefault.jpg`
    const styles = new CSSStyleSheet();
    styles.replaceSync(`
.background {
  background-image: url("${backgroundUrl}");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat
}`)
    this.shadowRoot.adoptedStyleSheets.push(styles);
  }

  addEventListeners() {
    const background = this.shadowRoot.querySelector(".background")
    background.addEventListener("click", (event) => {
      this.handleWrapperClick.call(this, event)
    })
  }

  connectedCallback() {
    this.constructor.registerInstance(this)
    this.getAttributes()
    this.addContent()
    this.addStyles()
    this.getBackgroundImage()
    this.addEventListeners()
    this.init()
  }

  getAttributes() {
    this.attrs = {}
    const attrs = this.getAttributeNames()
    attrs.forEach((attr) => {
      if (attr.startsWith(':') === true) {
        this.attrs[attr.substring(1)] = 
          this.getAttribute(attr)
      }
    })
  }

  getParts() {
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

  // buildStructure() {
  //   this.videoWrapper = document.createElement('div')
  //   this.videoWrapper.classList.add('youtube-video-wrapper')
  //   this.appendChild(this.videoWrapper)
  //   this.videoEl = document.createElement('div')
  //   this.videoWrapper.appendChild(this.videoEl)
  //   this.videoWrapper.style.backgroundImage = `url("https://i.ytimg.com/vi/${this.videoId}/maxresdefault.jpg")`
  //   this.videoWrapper.style.backgroundSize = 'cover'
  //   this.videoWrapper.style.backgroundPosition = 'center'
  //   this.videoWrapper.style.backgroundRepeat = 'no-repeat'
  //   this.buttonWrapper = document.createElement('div')
  //   this.buttonWrapper.classList.add('youtube-button-wrapper')
  //   this.appendChild(this.buttonWrapper)
  //   this.ytLogo = document.createElement('div')
  //   this.ytLogo.addEventListener("click", (event) => {
  //     this.handleYtLogoClick.call(this, event)
  //   })
  //   this.ytLogo.classList.add('youtube-logo')
  //   this.videoWrapper.appendChild(this.ytLogo)
  // }

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

  
  // makeHidden() {
  //   this.wrapper.classList.add("hidden")
  // }

  handlePlayerStateChange(event) {
    const playerState = event.target.getPlayerState()
    if (playerState == -1) {
      // this.dataset.state = 'unstarted'
      // document.body.dataset.youtubePlayerState = 'unstated'
    } else if (playerState == YT.PlayerState.BUFFERING) {
      // this.dataset.state = 'buffering'
      // document.body.dataset.youtubePlayerState = 'buffering'
    } else if (playerState == YT.PlayerState.CUED) {
      // this.dataset.state = 'cued'
      // document.body.dataset.youtubePlayerState = 'cued'
    } else if (playerState == YT.PlayerState.ENDED) {
      // TODO: Move the start time back to the origianal
      // start time.
      this.constructor.handleEnded(this)
      // this.wrapper.classList.add("hidden")
      // this.ytLogo.classList.remove("hidden")
      // this.updateButtonStyles()
      // this.player.g.style.visibility = 'hidden'
      // this.ytLogo.style.visibility = 'visible'
      // this.dataset.state = 'ended'
      // document.body.dataset.youtubePlayerState = 'ended'
    } else if (playerState == YT.PlayerState.PAUSED) {
      this.constructor.handlePause(this)
      // REMINDER: Can't do hidden here because
      // the controls go away if you try to scrub 
      // this.updateButtonStyles()
      // this.dataset.state = 'paused'
      // document.body.dataset.youtubePlayerState = 'paused'
    } else if (playerState == YT.PlayerState.PLAYING) {
      this.constructor.switchActivePlayer(this)

      // clearTimeout(this.timer)
      // this.wrapper.classList.remove("hidden")
      // this.ytLogo.classList.add("hidden")

      //this.updateButtonStyles()
      // this.player.g.style.visibility = 'visible'
      //this.ytLogo.style.visibility = 'hidden'
      //this.dataset.state = 'playing'
      // document.body.dataset.youtubePlayerState = 'playing'
    }
  }

  handleRewindButtonClick(event) {
    this.player.seekTo(
      Math.max(
        0, this.player.getCurrentTime() - this.rewindAmount
      )
    )
  }

  handleWrapperClick(event) {
    // this.ytLogo.classList.add("hidden")
    this.player.playVideo()
  }

  handleYtLogoClick(event) {
    this.ytLogo.classList.add("hidden")
    this.player.playVideo()
  }

  async init() {
    this.loadApi()
    await this.apiLoader
    const videoEl = this.shadowRoot.querySelector("#player")
    this.player = await new Promise((resolve) => {
      let player = new YT.Player(videoEl, {
        width: '560',
        height: '315',
        videoId: this.attrs.video,
        playerVars: {
          playsinline: 1,
          start: this.attrs["start"],
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

    // The player can be added now that it's
    // been switched to the iframe
    this.parts.player = this.shadowRoot.querySelector('#player')

    // this.addRewindButton()
    // this.getPlaybackRates()
    // this.addPlaybackButtons()
    // this.addFastForwardButton()
    // this.addMuteButton()
    // this.ytLogo.style.visibility = "visible"
    // this.videoWrapper.addEventListener("click", (event) => {
    //   this.handleVideoWrapperClick.call(this, event)
    // })

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


  addStyles() {
    const styles = new CSSStyleSheet();
    styles.replaceSync(`
.background {
  background-color: black;
  position: relative;
}
.control-button {
  width: 3rem;
  height: 2rem;
}
.hidden {
  opacity: 0;
}
:host {
  display: block;
  border-radius: 0.6rem;
  position: relative;
}
#player {
  border-radius: 0.6rem;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
}  
.playing {
  border: var(--youtube-player-playing-border);
}
.faded {
  border: var(--youtube-player-faded-border);
}
.stopped {
  border: var(--youtube-player-stopped-border);
}
.shader {
  border-radius: 0.6rem;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: black;
  z-index: 6;
}
#player {
  transition: all 0.7s ease-in;
}
.dark {
  opacity: 0.3;
}
.dark-shader-over-background {
  opacity: 0.7;
}
/*
.wrapper.paused #player {
  border-radius: 0.6rem;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 30%;
  height: 30%;
}
*/
.background {
  border-radius: 0.6rem;
  cursor: pointer;
  height: 0;
  padding-bottom: 56.25%;
}
.play-button {
  background: ${this.colors["base-background"]};
  border: 1px solid ${this.colors["base-border"]};
  border-radius: 0.6rem;
  margin: 0;
  position: relative;
}
.play-button:after {
  background: ${this.colors["base-foreground"]};
  content: "";
  height: 100%;
  left: 0;
  margin: 0;
  mask-image: url("data:image/svg+xml;utf8,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%3Csvg%20width%3D%2240px%22%20height%3D%2240px%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20color%3D%22%23000000%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6.90588%204.53682C6.50592%204.2998%206%204.58808%206%205.05299V18.947C6%2019.4119%206.50592%2019.7002%206.90588%2019.4632L18.629%2012.5162C19.0211%2012.2838%2019.0211%2011.7162%2018.629%2011.4838L6.90588%204.53682Z%22%20fill%3D%22%23000000%22%20stroke%3D%22%23000000%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E");
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: contain;
  position: absolute;
  top: 0;
  width: 100%;
}
.wrapper, .yt-logo, .shader {
  transition: opacity 0.7s ease-in;
}

.background {
  transition: border 0.7s ease-in;
}

/*
#player {
  top: 20%;
  left: 40%;
  postion: relative;
  width: 30%;
}
*/
@media (hover: hover) {
  .play-button:hover {
    background: ${this.colors['hover-background']};
    border: 1px solid ${this.colors['hover-foreground']};
  }
  .play-button:hover:after {
    background: ${this.colors['hover-foreground']};
  }
}
`
    );
    this.shadowRoot.adoptedStyleSheets.push(styles);
  }

  addContent() {
    const template = 
      this.ownerDocument.createElement('template')
    template.innerHTML = `
<div class="background stopped">
  <div class="shader hidden"></div>
  <div class="wrapper hidden">
    <div id="player"></div>
  </div>
</div>
<div class="yt-logo">YTLOGO</div>
<div class="buttons">
  <button aria-label="play" class="play-button control-button"></button>
</div>
`
    const contents = 
      template.content.cloneNode(true)
    this.shadowRoot.append(contents)
    // NOTE: player isn't added here since the element
    // is changed when the iframe loads
    this.parts.background = this.shadowRoot.querySelector('.background')
    this.parts.shader = this.shadowRoot.querySelector('.shader')
    this.parts.wrapper = this.shadowRoot.querySelector('.wrapper')
    this.parts.logo = this.shadowRoot.querySelector('.yt-logo')
    // this.wrapper = this.shadowRoot.querySelector('.wrapper')
    // this.playerEl = this.shadowRoot.querySelector('#player')
    // this.ytLogo = this.shadowRoot.querySelector('.yt-logo')
  }

  doPauseAndFade() {
    this.parts.background.classList.add('faded')
    this.parts.background.classList.remove('playing')
    this.parts.background.classList.remove('stopped')
    // const shader = this.shadowRoot.querySelector('.shader')
    // const playerEl = this.shadowRoot.querySelector('#player')
    if (this.player.getPlayerState() === 1 || this.player.getPlayerState() === 2) {
      this.parts.shader.classList.remove('dark-shader-over-background')
      this.parts.shader.classList.remove('hidden')
      this.parts.player.classList.add('dark')

    } else {
      this.parts.shader.classList.add('dark-shader-over-background')
      this.parts.shader.classList.remove('hidden')
    }
    if (this.player.getPlayerState() === 1) {
      this.player.pauseVideo()
    }
  }

  doRemoveFade() {
    this.parts.background.classList.remove('faded')
    this.parts.background.classList.remove('playing')
    this.parts.background.classList.add('stopped')
    // const shader = this.shadowRoot.querySelector('.shader')
    // const playerEl = this.shadowRoot.querySelector('#player')
    if (this.player.getPlayerState() === 2) {
      this.parts.player.classList.remove('dark')
    } else {
      this.parts.shader.classList.add('hidden')
      this.parts.shader.classList.remove('dark-shader-over-background')
    }
  }
}

customElements.define('youtube-player', YouTubePlayer)

