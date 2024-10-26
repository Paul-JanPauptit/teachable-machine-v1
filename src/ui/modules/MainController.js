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

    this.wizardWrapper = document.querySelector('.wizard__wrapper');
    this.bar = document.querySelector('#wizard');
    this.machine = document.querySelector('.machine');
    this.machineSections = document.querySelector('.machine__sections');
    this.intro = document.querySelector('.intro');
    this.introStartButtons = this.intro.querySelectorAll('.intro-start-button');
    this.main = document.querySelector('.main');
    this.mainScanButton = this.main.querySelector('.main-scan-button');
    this.textContainer = this.main.querySelector('.main-text');
    this.progressContainer = this.main.querySelector('.main-progress-container');
    this.progressBar = this.progressContainer.querySelector('.main-progress-bar');
    this.progressLabel = this.progressContainer.querySelector('.main-progress-label');

    this.titleContainer = this.bar.querySelector('.wizard__text-title');
    this.soundButton = this.bar.querySelector('.wizard__sound-button');
    this.soundIcon = this.soundButton.querySelector('.wizard__sound-icon');

    this.soundButton.addEventListener('click', this.toggleSound.bind(this));

    this.nextButton = this.bar.querySelector('.wizard__next-button');

    // this.restartButton = document.querySelector('#restart-machine-button');
    // this.restartButton.addEventListener('click', () => { this.restart(); });
    // this.restartButtonSmall = document.querySelector('#restart-machine-button-small');
    // this.restartButtonSmall.addEventListener('click', () => { this.restart(); });

    this.sections = this.initializeSections();


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

    this.initializeStartButtons(this.introStartButtons);
    this.mainScanButton.addEventListener("click", this.next.bind(this));

    this.documentClickEvent = this.documentClick.bind(this);
    document.body.addEventListener('mouseup', this.documentClickEvent, true);

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
          // Support for language switching in the title screen is turned off for now, fixed language  
          // title: {
          //   nl: "Teachable Machine NL",
          //   en: "Teachable Machine EN",
          //   de: "Teachable Machine DE",
          // },
          // text: {
          //   nl: "Nederlands Morbi interdum mollis sapien. Sed ac risus. Phasellus lacinia, magna a ullamcorper laoreet, lectus arcu pulvinar risus, vitae facilisis libero dolor a purus. Sed vel lacus. Mauris nibh felis, adipiscing varius, adipiscing in, lacinia vel, tellus. Suspendisse ac urna. Etiam pellentesque mauris ut lectus. Nunc tellus ante, mattis eget, gravida vitae, ultricies ac, leo. Integer leo pede, ornare a, lacinia eu, vulputate vel, nisl.<br/><br/>Suspendisse mauris. Fusce accumsan mollis eros. Pellentesque a diam sit amet mi ullamcorper vehicula. Integer adipiscing risus a sem. Nullam quis massa sit amet nibh viverra malesuada. Nunc sem lacus, accumsan quis, faucibus non, congue vel, arcu. Ut scelerisque hendrerit tellus. Integer sagittis. Vivamus a mauris eget arcu gravida tristique. Nunc iaculis mi in ante. Vivamus imperdiet nibh feugiat est.",
          //   en: "English Morbi interdum mollis sapien. Sed ac risus. Phasellus lacinia, magna a ullamcorper laoreet, lectus arcu pulvinar risus, vitae facilisis libero dolor a purus. Sed vel lacus. Mauris nibh felis, adipiscing varius, adipiscing in, lacinia vel, tellus. Suspendisse ac urna. Etiam pellentesque mauris ut lectus. Nunc tellus ante, mattis eget, gravida vitae, ultricies ac, leo. Integer leo pede, ornare a, lacinia eu, vulputate vel, nisl.<br/><br/>Suspendisse mauris. Fusce accumsan mollis eros. Pellentesque a diam sit amet mi ullamcorper vehicula. Integer adipiscing risus a sem. Nullam quis massa sit amet nibh viverra malesuada. Nunc sem lacus, accumsan quis, faucibus non, congue vel, arcu. Ut scelerisque hendrerit tellus. Integer sagittis. Vivamus a mauris eget arcu gravida tristique. Nunc iaculis mi in ante. Vivamus imperdiet nibh feugiat est.",
          //   de: "Deutsch Morbi interdum mollis sapien. Sed ac risus. Phasellus lacinia, magna a ullamcorper laoreet, lectus arcu pulvinar risus, vitae facilisis libero dolor a purus. Sed vel lacus. Mauris nibh felis, adipiscing varius, adipiscing in, lacinia vel, tellus. Suspendisse ac urna. Etiam pellentesque mauris ut lectus. Nunc tellus ante, mattis eget, gravida vitae, ultricies ac, leo. Integer leo pede, ornare a, lacinia eu, vulputate vel, nisl.<br/><br/>Suspendisse mauris. Fusce accumsan mollis eros. Pellentesque a diam sit amet mi ullamcorper vehicula. Integer adipiscing risus a sem. Nullam quis massa sit amet nibh viverra malesuada. Nunc sem lacus, accumsan quis, faucibus non, congue vel, arcu. Ut scelerisque hendrerit tellus. Integer sagittis. Vivamus a mauris eget arcu gravida tristique. Nunc iaculis mi in ante. Vivamus imperdiet nibh feugiat est."
          // },
          // textContainer: this.introTextContainer,
          // titleContainer: this.introTitleContainer,
          waitForEvent: true,
          execute: () => {
            this.showIntro();
            this.hideMain();
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

            //// HACK, PJ: For UX testing
            //this.next();
            //return;

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
          duration: 3,
          execute: () => {
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
            this.hideCountDown();
          }
        },
        {
          text: {
            en: "Stand in front of the camera and hold this green button for a couple of seconds.",
            de: "Stellen Sie sich vor die Kamera und halten Sie diesen grünen Knopf einige Sekunden lang gedrückt. "
          },
          name: "startTraining",
          waitForEvent: true,
          execute: () => {
            window.addEventListener('class-trained', this.classTrainedEvent);
            GLOBALS.learningSection.enableClass(0);
            GLOBALS.learningSection.highlightClass(0);
          }
        },
        {
          name: "greenTrained",
          // text: {
          //   en: 'You should now see the green bar and the robot GIF.',
          //   de: "Sie sollten jetzt die grüne Leiste und das Roboter-Bild sehen."
          // },
          execute: () => {
            GLOBALS.learningSection.dehighlightClass(0);
          }
        },
        {
          // text: {
          //   en: "Now pick up the stick figure with the cat image and hold it in front of the camera. While doing so, press this purple button for a couple of seconds.",
          //   de: "Nehmen Sie nun das Schildchen mit dem Katzenbild und halten Sie es vor die Kamera. Drücken Sie dabei einige Sekunden lang auf das violette Feld."
          // },
          waitForEvent: true,
          execute: () => {
            window.addEventListener('class-trained', this.classTrainedEvent);
            GLOBALS.learningSection.enableClass(1);
            GLOBALS.learningSection.highlightClass(1);
          }
        },
        {
          name: "purpleTrained",
          // text: {
          //   en: 'You should see the cat GIF when you hold up the cat figure, and the robot GIF when you don´t show it. Try it.',
          //   de: "Sie sollten das Katzen-Bild sehen, wenn Sie die Katzenfigur hochhalten, und das Roboter-Bild, wenn Sie es nicht tun. Versuchen Sie es."
          // },
          execute: () => {
            GLOBALS.learningSection.dehighlightClass(1);
          }
        },
        {
          // text: {
          //   en: "Now pick up the stick figure with the dog image and hold it in front of the camera. While doing so, press the orange button for a couple of seconds.",
          //   de: "Nehmen Sie nun das Schildchen mit dem Hundebild und halten Sie es vor die Kamera. Drücken Sie dabei einige Sekunden lang das orangene Feld."
          // },
          waitForEvent: true,
          execute: () => {
            window.addEventListener('class-trained', this.classTrainedEvent);
            GLOBALS.learningSection.enableClass(2);
            GLOBALS.learningSection.highlightClass(2);
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
        GLOBALS.outputSection.updateLanguage();

        GLOBALS.preventDocumentClick = true;
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
    this.main.classList.add("hidden");
  }

  showScanButton() {
    this.mainScanButton.classList.remove("hidden");
  }

  hideScanButton() {
    this.mainScanButton.classList.add("hidden");
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

    // TODO, PJ: Probably should have a wrapper object
    // TODO, PJ: dynamically select based on current index
    const previewContainer = document.querySelector(".main-object.object_1");

    GLOBALS.webcamClassifier.startRecording("object1", previewContainer);
  }

  stopRecording() {
    GLOBALS.recording = false;
    GLOBALS.webcamClassifier.stopRecording("object1");
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

  documentClick(event) {
    const isPrevented = (GLOBALS.preventDocumentClick === true);
    GLOBALS.preventDocumentClick = false;
    if (isPrevented)
      return;

    this.lastActivityTime = Date.now();
    // Allow the user to click anywhere on the screen, if we are waiting for the next step. 
    if (this.waitingForNextClick) {
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
      var text = {
        en: "Your machine will work best with at least 30 examples per class. Try recording some more.",
        de: "Ihre Maschine funktioniert am besten mit mindestens 30 Beispielen pro Klasse. Versuchen Sie, noch einige mehr aufzunehmen."
      };
      this.setText(text);
      return;
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
      this.play("startTraining");
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
    this.play();   // HACK, PJ: For testing purposes
    this.startAudioTimer();
    this.updateLanguage();

    // Restart the wizard whenever there is 2 minutes of inactivity 
    setTimeout(this.checkAutoRestart.bind(this), 1000);
  }

  restart() {
    // Restart the complete machine. 
    window.location.reload();
  }

  checkAutoRestart() {
    // Automatic restart is disabled in this version of the teachable machine
    return false;
    // var inactiveTime = (Date.now() - this.lastActivityTime) / 1000; 
    // if (inactiveTime > 2 * 60) // 2 minutes in seconds
    //   this.restart();
    // else 
    //   setTimeout(this.checkAutoRestart.bind(this), 1000);
  }

  next() {
    if (!this.wizardRunning)
      return;

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
    GLOBALS.outputSection.dehighlight();
    GLOBALS.outputSection.enable();
    GLOBALS.outputSection.undim();

    window.removeEventListener('resize', this.resizeEvent);
    window.removeEventListener('scroll', this.scrollEvent);

    document.body.removeEventListener('mouseup', this.documentClickEvent, true);

    this.restartButton.style.display = 'inline-block';
  }

}

export default MainController;
/* eslint-enable consistent-return, callback-return, no-case-declarations */