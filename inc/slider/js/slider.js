(function () {
    'use strict';

    window["onYouTubeIframeCallbacks"] = [];
    window["onYouTubeIframeAPIReady"] = () => {
        for (let i = 0; i < window["onYouTubeIframeCallbacks"].length; i++) {
            window["onYouTubeIframeCallbacks"][i]();
            delete window["onYouTubeIframeCallbacks"][i];
        }
    };
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
    class YouTube {
        constructor(video_id, slide) {
            this.video_id = "";
            this.initialize = (callback) => {
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
            this.stop = () => {
                var _a;
                (_a = this.player) === null || _a === void 0 ? void 0 : _a.stopVideo();
            };
            this.pause = () => {
                var _a;
                (_a = this.player) === null || _a === void 0 ? void 0 : _a.pauseVideo();
            };
            this.play = () => {
                if (this.player) {
                    return this.player.playVideo();
                }
                this.load(() => {
                    this.initialize(() => this.player.playVideo());
                });
            };
            this.onPlayerStateChange = (event) => {
                if (event.data == YT.PlayerState.PLAYING) {
                    this.playBtn.classList.remove("paused");
                    this.mainElement.classList.add("status-playing");
                    this.interval = setInterval(() => {
                        let time = this.player.getCurrentTime();
                        const newTime = time / this.player.getDuration();
                        this.progressFill.style.width = `${newTime * 100}%`;
                    }, 1000);
                }
                else if (event.data == YT.PlayerState.PAUSED || event.data == YT.PlayerState.ENDED) {
                    this.mainElement.classList.remove("status-playing");
                    this.playBtn.classList.add("paused");
                    if (this.interval)
                        clearInterval(this.interval);
                }
                if (event.data == YT.PlayerState.ENDED) {
                    this.player.seekTo(0, true);
                    this.pause();
                }
            };
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
                    }
                    else {
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
                    }
                    else {
                        this.player.unMute();
                        muteBtn.classList.add("loud");
                    }
                });
            let fullscreenBtn = playerElement.querySelector(".fullscreen");
            if (fullscreenBtn)
                fullscreenBtn.addEventListener("click", (e) => {
                    if (this.element.requestFullscreen) {
                        this.element.requestFullscreen();
                    }
                    else if (this.element.mozRequestFullscreen) {
                        this.element.mozRequestFullscreen();
                    }
                    else if (this.element.webkitRequestFullscreen) {
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
            }
            else if (window["_youtube_loaded"]) {
                document.body.classList.remove("na-status-loading");
                callback();
            }
        }
    }

    class NaSliderData {
        set(element, key, value) {
            if (!window["_storage"]) {
                window["_storage"] = [];
            }
            window["_storage"].push({ key, value, element });
        }
        get(element, key) {
            if (!window["_storage"] || window["_storage"].length == 0) {
                return false;
            }
            let i = 0;
            for (i = 0; i < window["_storage"].length; i++) {
                if (window["_storage"][i].element == element && window["_storage"][i].key == key) {
                    return window["_storage"][i].value;
                }
            }
            return null;
        }
        delete(element, key) {
            if (!window["_storage"] || window["_storage"].length == 0) {
                return false;
            }
            let i = 0;
            for (i = 0; i < window["_storage"].length; i++) {
                if (window["_storage"][i].element == element && window["_storage"][i].key == key) {
                    delete window["_storage"][i];
                }
            }
            return null;
        }
    }
    class NaSliderBullets {
        constructor(slider, pagination = 0, columns = 1, initial = 0) {
            this.slider = slider;
            if (!this.slider) {
                return;
            }
            this.bullets = this.slider.getElement().querySelector("bullets");
            if (this.bullets) {
                this.load(pagination, columns, initial);
            }
        }
        load(pagination, columns, initial) {
            let slides = this.slider.getSlides();
            let total = slides.length;
            if (pagination == 1) {
                total = Math.ceil(slides.length / columns);
            }
            let totalArray = new Array(total);
            [...totalArray].map((_, index) => {
                let span = document.createElement("span");
                this.bullets.appendChild(span);
                span.addEventListener("click", (e) => {
                    e.preventDefault();
                    this.slider.pause = true;
                    this.slider.to(index);
                    this.update(index);
                });
            });
            this.update(initial);
        }
        update(index) {
            if (!this.bullets) {
                return;
            }
            [].forEach.call(this.bullets.children, (item, i) => {
                if (index == i) {
                    item.classList.add("active");
                }
                else {
                    item.classList.remove("active");
                }
            });
        }
        setActive(index) {
            this.update(index);
        }
    }
    class NaSliderNavigation {
        constructor(slider, pagination = 0, columns = 1, initial = 0, loop = false) {
            this.current = 0;
            this.columns = 1;
            this.slider = slider;
            if (!this.slider) {
                return;
            }
            this.loop = loop;
            this.sliderElement = this.slider.getElement();
            this.columns = columns;
            this.current = initial;
            this.pagination = pagination;
            this.bullets = new NaSliderBullets(slider, pagination, columns, initial);
            this._prev = this.slider.getElement().querySelector('[action="prev"]');
            this._next = this.slider.getElement().querySelector('[action="next"]');
            if (this._prev) {
                this._prev.addEventListener("click", (e) => {
                    e.preventDefault();
                    if (pagination == 1) {
                        this.prevPage();
                        return;
                    }
                    if (this.current > 0) {
                        this.to(this.current - 1);
                    }
                });
            }
            if (this._next) {
                this._next.addEventListener("click", (e) => {
                    e.preventDefault();
                    if (pagination == 1) {
                        this.nextPage();
                        return;
                    }
                    if (this.current < this.slider.getTotalSlides() - columns) {
                        this.to(this.current + 1);
                    }
                    else if (loop) {
                        this.slider.fade = true;
                        this.to(0);
                    }
                });
            }
        }
        prev() {
            if (this.pagination == 1) {
                this.prevPage();
                return;
            }
            if (this.current > 0) {
                this.to(this.current - 1);
            }
        }
        next() {
            if (this.pagination == 1) {
                this.nextPage();
                return;
            }
            if (this.current < this.slider.getTotalSlides() - this.columns) {
                this.to(this.current + 1);
            }
            else if (this.loop) {
                this.slider.fade = true;
                this.to(0);
            }
        }
        prevPage() {
            if (this.current > 0) {
                var index = this.current - 1;
                this.to(index);
            }
        }
        nextPage() {
            if (this.current < this.slider.getTotalSlides() - this.columns) {
                this.to(this.current + 1);
            }
        }
        navClass() {
            if (this.current >= this.slider.getTotalSlides() - this.columns) {
                this.sliderElement.classList.add("na-no-next");
            }
            else {
                this.sliderElement.classList.remove("na-no-next");
            }
            if (this.current == 0) {
                this.sliderElement.classList.add("na-no-prev");
            }
            else {
                this.sliderElement.classList.remove("na-no-prev");
            }
        }
        to(i) {
            let index = i;
            if (this.pagination == 1) {
                index = i * this.columns;
                if (i > this.slider.getTotalSlides() / this.columns || i < 0) {
                    return;
                }
            }
            this.slider.setCurrentSlide(index, true, true);
            this.current = i;
            this.bullets.setActive(i);
            this.navClass();
        }
        getCurrent() {
            return this.current;
        }
        getCurrentIndex() {
            return this.pagination == 1 ? this.current * this.columns : this.current;
        }
    }
    class NaSlider {
        constructor(selector, settings) {
            this.inner = null;
            this.settings = null;
            this.slide = {
                height: 0,
                width: 0,
            };
            this.slider = {
                scroller: null,
                transform: null,
                width: 0,
                element: null,
            };
            this.columns = 1;
            this.cInterval = null;
            this.fade = false;
            this.pause = false;
            this.current = 0;
            this.scroll = false;
            this.slides = [];
            this._stop = false;
            this._fpsTime = 0;
            this.autoplay = (autoplay, delay = 3000) => {
                let xf = () => {
                    setInterval(() => {
                        if (this._stop) {
                            return;
                        }
                        if (!this.pause) {
                            this.next();
                        }
                        this.pause = false;
                    }, autoplay * 1000);
                };
                setTimeout(() => {
                    xf();
                }, delay);
            };
            this.get = (i) => {
                return this.slides[i];
            };
            this.getElement = () => {
                return this.element;
            };
            this.getSlides = () => {
                return this.slides;
            };
            this.draw = () => {
                this.animationframe = window.requestAnimationFrame(this.draw);
                let fpsInterval = 5;
                let now = Date.now();
                let elapsed = now - this._fpsTime;
                if (elapsed > fpsInterval) {
                    this._fpsTime = now - (elapsed % fpsInterval);
                    if (!this.scroll) {
                        return;
                    }
                    var transforms = {
                        webkitTransform: "-webkit-transform",
                        OTransform: "-o-transform",
                        msTransform: "-ms-transform",
                        MozTransform: "-moz-transform",
                        transform: "transform",
                    };
                    if (this.fade) {
                        this.element.classList.add("fade-slider");
                        setTimeout(() => {
                            setTimeout(() => {
                                this.element.classList.remove("fade-slider");
                            }, 300);
                        }, 200);
                        this.fade = false;
                        return;
                    }
                    if (this.settings.vertical == 1) {
                        for (var t in transforms) {
                            this.slider.transform.style[t] = "translate3d(0px," + -1 * this.slide.height * this.current + "px,0px)";
                        }
                    }
                    else {
                        for (var t in transforms) {
                            this.slider.transform.style[t] = "translate3d(" + -1 * this.slide.width * this.current + "px,0px,0px)";
                        }
                    }
                    this.visibility();
                    this.scroll = false;
                }
            };
            this.element = this.isString(selector) ? document.querySelector(selector) : selector;
            if (this.element) {
                if (!settings) {
                    settings = this.element.getAttribute("data-settings");
                }
                this.data = new NaSliderData();
                this.data.set(this.element, "na-slider", this);
                this.initialize(settings);
            }
        }
        stop() {
            this._stop = true;
        }
        continue() {
            this._stop = false;
        }
        initialize(settings) {
            var defaults = {
                type: "normal",
                pagination: 0,
                initial: 0,
                columns: 1,
                autoplay: 0,
                vertical: 0,
                minWidth: 200,
                height: "auto",
                sync: "",
            };
            this.settings = Object.assign(Object.assign({}, defaults), settings);
            this.columns = parseInt(this.settings.columns, 10);
            this.inner = document.createElement("div");
            this.inner.classList.add("na-slider");
            this.innerSlider = document.createElement("ul");
            this.innerSlider.classList.add("na-slides");
            let slides = this.element.querySelectorAll("slide");
            if (!slides || slides.length == 0) {
                return;
            }
            else {
                [].forEach.call(slides, (slide) => {
                    let li = document.createElement("li");
                    this.cloneAttributes(slide, li);
                    this.innerSlider.appendChild(li);
                    while (slide.children.length > 0) {
                        li.appendChild(slide.children[0]);
                        if (li.hasAttribute("data-youtube-video")) {
                            li["_youtube_video"] = new YouTube(li.getAttribute("data-youtube-video"), li);
                        }
                    }
                    this.slides.push(li);
                    slide.parentNode.removeChild(slide);
                });
            }
            this.inner.appendChild(this.innerSlider);
            this.element.prepend(this.inner);
            if (this.settings.autoplay > 0 && this.slides.length > 1) {
                this.autoplay(this.settings.autoplay);
            }
            if (this.slides.length >= 1) {
                if (this.settings.columns > this.slides.length) {
                    this.settings.columns = this.slides.length;
                }
                this.events();
                this.load();
                this.draw();
                this.visibility();
                this.to(this.settings.initial);
            }
            setTimeout(() => {
                this.element.dispatchEvent(new Event("ready"));
                let resizeElement = this.settings.height == "100%" || this.settings.height == "auto" ? window : this.element;
                this.onResizeElem(resizeElement, () => {
                    this.load(true);
                });
            }, 100);
        }
        maxHeight() {
            var h = 0;
            this.slides.forEach((slide) => {
                if (slide.clientHeight > h) {
                    h = slide.clientHeight;
                }
            });
            return h / this.columns + 15;
        }
        load(preserveIndex = false) {
            var _a;
            this.trigger(this.element, "load", [this.element, this.settings]);
            this.columns = parseInt(this.settings.columns, 10);
            var height = 0;
            switch (this.settings.height) {
                case "auto":
                    height = this.maxHeight();
                    break;
                case "100%":
                    height = window.innerHeight - ((_a = window["naTheme"]) === null || _a === void 0 ? void 0 : _a.headerOffset);
                    break;
                default:
                    if (this.settings.height.indexOf("%") > 0) {
                        if (this.settings.height.indexOf("w") == 0) {
                            height = Math.floor((parseInt(this.settings.height.replace("%", "").replace("w", ""), 10) / 100) * window.outerWidth);
                        }
                        else {
                            height = Math.floor((parseInt(this.settings.height.replace("%", ""), 10) / 100) * this.element.clientWidth);
                        }
                    }
                    else if (this.settings.height.indexOf("vh") > 0) {
                        height = Math.floor((parseInt(this.settings.height.replace("vh", ""), 10) / 100) * this.element.clientHeight);
                    }
                    else {
                        height = this.settings.height.replace("px", "");
                    }
                    break;
            }
            var width = Math.round(((this.element.clientWidth / this.columns) * 10) / 10);
            if (this.settings.minWidth > 0 && this.columns > 1) {
                while (width < this.settings.minWidth) {
                    this.columns = this.columns - 1;
                    width = Math.round(((this.element.clientWidth / this.columns) * 10) / 10);
                }
                if (this.columns == 0) {
                    this.columns = 1;
                    width = Math.round(((this.element.clientWidth / this.columns) * 10) / 10);
                }
            }
            this.slide = {
                height: height,
                width: width,
            };
            if (this.settings.vertical) {
                this.css(this.slides, {
                    height: height + "px",
                });
            }
            else {
                this.css(this.slides, {
                    width: width + "px",
                });
                if (this.settings.height != "auto") {
                    this.css(this.slides, {
                        height: height + "px",
                    });
                }
            }
            if (this.slides[0].clientWidth > width) {
                var s_width = this.slides[0].clientWidth;
                var w_width = this.element.clientWidth;
                var factor = Math.floor(w_width / s_width);
                width = w_width / factor;
                this.columns = factor <= 0 ? 1 : factor;
                this.slide = {
                    height: height,
                    width: width,
                };
                if (this.settings.vertical) {
                    this.css(this.slides, {
                        height: height + "px",
                    });
                }
                else {
                    this.css(this.slides, {
                        width: width + "px",
                    });
                    if (this.settings.height != "auto") {
                        this.css(this.slides, {
                            height: height + "px",
                        });
                    }
                }
            }
            var slider = this.innerSlider;
            if (this.settings.vertical == 1) {
                this.inner.style.height = height * this.columns + "px";
                slider.style.height = Math.ceil(this.slides.length * height) + "px";
            }
            else {
                this.inner.style.width = width * this.columns + "px";
                slider.style.width = Math.ceil(this.slides.length * width) + "px";
            }
            slider.style.marginLeft = "0px";
            this.slider.transform = slider;
            this.slider.scroller = this.inner;
            this.slider.element = slider;
            this.slider.width = Math.ceil(this.columns * width);
            if (!this.navigation) {
                this.navigation = new NaSliderNavigation(this, this.settings.pagination, this.columns, this.settings.initial, this.settings.loop);
            }
            if (!preserveIndex) {
                this.current = 0;
                this.to(this.settings.initial);
            }
            this.trigger(this.element, "load-slides", [this.slides, this.current]);
        }
        css(elements, css) {
            elements.forEach((elm) => {
                for (let i in css) {
                    elm.style[i] = css[i];
                }
            });
        }
        prev() {
            this.navigation.prev();
        }
        setCurrentSlide(index, scroll = true, pause = true) {
            this.scroll = scroll;
            this.current = index;
            this.pause = pause;
        }
        to(i) {
            this.navigation.to(i);
        }
        getTotalSlides() {
            return this.slides.length;
        }
        next() {
            this.navigation.next();
        }
        prevPage() {
            this.navigation.prevPage();
        }
        nextPage() {
            this.navigation.nextPage();
        }
        events() {
            var mousePosition = {
                clientX: 0,
                clientY: 0,
            };
            var keyhandle = false;
            this.element.addEventListener("mouseover", function (mouseMoveEvent) {
                mousePosition.clientX = mouseMoveEvent.pageX;
                mousePosition.clientY = mouseMoveEvent.pageY;
                keyhandle = true;
            });
            this.element.addEventListener("mouseout", () => {
                keyhandle = false;
            });
            document.addEventListener("keydown", (event) => {
                var divRect = this.element.getBoundingClientRect();
                if (mousePosition.clientX >= divRect.left && mousePosition.clientX <= divRect.right && mousePosition.clientY >= divRect.top && mousePosition.clientY <= divRect.bottom && keyhandle) {
                    event.preventDefault();
                    if (event.keyCode == 38 || event.keyCode == 37) {
                        this.prev();
                        return false;
                    }
                    else if (event.keyCode == 40 || event.keyCode == 39) {
                        this.next();
                        return false;
                    }
                }
                return true;
            });
            if (typeof Hammer != undefined) {
                var hammertime = new Hammer(this.element, {});
                hammertime.on("swipe", (ev) => {
                    if (ev.direction == Hammer.DIRECTION_LEFT) {
                        this.pause = true;
                        this.next();
                    }
                    if (ev.direction == Hammer.DIRECTION_RIGHT) {
                        this.pause = true;
                        this.prev();
                    }
                });
            }
            this.slides.forEach((slide, index) => {
                slide.addEventListener("click", () => {
                    this.trigger(this.element, "click-slide", [index, slide]);
                });
                slide.addEventListener("mouseover", () => {
                    this.pause = true;
                    return false;
                });
                slide.addEventListener("mouseleave", () => {
                    this.pause = false;
                    return false;
                });
            });
            if (this.settings.sync && this.settings.sync != "") {
                let sync_slider = document.querySelector("#" + this.settings.sync);
                if (sync_slider) {
                    var slider = this.data.get(sync_slider, "na-slider");
                    if (!slider) {
                        return;
                    }
                    this.element.addEventListener("active-slide", ((event, index) => {
                        if (slider && slider.active() != index)
                            slider.to(index);
                        return false;
                    }));
                    sync_slider.addEventListener("active-slide", ((event, index) => {
                        if (this.navigation.getCurrent() != index)
                            this.to(index);
                        return false;
                    }));
                    sync_slider.addEventListener("click-slide", ((event, index) => {
                        if (this.navigation.getCurrent() != index)
                            this.to(index);
                        return false;
                    }));
                }
            }
        }
        visibility() {
            let index = this.navigation.getCurrentIndex();
            var range = [index, index + this.columns - 1];
            this.slides.forEach((slide, index) => {
                slide.classList.remove("before", "after", "visible");
                slide.classList.add("na-slide");
                if (index >= range[0] && index <= range[1]) {
                    slide.classList.add("visible");
                }
                else {
                    slide.classList.remove("visible");
                }
                if (index == range[1] + 1) {
                    slide.classList.add("after");
                }
                if (index == range[0] - 1) {
                    slide.classList.add("before");
                }
            });
        }
        onResizeElem(element, callback) {
            if (!element) {
                return;
            }
            var onResizeElem = {};
            onResizeElem["watchedElementData"] = {
                element: element,
                offsetWidth: element.offsetWidth || element.innerWidth,
                offsetHeight: element.offsetHeight || element.innerHeight,
                callback: callback,
            };
            onResizeElem["checkForChanges"] = function () {
                const data = onResizeElem["watchedElementData"];
                let width = data.element.offsetWidth || data.element.innerWidth;
                let elmWidth = data.offsetWidth || data.innerWidth;
                let height = data.element.offsetHeight || data.element.innerHeight;
                let elmHeight = data.offsetHeight || data.innerHeight;
                if (width !== elmWidth || height !== elmHeight) {
                    data.offsetWidth = width;
                    data.offsetHeight = height;
                    data.callback();
                }
            };
            window.addEventListener("resize", onResizeElem["checkForChanges"]);
        }
        trigger(element, eventName, detail = null) {
            let event = null;
            if (detail) {
                event = new CustomEvent(eventName, { detail });
            }
            else {
                event = new Event(eventName);
            }
            if (element instanceof NodeList) {
                element.forEach((elm) => {
                    elm.dispatchEvent(event);
                });
            }
            else {
                element.dispatchEvent(event);
            }
        }
        isString(obj) {
            const type = typeof obj;
            return type == "string" || (type == "object" && obj != null && !Array.isArray(obj) && Object.prototype.toString.call(obj) === "[object String]");
        }
        cloneAttributes(from, to) {
            let attr;
            let attributes = Array.prototype.slice.call(from.attributes);
            while ((attr = attributes.pop())) {
                to.setAttribute(attr.nodeName, attr.nodeValue);
            }
        }
    }
    window["NaSlider"] = NaSlider;

}());
//# sourceMappingURL=slider.js.map
