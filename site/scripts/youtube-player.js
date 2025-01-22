class YouTubePlayer extends HTMLElement {

  static activeInstance = null
  static instances = {}
  static timeout = null

  static handleEnded(instance) {
    // console.log(`handleEnded: ${instance.uuid}`)
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
    // console.log(`handlePause: ${instance.uuid}`)
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
      }, 900)
    }
  }

  static registerInstance(instance) {
    this.instances[instance.uuid] = instance
  }

  static removeInstance(instance) {
    delete this.instances[instance.uuid]
  }

  static switchActivePlayer(instance) {
    // console.log(`switchActivePlayer: ${instance.uuid}`)
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

  addContent() {
    const template = 
      this.ownerDocument.createElement('template')
    template.innerHTML = `
<div class="background stopped">
  <div class="thumbnail">
    <object type="image/jpg" data="https://i.ytimg.com/vi/${this.attrs.video}/maxresdefault.jpg" aria-label="Video thumbnail image">
      <img src="https://i.ytimg.com/vi/${this.attrs.video}/hqdefault.jpg" aria-label="Video thumbnail image" />
      <!--
https://i.ytimg.com/vi/Cz8cbwR_6ms/hqdefault.jpg
      -->
    </object>
  </div>
  <div class="shader hidden"></div>
  <div class="wrapper hidden">
    <div id="player"></div>
  </div>
  <div class="title"></div>
  <div class="yt-logo"></div>
</div>
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
    this.parts.logo = this.shadowRoot.querySelector('.yt-logo')
    this.parts.shader = this.shadowRoot.querySelector('.shader')
    this.parts.thumbnail = this.shadowRoot.querySelector('.thumbnail')
    this.parts.title = this.shadowRoot.querySelector('.title')
    this.parts.wrapper = this.shadowRoot.querySelector('.wrapper')
    this.parts.playButton = this.shadowRoot.querySelector('.play-button')
  }

  addEventListeners() {
    // const background = this.shadowRoot.querySelector(".background")
    this.parts.background.addEventListener('click', (event) => {
      this.handleWrapperClick.call(this, event)
    })
    this.parts.playButton.addEventListener('click', (event) => {
      this.handlePlayButtonClick.call(this, event)
    })
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
    this.parts.playButton.classList.add('play-button')
    this.parts.playButton.classList.remove('pause-button')
    this.parts.thumbnail.classList.remove('hidden')
    this.parts.logo.classList.remove('hidden')
    this.parts.background.classList.remove('playing')
    this.parts.background.classList.add('stopped')
    this.parts.background.classList.remove('faded')
    this.parts.shader.classList.add('hidden')
    this.parts.wrapper.classList.add('hidden')
  }

  doPlaying() {
    this.parts.playButton.classList.remove('play-button')
    this.parts.playButton.classList.add('pause-button')
    this.parts.thumbnail.classList.add('hidden')
    this.parts.logo.classList.add('hidden')
    this.parts.background.classList.add('playing')
    this.parts.background.classList.remove('stopped')
    this.parts.background.classList.remove('faded')
    this.parts.wrapper.classList.remove('hidden')
    this.parts.player.classList.remove('dark')
    let shaderUpdate = setTimeout(() => {
      this.parts.shader.classList.remove('dark-shader-over-background')
      this.parts.shader.classList.remove('hidden')
    }, 3000)
  }

  doPauseAndFade() {
    this.parts.playButton.classList.add('play-button')
    this.parts.playButton.classList.remove('pause-button')
    this.parts.background.classList.add('faded')
    this.parts.background.classList.remove('playing')
    this.parts.background.classList.remove('stopped')
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

  doPauseOnActivePlayer() {
    this.parts.playButton.classList.add('play-button')
    this.parts.playButton.classList.remove('pause-button')
    this.parts.background.classList.remove('faded')
    this.parts.background.classList.remove('playing')
    this.parts.background.classList.add('stopped')
  }

  doRemoveFade() {
    this.parts.background.classList.remove('faded')
    this.parts.background.classList.remove('playing')
    this.parts.background.classList.add('stopped')
    if (this.player.getPlayerState() === 2) {
      this.parts.player.classList.remove('dark')
    } else {
      this.parts.shader.classList.add('hidden')
      this.parts.shader.classList.remove('dark-shader-over-background')
    }
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

  async getTitle() {
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

  handlePlayButtonClick(event) {
    if (this.player.getPlayerState() === 1) {
      this.player.pauseVideo()
    } else {
      this.player.playVideo()
    }
  }

  handlePlayerStateChange(event) {
    const playerState = event.target.getPlayerState()
    if (playerState == -1) {
      // N/A - here for reference
    } else if (playerState == YT.PlayerState.BUFFERING) {
      // N/A - here for reference
    } else if (playerState == YT.PlayerState.CUED) {
      // N/A - here for reference
    } else if (playerState == YT.PlayerState.ENDED) {
      // TODO: Move the start time back to the original 
      // start time.
      this.constructor.handleEnded(this)
    } else if (playerState == YT.PlayerState.PAUSED) {
      this.constructor.handlePause(this)
    } else if (playerState == YT.PlayerState.PLAYING) {
      this.constructor.switchActivePlayer(this)
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
    this.player.playVideo()
  }

  handleYtLogoClick(event) {
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
          // onPlaybackRateChange: (event) => {
          //   this.handlePlaybackRateChange.call(this, event)
          // }
        },
      })
    }).then((value) => {
      return value
    })
    // TODO: Figure out how to handle errors here.
    //
    // The player can be added now that it's
    // been switched to the iframe
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

  addStyles() {
    const styles = new CSSStyleSheet();
    styles.replaceSync(`
.background {
  background-color: black;
  position: relative;
}
.control-button {
  background: ${this.colors["base-background"]};
  border: 1px solid ${this.colors["base-border"]};
  border-radius: 0.6rem;
  margin: 0;
  position: relative;
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
  display: grid;
  place-items: center;
}
.thumbnail object img {
  border-radius: 0.6rem;
  height: 100%;
  z-index: 2;
}
.title {
  background: rgb(0 0 0 / 0.3);
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
.pause-button:after {
  background: ${this.colors["base-foreground"]};
  content: "";
  height: 100%;
  left: 0;
  margin: 0;
  mask-image: url("data:image/svg+xml;utf8,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%3Csvg%20width%3D%2240px%22%20height%3D%2240px%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20color%3D%22%23000000%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%2018.4V5.6C6%205.26863%206.26863%205%206.6%205H9.4C9.73137%205%2010%205.26863%2010%205.6V18.4C10%2018.7314%209.73137%2019%209.4%2019H6.6C6.26863%2019%206%2018.7314%206%2018.4Z%22%20fill%3D%22%23000000%22%20stroke%3D%22%23000000%22%20stroke-width%3D%222%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M14%2018.4V5.6C14%205.26863%2014.2686%205%2014.6%205H17.4C17.7314%205%2018%205.26863%2018%205.6V18.4C18%2018.7314%2017.7314%2019%2017.4%2019H14.6C14.2686%2019%2014%2018.7314%2014%2018.4Z%22%20fill%3D%22%23000000%22%20stroke%3D%22%23000000%22%20stroke-width%3D%222%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E");
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: contain;
  position: absolute;
  top: 0;
  width: 100%;
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
#player {
  transition: all 0.7s ease-out;
}
.wrapper, .shader, .thumbnail {
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
  transition: opacity 0.7s ease-in;
}
@media (hover: hover) {
  .background:hover .title {
    color: white;
  }
  .background:hover .yt-logo{
    filter: drop-shadow(0px 0px 1px white);
  }
  .control-button:hover {
    background: ${this.colors['hover-background']};
    border: 1px solid ${this.colors['hover-foreground']};
  }
  .control-button:hover:after {
    background: ${this.colors['hover-foreground']};
  }
}`
    );
    this.shadowRoot.adoptedStyleSheets.push(styles);
  }
}

customElements.define('youtube-player', YouTubePlayer)

