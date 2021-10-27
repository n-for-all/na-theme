window["onYouTubeIframeCallbacks"] = [];
window["onYouTubeIframeAPIReady"] = () => {
	for (let i = 0; i < window["onYouTubeIframeCallbacks"].length; i++) {
		window["onYouTubeIframeCallbacks"][i]();
		delete window["onYouTubeIframeCallbacks"][i];
	}
};

declare let YT: any;

const template = `<div class="player-container">
<div class="player">
    <div class="controls">
        <div class="progress">
            <div class="progress-filled"></div>
        </div>
        <div class="controls-main">
            <div class="controls-left">
                <div class="volume">
                    <div class="volume-btn loud">
                        <svg width="26" height="24" viewBox="0 0 26 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.75497 17.6928H2C0.89543 17.6928 0 16.7973 0 15.6928V8.30611C0 7.20152 0.895431 6.30611 2 6.30611H6.75504L13.9555 0.237289C14.6058 -0.310807 15.6 0.151473 15.6 1.00191V22.997C15.6 23.8475 14.6058 24.3098 13.9555 23.7617L6.75497 17.6928Z" transform="translate(0 0.000518799)" fill="white" />
                            <path id="volume-low" d="M0 9.87787C2.87188 9.87787 5.2 7.66663 5.2 4.93893C5.2 2.21124 2.87188 0 0 0V2C1.86563 2 3.2 3.41162 3.2 4.93893C3.2 6.46625 1.86563 7.87787 0 7.87787V9.87787Z" transform="translate(17.3333 7.44955)" fill="white" />

                            <path id="volume-high" d="M0 16.4631C4.78647 16.4631 8.66667 12.7777 8.66667 8.23157C8.66667 3.68539 4.78647 0 0 0V2C3.78022 2 6.66667 4.88577 6.66667 8.23157C6.66667 11.5773 3.78022 14.4631 0 14.4631V16.4631Z" transform="translate(17.3333 4.15689)" fill="white" />
                            <path id="volume-off" d="M1.22565 0L0 1.16412L3.06413 4.0744L0 6.98471L1.22565 8.14883L4.28978 5.23853L7.35391 8.14883L8.57956 6.98471L5.51544 4.0744L8.57956 1.16412L7.35391 0L4.28978 2.91031L1.22565 0Z" transform="translate(17.3769 8.31403)" fill="white" />
                        </svg>
                    </div>
                </div>
            </div>
            <div class="play-btn paused"></div>
            <div class="controls-right">
                <div class="fullscreen">
                    <svg width="30" height="22" viewBox="0 0 30 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 0V-1.5H-1.5V0H0ZM0 18H-1.5V19.5H0V18ZM26 18V19.5H27.5V18H26ZM26 0H27.5V-1.5H26V0ZM1.5 6.54545V0H-1.5V6.54545H1.5ZM0 1.5H10.1111V-1.5H0V1.5ZM-1.5 11.4545V18H1.5V11.4545H-1.5ZM0 19.5H10.1111V16.5H0V19.5ZM24.5 11.4545V18H27.5V11.4545H24.5ZM26 16.5H15.8889V19.5H26V16.5ZM27.5 6.54545V0H24.5V6.54545H27.5ZM26 -1.5H15.8889V1.5H26V-1.5Z" transform="translate(2 2)" fill="white" />
                    </svg>
                </div>
            </div>
        </div>
    </div>
</div>
</div>`;

export class YouTube {
	player: any;
	done: boolean;
	element: HTMLElement;
	mainElement: HTMLElement;
	video_id = "";
	progressSlider: any;
	progressFill: any;
	playBtn: any;
	interval: NodeJS.Timer;

	constructor(video_id, slide: HTMLElement) {
		this.mainElement = slide;

        let playBtn = this.mainElement.querySelector(".play-btn-big");

        
		if (!playBtn) {
			this.mainElement.insertAdjacentHTML("beforeend", '<a href="#" class="play-btn-big"></a>');
			playBtn = this.mainElement.querySelector(".play-btn-big");
		}

		playBtn.addEventListener("click", (e) => {  
			e.preventDefault();
			this.play();
		});

		this.video_id = video_id;
	}

