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

class LaunchScreen {
  constructor() {
    this.element = document.querySelector('.intro');

    this.startButton = document.querySelector('#start-tutorial-button');

    this.startButton.addEventListener('click', this.startClick.bind(this));
    this.startButton.addEventListener('touchend', this.startClick.bind(this));

    this.updateLanguage();
  }

  skipClick(event) {
    event.preventDefault();
    let intro = document.querySelector('.intro');
    let offset = intro.offsetHeight;
    GLOBALS.wizard.skip();
    gtag('event', 'wizard_skip');

    if (GLOBALS.browserUtils.isMobile) {
      let msg = new SpeechSynthesisUtterance();
      msg.text = ' ';
      window.speechSynthesis.speak(msg);

      GLOBALS.inputSection.createCamInput();
      GLOBALS.camInput.start();
      let event = new CustomEvent('mobileLaunch');
      window.dispatchEvent(event);
    }
    TweenMax.to(intro, 0.5, {
      y: -offset,
      onComplete: () => {
        this.destroy();
        if (!GLOBALS.browserUtils.isMobile) {
          GLOBALS.wizard.startCamera();
        }
      }
    });
  }

  destroy() {
    document.body.classList.remove('no-scroll');
    this.element.style.display = 'none';

  }

  startClick() {
    let intro = document.querySelector('.intro');
    let offset = intro.offsetHeight;
    if (GLOBALS.browserUtils.isMobile || GLOBALS.browserUtils.isSafari) {
      GLOBALS.inputSection.createCamInput();
      GLOBALS.camInput.start();
      GLOBALS.wizard.touchPlay();
      let event = new CustomEvent('mobileLaunch');
      window.dispatchEvent(event);
    }

    TweenMax.to(intro, 0.5, {
      y: -offset,
      onComplete: () => {
        this.destroy();
        GLOBALS.wizard.start();
      }
    });
  }

  updateLanguage() {
    const titleText = {
      en: "Click start to begin training a program.",
      de: "Klicken Sie auf Start, um mit dem Training eines Programms zu beginnen."
    };
    const titleElement = this.element.querySelector('.intro__text');
    titleElement.textContent = titleText[GLOBALS.language];
  }
}

import TweenMax from 'gsap';
import ScrollToPlugin from 'gsap/ScrollToPlugin';
import GLOBALS from './../../../config.js';
import Button from './../../components/Button.js';

export default LaunchScreen;