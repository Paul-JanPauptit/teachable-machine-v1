// Dummy audio class that provides timing feedback but no actual Audio playback

class DummyAudio {

    constructor() {
        this.events = {};
        this.isRunning = false;
        this.startTime = 0;
        this.accumulatedTime = 0;
    }

    set src(url) {
        var me = this;
        setTimeout(function () {
            me.fireEvent("canplaythrough");
        }, 100);
    }

    // Current running time in seconds
    get currentTime() {
        return this.accumulatedTime + this.isRunning ? (new Date().getTime() - this.startTime) / 1000 : 0;
    }

    set currentTime(time) {
        this.accumulatedTime = time / 1000 - this.currentTime + this.accumulatedTime;
    }

    play() {
        if (this.isRunning)
            return;

        this.startTime = new Date().getTime();
        this.isRunning = true;
    }

    pause() {
        if (!this.isRunning)
            return;

        this.accumulatedTime = this.currentTime;
        this.isRunning = false;
    }

    addEventListener(name, handler) {
        if (this.events.hasOwnProperty(name))
            this.events[name].push(handler);
        else
            this.events[name] = [handler];
    }

    removeEventListener(name, handler) {
        if (!this.events.hasOwnProperty(name))
            return;

        var index = this.events[name].indexOf(handler);
        if (index != -1)
            this.events[name].splice(index, 1);
    }

    fireEvent(name, args) {
        if (!this.events.hasOwnProperty(name))
            return;

        if (!args || !args.length)
            args = [];

        var evs = this.events[name], l = evs.length;
        for (var i = 0; i < l; i++) {
            evs[i].apply(null, args);
        }
    };
}

export default DummyAudio;