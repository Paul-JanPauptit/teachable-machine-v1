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

import TweenMax from 'gsap';

import GLOBALS from './config.js';
import InputSection from './ui/modules/InputSection.js';
import LearningSection from './ui/modules/LearningSection.js';
import OutputSection from './ui/modules/OutputSection.js';
import MainController from './ui/modules/MainController.js';
import Recording from './ui/modules/Recording';
import BrowserUtils from './ui/components/BrowserUtils';

function init() {

	// Prevent zooming
  window.addEventListener("wheel", function (e) {
    if (e.ctrlKey)
      e.preventDefault();
  }, { passive: false });

	// Shim for forEach for IE/Edge
  if (typeof NodeList.prototype.forEach !== 'function') {
    NodeList.prototype.forEach = Array.prototype.forEach;
	}

	GLOBALS.browserUtils = new BrowserUtils();
  GLOBALS.language = localStorage.getItem("language") || "nl";
  
  GLOBALS.learningSection = new LearningSection(document.querySelector('#learning-section'));
	GLOBALS.inputSection = new InputSection(document.querySelector('.main'));
	GLOBALS.outputSection = new OutputSection(document.querySelector('#output-section'));
  
	GLOBALS.inputSection.ready();
	GLOBALS.learningSection.ready();
	GLOBALS.mainController = new MainController();
	GLOBALS.recordSection = new Recording(document.querySelector('#recording'));
	if (localStorage.getItem('isBackFacingCam') && localStorage.getItem('isBackFacingCam') === 'true') {
		GLOBALS.isBackFacingCam = true;
	}

	// Camera status messages per browser
	if (GLOBALS.browserUtils.isChrome && !GLOBALS.browserUtils.isEdge) {
		document.querySelector('.input__media__activate').innerHTML = 'To teach your machine, <span class="input__media__activate--desktop"> you need to click up here to turn on your camera and then <a href="#">refresh the page</a>.</span><span class="input__media__activate--mobile"> you need to <a href="#">refresh the page</a> and allow camera access.</span></p>';

	}else if (GLOBALS.browserUtils.isSafari) {
		document.querySelector('.input__media__activate').innerHTML = 'To teach your machine, you need to turn on your camera. To do this click "Safari" in the menu bar, navigate to "Settings for This Website", in the "Camera" drop down menu choose "Allow" and then <a href="#">refresh the page</a>.';
	}else if (GLOBALS.browserUtils.isFirefox) {
		document.querySelector('.input__media__activate').innerHTML = 'To teach your machine, you need to turn on your camera. To do this you need to click this icon <img class="camera-icon" src="assets/ff-camera-icon.png"> to grant access and <a href="#">refresh the page</a>.';
	}

  GLOBALS.mainController.start();
}


window.addEventListener('load', init);

export default GLOBALS;