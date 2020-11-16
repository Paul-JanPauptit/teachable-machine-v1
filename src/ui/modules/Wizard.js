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
      title: {
        en: "1. Interface introduction",
        de: "1. Einführung"
      },
      steps: [
        {
          text: {
            en: 'This experiment lets you explore how machine learning works.',
            de: "Mit diesem Experiment verstehen Sie, wie maschinelles Lernen funktioniert."
          }
        },
        {
          text: {
            en: 'You can teach the machine using the camera.',
            de: "2. Sie lehren die Maschine über die eingebaute Kamera."
          },
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
              const text = {
                en: 'First, click allow to turn on your camera.',
                de: "Klicken Sie zuerst auf Zulassen, um Ihre Kamera einzuschalten."
              };
              this.setText(text);
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
          text: {
            en: 'Here is your input. You should see yourself.',
            de: "Hier ist Ihre Eingabe. Sie sollten sich selbst sehen."
          },
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
          text: {
            en: 'Here are three classes: green, purple, orange.',
            de: "Es gibt drei Klassen: grün, violett, orange. "
          },
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
          text: {
            en: "Here is the output, where the machine responds.",
            de: "Das ist die Ausgabe, mit der die Maschine antwortet."
          },
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
          text: {
            en: "It’s set to respond with one of these GIFs.",
            de: "Sie ist so eingestellt, dass sie mit einem dieser GIFs antwortet."
          },
          execute: () => {
            GLOBALS.outputSection.dehighlight();
          }
        },
        {
          text: {
            en: "First, we’re going to teach it to respond with the robot GIF.",
            de: "Zuerst werden wir dem Programm beibringen, mit dem Roboter-GIF zu antworten."
          },
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
      title: {
        en: "2. Teaching first dataset",
        de: "2. Ersten Datensatz lehren"
      },
      steps: [
        {
          text: {
            en: "Stand in front of the camera and hold this green button for a couple of seconds.",
            de: "Stellen Sie sich vor die Kamera und halten Sie diesen grünen Knopf einige Sekunden lang gedrückt. "
          },
          waitForEvent: true,
          execute: () => {
            window.addEventListener('class-trained', this.classTrainedEvent);
            GLOBALS.learningSection.enableClass(0);
            GLOBALS.learningSection.highlightClass(0);
          }
        },
        {
          name: "greenTrained",
          text: {
            en: 'You should now see the green bar and the robot GIF.',
            de: "Sie sollten jetzt die grüne Leiste und das Roboter-GIF sehen."
          },
          execute: () => {
            GLOBALS.learningSection.dehighlightClass(0);
          }
        },
        { text: {
          en: 'No matter what you do, you will always see the robot GIF.',
          de: "Egal, was Sie tun, es wird immer das Roboter-GIF angezeigt werden."
        } },
        {
          text: {
            en: "That’s because the machine processes your input and picks which class was trained on similar images to the current one.",
            de: "Das liegt daran, dass die Maschine Ihre Eingabe verarbeitet und auswählt, welche Klasse mit Bildern trainiert wurde, die dem aktuellen am ähnlichsten sehen."
          }
        },
        {
          text: {
            en: 'But since you’ve only trained the green class, it always picks that one. That’s why you need to teach it a second class.',
            de: "Aber da Sie nur die grüne Klasse trainiert haben, wählt die Maschine immer diese aus. Deshalb müssen Sie ihr eine zweite Klasse beibringen."
          }
        }
      ]
    });

    // Section 3 - Teaching to distinguish cats and dogs
    this.sections.push({
      title: {
        en: "3. Teaching to distinguish cats and dogs",
        de: "3. Katzen und Hunde unterscheiden lernen"
      },
      steps: [
        {
          text: {
            en: "Now pick up the stick figure with the cat image and hold it in front of the camera. While doing so, press this purple button for a couple of seconds.",
            de: "Nehmen Sie nun das Schildchen mit dem Katzenbild und halten Sie es vor die Kamera. Drücken Sie dabei einige Sekunden lang auf das violette Feld."
          },
          waitForEvent: true,
          execute: () => {
            window.addEventListener('class-trained', this.classTrainedEvent);
            GLOBALS.learningSection.enableClass(1);
            GLOBALS.learningSection.highlightClass(1);
          }
        },
        {
          name: "purpleTrained",
          text: {
            en: 'You should see the cat GIF when you hold up the cat figure, and the robot GIF when you don´t show it. Try it.',
            de: "Sie sollten das Katzen-GIF sehen, wenn Sie die Katzenfigur hochhalten, und das Roboter-GIF, wenn Sie es nicht tun. Versuchen Sie es."
          },
          execute: () => {
            GLOBALS.learningSection.dehighlightClass(1);
          }
        },
        {
          text: {
            en: 'Great! Looks like it’s working.',
            de: "Großartig! Sieht aus, als würde es funktionieren."
          }
        },
        {
          text: {
            en: "Now pick up the stick figure with the dog image and hold it in front of the camera. While doing so, press the orange button for a couple of seconds.",
            de: "Nehmen Sie nun das Schildchen mit dem Hundebild und halten Sie es vor die Kamera. Drücken Sie dabei einige Sekunden lang das orangene Feld."
          },
          waitForEvent: true,
          execute: () => {
            window.addEventListener('class-trained', this.classTrainedEvent);
            GLOBALS.learningSection.enableClass(2);
            GLOBALS.learningSection.highlightClass(2);
          }
        },
        {
          name: "orangeTrained",
          text: {
            en: 'You should now see the cat GIF when you hold the cat image and the dog GIF when you hold the dog image. When they’re down you should see the robot GIF.',
            de: "Sie sollten jetzt das Katzen-GIF sehen, wenn Sie das Katzenbild hochhalten, und das Hunde-GIF, wenn Sie das Hundebild hochhalten. Wenn Sie keines zeigen, sollten Sie das Roboter-GIF sehen."
          }
        },
        {
          text: {
            en: 'You’ve now fully trained the artificial intelligence!',
            de: "Sie haben die künstliche Intelligenz jetzt vollständig trainiert!"
          }
        }
      ]
    });

    // Section 4 - Testing the AI model
    this.sections.push({
      title: {
        en: "4. Testing the AI model",
        de: "4. Das KI-Modell testen"
      },
      steps: [
        {
          text: {
            en:
              'See if the machine will now recognize similar images. Hold the image of the dog in the snow and the image of the mountain lion in front of the camera.',
            de:
              "Überprüfen Sie, wie das Gerät ähnliche Bilder einordnet. Halten Sie das Bild des Hundes im Schnee und das Bild des Berglöwen in die Kamera."
          }
        },
        {
          text: {
            en: 'Great! Looks like it’s working.',
            de: "Großartig! Sieht aus, als ob es funktioniert."
          }
        },
        {
          text: {
            en: 'Is the machine foolproof? Try to hold the image of the wolf in front of the camera.',
            de: "Aber ist die Maschine unfehlbar? Halten Sie das Bild des Wolfes in die Kamera."
          }
        },
        {
          text: {
            en: 'You will see either the cat GIF or the dog GIF.',
            de: "Sie werden entweder das Katzen-GIF oder das Hunde-GIF sehen."
          }
        },
        {
          text: {
            en: 'The machine cannot decide between cat and dog, because it has no understanding of "wolf". It only knows the colors and patterns that you have taught it before.',
            de: 'Die Maschine kann sich nicht zwischen Katze und Hund entscheiden, da sie kein Verständnis von "Wolf" besitzt. Sie kennt nur die Farben und Muster, die Sie ihr vorher beigebracht haben.'
          }
        },
        {
          text: {
            en: 'Machines need large datasets and more categories to be able to recognize a larger variety of images.',
            de: "Computerprogramme brauchen große Datensätze und mehr Kategorien, um eine größere Vielfalt von Bildern erkennen zu können."
          }
        },
        {
          text: {
            en: 'Thanks for teaching … and learning. You may continue playing with the program and teach it whatever you like: people, body parts, facial expression, ...',
            de: 'Danke für das Lehren ... und Lernen. Sie können nun weiter mit dem Programm spielen und ihm beibringen, was immer Sie wollen: Personen, Körperteile, Gesichtsausdrücke, ...'
          }
        }
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
    this.message = message;
    this.title = title;

    var messageText = message ? message[GLOBALS.language] : "";
    this.textContainer.textContent = messageText;

    if (title)
      this.titleContainer.textContent = title[GLOBALS.language];

    if (messageText.length > 0) {
      this.timerFill.style.width = 0 + 'px';
    }
  }

  updateLanguage() {
    this.setText(this.message, this.title);

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
    this.wizardRunning = true;
    this.soundButton.style.display = 'block';
    this.play();
    this.startAudioTimer();
    this.updateLanguage();
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

    setTimeout(this.checkAutoRestart.bind(this), 1000); 
  }

}

export default Wizard;
/* eslint-enable consistent-return, callback-return, no-case-declarations */