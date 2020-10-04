// Copyright 2017 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* eslint-disable consistent-return, callback-return, no-case-declarations */
import GLOBALS from './../../config.js';
import DummyAudio from '../components/DummyAudio.js';
import TweenLite from 'gsap';


class Wizard {
  constructor() {

    this.sections = [];

    // Section 1 - Introduction
    this.sections.push({
      title: "1. Interface introduction",
      steps: [
        {
          text: 'This experiment lets you explore how machine learning works.'
        },
        {
          text: 'You can teach the machine using your camera.',
          execute: () => {
            if (localStorage.getItem('webcam_status') === null) {
              this.play("cameraInit");
              this.webcamEvent = this.webcamStatus.bind(this);
              window.addEventListener('webcam-status', this.webcamEvent);
            } else if (localStorage.getItem('webcam_status') === 'granted') {
              GLOBALS.camInput.start();
              this.play("cameraStart");
            } else if (localStorage.getItem('webcam_status') === 'denied') {
              this.play("cameraDenied");
            }
          }
        },
        {
          name: 'cameraInit',
          execute: () => {
            /*eslint-disable */
            if (!GLOBALS.browserUtils.isMobile && !GLOBALS.isCamGranted) {
              this.setText('First, click allow to turn on your camera.');
            } else {
              this.play('cameraStart');
            }
            /* eslint-enable */
          }
        },
        {
          name: 'cameraStart',
          execute: () => {
            GLOBALS.camInput.start();
          }
        },
        {
          duration: 20.6 - 16.3,
          text: 'Here is your input. You should see yourself.',
          execute: () => {
            GLOBALS.inputSection.enable();
            GLOBALS.inputSection.highlight();

            GLOBALS.learningSection.dim();
            GLOBALS.outputSection.dim();
          }
        },
        {

          duration: 1.5,
          groupWithNext: true,
          text: 'Here are three classes: green, purple, orange.',
          execute: () => {
            GLOBALS.inputSection.dehighlight();
            GLOBALS.inputSection.dim();
            GLOBALS.learningSection.undim();
            GLOBALS.outputSection.dim();
            if (GLOBALS.browserUtils.isMobile) {
              TweenLite.to(window, 0, { scrollTo: 385 });
            }

          }
        },
        {
          duration: 1,
          groupWithNext: true,
          execute: () => {
            GLOBALS.learningSection.highlightClass(0);
          }
        },
        {
          duration: 1,
          groupWithNext: true,
          execute: () => {
            GLOBALS.learningSection.dehighlightClass(0);
            GLOBALS.learningSection.highlightClass(1);
          }
        },
        {
          duration: 1.5,
          groupWithNext: true,
          execute: () => {
            GLOBALS.learningSection.dehighlightClass(0);
            GLOBALS.learningSection.dehighlightClass(1);
            GLOBALS.learningSection.highlightClass(2);
          }
        },
        {
          duration: 0.1,
          execute: () => {
            GLOBALS.learningSection.dehighlightClass(2);
          }
        },
        {
          duration: 3,
          text: "Here is the output, where the machine responds.",
          execute: () => {
            if (GLOBALS.browserUtils.isMobile) {
              TweenLite.to(window, 0, { scrollTo: 660 });
            }
            GLOBALS.inputSection.dim();
            GLOBALS.learningSection.dim();
            GLOBALS.outputSection.undim();
            GLOBALS.outputSection.highlight();
          }
        },
        {
          text: "It’s set to respond with one of these GIFs.",
          execute: () => {
            GLOBALS.outputSection.dehighlight();
          }
        },
        {
          text: "First, we’re going to teach it to respond with the rabbit GIF.",
          execute: () => {
            GLOBALS.inputSection.undim();
            GLOBALS.inputSection.enable();
            GLOBALS.learningSection.undim();
            GLOBALS.learningSection.enable();
            GLOBALS.outputSection.undim();
          }
        }


      ]
    });

    // Section 2 - Teaching first dataset
    this.sections.push({
      title: "2. Teaching first dataset",
      steps: [
        {
          text: "Stand in front of the camera and hold this green button for a couple of seconds.",
          waitForEvent: true,
          execute: () => {
            window.addEventListener('class-trained', this.classTrainedEvent);
            GLOBALS.learningSection.enableClass(0);
            GLOBALS.learningSection.highlightClass(0);
          }
        },
        {
          name: "greenTrained",
          text: 'You should now see the green bar and the rabbit GIF.',
          execute: () => {
            GLOBALS.learningSection.dehighlightClass(0);
          }
        },
        { text: 'But if you move around, you’ll see that they’re always showing no matter what.' },
        { text: "That’s because the machine is looking at your input, and picking which class looks most similar." },
        { text: 'But since you’ve only trained the green class, it always picks that one. That’s why you need to teach it a second class.' }
      ]
    });

    // Section 3 - Teaching cat and dog dataset
    this.sections.push({
      title: "3. Teaching cat and dog dataset",
      steps: [
        {
          text: "Now pick up and hold the stick figure with the cat image in front of the camera and hold this purple button for a couple seconds.",
          waitForEvent: true,
          execute: () => {
            window.addEventListener('class-trained', this.classTrainedEvent);
            GLOBALS.learningSection.enableClass(1);
            GLOBALS.learningSection.highlightClass(1);
          }
        },
        {
          name: "purpleTrained",
          text: ' You should see the cat GIF when you hold up the cat image, and the rabbit GIF when it’s down. Try it.',
          execute: () => {
            GLOBALS.learningSection.dehighlightClass(1);
          }
        },
        { text: 'Great! Looks like it’s working.' },
        {
          text: "Now pick up and hold the stick figure with the dog image in front of the camera and hold the orange button for a couple seconds.",
          waitForEvent: true,
          execute: () => {
            window.addEventListener('class-trained', this.classTrainedEvent);
            GLOBALS.learningSection.enableClass(2);
            GLOBALS.learningSection.highlightClass(2);
          }
        },
        {
          name: "orangeTrained",
          text: 'You should now see the cat GIF when you hold the cat image and the dog GIF when you hold the dog image. When they’re down you should see the rabbit GIF.'
        },
        { text: 'You’ve now fully teached the machine!' }
      ]
    });

    // Section 4 - Validation of datasets
    this.sections.push({
      title: "4. Validation of datasets",
      steps: [
        { text: 'See if the machine will now recognize similar images. Hold the image of the dog in the snow and the image of the mountain lion in front of the camera.'},
        { text: 'Great! Looks like it’s working.' },
        { text: 'Is the machine foolproof? Try to hold the image of the wolf in front of the camera.' },
        { text: 'The machine switches between the cat GIF and the dog GIF!' },
        { text: 'This is because the machine can not distinguish between the cat and the dog, since they are not representative for the wolf.' },
        { text: 'Machines need large data-sets to be able to recognize a larger variety of images.' },
        { text: 'Thanks for playing around. Continue teaching your machine whatever you want, or continue the exhbition. ' },
      ]
    });

    this.wizardRunning = false;
    this.sectionIndex = 0; // HACK, PJ: Do not commit anything other than 0, for testing purposes only.
    if (this.sectionIndex > 0) // For testing purposes only.
      this.startCamera();

    this.stepIndex = 0;

    this.timer = document.querySelector('.wizard__timer');
    this.timerFill = this.timer.querySelector('.wizard__timer-fill');
    this.percentage = 0;
    this.stepStartTime = 0;
    this.currentTime = 0;

    this.stopTime = 0;
    this.audio = new DummyAudio();
    this.loadedEvent = this.loaded.bind(this);
    this.audio.addEventListener('canplaythrough', this.loadedEvent);
    this.audio.src = 'assets/wizard/voice-over.mp3';

    this.wizardWrapper = document.querySelector('.wizard__wrapper');
    this.bar = document.querySelector('#wizard');
    this.machine = document.querySelector('.machine');
    this.titleContainer = this.bar.querySelector('.wizard__text-title');
    this.textContainer = this.bar.querySelector('.wizard__text-inner');
    this.soundButton = this.bar.querySelector('.wizard__sound-button');
    this.soundIcon = this.soundButton.querySelector('.wizard__sound-icon');
    this.soundButton.addEventListener('click', this.toggleSound.bind(this));

    this.nextButton = this.bar.querySelector('.wizard__next-button');

    this.restartButton = document.querySelector('#restart-machine-button');
    this.restartButton.addEventListener('click', () => { this.restart(); });

    this.classTrainedEvent = this.classTrained.bind(this);

    this.numTriggered = 0;
    this.lastClassTriggered = null;

    this.activateWebcamButton = document.getElementById('input__media__activate');
    this.activateWebcamButton.style.display = 'none';
    if (this.activateWebcamButton) {
      this.activateWebcamButton.addEventListener('click', () => {
        location.reload();
      });
    }


    this.resizeEvent = this.size.bind(this);
    this.scrollEvent = this.scroll.bind(this);
    window.addEventListener('resize', this.resizeEvent);
    window.addEventListener('scroll', this.scrollEvent);

    this.documentClickEvent = this.documentClick.bind(this);
    document.body.addEventListener('mouseup', this.documentClickEvent, true);     


    this.resizeEvent();
    this.scrollEvent();
  }

