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
import GLOBALS from '../../config.js';
import DummyAudio from '../components/DummyAudio.js';
import TweenLite from 'gsap';


class MainController {
  constructor() {

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

    this.currentObjectIndex = 1;

    this.wizardWrapper = document.querySelector('.wizard__wrapper');
    this.bar = document.querySelector('#wizard');
    this.machine = document.querySelector('.machine');
    this.machineSections = document.querySelector('.machine__sections');
    this.intro = document.querySelector('.intro');
    this.introStartButtons = this.intro.querySelectorAll('.intro-start-button');
    this.main = document.querySelector('.main');
    this.mainScanButton = this.main.querySelector('.main-scan-button');
    this.mainSmallResetButton = this.main.querySelector('.main-small-reset-button');
    this.mainSmallScanButton = this.main.querySelector('.main-small-scan-button');

    this.textContainer = this.main.querySelector('.main-text');
    this.progressContainer = this.main.querySelector('.main-progress-container');
    this.progressBar = this.progressContainer.querySelector('.main-progress-bar');
    this.progressLabel = this.progressContainer.querySelector('.main-progress-label');

    this.titleContainer = this.bar.querySelector('.wizard__text-title');
    this.soundButton = this.bar.querySelector('.wizard__sound-button');
    this.soundIcon = this.soundButton.querySelector('.wizard__sound-icon');

    this.soundButton.addEventListener('click', this.toggleSound.bind(this));

    this.nextButton = this.bar.querySelector('.wizard__next-button');

    this.sections = this.initializeSections();

    this.numTriggered = 0;
    this.lastClassTriggered = null;

    this.lastActivityTime = Date.now();

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

    this.initializeStartButtons(this.introStartButtons);
    this.mainScanButton.addEventListener("click", this.next.bind(this));
    this.mainSmallScanButton.addEventListener("click", this.scanNext.bind(this));
    this.mainSmallResetButton.addEventListener("click", this.restart.bind(this));

    window.addEventListener('class-triggered', this.classTriggered.bind(this));

    this.resizeEvent();
    this.scrollEvent();
  }

  // Specify the interaction steps of the app in a wizard-like action
  initializeSections() {
    const sections = [];

    // Section 1 - Initialization (for legacy reason part of the workflow definition)
    sections.push({
      steps: [
        {
          waitForEvent: true,
          execute: () => {
            this.showIntro();
            this.hideMain();
            this.hideSmallNavigationButtons();
            this.hideWizard();
            this.hideMachineSections();
          }
        },
        {
          name: "startWizard",
          text: {
            nl: "Plaats een object op het platform en druk op de knop.<br/>De objecten op dit scherm zijn al gescand.",
            en:
              "Place on object on the platform and press the button.<br/>The objects on this screen have already been scanned.",
            de:
              "Platzieren Sie ein Objekt auf der Plattform und drücken Sie den Knopf. Die Objekte auf diesem Bildschirm wurden bereits gescannt."
          },
          execute: () => {
            this.hideIntro();
            this.showMain();
            this.showScanButton();
            if (localStorage.getItem('webcam_status') === null) {
              this.play("cameraInit");
              this.webcamEvent = this.webcamStatus.bind(this);
              window.addEventListener('webcam-status', this.webcamEvent);
            } else if (localStorage.getItem('webcam_status') === 'granted') {
              GLOBALS.camInput.start();
              this.play("cameraStart");
            } else if (localStorage.getItem('webcam_status') === 'denied') {
              const text = {
                en: 'Seems like the camera isn’t working. It might be your browser or camera settings.',
                de:
                  "Scheint, als ob die Kamera nicht funktioniert. Dies können Ihre Browser- oder Kameraeinstellungen sein."
              };
              this.setText(text);
            }
          }
        },
        {
          name: 'cameraInit',
          execute: () => {
            if (!GLOBALS.browserUtils.isMobile && !GLOBALS.isCamGranted) {
              const text = {
                en: 'First, click allow to turn on your camera.',
                de: "Klicken Sie zuerst auf Zulassen, um Ihre Kamera einzuschalten."
              };
              this.setText(text);
            } else
              this.play('cameraStart');
          }
        },
        {
          name: 'cameraStart',
          execute: () => {
            GLOBALS.camInput.start();
          }
        },
        {
          name: "startTraining",
          waitForEvent: true,
          execute: () => {
            this.hideScanButton();
            this.hideSmallNavigationButtons();
            GLOBALS.learningSection.stopRecognition();

            this.startCountdown(3,
              (value) => {
                this.showCountDown(value, 3);
              },
              () => {
                this.next();
              });
          }
        },
        {
          waitForEvent: true,
          execute: () => {
            const text = {
              en: "Scanning...",
              de: "Scannen...",
              nl: "Scannen..."
            };

            this.startRecording();
            this.startCountdown(5,
              (value) => {
                this.showCountDown(value, 5, text[GLOBALS.language]);
              },
              () => {
                this.stopRecording();
                this.next();
              });
          }
        },
        {
          duration: 2,
          execute: () => {
            this.getCurrentPreviewContainer().classList.add("scanned");
            const text = {
              en: "Object scanned...",
              de: "Objekt gescannt...",
              nl: "Object gescanned..."
            };
            this.showCountDown(0, 1, text[GLOBALS.language]);
          }
        },
        {
          waitForEvent: true,
          text: {
            en: "The robot is now telling you what it sees. If you change the object, it will also mention this. Scan another object by pressing the button, or reset all scans and start again.",
            de: "Der Roboter sagt dir jetzt, was er sieht. Wenn du das Objekt wechselst, wird er das ebenfalls mitteilen. Scanne ein weiteres Objekt, indem du die Taste drückst, oder setze alle Scans zurück und beginne von vorne.",
            nl: "De robot vertelt je nu wat hij ziet. Als je het object wisselt zal hij dit ook vertellen. Scan nog een object door op de knop te drukken. Of reset alle scans en begin opnieuw."
          },
          execute: () => {
            GLOBALS.learningSection.startRecognition();
            this.showSmallNavigationButtons();
            this.hideCountDown();
          }
        }
      ]
    });

    return sections;
  }