	loadControls() {
		let main = this.mainElement;

        this.mainElement.insertAdjacentHTML("beforeend", template);
		let playerElement = main.parentElement.querySelector(".player-container");
		this.playBtn = playerElement.querySelector(".play-btn");
		if (this.playBtn)
			this.playBtn.addEventListener("click", (e) => { 
				if (this.playBtn.classList.contains("paused")) {
					this.player.playVideo();
					this.playBtn.classList.remove("paused");
				} else {
					this.player.pauseVideo();
					this.playBtn.classList.add("paused");
				}
			});
		let muteBtn = playerElement.querySelector(".volume-btn");
		if (muteBtn)
			muteBtn.addEventListener("click", (e) => {
				if (muteBtn.classList.contains("loud")) {
					this.player.mute();
					muteBtn.classList.remove("loud");
				} else {
					this.player.unMute();
					muteBtn.classList.add("loud");
				}
			});
		let fullscreenBtn = playerElement.querySelector(".fullscreen");
		if (fullscreenBtn)
			fullscreenBtn.addEventListener("click", (e) => {
				if (this.element.requestFullscreen) {
					this.element.requestFullscreen();
					//@ts-ignore
				} else if (this.element.mozRequestFullscreen) {
					//@ts-ignore
					this.element.mozRequestFullscreen();
					//@ts-ignore
				} else if (this.element.webkitRequestFullscreen) {
					//@ts-ignore
					this.element.webkitRequestFullscreen();
				}
			});
		this.progressSlider = playerElement.querySelector(".progress");
		this.progressFill = playerElement.querySelector(".progress-filled");

		this.progressSlider.addEventListener("click", (e) => {
			const newTime = e.offsetX / this.progressSlider.offsetWidth;
			this.progressFill.style.width = `${newTime * 100}%`;
			this.player.seekTo(Math.ceil(newTime * this.player.getDuration()), true);
		});
	}

	load(callback) {
		if (!window["_youtube_loaded"]) {
			document.body.classList.add("na-status-loading");
			window["onYouTubeIframeCallbacks"].push(() => {
				window["_youtube_loaded"] = true;
				callback();
                setTimeout(() => {
                    document.body.classList.remove("na-status-loading");
                }, 2000);
			});
		}

		if (!window["_youtube_script_loaded"]) {
			var tag = document.createElement("script");
			tag.src = "https://www.youtube.com/iframe_api";
			var firstScriptTag = document.getElementsByTagName("script")[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
			window["_youtube_script_loaded"] = true;
		} else if (window["_youtube_loaded"]) {
			document.body.classList.remove("na-status-loading");
			callback();
		}
	}

	initialize = (callback) => {
		if (this.player) {
            callback();
			return;
		}

		let div = document.createElement("div");
		div.classList.add("video-placeholder");
		div.setAttribute("id", `video-${this.video_id}`);
		this.mainElement.appendChild(div);

		this.loadControls();

		this.player = new YT.Player(`video-${this.video_id}`, {
			height: "100%",
			width: "100%",
			playerVars: { autoplay: 0, controls: 0, showinfo: 0, modestbranding: 1, rel: 0, loop: 1 },
			videoId: this.video_id,
			events: {
				onReady: callback,
				onStateChange: this.onPlayerStateChange,
			},
		});

		this.element = document.querySelector(`#video-${this.video_id}`);
	};

	stop = () => {
		this.player?.stopVideo();
	};

	pause = () => {
		this.player?.pauseVideo();
	};

	play = () => {
		if (this.player) {
			return this.player.playVideo();
		}
		this.load(() => {
			this.initialize(() => this.player.playVideo());
		});
	};

	onPlayerStateChange = (event) => {
		if (event.data == YT.PlayerState.PLAYING) {
			this.playBtn.classList.remove("paused");
			this.mainElement.classList.add("status-playing");
			this.interval = setInterval(() => {
				let time = this.player.getCurrentTime();
				const newTime = time / this.player.getDuration();
				this.progressFill.style.width = `${newTime * 100}%`;
			}, 1000);
		} else if (event.data == YT.PlayerState.PAUSED || event.data == YT.PlayerState.ENDED) {
			this.mainElement.classList.remove("status-playing");
			this.playBtn.classList.add("paused");
			if (this.interval) clearInterval(this.interval);
		}

		if (event.data == YT.PlayerState.ENDED) {
			this.player.seekTo(0, true);
			this.pause();
		}
	};
};