  iniializeSections() {

  }

  stickBar() {
    this.bar.classList.add('wizard--fixed');
    this.stickyBar = true;
  }

  unstickBar() {
    this.bar.classList.remove('wizard--fixed');
    this.stickyBar = false;
  }

  size() {
    this.wizardWrapper.style.height = this.bar.offsetHeight + 'px';

    if (this.machine.offsetHeight + this.bar.offsetHeight - window.pageYOffset > window.innerHeight) {
      this.stickBar();
    } else if (this.stickyBar) {
      this.unstickBar();
    }
  }

  scroll() {
    if (this.machine.offsetHeight + this.bar.offsetHeight - window.pageYOffset <= window.innerHeight) {
      this.unstickBar();
    } else {
      this.stickBar();
    }
  }

  documentClick(event) {
    this.lastActivityTime = Date.now();
    // Allow the user to click anywhere on the screen, if we are waiting for the next step. 
    if (this.waitingForNextClick)
    {
      event.preventDefault();
      event.stopPropagation();
      this.next();
    }
  }

  classTriggered(event) {
    let id = event.detail.id;

    if (id !== this.lastClassTriggered) {
      this.lastClassTriggered = id;
      this.numTriggered += 1;
    }

    if (this.numTriggered > 4 && !this.triggerTimer) {
      GLOBALS.outputSection.stopWizardMode();
      this.triggerTimer = setTimeout(() => {
        this.play("classTriggered");
      }, 1500);
    }
  }

