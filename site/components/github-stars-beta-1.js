const sheet = new CSSStyleSheet();
sheet.replaceSync(`
  :host {
    --background: var(--github-star--background, rgb(255 255 255 / 0.7));
    --border-radius: var(--github-stars--border-radius, 0.3rem);
    --font-size: var(--github-start--font-size, 0.8rem);
    --color: var(--github-stars--color, rgb(0 0 0 / 0.6));
  }
  :host { 
    cursor: pointer;
    line-height: 1;
    background: var(--background);
    border: 1px solid var(--color);
    border-radius: var(--border-radius);
    color: var(--color);
    display: inline-block; 
    font-size: var(--font-size);
    margin: 0;
    min-width: 3rem;
    padding-top: 3px;
    padding-bottom: 3px;
    padding-inline: 0.3rem;
    text-align: center;
  }
  :host(:hover) {
    border: 1px solid var(--background);
  }
  :host(:hover), :host(:hover) a {
    background: var(--color);
    color: var(--background);
  }
  :host(:hover) #logo {
    background: var(--background);
  }
  a {
    color: var(--color);
    text-decoration: none;
  }
  .hidden {
    opacity: 0;
  }
  #logo {
    background: var(--color);
    mask-image: url("data:image/svg+xml;utf8,%3Csvg%20width%3D%22139%22%20height%3D%22106%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20d%3D%22M54.854%204C27.839%204%206%2026%206%2053.217c0%2021.756%2013.993%2040.172%2033.405%2046.69%202.427.49%203.316-1.059%203.316-2.362%200-1.141-.08-5.052-.08-9.127-13.59%202.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015%204.934.326%207.523%205.052%207.523%205.052%204.367%207.496%2011.404%205.378%2014.235%204.074.404-3.178%201.699-5.378%203.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283%200-5.378%201.94-9.778%205.014-13.2-.485-1.222-2.184-6.275.486-13.038%200%200%204.125-1.304%2013.426%205.052a46.97%2046.97%200%200%201%2012.214-1.63c4.125%200%208.33.571%2012.213%201.63%209.302-6.356%2013.427-5.052%2013.427-5.052%202.67%206.763.97%2011.816.485%2013.038%203.155%203.422%205.015%207.822%205.015%2013.2%200%2018.905-11.404%2023.06-22.324%2024.283%201.78%201.548%203.316%204.481%203.316%209.126%200%206.6-.08%2011.897-.08%2013.526%200%201.304.89%202.853%203.316%202.364%2019.412-6.52%2033.405-24.935%2033.405-46.691C103.707%2026%2081.788%204%2054.854%204Z%22%20fill%3D%22%2324292f%22%2F%3E%3Cpath%20d%3D%22m111.031%2016.445%204.33-8.72c.555-1.12%202.161-1.12%202.717%200l4.329%208.72%209.681%201.407c1.242.18%201.737%201.699.838%202.57l-7.004%206.783%201.653%209.582c.212%201.231-1.087%202.17-2.198%201.588l-8.658-4.527-8.657%204.527c-1.112.581-2.411-.357-2.199-1.588l1.653-9.582-7.004-6.783c-.9-.871-.404-2.39.838-2.57z%22%20stroke%3D%22%23000%22%20stroke-width%3D%223.333%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E");
    mask-position: center;
    mask-repeat: no-repeat;
    mask-size: contain;
    width: 1rem;
    display: inline-block;
  }
`);

const template = document.createElement('template');
template.innerHTML = `<a class="hidden"><span id="logo">&nbsp;</span> <span id="count">+1</span></a>`

class GitHubStars extends HTMLElement {
  constructor() {
    super();
  }

  apiURL() {
    return `https://api.github.com/repos${this.url.pathname}`;
  }

  connectedCallback() {
    const initialTag = this.querySelector("a");
    this.url = new URL(initialTag.href);
    this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.shadowRoot.adoptedStyleSheets = [ sheet ];
    this.parts = {
      "a": this.shadowRoot.querySelector('a'),
      "count": this.shadowRoot.querySelector('#count')
    };
    this.parts.a.href = this.url.href
    this.getCount();
  }

  async getCount() {
    let response = await fetch(this.apiURL());
    if (!response.ok) {
      throw new Error('There was a problem getting the data');
    } else {
      this.gitHubJson = await response.json();
      // TODO: Figure out how to do error handling here
      this.parts.count.innerHTML = this.gitHubJson.stargazers_count;
    }
    this.parts.a.classList.remove('hidden');
  }
}

customElements.define('github-stars', GitHubStars)