  initializeStartButtons(buttons) {
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        GLOBALS.language = button.dataset.language;
        localStorage.setItem("language", GLOBALS.language);

        GLOBALS.mainController.updateLanguage();
        GLOBALS.inputSection.updateLanguage();
        GLOBALS.learningSection.updateLanguage();
        this.next();
      });
    });
  }

  showIntro() {
    this.intro.classList.remove("hidden");
  }

  hideIntro() {
    this.intro.classList.add("hidden");
  }

  showMain() {
    this.main.classList.remove("hidden");
  }

  hideMain() {
    this.hideSmallNavigationButtons();
  }

  showScanButton() {
    this.mainScanButton.classList.remove("hidden");
  }

  hideScanButton() {
    this.mainScanButton.classList.add("hidden");
  }

  showSmallNavigationButtons() {
    this.mainSmallResetButton.classList.remove("hidden");
    this.mainSmallScanButton.classList.remove("hidden");
  }

  hideSmallNavigationButtons() {
    this.mainSmallResetButton.classList.add("hidden");
    this.mainSmallScanButton.classList.add("hidden");
  }


  startCountdown(seconds, onUpdate, onFinished) {

    const startTime = new Date();
    const countdownInterval = setInterval(() => {
      const time = new Date();
      const elapsedSeconds = Math.max(seconds - (time - startTime) / 1000, 0);
      onUpdate(elapsedSeconds);
      if (elapsedSeconds === 0) {
        clearInterval(countdownInterval);
        this.hideCountDown();
        onFinished();
      }
    },
      16);
  }

  showCountDown(currentValue, maxValue, text) {
    this.setText("");
    this.progressContainer.classList.remove("hidden");
    const percentage = 100 * (maxValue - currentValue) / maxValue;
    this.progressBar.style.width = percentage + '%';

    const counter = Math.ceil(currentValue);
    const counterText = counter > 0 ? `${counter}...` : "";
    this.progressLabel.innerHTML = text || counterText;
  }

  startRecording() {
    GLOBALS.recording = true;
    GLOBALS.classId = this.id;

    const previewContainer = this.getCurrentPreviewContainer();
    GLOBALS.webcamClassifier.startRecording(this.getCurrentObjectName(), previewContainer);
  }

  stopRecording() {
    GLOBALS.recording = false;
    GLOBALS.webcamClassifier.stopRecording(this.getCurrentObjectName());
  }

  getCurrentObjectName() {
    return `object${this.currentObjectIndex}`;
  }

  getCurrentPreviewContainer() {
    const currentObjectName = this.getCurrentObjectName();
    return document.querySelector(`.main-object.${currentObjectName}`);
  }

  hideCountDown() {
    this.progressContainer.classList.add("hidden");
  }

  showWizard() {
    this.wizardWrapper.classList.remove("hidden");
  }

  hideWizard() {
    this.wizardWrapper.classList.add("hidden");
  }

  showMachineSections() {
    this.machineSections.classList.remove("hidden");
  }

  hideMachineSections() {
    this.machineSections.classList.add("hidden");
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

  highlightTriggeredClass(id) {
    const elements = document.querySelectorAll('.main-object');
    elements.forEach(element => {
      element.classList.remove('triggered');
    });
    if (id) {
      const triggeredElement = document.querySelector(`.main-object.${id}`);
      triggeredElement.classList.add("triggered");
    }
  }

  classTriggered(event) {
    const id = event.detail.id;
    console.log(`Class ${id} was triggered`);

    this.highlightTriggeredClass(id);

    /*
    if (id !== this.lastClassTriggered) {
      this.lastClassTriggered = id;
      this.numTriggered += 1;
    }

    if (this.numTriggered > 4 && !this.triggerTimer) {
      this.triggerTimer = setTimeout(() => {
        this.play("classTriggered");
      }, 1500);
    }
    */
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
      this.setText(step.text || "", step.title || section.title, { textContainer: step.textContainer, titleContainer: step.titleContainer });
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
      groupWithNext = step.groupWithNext;
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
            stepIndex: stepIndex
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

  setText(message, title, elements) {
    this.message = message;
    this.title = title;
    this.textElements = elements;

    var messageText = message ? message[GLOBALS.language] || "" : "";

    var textElement = (elements && elements.textContainer) || this.textContainer;
    textElement.innerHTML = messageText;

    if (title) {
      var titleElement = (elements && elements.titleContainer) || this.titleContainer;
      titleElement.textContent = title[GLOBALS.language];
    }

    if (messageText.length > 0) {
      this.timerFill.style.width = 0 + 'px';
    }
  }

  updateLanguage() {
    this.setText(this.message, this.title, this.textElements);

    const nextButtonCaption = {
      en: "Click to continue",
      de: "Klicken Sie um Fortzufahren"
    };
    this.nextButton.textContent = nextButtonCaption[GLOBALS.language];
  }


  clear() {
    this.textContainer.textContent = '';
  }

  webcamStatus(event) {
    if (event.detail.granted === true) {
      localStorage.setItem('webcam_status', 'granted');
      this.play("cameraStart");
      window.removeEventListener('webcam-status', this.webcamEvent);
    } else {
      localStorage.setItem('webcam_status', 'denied');
      this.play("cameraDenied");
    }
  }

  start() {
    this.wizardRunning = true;
    this.soundButton.style.display = 'block';
    this.play();  
    this.startAudioTimer();
    this.updateLanguage();

    // Restart the wizard whenever there is 2 minutes of inactivity 
    setTimeout(this.checkAutoRestart.bind(this), 1000);
  }

  scanNext() {
    this.currentObjectIndex++;
    if (this.currentObjectIndex > 6)
      this.currentObjectIndex = 1;
    this.play("startTraining");
  }

  restart() {
    // Restart the complete machine. 
    window.location.reload();
  }

  checkAutoRestart() {
    const inactiveTime = (Date.now() - this.lastActivityTime) / 1000; 
    if (inactiveTime > 2 * 60) // 2 minutes in seconds
      this.restart();
    else 
      setTimeout(this.checkAutoRestart.bind(this), 1000);
  }

  next() {
    if (!this.wizardRunning)
      return;

    this.lastActivityTime = Date.now();

    var section = this.sections[this.sectionIndex];
    if (!section)
      return;
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

    this.wizardRunning = false;

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

    window.removeEventListener('resize', this.resizeEvent);
    window.removeEventListener('scroll', this.scrollEvent);

    this.restartButton.style.display = 'inline-block';
  }

}

export default MainController;
/* eslint-enable consistent-return, callback-return, no-case-declarations */