  classTrained(event) {
    let id = event.detail.id;
    let numSamples = event.detail.numSamples;

    if (numSamples < 30) {
      this.play("trainMore");
    }

    if (id === 'green' && numSamples >= 30 && !this.greenDone) {
      this.greenDone = true;
      GLOBALS.learningSection.dehighlightClass(0);
      GLOBALS.inputSection.hideGif(0);
      this.play("greenTrained");
      window.removeEventListener('class-trained', this.classTrainedEvent);
    }

    if (id === 'purple' && numSamples >= 30) {
      GLOBALS.learningSection.dehighlightClass(1);
      GLOBALS.inputSection.hideGif(1);
      this.play("purpleTrained");
      window.removeEventListener('class-trained', this.classTrainedEvent);
    }

    if (id === 'orange' && numSamples >= 30) {
      GLOBALS.learningSection.dehighlightClass(2);
      GLOBALS.inputSection.hideGif(2);
      this.play("orangeTrained");
      window.removeEventListener('class-trained', this.classTrainedEvent);
    }

  }

  toggleSound(event) {
    event.preventDefault();
    if (this.muted) {
      this.unmute();
    } else {
      this.mute();
    }
  }

  timeUpdate() {

    if (this.currentStep && this.currentStep.duration) {
      let startTime = this.groupStartTime || this.stepStartTime;
      let duration = this.groupDuration || this.currentStep.duration;
      let percentage = (this.audio.currentTime - startTime) / duration;
      if (percentage > 1) {
        this.timer.style.opacity = 0;
      } else {
        this.timer.style.opacity = 1;
        this.timerFill.style.width = 80 * percentage + 'px';
      }

      if (this.audio.currentTime > this.stepStartTime + this.currentStep.duration)
        this.next();
    }

    this.audioTimer = requestAnimationFrame(this.timeUpdate.bind(this));

  }

