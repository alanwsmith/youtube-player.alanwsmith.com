class YouTubePlayer extends HTMLElement {

  // static activeInstance = null
  static instances = {}
  // static timeout = null

  static handleBuffering(instance) {

    // // this is here to help prevent the
    // // pause from flowing through and triggering
    // // the style changes when scrolling
    // this.activeInstance = instance.uuid
    // if (instance.uuid == this.activeInstance) {
    //   if (this.timeout !== null) {
    //     clearTimeout(this.timeout)
    //     this.timeout = null
    //   }
    //   document.body.dataset.youtubePlayerState = 'playing'
    // }

  }

  static handleEnded(instance) {
    document.body.dataset.youtubePlayerState = 'ended'
    for (const uuid in this.instances) {
      this.instances[uuid].showStoppedBorder()
      if (uuid === instance.uuid) {
        this.instances[uuid].hidePlayer()
        this.instances[uuid].showPlayButton()
        this.instances[uuid].cueVideo()
      } else {
        this.instances[uuid].hideFader()
      }
    }

    // // console.log(`handleEnded: ${instance.uuid}`)
    // this.activeInstance = instance.uuid
    // if (instance.uuid == this.activeInstance) {
    //   document.body.dataset.youtubePlayerState = 'ended'
    //   instance.doEnded()
    // }


  }

  static handlePaused(instance) {
    document.body.dataset.youtubePlayerState = 'paused'
    for (const uuid in this.instances) {
      this.instances[uuid].hideFader()
      this.instances[uuid].showStoppedBorder()
    }


    // // console.log(`handlePause: ${instance.uuid}`)
    // if (instance.uuid == this.activeInstance) {
    //   // This is in a timeout because fast 
    //   // forwarding and rewinding videos sends
    //   // a pause event before sending another play
    //   // event. without this everything does
    //   // a quick unfade and then fade back. The
    //   // little delay before fading back in when
    //   // it should is less distracting than the
    //   // in/out when moving in the video
    //   this.timeout = setTimeout(() => {
    //     instance.doPauseOnActivePlayer()
    //     document.body.dataset.youtubePlayerState = 'paused'
    //     for (const uuid in this.instances) {
    //       if (uuid !== instance.uuid) {
    //         this.instances[uuid].doRemoveFade()
    //       }
    //     }
    //   }, 200)
    // }

  }

  static fadeOtherVideos(instance) {
    for (const uuid in this.instances) {
      if (instance.uuid !== uuid) {
        this.instances[uuid].showFader()
      }
    }
  }

  static stopOtherVideos(instance) {
    for (const uuid in this.instances) {
      if (instance.uuid !== uuid) {
        this.instances[uuid].stopPlaying()
        this.instances[uuid].hidePlayer()
        this.instances[uuid].showPlayButton()
      }
    }
  }

  static handlePlaying(instance) {
    document.body.dataset.youtubePlayerState = 'playing'
    instance.showPlayer()
    instance.hideLoading()
    instance.showPlayingBorder()

    for (const uuid in this.instances) {
      if (uuid !== instance.uuid) {
        this.instances[uuid].showFader()
      }
    }

    // for (const uuid in this.instances) {
    //   if (this.activeInstance === uuid) {
    //     this.instances[uuid].showPlayer()
    //   } else {
    //     this.instances[uuid].stopPlaying()
    //     this.instances[uuid].hidePlayer()
    //     this.instances[uuid].showThumbnail()
    //   }
    // }


    // // console.log(`switchActivePlayer: ${instance.uuid}`)
    // // This clears the pause timeout which
    // // is necessary to prevent short changes
    // // when fast forwarding and rewinding
    // if (this.timeout !== null) {
    //   clearTimeout(this.timeout)
    //   this.timeout = null
    // }
    // this.activeInstance = instance.uuid
    // document.body.dataset.youtubePlayerState = 'playing'
    // for (const uuid in this.instances) {
    //   if (uuid === instance.uuid) {
    //     this.instances[uuid].doPlaying()
    //   } else {
    //     this.instances[uuid].doPauseAndFade()
    //   }
    // }

  }

  static registerInstance(instance) {
    this.instances[instance.uuid] = instance
  }

  static removeInstance(instance) {
    delete this.instances[instance.uuid]
  }

  static setActivePlayer(instance) {
    console.log(`Active player now: ${instance.uuid}`)
    this.activePlayer = instance.uuid
  }

  addContent() {
    let previousChapterButton = ""
    let nextChapterButton = ""
    if (this.chapters.length > 0) {
      previousChapterButton = `<button class="previous-chapter-button control-button" aria-label="Previous Chapter"></button>`
      nextChapterButton = `<button class="next-chapter-button control-button" aria-label="Next Chapter"></button>`
    }
    const template = 
      this.ownerDocument.createElement('template')
    template.innerHTML = `
<div class="background stopped">
  <div class="fader hidden"></div>
  <div class="thumbnail">
    <object type="image/jpg" data="https://i.ytimg.com/vi/${this.attrs.video}/maxresdefault.jpg" aria-label="Video thumbnail image">
      <img src="https://i.ytimg.com/vi/${this.attrs.video}/hqdefault.jpg" aria-label="Video thumbnail image" />
    </object>
  </div>
  <div class="wrapper hidden">
    <div id="player"></div>
  </div>
  <div class="title"></div>
  <div class="scrub-display hidden"></div>
  <div class="loading hidden">Loading...</div>
  <!--
  <div class="click-catcher"></div>
  <div class="yt-logo"></div>
  -->
</div>
<div class="buttons">
  <button aria-label="Restart" class="restart-button control-button"></button>
  <button aria-label="Rewind" class="rewind-button control-button"></button>
  ${previousChapterButton}
  <button aria-label="Play" class="play-button control-button"></button>
  ${nextChapterButton}
  <button aria-label="Fast Forward" class="fast-forward-button control-button"></button>
  <button aria-label="Mute" class="mute-button control-button"></button>
</div>
`
    const contents = 
      template.content.cloneNode(true)
    this.shadowRoot.append(contents)
    // NOTE: player isn't added here since the element
    // is changed when the iframe loads
    this.parts.background = this.shadowRoot.querySelector('.background')
    this.parts.buttons = this.shadowRoot.querySelector('.buttons')
    this.parts.fader = this.shadowRoot.querySelector('.fader')
    this.parts.fastForwardButton = this.shadowRoot.querySelector('.fast-forward-button')
    this.parts.fastForwardDisplay = this.shadowRoot.querySelector('.fast-forward-display')
    this.parts.loading = this.shadowRoot.querySelector('.loading')
    this.parts.muteButton = this.shadowRoot.querySelector('.mute-button')
    this.parts.playButton = this.shadowRoot.querySelector('.play-button')
    this.parts.restartButton = this.shadowRoot.querySelector('.restart-button')
    this.parts.rewindButton = this.shadowRoot.querySelector('.rewind-button')
    this.parts.scrubDisplay = this.shadowRoot.querySelector('.scrub-display')
    this.parts.thumbnail = this.shadowRoot.querySelector('.thumbnail')
    this.parts.title = this.shadowRoot.querySelector('.title')
    this.parts.wrapper = this.shadowRoot.querySelector('.wrapper')
    if (this.chapters.length > 0) {
      this.parts.previousChapterButton = this.shadowRoot.querySelector('.previous-chapter-button')
      this.parts.nextChapterButton = this.shadowRoot.querySelector('.next-chapter-button')
    }
  }

  addEventListeners() {
    this.parts.fastForwardButton.addEventListener('click', (event) => {
      this.handleFastForwardButtonClick.call(this, event)
    })
    this.parts.muteButton.addEventListener('click', (event) => {
      this.handleMuteButtonClick.call(this, event)
    })
    this.parts.playButton.addEventListener('click', (event) => {
      this.handlePlayButtonClick.call(this, event)
    })
    this.parts.restartButton.addEventListener('click', (event) => {
      this.handleRestartButtonClick.call(this, event)
    })
    this.parts.rewindButton.addEventListener('click', (event) => {
      this.handleRewindButtonClick.call(this, event)
    })
    if (this.chapters.length > 0) {
      this.parts.previousChapterButton.addEventListener('click', (event) => {
        this.handlePreviousChapterButtonClick.call(this, event)
      })
      this.parts.nextChapterButton.addEventListener('click', (event) => {
        this.handleNextChapterButtonClick.call(this, event)
      })
     }
  }

  connectedCallback() {
    this.constructor.registerInstance(this)
    this.getAttributes()
    this.addContent()
    this.addStyles()
    this.getTitle()
    this.addEventListeners()
    this.init()
  }

  constructor() {
    super()
    this.uuid = self.crypto.randomUUID()
    this.chapters = []
    this.loadingTimeout = null
    this.loadingTimeoutTime = 400
    this.timeouts = {}
    this.restart = false
    this.attrs = {
      "end": null, 
      "fast-forward-time": 7,
      "restart": "off",
      "rewind-time": 10,
      "start": 0,
      "title": null,
    }

    // this.colors = {
    //   "button-base-foreground": "var(--youtube-player-button-base-background, black)",
    //   "button-base-background": "var(--youtube-player-button-base-foreground, #aaa)",
    //   "button-base-hover-foreground": "var(--youtube-player-button-base-background, black)",
    //   "button-base-hover-background": "var(--youtube-player-button-base-foreground, #aaa)",
    //   "button-faded-foreground": "var(--youtube-player-button-faded-background, black)",
    //   "button-faded-background": "var(--youtube-player-button-faded-foreground, #aaa)",
    //   "button-faded-hover-foreground": "var(--youtube-player-button-faded-background, black)",
    //   "button-faded-hover-background": "var(--youtube-player-button-faded-foreground, #aaa)",
    // }

    this.parts = {}
    this.backgroundImageSizes = [
      "default",
      "mqdefault", 
      "hqdefault", 
      "sddefault", 
      "maxresdefault",
    ]
    this.attachShadow({mode: 'open'})
  }

  doEnded() {

    // this.parts.rewindButton.classList.remove('dark')
    // this.parts.fastForwardButton.classList.remove('dark')
    // this.parts.muteButton.classList.remove('dark')
    // this.parts.playButton.classList.remove('dark')
    // this.parts.rewindButton.classList.remove('darker')
    // this.parts.fastForwardButton.classList.remove('darker')
    // this.parts.muteButton.classList.remove('darker')
    // this.parts.playButton.classList.remove('darker')
    // this.parts.playButton.classList.add('play-button')
    // this.parts.playButton.classList.remove('pause-button')
    // this.parts.thumbnail.classList.remove('hidden')
    // // this.parts.logo.classList.remove('hidden')
    // this.parts.background.classList.remove('playing')
    // this.parts.background.classList.add('stopped')
    // this.parts.background.classList.remove('faded')
    // this.parts.fader.classList.add('hidden')
    // this.parts.wrapper.classList.add('hidden')

  }

  doPlaying() {

    // if (this.loadingTimeout !== null) {
    //   clearTimeout(this.loadingTimeout)
    //   this.loadingTimeout = null
    // }
    // this.parts.player.classList.remove('hidden')
    // this.parts.loading.classList.add('hidden')
    // this.parts.rewindButton.classList.remove('darker')
    // this.parts.fastForwardButton.classList.remove('darker')
    // this.parts.muteButton.classList.remove('darker')
    // this.parts.playButton.classList.remove('darker')
    // this.parts.rewindButton.classList.add('dark')
    // this.parts.fastForwardButton.classList.add('dark')
    // this.parts.muteButton.classList.add('dark')
    // this.parts.playButton.classList.add('dark')
    // this.parts.playButton.classList.remove('play-button')
    // this.parts.playButton.classList.add('pause-button')
    // this.parts.thumbnail.classList.add('hidden')
    // // this.parts.logo.classList.add('hidden')
    // this.parts.background.classList.add('playing')
    // this.parts.background.classList.remove('stopped')
    // this.parts.background.classList.remove('faded')
    // this.parts.wrapper.classList.remove('hidden')
    // this.parts.player.classList.remove('dark')
    // let faderUpdate = setTimeout(() => {
    //   this.parts.fader.classList.remove('dark-fader-over-background')
    //   this.parts.fader.classList.remove('hidden')
    // }, 3000)

  }

  // really stop and fade
  doPauseAndFade() {

    // this.parts.thumbnail.classList.remove('hidden')
    // // this.parts.fader.classList.remove('hidden')
    // this.parts.wrapper.classList.remove('hidden')
    // this.parts.player.classList.add('hidden')
    // this.parts.rewindButton.classList.add('darker')
    // this.parts.fastForwardButton.classList.add('darker')
    // this.parts.muteButton.classList.add('darker')
    // this.parts.playButton.classList.add('darker')
    // this.parts.playButton.classList.add('play-button')
    // this.parts.playButton.classList.remove('pause-button')

    // this.parts.background.classList.add('faded')
    // this.parts.background.classList.remove('playing')
    // this.parts.background.classList.remove('stopped')

    //this.parts.wrapper.classList.remove('hidden')

    //if (this.player.getPlayerState() === 1 || this.player.getPlayerState() === 2) {
    //  this.parts.fader.classList.remove('dark-fader-over-background')
    //  this.parts.fader.classList.remove('hidden')
    //  // this.parts.player.classList.add('dark')
    //  this.parts.player.classList.add('hidden')
    //} else {
    //  this.parts.fader.classList.add('dark-fader-over-background')
    //  this.parts.fader.classList.remove('hidden')
    //  //
    //  this.parts.player.classList.add('hidden')
    //}
    
    // if (this.player.getPlayerState() === 1) {
    //   this.player.pauseVideo()
    // }

    this.player.stopVideo()
  }

  doPauseOnActivePlayer() {

    // this.blur()
    // this.parts.rewindButton.classList.remove('dark')
    // this.parts.fastForwardButton.classList.remove('dark')
    // this.parts.muteButton.classList.remove('dark')
    // this.parts.playButton.classList.remove('dark')
    // this.parts.rewindButton.classList.remove('darker')
    // this.parts.fastForwardButton.classList.remove('darker')
    // this.parts.muteButton.classList.remove('darker')
    // this.parts.playButton.classList.remove('darker')
    // this.parts.playButton.classList.add('play-button')
    // this.parts.playButton.classList.remove('pause-button')
    // this.parts.background.classList.remove('faded')
    // this.parts.background.classList.remove('playing')
    // this.parts.background.classList.add('stopped')

  }

  doRemoveFade() {

    // this.parts.rewindButton.classList.remove('darker')
    // this.parts.fastForwardButton.classList.remove('darker')
    // this.parts.muteButton.classList.remove('darker')
    // this.parts.playButton.classList.remove('darker')
    // this.parts.background.classList.remove('faded')
    // this.parts.background.classList.remove('playing')
    // this.parts.background.classList.add('stopped')
    // if (this.player.getPlayerState() === 2) {
    //   this.parts.player.classList.remove('dark')
    // } else {
    //   this.parts.fader.classList.add('hidden')
    //   this.parts.fader.classList.remove('dark-fader-over-background')
    // }

  }

  flashMessage(text) {
    this.parts.scrubDisplay.innerHTML = text
    this.parts.scrubDisplay.classList.remove('hidden')
    if (this.timeouts.scrubDisplay) {
      clearTimeout(this.timeouts.scrubDisplay)
    }
    this.timeouts.scrubDisplay = setTimeout(
      () => {
        this.parts.scrubDisplay.classList.add('hidden')
      },
      500
    )
  }

  getAttributes() {
    const attrs = this.getAttributeNames()
    attrs.forEach((attr) => {
      if (attr.startsWith(':') === true) {
        this.attrs[attr.substring(1)] = 
          this.getAttribute(attr)
      }
    })
    const ints = ['fast-forward-time', 'rewind-time', 'start', 'end']
    ints.forEach((int) => {
      this.attrs[int] = parseInt(this.attrs[int], 10)
    })
    if (this.attrs['restart'].toLowerCase() === 'on') {
      this.restart = true
    }
    if (this.attrs['chapters']) {
      let chapterTimes = this.attrs['chapters'].split(',')
      this.chapters.push(0)
      chapterTimes.forEach((chapterTime) => {
        this.chapters.push(parseInt(chapterTime, 10))
      })
    }
  }

  async getTitle() {
    if (this.attrs['title'] !== null) {
      this.parts.title.innerHTML = this.attrs['title']
    } else {
      const url = `https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=${this.attrs.video}&format=json`
      let response = await fetch(url)
      if (!response.ok) {
        throw new Error('There was a problem getting the data')
      } else {
        let json = await response.json()
        // TODO: Figure out error handling here
        this.parts.title.innerHTML = json.title
      }
    }
  }

  handleFastForwardButtonClick(event) {
    this.player.seekTo(
      Math.min(
        this.player.getCurrentTime() + this.attrs['fast-forward-time'],
        this.player.getDuration() 
      )
    )
    this.parts.scrubDisplay.innerHTML = `+${this.attrs['fast-forward-time']}sec.`
    this.parts.scrubDisplay.classList.remove('hidden')
    if (this.timeouts.scrubDisplay) {
      clearTimeout(this.timeouts.scrubDisplay)
    }
    this.timeouts.scrubDisplay = setTimeout(
      () => {
        this.parts.scrubDisplay.classList.add('hidden')
      },
      500
    )
  }

  handleMuteButtonClick(event) {
    if (this.player.isMuted() === true) {
      this.parts.muteButton.classList.add('mute-button')
      this.parts.muteButton.classList.remove('unmute-button')
      this.player.unMute()
    } else {
      this.parts.muteButton.classList.add('unmute-button')
      this.parts.muteButton.classList.remove('mute-button')
      this.player.mute()
    }
  }

  handleNextChapterButtonClick(event) {
    const currentTime = this.player.getCurrentTime()
    let foundChapter = false
    // for (let checkIndex = this.chapters.length - 1; checkIndex >= 0; checkIndex -= 1) {
    for (let checkIndex = 0; checkIndex < this.chapters.length; checkIndex += 1) {
      if (currentTime < this.chapters[checkIndex]) {
        this.player.seekTo(this.chapters[checkIndex])
        this.flashMessage(`Chapter ${checkIndex + 1}`)
        foundChapter = true
        break
      }
    }
    if (foundChapter === false) {
      this.flashMessage(`No more chapters`)
    }
  }

  handlePlayButtonClick(event) {
    const state = this.player.getPlayerState()
    if (state === 1) {
      this.showPlayButton()
      this.player.pauseVideo()
      this.showStoppedBorder()
      this.flashMessage(this.player.getCurrentTime())
    } else {
      this.showPlayingBorder()
      this.hideFader()
      this.showLoading()
      this.constructor.stopOtherVideos(this)
      this.constructor.fadeOtherVideos(this)
      this.player.playVideo()
      this.showPauseButton()
    }
  }

  handlePreviousChapterButtonClick(event) {
    const currentTime = this.player.getCurrentTime()
    for (let checkIndex = this.chapters.length - 1; checkIndex >= 0; checkIndex -= 1) {
      if (currentTime > this.chapters[checkIndex] + 2) {
        this.player.seekTo(this.chapters[checkIndex])
        this.flashMessage(`Chapter ${checkIndex + 1}`)
        break
      }
    }
  }

  handleRestartButtonClick(event) {
    const playerState = this.player.getPlayerState()
    if (playerState === 1 || playerState === 2) {
      this.player.seekTo(this.attrs['start'])
    }
  }

  handlePlayerStateChange(event) {
    const playerState = event.target.getPlayerState()
    if (playerState == -1) {
      // console.log("STATUS: UNSTARTED")
      // N/A - here for reference
    } else if (playerState == YT.PlayerState.BUFFERING) {
      // console.log("STATUS: BUFFERING")
      this.constructor.handleBuffering(this)
    } else if (playerState == YT.PlayerState.CUED) {
      // console.log("STATUS: CUED")
      // N/A - here for reference
    } else if (playerState == YT.PlayerState.ENDED) {
      // console.log("STATUS: ENDED")
      // TODO: Move the start time back to the original 
      // start time.
      this.constructor.handleEnded(this)
    } else if (playerState == YT.PlayerState.PAUSED) {
      // console.log("STATUS: PAUSED")
      this.constructor.handlePaused(this)
    } else if (playerState == YT.PlayerState.PLAYING) {
      // console.log("STATUS: PLAYING")
      this.constructor.handlePlaying(this)
    }
  }

  handleRewindButtonClick(event) {
    this.player.seekTo(
      Math.max(
        0, this.player.getCurrentTime() - this.attrs['rewind-time']
      )
    )
    this.parts.scrubDisplay.innerHTML = `-${this.attrs['rewind-time']}sec.`
    this.parts.scrubDisplay.classList.remove('hidden')
    if (this.timeouts.scrubDisplay) {
      clearTimeout(this.timeouts.scrubDisplay)
    }
    this.timeouts.scrubDisplay = setTimeout(
      () => {
        this.parts.scrubDisplay.classList.add('hidden')
      },
      500
    )
  }

  handleWrapperClick(event) {
    this.loadingTimeout = setTimeout(() => {
      this.parts.loading.classList.remove('hidden')
    }, this.loadingTimeoutTime)
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
        playerVars: {
          playsinline: 1,
        },
        events: {
          onReady: (event) => {
            resolve(player)
          },
          onStateChange: (event) => {
            this.handlePlayerStateChange.call(this, event)
          },
          // onPlaybackRateChange: (event) => {
          //   this.handlePlaybackRateChange.call(this, event)
          // }
        },
      })
    }).then((value) => {
      return value
      // TODO: Figure out how to handle errors here.
    })
    this.cueVideo()
    this.parts.player = this.shadowRoot.querySelector('#player')
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
  
  hideLoading() {
    this.parts.loading.classList.add('hidden')
  }

  hideFader() {
    this.parts.fader.classList.add('hidden')
    this.parts.buttons.classList.remove('button-fader')
  }

  hidePlayer() {
    this.parts.wrapper.classList.add('hidden')
  }

  showPlayingBorder() {
    this.parts.background.classList.add('playing')
    this.parts.background.classList.remove('stopped')
    this.parts.background.classList.remove('faded')
  }

  showStoppedBorder() {
    this.parts.background.classList.add('stopped')
    this.parts.background.classList.remove('playing')
    this.parts.background.classList.remove('faded')
  }

  showFadedBorder() {
    this.parts.background.classList.add('faded')
    this.parts.background.classList.remove('playing')
    this.parts.background.classList.remove('stopped')
  }

  showFader() {
    this.parts.fader.classList.remove('hidden')
    this.parts.buttons.classList.add('button-fader')
    this.showFadedBorder()
  }

  showLoading() {
    this.parts.loading.classList.remove('hidden')
  }

  showPlayButton() {
    this.parts.playButton.classList.add('play-button')
    this.parts.playButton.classList.remove('pause-button')
  }

  showPauseButton() {
    this.parts.playButton.classList.add('pause-button')
    this.parts.playButton.classList.remove('play-button')
  }

  showPlayer() {
    this.parts.wrapper.classList.remove('hidden')
  }

  stopPlaying() {
    const state = this.player.getPlayerState()
    if (state === 1 || state === 2) {
      this.player.stopVideo()
      this.cueVideo()
    }
  }

  cueVideo() {
    let options = {
      'videoId': this.attrs.video,
    }
    if (this.restart === true) {
      options['startSeconds'] = this.attrs['start']
    } else if (this.player.getPlayerState() === -1) {
      options['startSeconds'] = this.attrs['start']
    } else if (this.player.getPlayerState() === YT.PlayerState.CUED) {
      options['startSeconds'] = this.attrs['start']
    } else if (this.player.getPlayerState() === YT.PlayerState.ENDED) {
      options['startSeconds'] = this.attrs['start']
    } else {
      const currentTime = Math.max(this.player.getCurrentTime() - 1, 0)
      options['startSeconds'] = currentTime
    }
    if (this.attrs['end'] !== null) {
      options['endSeconds'] = this.attrs['end']
    }
    this.player.cueVideoById(options)
  }

  addStyles() {
    const styles = new CSSStyleSheet();
    styles.replaceSync(`
:root {
  --transition-time: 0.5s;
}
.background {
  font-size: var(--youtube-player-font-size, 0.9rem);
  background-color: black;
  position: relative;
}
.buttons {
  margin-top: 0.6rem;
  display: flex;
  gap: 0.3rem;
  justify-content: right;
}
.control-button {
  background: var(--youtube-player-button-base-background, #999);
  border: 1px solid var(--youtube-player-button-base-foreground, #333);
  border-radius: 0.6rem;
  margin: 0;
  position: relative;
  width: 3rem;
  height: 2rem;
}
.control-button:after {
  background: var(--youtube-player-button-base-foreground, #333);
  content: "";
  height: 100%;
  left: 0;
  margin: 0;
  position: absolute;
  top: 0;
  width: 100%;
}
.button-fader > .control-button {
  background: var(--youtube-player-button-faded-background, #333);
  border: 1px solid var(--youtube-player-button-faded-foreground, #111);
}
.button-fader > .control-button:after {
  background: var(--youtube-player-button-faded-foreground, #111);
}
.hidden {
  opacity: 0;
}
:host {
  display: block;
  border-radius: 0.6rem;
  position: relative;
}
.loading {
  background: var(--youtube-player-text-background-color, rbg(0 0 0 / 0.5));
  border-top-right-radius: 0.6rem;
  border-top-left-radius: 0.6rem;
  color: var(--youtube-player-text-color, #aaa);
  filter: drop-shadow(1px 1px 1px black);
  left: calc(50vw - 10ch);
  position: absolute;
  bottom: 0rem;
  z-index: 5;
  padding-top: 1rem;
  padding-bottom: 0.5rem;
  padding-left: 1rem;
  padding-right: 1rem;
  /*
  transition: all 0.5s ease-in;
  */
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
  border: var(--youtube-player-playing-border, 1px solid #999);
}
.faded {
  border: var(--youtube-player-faded-border, 1px solid #444);
}
.fast-forward-button:after {
  mask-image: url("data:image/svg+xml;utf8,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%3Csvg%20width%3D%2240px%22%20height%3D%2240px%22%20viewBox%3D%220%200%2024%2024%22%20stroke-width%3D%222%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20color%3D%22%23000000%22%3E%3Cpath%20d%3D%22M13%206L19%2012L13%2018%22%20stroke%3D%22%23000000%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M5%206L11%2012L5%2018%22%20stroke%3D%22%23000000%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E");
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: contain;
}
.rewind-button:after {
  mask-image: url("data:image/svg+xml;utf8,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%3Csvg%20width%3D%2240px%22%20height%3D%2240px%22%20viewBox%3D%220%200%2024%2024%22%20stroke-width%3D%222%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20color%3D%22%23000000%22%3E%3Cpath%20d%3D%22M11%206L5%2012L11%2018%22%20stroke%3D%22%23000000%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M19%206L13%2012L19%2018%22%20stroke%3D%22%23000000%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E");
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: contain;
}
.previous-chapter-button:after {
  mask-image: url("data:image/svg+xml;utf8,%3Csvg%20width%3D%22800%22%20height%3D%22800%22%20viewBox%3D%220%200%201024%201024%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22m230.2%20499.3%20287.4-225.8c10.7-8.4%2026.4-.8%2026.4%2012.7v451.6c0%2013.5-15.7%2021.1-26.4%2012.7L230.2%20524.7a16.14%2016.14%200%200%201%200-25.4zm320%200%20287.4-225.8c10.7-8.4%2026.4-.8%2026.4%2012.7v451.5c0%2013.5-15.7%2021.1-26.4%2012.7L550.2%20524.6c-4.1-3.2-6.2-8-6.2-12.7%200-4.6%202.1-9.4%206.2-12.6zM166.4%20248h51.2c3.5%200%206.4%202.7%206.4%206v516c0%203.3-2.9%206-6.4%206h-51.2c-3.5%200-6.4-2.7-6.4-6V254c0-3.3%202.9-6%206.4-6z%22%2F%3E%3C%2Fsvg%3E");
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: contain;
}
.next-chapter-button:after {
  mask-image: url("data:image/svg+xml;utf8,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%0A%3C!--%20Uploaded%20to%3A%20SVG%20Repo%2C%20www.svgrepo.com%2C%20Generator%3A%20SVG%20Repo%20Mixer%20Tools%20--%3E%0A%3Csvg%20fill%3D%22%23000000%22%20width%3D%22800px%22%20height%3D%22800px%22%20viewBox%3D%220%200%201024%201024%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%20%20%3Cpath%20d%3D%22M793.8%20499.3L506.4%20273.5c-10.7-8.4-26.4-.8-26.4%2012.7v451.6c0%2013.5%2015.7%2021.1%2026.4%2012.7l287.4-225.8a16.14%2016.14%200%200%200%200-25.4zm-320%200L186.4%20273.5c-10.7-8.4-26.4-.8-26.4%2012.7v451.5c0%2013.5%2015.7%2021.1%2026.4%2012.7l287.4-225.8c4.1-3.2%206.2-8%206.2-12.7%200-4.6-2.1-9.4-6.2-12.6zM857.6%20248h-51.2c-3.5%200-6.4%202.7-6.4%206v516c0%203.3%202.9%206%206.4%206h51.2c3.5%200%206.4-2.7%206.4-6V254c0-3.3-2.9-6-6.4-6z%22%2F%3E%0A%3C%2Fsvg%3E");
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: contain;
}

@media (hover: hover) {
  .fast-forward-chapter-button:hover {
    background: var(--button-hover-background-color);
    border: 1px solid var(--button-hover-border-color);
  }

  .fast-forward-chapter-button:hover:after {
    background: var(--button-hover-color);
  }
}


@media (hover: hover) {
  .rewind-chapter-button:hover {
    background: var(--button-hover-background-color);
    border: 1px solid var(--button-hover-border-color);
  }

  .rewind-chapter-button:hover:after {
    background: var(--button-hover-color);
  }
}


.scrub-display {
  font-size: 1.6rem;
  color: var(--youtube-player-button-base-background, blue);
  border-radius: 0.6rem;
  position: absolute;
  bottom: 2rem;
  left: 2rem;
  z-index: 30;
  transition: opacity 0s;
  text-align: right;
  background: var(--youtube-player-text-background-color, rgb(0 0 0 / 0.5));
  padding: 0.5rem;
}
.scrub-display.hidden {
  transition: opacity 0.7s ease-in;
}

.stopped {
  border: var(--youtube-player-stopped-border, 1px solid #aaa);
}
.fader {
  border-radius: 0.6rem;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: black;
  z-index: 6;
  opacity: 0.75;
}
.fader.hidden {
  opacity: 0;
}

.thumbnail {
  border-radius: 0.6rem;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}
.thumbnail object {
  border-radius: 0.6rem;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  display: flex;
  justify-content: center;
}
.thumbnail object img {
  z-index: 2;
}
.title {
  background: var(--youtube-player-text-background-color, #aaa);
  border-top-left-radius: 0.6rem;
  color: var(--youtube-player-text-color);
  filter: drop-shadow(1px 1px 1px black);
  left: 0rem;
  position: absolute;
  top: 0rem;
  z-index: 5;
  padding-top: 1rem;
  padding-bottom: 0.5rem;
  padding-left: 1rem;
  padding-right: 1rem;
}
/*
.dark {
  opacity: 0.35;
}
.darker {
  opacity: 0.1;
}
.dark-fader-over-background {
  opacity: 0.7;
}
*/
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
  height: 0;
  padding-bottom: 56.25%;
}
.pause-button:after {
  mask-image: url("data:image/svg+xml;utf8,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%3Csvg%20width%3D%2240px%22%20height%3D%2240px%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20color%3D%22%23000000%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%2018.4V5.6C6%205.26863%206.26863%205%206.6%205H9.4C9.73137%205%2010%205.26863%2010%205.6V18.4C10%2018.7314%209.73137%2019%209.4%2019H6.6C6.26863%2019%206%2018.7314%206%2018.4Z%22%20fill%3D%22%23000000%22%20stroke%3D%22%23000000%22%20stroke-width%3D%222%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M14%2018.4V5.6C14%205.26863%2014.2686%205%2014.6%205H17.4C17.7314%205%2018%205.26863%2018%205.6V18.4C18%2018.7314%2017.7314%2019%2017.4%2019H14.6C14.2686%2019%2014%2018.7314%2014%2018.4Z%22%20fill%3D%22%23000000%22%20stroke%3D%22%23000000%22%20stroke-width%3D%222%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E");
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: contain;
}
.play-button:after {
  mask-image: url("data:image/svg+xml;utf8,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%3Csvg%20width%3D%2240px%22%20height%3D%2240px%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20color%3D%22%23000000%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6.90588%204.53682C6.50592%204.2998%206%204.58808%206%205.05299V18.947C6%2019.4119%206.50592%2019.7002%206.90588%2019.4632L18.629%2012.5162C19.0211%2012.2838%2019.0211%2011.7162%2018.629%2011.4838L6.90588%204.53682Z%22%20fill%3D%22%23000000%22%20stroke%3D%22%23000000%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E");
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: contain;
}
.mute-button:after {
  mask-image: url("data:image/svg+xml;utf8,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%3Csvg%20width%3D%2240px%22%20height%3D%2240px%22%20viewBox%3D%220%200%2024%2024%22%20stroke-width%3D%222%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20color%3D%22%23000000%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20d%3D%22M16.9697%206.96967C17.2626%206.67678%2017.7374%206.67678%2018.0303%206.96967L17.5%207.5C18.0303%206.96967%2018.0306%206.96989%2018.0308%206.97012L18.0313%206.9706L18.0323%206.97168L18.0349%206.97426L18.0416%206.98113L18.0613%207.00165C18.0771%207.01833%2018.0982%207.04101%2018.1237%207.06959C18.1747%207.1267%2018.2439%207.20756%2018.325%207.31121C18.487%207.51816%2018.6983%207.8181%2018.9084%208.20336C19.3286%208.97364%2019.75%2010.0966%2019.75%2011.5C19.75%2012.9034%2019.3286%2014.0264%2018.9084%2014.7966C18.6983%2015.1819%2018.487%2015.4818%2018.325%2015.6888C18.2439%2015.7924%2018.1747%2015.8733%2018.1237%2015.9304C18.0982%2015.959%2018.0771%2015.9817%2018.0613%2015.9984L18.0416%2016.0189L18.0349%2016.0257L18.0323%2016.0283L18.0313%2016.0294L18.0308%2016.0299C18.0306%2016.0301%2018.0303%2016.0303%2017.5207%2015.5207L18.0303%2016.0303C17.7374%2016.3232%2017.2626%2016.3232%2016.9697%2016.0303C16.6776%2015.7383%2016.6768%2015.2654%2016.9671%2014.9723C16.9679%2014.9714%2016.9688%2014.9705%2016.9697%2014.9697L17.5%2015.5C16.9697%2014.9697%2016.9695%2014.9699%2016.9693%2014.9701L16.9689%2014.9705L16.9682%2014.9711L16.9673%2014.9721L16.9724%2014.9667C16.9786%2014.9602%2016.9897%2014.9482%2017.0052%2014.9309C17.0362%2014.8962%2017.0842%2014.8404%2017.1437%2014.7643C17.263%2014.6119%2017.4267%2014.3806%2017.5916%2014.0784C17.9214%2013.4736%2018.25%2012.5966%2018.25%2011.5C18.25%2010.4034%2017.9214%209.52636%2017.5916%208.92164C17.4267%208.6194%2017.263%208.38809%2017.1437%208.23567C17.0842%208.15963%2017.0362%208.10377%2017.0052%208.06908C16.9897%208.05176%2016.9786%208.03978%2016.9724%208.03326L16.9671%208.02774C16.6768%207.73464%2016.6776%207.2617%2016.9697%206.96967Z%22%20fill%3D%22%23000000%22%3E%3C%2Fpath%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20d%3D%22M19.9697%203.96967C20.2626%203.67678%2020.7374%203.67678%2021.0303%203.96967L20.5%204.5C21.0303%203.96967%2021.0306%203.96991%2021.0308%203.97017L21.0314%203.97072L21.0327%203.972L21.0359%203.97527L21.045%203.98462C21.0523%203.9921%2021.0619%204.00207%2021.0736%204.01451C21.0971%204.03939%2021.1292%204.0742%2021.1688%204.11882C21.2478%204.20802%2021.3566%204.33662%2021.4851%204.50365C21.7419%204.83749%2022.0786%205.32653%2022.4137%205.96319C23.0845%207.23773%2023.75%209.10689%2023.75%2011.5C23.75%2013.8931%2023.0845%2015.7623%2022.4137%2017.0368C22.0786%2017.6735%2021.7419%2018.1625%2021.4851%2018.4963C21.3566%2018.6634%2021.2478%2018.792%2021.1688%2018.8812C21.1292%2018.9258%2021.0971%2018.9606%2021.0736%2018.9855C21.0619%2018.9979%2021.0523%2019.0079%2021.045%2019.0154L21.0359%2019.0247L21.0327%2019.028L21.0314%2019.0293L21.0308%2019.0298C21.0306%2019.0301%2021.0303%2019.0303%2020.5%2018.5L21.0303%2019.0303C20.7374%2019.3232%2020.2626%2019.3232%2019.9697%2019.0303C19.6771%2018.7378%2019.6768%2018.2636%2019.9687%2017.9706C19.9688%2017.9706%2019.9689%2017.9705%2019.969%2017.9704L19.9689%2017.9705L19.9687%2017.9706L19.9683%2017.9711L19.9678%2017.9716C19.9679%2017.9714%2019.9684%2017.9709%2019.9693%2017.97L19.9825%2017.9562C19.9957%2017.9422%2020.0173%2017.9189%2020.0461%2017.8864C20.1038%2017.8213%2020.1903%2017.7194%2020.2962%2017.5818C20.5081%2017.3062%2020.7964%2016.889%2021.0863%2016.3382C21.6655%2015.2377%2022.25%2013.6069%2022.25%2011.5C22.25%209.39311%2021.6655%207.76227%2021.0863%206.66181C20.7964%206.11097%2020.5081%205.69376%2020.2962%205.41822C20.1903%205.28057%2020.1038%205.17869%2020.0461%205.1136C20.0173%205.08107%2019.9957%205.05777%2019.9825%205.04384L19.9693%205.03C19.9683%205.02899%2019.9678%205.02845%2019.9677%205.02839L19.9683%205.02891L19.9689%205.02951L19.9692%205.02989C19.6768%204.73696%2019.6769%204.26242%2019.9697%203.96967ZM19.9677%205.02838C19.9677%205.02838%2019.9677%205.02838%2019.9677%205.02839L19.9677%205.02838Z%22%20fill%3D%22%23000000%22%3E%3C%2Fpath%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20d%3D%22M12.0367%203.3964C13.2002%202.62923%2014.75%203.46373%2014.75%204.85741V19.1431C14.75%2020.5368%2013.2002%2021.3713%2012.0367%2020.6041L6.03762%2016.6487C5.99677%2016.6218%205.94892%2016.6074%205.9%2016.6074H3C1.48122%2016.6074%200.25%2015.3762%200.25%2013.8574V10.1431C0.25%208.62434%201.48122%207.39313%203%207.39313H5.9C5.94892%207.39313%205.99677%207.37877%206.03762%207.35184L12.0367%203.3964Z%22%20fill%3D%22%23000000%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E");
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: contain;
}
.unmute-button:after {
  mask-image: url("data:image/svg+xml;utf8,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%3Csvg%20width%3D%2240px%22%20height%3D%2240px%22%20viewBox%3D%220%200%2024%2024%22%20stroke-width%3D%222%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20color%3D%22%23000000%22%3E%3Cg%20clip-path%3D%22url(%23clip0_4223_8258)%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20d%3D%22M17.4696%209.46973C17.7625%209.1768%2018.2373%209.17675%2018.5303%209.46961L20.0003%2010.9393L21.4696%209.46973C21.7625%209.1768%2022.2373%209.17675%2022.5303%209.46961C22.8232%209.76247%2022.8232%2010.2373%2022.5304%2010.5303L21.061%2012L22.5304%2013.4697C22.8232%2013.7627%2022.8232%2014.2375%2022.5303%2014.5304C22.2373%2014.8233%2021.7625%2014.8232%2021.4696%2014.5303L20.0003%2013.0607L18.5303%2014.5304C18.2373%2014.8233%2017.7625%2014.8232%2017.4696%2014.5303C17.1767%2014.2373%2017.1768%2013.7625%2017.4697%2013.4696L18.9397%2012L17.4697%2010.5304C17.1768%2010.2375%2017.1767%209.76266%2017.4696%209.46973Z%22%20fill%3D%22%23000000%22%3E%3C%2Fpath%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20d%3D%22M13.0367%203.3964C14.2002%202.62923%2015.75%203.46373%2015.75%204.85741V19.1431C15.75%2020.5368%2014.2002%2021.3713%2013.0367%2020.6041L7.03762%2016.6487C6.99677%2016.6218%206.94892%2016.6074%206.9%2016.6074H4C2.48122%2016.6074%201.25%2015.3762%201.25%2013.8574V10.1431C1.25%208.62434%202.48122%207.39313%204%207.39313H6.9C6.94892%207.39313%206.99677%207.37877%207.03762%207.35184L13.0367%203.3964Z%22%20fill%3D%22%23000000%22%3E%3C%2Fpath%3E%3C%2Fg%3E%3Cdefs%3E%3CclipPath%20id%3D%22clip0_4223_8258%22%3E%3Crect%20width%3D%2224%22%20height%3D%2224%22%20fill%3D%22white%22%3E%3C%2Frect%3E%3C%2FclipPath%3E%3C%2Fdefs%3E%3C%2Fsvg%3E");
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: contain;
}
.restart-button:after {
  mask-image: url("data:image/svg+xml;utf8,%3Csvg%20width%3D%22800%22%20height%3D%22800%22%20viewBox%3D%22-7.5%200%2032%2032%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M15.88%2013.84c-1.68-3.48-5.44-5.24-9.04-4.6l.96-1.8a.8.8%200%200%200-.32-1.12.8.8%200%200%200-1.12.32L4.4%2010.28s-.44.72.24%201.04l3.64%201.96c.12.08.28.12.4.12.28%200%20.6-.16.72-.44a.8.8%200%200%200-.32-1.12L7.2%2010.8c2.84-.48%205.8.96%207.12%203.68%201.6%203.32.2%207.32-3.12%208.88-1.6.76-3.4.88-5.08.28s-3.04-1.8-3.8-3.4c-.76-1.6-.88-3.4-.28-5.08a.848.848%200%200%200-.52-1.08c-.4-.08-.88.16-1.04.6-.72%202.12-.6%204.36.36%206.36s2.64%203.52%204.76%204.28c.92.32%201.84.48%202.76.48%201.24%200%202.48-.28%203.6-.84%204.16-2%205.92-7%203.92-11.12z%22%2F%3E%3C%2Fsvg%3E");
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: contain;
}

/*
#player {
  transition: all 0.6s ease-out;
}
*/
/*
.wrapper, .fader, .thumbnail {
  transition: opacity 0.6s ease-in;
}
.background {
  transition: border 0.6s ease-in;
}
*/
/*
#player {
  top: 20%;
  left: 40%;
  postion: relative;
  width: 30%;
}
*/
/*
.yt-logo {
  background-image: url("data:image/svg+xml;utf8,<svg id='Layer_1' data-name='Layer 1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 176 124'><defs><style>.cls-1 {fill: white;} .cls-2 {fill: red;}</style></defs><path class='cls-2' d='M172.32,19.36c-2.02-7.62-7.99-13.62-15.56-15.66C143.04,0,88,0,88,0c0,0-55.04,0-68.76,3.7-7.57,2.04-13.54,8.04-15.56,15.66C0,33.18,0,62,0,62c0,0,0,28.82,3.68,42.64,2.02,7.62,7.99,13.62,15.56,15.66,13.73,3.7,68.76,3.7,68.76,3.7,0,0,55.04,0,68.76-3.7,7.57-2.04,13.54-8.04,15.56-15.66,3.68-13.81,3.68-42.64,3.68-42.64,0,0,0-28.82-3.68-42.64Z'/><polygon class='cls-1' points='70 88.17 116 62 70 35.83 70 88.17'/></svg>");
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 0.6rem;
  bottom: 1.8rem;
  filter: drop-shadow(1px 1px 3px black);
  height: 2.5rem;
  left: 1.8rem;
  position: absolute;
  width: 3.5rem;
  z-index: 5;
  transition: opacity 0.6s ease-in;
}
*/
@media (hover: hover) {
  .control-button:hover {
    background: var(--youtube-player-button-base-hover-background, #333);
    border: 1px solid var(--youtube-player-button-base-hover-foreground, #999);
  }
  .control-button:hover:after {
    background: var(--youtube-player-button-base-hover-foreground, #999);
  }
  .button-fader > .control-button:hover {
    background: var(--youtube-player-button-faded-hover-background, #111);
    border: 1px solid var(--youtube-player-button-faded-hover-foreground, #333);
  }
  .button-fader > .control-button:hover:after {
    background: var(--youtube-player-button-faded-hover-foreground, #333);
  }
}`
    );
    this.shadowRoot.adoptedStyleSheets.push(styles);
  }
}

customElements.define('youtube-player', YouTubePlayer)