  play(stepName) {
    this.playing = true;
    if (stepName) {
      var stepInfo = this.findStep(stepName);
      if (!stepInfo)
        throw `Step ${stepName} not found.`;
      this.sectionIndex = stepInfo.sectionIndex;
      this.stepIndex = stepInfo.stepIndex;
    }
    var section = this.sections[this.sectionIndex];
    this.currentStep = section.steps[this.stepIndex];
    this.stepStartTime = this.audio.currentTime;

    var step = this.currentStep;

    if (step.groupWithNext && !this.groupStartTime) {
      this.groupStartTime = this.stepStartTime;
      this.groupDuration = this.calculateGroupDuration();
    }

    this.waitingForNextClick = !(step.duration && step.execute || step.waitForEvent);

    this.nextButton.style.display = this.waitingForNextClick ? "block" : "none";
    this.timer.style.display = (step.duration && step.execute) ? "block" : "none";

    if (step.text)
      this.setText(step.text, section.title);
    if (step.execute) {
      step.execute();
    }

    //this.audio.currentTime = this.currentStep.startTime;
    this.audio.play();
  }

  calculateGroupDuration() {
    var section = this.sections[this.sectionIndex];
    
    var stepIndex = this.stepIndex;
    var groupWithNext = true;
    var duration = 0;
    while (groupWithNext) {
      var step = section.steps[stepIndex++];
      duration += (step.duration || 0);
      var groupWithNext = step.groupWithNext
    }
    return duration;
  }

  findStep(stepName) {
    for (var sectionIndex = 0; sectionIndex < this.sections.length; sectionIndex++) {
      var section = this.sections[sectionIndex];
      for (var stepIndex = 0; stepIndex < section.steps.length; stepIndex++) {
        var step = section.steps[stepIndex];
        if (step.name === stepName)
          return {
            section: section,
            step: step,
            sectionIndex: sectionIndex,
            stepIndex: stepIndex,
          };
      }
    }
    return null;
  }

  touchPlay() {
    this.audio.play();
    this.audio.pause();
  }

  loaded() {
    this.audio.removeEventListener('canplaythrough', this.loadedEvent);
  }

  startAudioTimer() {
    this.stopAudioTimer();
    this.audioTimer = requestAnimationFrame(this.timeUpdate.bind(this));
  }

  stopAudioTimer() {
    if (this.audioTimer) {
      cancelAnimationFrame(this.audioTimer);
    }
  }

  mute() {
    this.audio.muted = true;
    this.muted = true;
    this.soundIcon.classList.remove('wizard__sound-icon--on');
  }

  unmute() {
    this.audio.muted = false;
    this.muted = false;
    this.soundIcon.classList.add('wizard__sound-icon--on');
  }

  setText(message, title) {
    this.textContainer.textContent = message;

    if (title)
      this.titleContainer.textContent = title;

    if (message.length > 0) {
      this.timerFill.style.width = 0 + 'px';
    }
  }


  clear() {
    this.textContainer.textContent = '';
  }

  webcamStatus(event) {
    let that = this;
    if (event.detail.granted === true) {
      localStorage.setItem('webcam_status', 'granted');
      this.play(2);
      window.removeEventListener('webcam-status', this.webcamEvent);
    } else {
      localStorage.setItem('webcam_status', 'denied');
      this.play(7);
    }
  }

  start() {
    let that = this;
    this.wizardRunning = true;
    this.soundButton.style.display = 'block';
    this.play();
    this.startAudioTimer();
    GLOBALS.launchScreen.destroy();
    gtag('event', 'wizard_start');
  }

  restart() {
    // Restart the complete machine. Not technically part of the wizard,
    // but I keep changing the position of this button and for our purposes 
    // the wizard has become more of a generic controller anyway :D
    window.location.reload();
  }

  checkAutoRestart() {
    var inactiveTime = (Date.now() - this.lastActivityTime) / 1000; 
    if (inactiveTime > 30) // in seconds
      this.restart();
    else 
      setTimeout(this.checkAutoRestart.bind(this), 1000);
  }

  next() {
    if (!this.wizardRunning)
      return;

    var section = this.sections[this.sectionIndex];
    this.stepIndex++;

    if (this.stepIndex >= section.steps.length) {
      this.stepIndex = 0;
      this.sectionIndex++;

      if (this.sectionIndex >= this.sections.length) {
        section = null;
        this.finish();
        return;
      }
    }

    // Clear any previously running groups
    var step = section.steps[this.stepIndex];
    if (!step.groupWithNext) {
      this.groupStartTime = null;
      this.groupDuration = null;
    }

    this.play();
  }

  startCamera() {
    GLOBALS.camInput.start();
  }

  finish(event) {
    if (event) {
      event.preventDefault();
    }

    if (this.wizardRunning) {

      TweenLite.to(this.wizardWrapper, 0.3, {
        height: 0,
        onComplete: () => {
          this.wizardWrapper.style.display = 'none';
        }
      });
      TweenLite.to(this.machine, 0.3, {
        height: "100vh",
        onComplete: () => {
          this.wizardWrapper.style.display = 'none';
        }
      });
    } else {
      this.wizardWrapper.style.display = 'none';
    }

    this.stopAudioTimer();
    this.audio.pause();
    this.clear();
    this.soundButton.style.display = 'none';
    window.removeEventListener('class-trained', this.classTrainedEvent);
    setTimeout(() => {
      GLOBALS.camInput.start();
    }, 500);
    GLOBALS.inputSection.enable();
    GLOBALS.inputSection.hideGif(0);
    GLOBALS.inputSection.hideGif(1);
    GLOBALS.inputSection.hideGif(2);
    GLOBALS.inputSection.hideGif(3);
    GLOBALS.inputSection.undim();
    GLOBALS.learningSection.dehighlight();
    GLOBALS.learningSection.dehighlightClass(0);
    GLOBALS.learningSection.dehighlightClass(1);
    GLOBALS.learningSection.dehighlightClass(2);
    GLOBALS.learningSection.enable();
    GLOBALS.learningSection.enableClass(0);
    GLOBALS.learningSection.enableClass(1);
    GLOBALS.learningSection.enableClass(2);
    GLOBALS.learningSection.undim();
    GLOBALS.outputSection.dehighlight();
    GLOBALS.outputSection.enable();
    GLOBALS.outputSection.undim();

    window.removeEventListener('resize', this.resizeEvent);
    window.removeEventListener('scroll', this.scrollEvent);

    this.restartButton.style.display = 'inline-block';

    setTimeout(this.checkAutoRestart.bind(this), 1000);
  }

}

export default Wizard;
/* eslint-enable consistent-return, callback-return, no-case-declarations */