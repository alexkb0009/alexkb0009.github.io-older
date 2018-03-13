var uxFunctions, data, util, UXItems;

/**
 * Requires JS settings object, which is set in index file w/ PHP from settings.inc.
 **/

$(document).ready(function () {

  /** 
   * jqDomElementID        : Element identification as would be given to JQuery to find.
   *                         Should be final - such as ".group.ux-services".
   **/
  var PhaseGroup = function (domElementID) {
    // Wrap in JQuery rather than getElementsByClassName or ID, for easier manipulation.
    this.element    =   document.getElementById(domElementID);
    if (this.element.id.length < 1) {
      util.log("Error: Group ID \"" + domElementID + "\" supplied is not found in DOM.");
      return false;
    }
    this.height     =   null;
    if ($("#" + domElementID + " div.inner").length !== 0) {
      this.inner = {
        element: document.getElementById(domElementID + "-inner"),
        height: null
      }
    }
    this.innerTopMarginIntent = null;
    this.setCurrentHeight = function () {
      this.height = Math.floor($(this.element).outerHeight());
      if (this.inner !== "undefined") {
        this.inner.height = Math.floor($(this.inner.element).height());
      }
      return this;
    }
    this.applyTopMargin = function () {
      if (this.element == null || typeof this.inner == "undefined" || this.inner.element == null) return false;
      this.innerTopMarginIntent = Math.floor((this.height - this.inner.height)/2);
      if (this.innerTopMarginIntent > settings.minimumMargin) {
        $(this.inner.element).css("padding-top", this.innerTopMarginIntent + "px");
        //this.inner.element.style["padding-top"] = this.innerTopMarginIntent + "px";
      } else {
        $(this.inner.element).css("padding-top", settings.minimumMargin + "px");
        //this.inner.element.style["padding-top"] = settings.minimumMargin + "px";
      }
      return this;
    }
    util.log(this); // Log group contents.
  }
  
  /** 
   * Main Data Container.
   * param : Optional array of group/phase class names to bind.
   **/
  var UXDataContainer = function(param){
    this.docHeight = null;
    this.currentPhaseDistanceRatio = 0;
    this.iterator = null;
    this.elements = new Array();
    this.scrollDistanceToSlides = new Array();
    this.foregroundContainer = document.getElementById("foreground-elements");
    this.currentSlideNum = 0;
    this.lastSlideNum = 0;
    this.doOncePerformed = false;
    this.currentPastCombinedHeight = 0;
    this.bg = {
      body: document.getElementById("body-element"),
      style: document.getElementById("body-element").style,
      lastBgColor: null, 
      setStaticColor: function(dataObjBg, colorVal){
        if (colorVal == dataObjBg.lastBgColor) return false;
        dataObjBg.style.backgroundColor = colorVal;
        dataObjBg.lastBgColor = colorVal;
        util.log("Changed BG Color to: " + dataObjBg.style.backgroundColor);
        return true;
      }
    }
    this.preloadOverlay = $("#preload-overlay");
    this.reqAnimFrameCapable = window.requestAnimationFrame ? true : false;
    this.reqAnimFrameID = null;
    util.log("Request Animation Frame Capable: " + this.reqAnimFrameCapable);
    this.lastScrollTop = null;
    this.tabletFrameScale = null;
    this.siteMenu = document.getElementById("ics-site-menu");
    this.scrollOff = false;


    // Supply an array of phase/group class names.
    this.setupGroups = function(groupDOMsArray){
      util.log("Setting up groups...");
      for (this.iterator = 0; this.iterator < groupDOMsArray.length; this.iterator++) {
        this.elements[this.iterator] = new PhaseGroup("group-" + groupDOMsArray[this.iterator]);
      }
      this.iterator = null;
      return this;
    }
    
    
    this.setDistanceToSlides = function(){
      for (this.iterator = 0; this.iterator <= this.elements.length; this.iterator++) {
        this.scrollDistanceToSlides[this.iterator] = util.getHeightsUpTo(this, this.iterator - 1);
      }
      this.iterator = null;
      util.log("Scroll Distance to Slides => [" + this.scrollDistanceToSlides + "]");
      return this;
    }
    
    
    /**
     * Works from phase index 0, which is distance scrolled along slide 2 (second slide).
     * Doesn't take distance across first slide as its 'scroll duration' == 0.
     **/
    this.setPhaseDistanceRatio = function(slideNum){ 
      this.currentPhaseDistanceRatio = 1 + (document.body.scrollTop - this.currentPastCombinedHeight) / (this.elements[slideNum - 1].height);
      return this;
    }
    
    this.updateHeightPast = function(num){
      this.currentSlideNum = num;
      this.currentPastCombinedHeight = this.scrollDistanceToSlides[num];
      this.foregroundContainer.style["top"] = 0 - this.currentPastCombinedHeight + "px";
      util.log("Changed Slide Index To: " + this.currentSlideNum + "; Top: " + this.currentPastCombinedHeight + "px");
      
      if (num > 0) this.setPhaseDistanceRatio(num);
      this.doOncePerformed = false;
      return this;
    }
    
    // Allow init of data in constructor if array of group classes/ids.
    if ($.isArray(param)) this.setupGroups(param);
  }
  
  function preInit(){
    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || false;
    window.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || false;

    document.body.scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
    data = new UXDataContainer([
      "ux-services", 
      "sports-med", 
      "know-the-objective",
      "understand-the-users", 
      "design-concept", 
      "develop-design", 
      "test-validate", 
      "implement-support", 
      "success-story"
    ]);
    
    data.preloadOverlay.children("h3").css("margin-top", window.innerHeight/2 - 30);
    
    uxFunctions.bind();
  }
  
  function init(){
    data.preloadOverlay.css("opacity", "0").css("z-index", "-10");
    $(window).resize(onResizeFunction);
    $(window).scroll(onScrollFunction);
    data.bg.body.onkeydown = upDownKey
    $(window).mousewheel(upDownWheel);
    onResizeFunction(data);
    $('#fixed-nav').css("right", function(){
      var menuItems = $("#fixed-nav div.fixed-menu-item");
      var totalWidth = 0;
      for (data.iterator = 0; data.iterator < menuItems.length; data.iterator++){
        totalWidth += $(menuItems[data.iterator]).outerWidth();
      }
      data.iterator = null;
      return "-" + totalWidth + "px";
    });
    if (data.reqAnimFrameCapable) {
      data.reqAnimFrameID = window.requestAnimationFrame(uxFunctions.transitionDelegate); 
    }

    util.log("Fully Initialized");
  }

  /**
   * Called on scroll function.
   * Sets relevant positioning values in data object, incl current slide number and phase distance ratio.
   **/
  
  function onScrollFunction(uxdata, resize){
    if (data.scrollOff) return;
    resize = (resize == true ? true : false);
    data.lastScrollTop = document.body.scrollTop;
	if (data.lastScrollTop > data.scrollDistanceToSlides[data.currentSlideNum] || data.lastScrollTop <= data.scrollDistanceToSlides[data.currentSlideNum - 1] || resize){ // Set new currentSlideNum, position slide, etc.
	  if (data.lastScrollTop == 0){ // First slide (index 0) / User Experience
        data.updateHeightPast(0);
      } else if (data.lastScrollTop <= data.scrollDistanceToSlides[1]) { // Second Slide  (index 1) / Sports Med Inc
        data.updateHeightPast(1);
      } else if (data.lastScrollTop <= data.scrollDistanceToSlides[2]) { // Third Slide   (index 2) / Know the Objective
        data.updateHeightPast(2);
      } else if (data.lastScrollTop <= data.scrollDistanceToSlides[3]) { // Fourth Slide  (index 3) / Understand the Users
        data.updateHeightPast(3);
      } else if (data.lastScrollTop <= data.scrollDistanceToSlides[4]) { // Fifth Slide   (index 4) / Design a Concept
        data.updateHeightPast(4);
      } else if (data.lastScrollTop <= data.scrollDistanceToSlides[5]) { // Sixth Slide   (index 5) / Develop the Design
        data.updateHeightPast(5);
      } else if (data.lastScrollTop <= data.scrollDistanceToSlides[6]) { // Seventh Slide (index 6) / Test and Validate 
        data.updateHeightPast(6);
      } else if (data.lastScrollTop <= data.scrollDistanceToSlides[7]) { // Eighth Slide  (index 7) / Implementation Support
        data.updateHeightPast(7);
      } else if (data.lastScrollTop <= data.scrollDistanceToSlides[8]) { // Ninth Slide   (index 8) / ...
        data.updateHeightPast(8);
      } else if (data.lastScrollTop <= data.scrollDistanceToSlides[9]) { // Tenth Slide   (index 9) / ...
        data.updateHeightPast(9);
      }
	}
    
	if (data.currentSlideNum > 0) data.setPhaseDistanceRatio(data.currentSlideNum);
    
    if (data.reqAnimFrameCapable) {
      //window.cancelAnimationFrame(data.reqAnimFrameID);
      data.reqAnimFrameID = window.requestAnimationFrame(uxFunctions.transitionDelegate);
    } else {
      uxFunctions.transitionDelegate();  
    }
    return;
  }
  
  function onResizeFunction(uxdata){
    if (data.scrollOff) return;
    if (uxdata.elements == null) uxdata = data; 
    util.adjustDynImgSizes(uxdata);
    util.adjustJSCentering(uxdata);
    util.updateAllSizing(uxdata);
    uxFunctions.adjustCustomSizing(uxFunctions.uxItems, uxdata);
    uxdata.docHeight = util.getHeightsUpTo(uxdata, uxdata.elements.length - 2) + 1; // -2 instead of -1 because last slide has no transition, and can stop w/o further scrolling.
    uxdata.bg.style["height"] = uxdata.docHeight + "px"; // Added 1 or 2 ticks so it crosses into last slide.
    uxdata.setDistanceToSlides();
    
    onScrollFunction(uxdata, true);
    util.log("Resize Function Complete -- New Document Height = " + uxdata.docHeight + "; Window Height = " + window.innerHeight);
  }
  
  function upDownWheel(e){
    util.log(e.deltaY);
    if (e.deltaY < 0){
      if (data.currentSlideNum == 8) return false;
      uxFunctions.topClick(data.currentSlideNum + 1, null, "none");
    } 
    else if (e.deltaY > 0){
      if (data.currentSlideNum == 0) return false;
      uxFunctions.topClick(data.currentSlideNum - 1, null, "none");
    }
    return e.deltaY;
  }
  
  function upDownKey(e, key, currentSlideNum){
    if (currentSlideNum == null) currentSlideNum = data.currentSlideNum;
      if (window.event) {
        if (e.keyCode == 38) key = "up";
        else if (e.keyCode == 40) key = "down";
        else key = null;
      } else if (e.which) {
        if (e.which == 38) key = "up";
        if (e.which == 40) key = "down";
        else key = null;
      } else key = null;
      
      if (key == "up"){
        if (currentSlideNum == 0) return;
        uxFunctions.topClick(currentSlideNum - 1, null, "none");
      } else if (key == "down"){
        if (currentSlideNum == 8) return;
        uxFunctions.topClick(currentSlideNum + 1, null, "none");
      }
      util.log("To slide " + currentSlideNum + " via key press.")
  }
  
  /**
   * In-Slide Animations & Transitions.
   **/
  uxFunctions = {

    transitionDelegate: function(dataObj){
      dataObj = data;
      uxFunctions.animate(uxFunctions.uxItems, dataObj.currentPhaseDistanceRatio, dataObj.currentSlideNum);

      if (dataObj.doOncePerformed == false){
        uxFunctions.doOnce(uxFunctions.uxItems, dataObj.currentSlideNum);
        dataObj.doOncePerformed = true;
      }
      
      //if (dataObj.reqAnimFrameCapable) dataObj.reqAnimFrameID = window.requestAnimationFrame(uxFunctions.transitionDelegate);
      
      return;

    },
    
    animate: function(uxObj, distRatio, currSlideNum){
      switch (currSlideNum) {
        
        case 0: // UX Services (First Slide)
          uxFunctions.preTransition.reset();
	      uxFunctions.postTransition.reset();
          break;
          
        case 1: // Sports Med Inc.
          uxFunctions.preTransition.reset();
	      uxFunctions.postTransition.reset();
          break;
      
        case 2: // Know the Objective
          /** Old Scroll-Position based transition. Now using CSS transitions w/ changes specified in doOnce function.
          if (distRatio <= 0.75){
            distRatio = distRatio + 0.25;
            uxObj.knowObjective.innerElement.opacity = distRatio
            uxObj.understandUsers.mainImg.top = uxObj.understandUsers.mainImgTopMargin * (distRatio / 2 + .45) + "px";
            uxFunctions.postTransition.reset();
          } else {
            uxFunctions.postTransition.exec(uxObj);
          }
          **/
          uxFunctions.postTransition.exec(uxObj);
          uxFunctions.preTransition.reset();
          break;
          
        case 3: // Understand the Users
          /**
          if (distRatio < 0.75) {
            distRatio = distRatio * 1.33;
            uxObj.understandUsers.textElement.opacity = distRatio;
            uxObj.understandUsers.textElement.top = -((uxObj.understandUsers.mainImgHeight) * distRatio) + "px"; 

            uxObj.understandUsers.mainImg.top = (uxObj.understandUsers.textElemHeight * distRatio) + (uxObj.understandUsers.mainImgTopMargin * (1 - distRatio)) + "px";

            uxObj.understandUsers.animItems.wrapper.top = (1 - distRatio) * 200 + "px";
            uxObj.understandUsers.animItems.leftCoach.left = distRatio * 34 - 3 + "%";
            uxObj.understandUsers.animItems.rightCoach.right =  distRatio * 34 - 3 + "%";
            uxObj.understandUsers.animItems.medBag.left = distRatio * 27 + 4 + "%";
            uxObj.understandUsers.animItems.player.bottom =  - ((1 - distRatio) * 160) + 50 + "px";
            uxFunctions.postTransition.reset();
			uxFunctions.preTransition.exec(uxObj);
          } else { 
            uxFunctions.postTransition.exec(uxObj);
			uxFunctions.preTransition.reset();
          }
          **/
          
          uxFunctions.postTransition.exec(uxObj);
		  uxFunctions.preTransition.reset();

          break;
          
        case 4: // Design the Concept
          var scaleVal;
	      if (distRatio <= 0.33){
            scaleVal = distRatio * 1.5;
            uxObj.designConcept.sketchbook.bottom =  - (uxObj.designConcept.sketchbookHeight * (0.33 - distRatio) * 4) + "px";
            uxObj.developDesign.tabletFrame.bottom = distRatio * 500 - 262 + "px";
          
            uxObj.developDesign.tabletFrame.transform = "scale3d(" + (scaleVal * (distRatio + .33)) + "," + scaleVal + ",1) skew(" + (60 * (.33 - distRatio)) + "deg," + (45 * (.67 - distRatio)) + "deg)";
            uxObj.developDesign.tabletFrame.webkitTransform = uxObj.developDesign.tabletFrame.MozTransform = uxObj.developDesign.tabletFrame.msTransform = uxObj.developDesign.tabletFrame.transform;
          
            uxFunctions.preTransition.exec(uxObj);
            uxFunctions.postTransition.reset();
		  } else {
		    if (distRatio < 0.67) {
              scaleVal = distRatio * 1.5;
              uxObj.designConcept.sketchbook.bottom =  - (uxObj.designConcept.sketchbookHeight * (distRatio - 0.3) * 2) + "px";
            
              uxObj.developDesign.tabletFrame.transform = "scale3d(" + (scaleVal * (distRatio + .33)) + "," + scaleVal + ",1) skew(0deg," + (45 * (.67 - distRatio)) + "deg)";
              uxObj.developDesign.tabletFrame.webkitTransform = uxObj.developDesign.tabletFrame.MozTransform = uxObj.developDesign.tabletFrame.msTransform = uxObj.developDesign.tabletFrame.transform;
            
              uxObj.developDesign.tabletFrame.bottom = distRatio * 500 - 262 + "px";
              uxFunctions.preTransition.exec(uxObj);
              uxFunctions.postTransition.reset();
            } else {
              uxFunctions.preTransition.reset();
              uxFunctions.postTransition.exec(uxObj);
              if (distRatio > 0.75) {
                uxObj.developDesign.conceptLayers.wireframeMockup.opacity = "1";
                uxObj.developDesign.conceptLayers.wireframeSketch.opacity = "0";
              }
            }
          }
          break;
        
        case 5: // Develop the Design
        // Transitions on this slide, of frame inner image opacities, are done w/ CSS3 transitions, for performance.
          if (distRatio < 0.6) {
            uxFunctions.preTransition.exec(uxObj);
            uxFunctions.postTransition.reset();
          } else {
            uxFunctions.postTransition.exec(uxObj);
            uxFunctions.preTransition.reset();
          }
          break;
        
        case 6: // Test and Validate
          if (distRatio < 0.2) {
            distRatio = distRatio * 5;
            uxObj.developDesign.handImg["left"] = uxObj.developDesign.handFinalLeftCtr - uxObj.developDesign.tfHeight + "px";
            uxObj.developDesign.handImg["bottom"] = (-2.18) * uxObj.developDesign.tfHeight + "px";
            
            uxFunctions.preTransition.exec(uxObj);
            uxFunctions.postTransition.reset();
          } else if (distRatio < 0.35) {
            distRatio = (distRatio - 0.2) * 6.667;
            uxObj.developDesign.handImg["left"] = uxObj.developDesign.handFinalLeftCtr + uxObj.developDesign.tfHeight * ( distRatio - 1.09) + "px";
            uxObj.developDesign.handImg["bottom"] = - 2 * (1.09 - distRatio) * uxObj.developDesign.tfHeight + "px";
            
            uxFunctions.preTransition.exec(uxObj);
            uxFunctions.postTransition.reset();
          } else if (distRatio < 0.40) {
            //distRatio = (distRatio - 0.2) * 20;
            uxObj.developDesign.handImg["left"] = uxObj.developDesign.handFinalLeftCtr + uxObj.developDesign.tfHeight * 0.09 + "px";
            uxObj.developDesign.handImg["bottom"] = - uxObj.developDesign.tfHeight * 0.18 + "px";

            uxFunctions.preTransition.exec(uxObj);
            uxFunctions.postTransition.reset();
          } else if (distRatio < 0.43) {
            //distRatio = (distRatio - 0.25) * 33;
            uxObj.developDesign.handImg["left"] = uxObj.developDesign.handFinalLeftCtr + uxObj.developDesign.tfHeight * 0.09 + "px";
            uxObj.developDesign.handImg["bottom"] = - uxObj.developDesign.tfHeight * 0.15 + "px";

            uxFunctions.preTransition.exec(uxObj);
            uxFunctions.postTransition.reset();
          } else if (distRatio < 0.47) {
            //distRatio = (distRatio - 0.28) * 25;
            uxObj.developDesign.handImg["left"] = uxObj.developDesign.handFinalLeftCtr + uxObj.developDesign.tfHeight * 0.09 + "px";
            uxObj.developDesign.handImg["bottom"] = - uxObj.developDesign.tfHeight * 0.18 + "px";
            uxObj.developDesign.conceptLayers.testValidate["opacity"] = "0";
            uxObj.developDesign.conceptLayers.developMockupTop["opacity"] = "1";
 
            uxFunctions.preTransition.reset();
            uxFunctions.postTransition.reset();
          } else if (distRatio < 0.57) {
            distRatio = (distRatio - 0.47) * 10;
            uxObj.developDesign.handImg["left"] = uxObj.developDesign.handFinalLeftCtr + uxObj.developDesign.tfHeight * 0.09 - (distRatio * uxObj.developDesign.tfHeight * 0.45) + "px";
            uxObj.developDesign.handImg["bottom"] = - uxObj.developDesign.tfHeight * 0.18 + "px";
            uxObj.developDesign.conceptLayers.testValidate["opacity"] = "0";//1 - distRatio;
            uxObj.developDesign.conceptLayers.developMockupTop["opacity"] = "1";
          
            uxFunctions.preTransition.reset();
            uxFunctions.postTransition.reset();
          } else if (distRatio < 0.62) {
            distRatio = (distRatio - 0.57) * 20;
            uxObj.developDesign.handImg["left"] = uxObj.developDesign.handFinalLeftCtr - (uxObj.developDesign.tfHeight * 0.35) - (distRatio * uxObj.developDesign.tfHeight * 0.12)  + "px";
            uxObj.developDesign.handImg["bottom"] = - uxObj.developDesign.tfHeight * (0.18 + 0.04 * distRatio) + "px";
            uxObj.developDesign.conceptLayers.testValidate["opacity"] = "0";
            uxObj.developDesign.conceptLayers.developMockupTop["opacity"] = "1";

            uxFunctions.preTransition.reset();
            uxFunctions.postTransition.reset();
          } else if (distRatio < 0.65) {
            uxObj.developDesign.handImg["left"] = uxObj.developDesign.handFinalLeftCtr - uxObj.developDesign.tfHeight * 0.48 + "px";
            uxObj.developDesign.handImg["bottom"] = - uxObj.developDesign.tfHeight * .22 + "px";
          
            uxObj.developDesign.conceptLayers.testValidate["opacity"] = "0";
            uxObj.developDesign.conceptLayers.developMockupTop["opacity"] = "1";

            uxFunctions.preTransition.reset();
            uxFunctions.postTransition.reset();
          } else if (distRatio < 0.75) {
            distRatio = (distRatio - 0.65) * 10;
            uxObj.developDesign.handImg["left"] = uxObj.developDesign.handFinalLeftCtr - (uxObj.developDesign.tfHeight * (0.48 - 0.41 * distRatio)) + "px";
            uxObj.developDesign.handImg["bottom"] = - uxObj.developDesign.tfHeight * (0.22 - 0.07 * distRatio) + "px";
          
            uxObj.developDesign.conceptLayers.testValidate["opacity"] = "0";
            uxObj.developDesign.conceptLayers.developMockupTop["opacity"] = "1";

            uxFunctions.preTransition.reset();
            uxFunctions.postTransition.reset();
          } else if (distRatio < 0.77) {
            uxObj.developDesign.handImg["left"] = uxObj.developDesign.handFinalLeftCtr - (uxObj.developDesign.tfHeight * 0.07) + "px";
            uxObj.developDesign.handImg["bottom"] = - uxObj.developDesign.tfHeight * 0.15 + "px";
          
            uxObj.developDesign.conceptLayers.testValidate["opacity"] = "0";
            uxObj.developDesign.conceptLayers.developMockupTop["opacity"] = "1";
            
            uxFunctions.preTransition.reset();
            uxFunctions.postTransition.reset();
          } else if (distRatio < 0.795) {
            uxObj.developDesign.handImg["left"] = uxObj.developDesign.handFinalLeftCtr - (uxObj.developDesign.tfHeight * 0.07) + "px";
            uxObj.developDesign.handImg["bottom"] = - uxObj.developDesign.tfHeight * 0.12 + "px";
          
            uxObj.developDesign.conceptLayers.testValidate["opacity"] = "0";
            uxObj.developDesign.conceptLayers.developMockupTop["opacity"] = "1";

            uxFunctions.preTransition.reset();
            uxFunctions.postTransition.reset();
          } else if (distRatio < 0.8) {
            uxObj.developDesign.handImg["left"] = uxObj.developDesign.handFinalLeftCtr - (uxObj.developDesign.tfHeight * 0.07) + "px";
            uxObj.developDesign.handImg["bottom"] = - uxObj.developDesign.tfHeight * 0.15 + "px";
          
            uxFunctions.postTransition.exec(uxObj);
            uxFunctions.preTransition.reset();
          } else if (distRatio < 0.90) {
            distRatio = (distRatio - 0.8) * 10;
            uxObj.developDesign.handImg["left"] = uxObj.developDesign.handFinalLeftCtr - (uxObj.developDesign.tfHeight * (0.07 + (distRatio * 0.35) )) + "px";
            uxObj.developDesign.handImg["bottom"] = - uxObj.developDesign.tfHeight * 0.15 + "px";
          
            uxFunctions.postTransition.exec(uxObj);
            uxFunctions.preTransition.reset();
          } else {
            uxObj.developDesign.handImg["left"] = uxObj.developDesign.handFinalLeftCtr - (uxObj.developDesign.tfHeight * 0.42) + "px";
            uxObj.developDesign.handImg["bottom"] = - uxObj.developDesign.tfHeight * 0.15 + "px";
            
            uxFunctions.postTransition.exec(uxObj);
            uxFunctions.preTransition.reset();
          }
          break;
          
        case 7: // Implementation Support
          if (distRatio < 0.95){
            distRatio += 0.05;
            
            if (distRatio < 0.16){
              distRatio = 1 - distRatio * 5.25;
            }
            
            uxObj.implementSupport.codeSample.left = 160 * (1 - distRatio) + "px";
            uxObj.implementSupport.assetsFrame["color"] = "rgba(0,0,0," + (distRatio * 0.5) + ")";
            uxObj.implementSupport.assetsFrame["opacity"] =  distRatio/2 + 0.5;
            
            for (var floatingAsset in uxObj.implementSupport.floatingAssets){
              floatingAsset = uxObj.implementSupport.floatingAssets[floatingAsset];
              floatingAsset.element.style.left = Math.round(floatingAsset.finalLeft + uxObj.developDesign.tfHeight * floatingAsset.iLeftMultiplier * (1 - distRatio)) + "px";
              floatingAsset.element.style.top = Math.round(floatingAsset.finalTop + uxObj.developDesign.tfHeight * floatingAsset.iTopMultiplier  * (1 - distRatio)) + "px";
              if (floatingAsset.rotate == 1) {
                floatingAsset.element.style.webkitTransform  = "rotate3d(0,0,1," + ((1 - distRatio) * 70) + "deg)";
                floatingAsset.element.style.MozTransform  = "rotate3d(0,0,1," + ((1 - distRatio) * 70) + "deg)";
                floatingAsset.element.style.msTransform  = "rotate3d(0,0,1," + ((1 - distRatio) * 70) + "deg)";
                floatingAsset.element.style.transform  = "rotate3d(0,0,1," + ((1 - distRatio) * 70) + "deg)";
              }
              else if (floatingAsset.rotate == 2) {
                floatingAsset.element.style.webkitTransform  = "rotate3d(0,0,1," + ((1 - distRatio) * -120) + "deg)";
                floatingAsset.element.style.MozTransform  = "rotate3d(0,0,1," + ((1 - distRatio) * 120) + "deg)";
                floatingAsset.element.style.msTransform  = "rotate3d(0,0,1," + ((1 - distRatio) * 120) + "deg)";
                floatingAsset.element.style.transform  = "rotate3d(0,0,1," + ((1 - distRatio) * 120) + "deg)";
              }
            }
            uxFunctions.postTransition.reset();
          } else {
            uxFunctions.postTransition.exec(uxObj);
          }
          uxFunctions.preTransition.reset();
          break;
          
        case 8: // Highlighted Success Story
/*
          if (distRatio < 0){
            distRatio += 0.75;
            for (var floatingAsset in uxObj.implementSupport.floatingAssets){
              floatingAsset = uxObj.implementSupport.floatingAssets[floatingAsset];
              floatingAsset.element.style.left = Math.round(floatingAsset.finalLeft + uxObj.developDesign.tfHeight * floatingAsset.iLeftMultiplier * (1 - distRatio)) + "px";
              floatingAsset.element.style.top = Math.round(floatingAsset.finalTop + uxObj.developDesign.tfHeight * floatingAsset.iTopMultiplier  * (1 - distRatio)) + "px";
            }
          
            uxFunctions.preTransition.exec(uxObj);
            uxFunctions.postTransition.reset();
          } else {
*/
            uxFunctions.postTransition.exec(uxObj);
            uxFunctions.preTransition.reset();
//          }
          break;
      }
    },
    
    /**
     * preTransition and postTransition are for executing static transitions, such as height = 5 instead of height = 5 * distRatio.
     * Delegating them to here prevents unneeded repetitive JS execution of assigning elements custom but non-dynamic values.
     * Execution is dependant on slide and phaseDistRatio, so is delegated from the primary animate function. 
     * Remember to reset each when doing dynamic animation, so it will execute again when needed.
     **/
     
    preTransition: {
      last: null,
      exec: function(uxObj){
        if (data.currentSlideNum == uxFunctions.preTransition.last) return;
        uxFunctions.preTransition.last = data.currentSlideNum;
        util.log("Pre-transitioning on slide " + uxFunctions.postTransition.last);
        switch (data.currentSlideNum) {
          
          case 3: // Understand the Users
            uxObj.understandUsers.textElement.zIndex = 0;
            break;
          
          case 4: // Design the Concept
            uxObj.developDesign.tabletFrame["background"] = "";
            uxObj.developDesign.conceptLayers.wireframeMockup["opacity"] = "0";
            uxObj.developDesign.conceptLayers.wireframeSketch["opacity"] = "1"; 
            break;
            
          case 5: // Develop the Design
            uxObj.developDesign.conceptLayers.wireframeMockup["opacity"] = "1";
            uxObj.developDesign.conceptLayers.developMockup["opacity"] = "0";
            break;
            
          case 6: // Test & Validate
            uxObj.developDesign.conceptLayers.testValidate["opacity"] = "1";
            uxObj.developDesign.conceptLayers.developMockupTop["opacity"] = "1";
            break;
            
          /*  
          case 7: // Implementation Support
           for (var floatingAsset in uxObj.implementSupport.floatingAssets){
              floatingAsset = uxObj.implementSupport.floatingAssets[floatingAsset];
              floatingAsset.element.style.left = Math.round(floatingAsset.finalLeft + uxObj.developDesign.tfHeight * floatingAsset.iLeftMultiplier) + "px";
              floatingAsset.element.style.top = Math.round(floatingAsset.finalTop + uxObj.developDesign.tfHeight * floatingAsset.iTopMultiplier) + "px";
            }
            break;
          */
          case 8: // Success Story
            for (var floatingAsset in uxObj.implementSupport.floatingAssets){
              floatingAsset = uxObj.implementSupport.floatingAssets[floatingAsset];
              floatingAsset.element.style.left = Math.round(floatingAsset.finalLeft + uxObj.developDesign.tfHeight * floatingAsset.iLeftMultiplier * 0.2) + "px";
              floatingAsset.element.style.top = Math.round(floatingAsset.finalTop + uxObj.developDesign.tfHeight * floatingAsset.iTopMultiplier * 0.2) + "px";
            }
            break;
            
            
        }
        
        return;
      },
      reset: function(){
        if (uxFunctions.preTransition.last == null) return;
        else uxFunctions.preTransition.last = null;
        return;
      }
    },
    
    postTransition: {
      last: null,
      exec: function(uxObj){
        if (data.currentSlideNum == uxFunctions.postTransition.last) return;
        uxFunctions.postTransition.last = data.currentSlideNum;
        util.log("Post-transitioning on slide " + uxFunctions.postTransition.last);
        switch (data.currentSlideNum) {
        
          case 2: // PostTransition: Know the Objective
            uxObj.understandUsers.mainImg.top = uxObj.understandUsers.mainImgTopMargin + "px";
            uxObj.knowObjective.innerElement.opacity =  "1";
            break;
          
          case 3: // PostTransition: Understand the Users
            uxObj.understandUsers.textElement.opacity = "1";
            uxObj.understandUsers.textElement.zIndex = 2;
            uxObj.understandUsers.textElement.top = - 28 - uxObj.understandUsers.mainImgHeight + "px";
            uxObj.understandUsers.mainImg.top = uxObj.understandUsers.textElemHeight + "px";
            //uxObj.understandUsers.mainImg["margin-top"] = "0";

            uxObj.understandUsers.animItems.wrapper["top"] = "0";
            uxObj.understandUsers.animItems.leftCoach["left"] = "31%";
            uxObj.understandUsers.animItems.rightCoach["right"] = "31%";
            uxObj.understandUsers.animItems.medBag["left"] = "31%";
            uxObj.understandUsers.animItems.player["bottom"] = "50px";
            break;
          
          case 4: // PostTransition: Design the Concept
            uxObj.designConcept.sketchbook["bottom"] = ( - uxObj.designConcept.sketchbookHeight - 5) + "px"; //"-200px";
            uxObj.developDesign.tabletFrame.webkitTransform = "scale3d(1,1,1)";
            uxObj.developDesign.tabletFrame.MozTransform = "scale3d(1,1,1)";
            uxObj.developDesign.tabletFrame.msTransform = "scale3d(1,1,1)";
            uxObj.developDesign.tabletFrame.transform = "scale3d(1,1,1)";
            uxObj.developDesign.tabletFrame["bottom"] = settings.layeredMockupBottomOffset + "px";
            uxObj.developDesign.tabletFrame.backgroundColor = "rgba(160,160,160,0.25)";
            break;
            
          case 5: // PostTransition: Develop the Design
            uxObj.developDesign.conceptLayers.wireframeMockup["opacity"] = "0";
            uxObj.developDesign.conceptLayers.developMockup["opacity"] = "1";
            break;
            
          case 6: // PostTransition: Test & Validate
            uxObj.developDesign.conceptLayers.developMockupTop["opacity"] = "0";
            uxObj.developDesign.conceptLayers.testValidate["opacity"] = "0";
            break;
            
          case 7: // PostTransition: Implementation Support
            for (var floatingAsset in uxObj.implementSupport.floatingAssets){
              floatingAsset = uxObj.implementSupport.floatingAssets[floatingAsset];
              floatingAsset.element.style.left = floatingAsset.finalLeft + "px";
              floatingAsset.element.style.top = floatingAsset.finalTop + "px";
              
              floatingAsset.element.style.webkitTransform  = "rotate3d(0,0,1,0deg)";
              floatingAsset.element.style.MozTransform  = "rotate3d(0,0,1,0deg)";
              floatingAsset.element.style.msTransform  = "rotate3d(0,0,1,0deg)";
              floatingAsset.element.style.transform  = "rotate3d(0,0,1,0deg)";
            }
            uxObj.implementSupport.assetsFrame["opacity"] =  "1";
            break;
            
          case 8: // PostTransition: Success Story
            for (var floatingAsset in uxObj.implementSupport.floatingAssets){
              floatingAsset = uxObj.implementSupport.floatingAssets[floatingAsset];
              floatingAsset.element.style.left = floatingAsset.finalLeft + "px";
              floatingAsset.element.style.top = floatingAsset.finalTop + "px";
              floatingAsset.element.style.webkitTransform  = "rotate3d(0,0,1,0deg)";
              floatingAsset.element.style.MozTransform  = "rotate3d(0,0,1,0deg)";
              floatingAsset.element.style.msTransform  = "rotate3d(0,0,1,0deg)";
              floatingAsset.element.style.transform  = "rotate3d(0,0,1,0deg)";
            }
            break;
            
            
        }
        
        return;
      },
      reset: function(){
        if (uxFunctions.postTransition.last == null) return;
        else uxFunctions.postTransition.last = null;
        return;
      }
    },
    
    doOnce: function (uxObj, slideNum, dataObj) {
      if (uxObj == null) return false;
      if (dataObj == null || dataObj.elements == null) dataObj = data;
      util.log("Doing Once - Slide Index " + slideNum);
      switch (slideNum) {
        case 0: // DoOnce: User Experience
          uxObj.implementSupport.assetsLayered["position"] = "absolute";
          uxObj.developDesign.conceptLayers.wireframeMockup.opacity = "0";
          uxFunctions.resetUnderstandUsers(uxObj);
          uxObj.understandUsers.mainImg.top = "0";
          $(data.bg.body).stop(true, false);
          break;
          
        case 1: // DoOnce: Sports Med Inc.
          uxObj.knowObjective.innerElement.opacity = "0.25";
          uxObj.implementSupport.assetsLayered["position"] = "absolute";
          uxObj.developDesign.conceptLayers.wireframeMockup.opacity = "0";
          uxFunctions.resetUnderstandUsers(uxObj);
          uxObj.understandUsers.mainImg.top = "0";
          $(data.bg.body).stop(true, false);
          break;
          
        case 2: // DoOnce: Know Objective
          uxObj.understandUsers.textElement.opacity = "0";
          uxObj.understandUsers.textElement.top = "0";
          uxObj.understandUsers.animItems.wrapper.top = "200px";
          uxObj.developDesign.conceptLayers.wireframeMockup.opacity = "0";
          uxObj.implementSupport.assetsLayered["position"] = "absolute";
          uxFunctions.resetUnderstandUsers(uxObj);
          $(data.bg.body).stop(true, false);
          break;
          
        case 3: // DoOnce: Understand Users
          uxObj.knowObjective.innerElement.opacity = "1";
          uxObj.developDesign.conceptLayers.wireframeMockup.opacity = "0";
          uxObj.implementSupport.assetsLayered["position"] = "absolute";
          $(data.bg.body).stop(true, false);
          break;
          
        case 4: // DoOnce: Design Concept
          setTimeout(function(){
            if (data.currentSlideNum == 4) uxObj.designConcept.sketchbook["display"] = "inline-block";
          }, 750);
          uxObj.developDesign.conceptLayers.developMockup.opacity = "0"; 
          uxObj.developDesign.conceptLayers.developMockupTop.opacity = "1";
          uxObj.developDesign.wireframesLayered["position"] = "fixed";
          uxObj.developDesign.conceptLayers.wireframeMockup["border-color"] = "#fff";
          uxObj.developDesign.conceptLayers.testValidate.opacity = "0";
          
          uxObj.implementSupport.assetsFrame.opacity =  "0";
          uxObj.implementSupport.assetsLayered["position"] = "absolute";
          uxFunctions.resetUnderstandUsers(uxObj);
          uxObj.understandUsers.animItems.wrapper.top = "-100px"; // Override reset to hide better in this slide.
          uxFunctions.topClick(4, 2400, (4 >= data.lastSlideNum ? "anim" : "anim-past"));
          
          break;
          
        case 5: // DoOnce: Develop the Design
        
          uxObj.developDesign.wireframesLayered["position"] = "fixed";
          uxObj.designConcept.sketchbook["display"] = "none";
          uxObj.developDesign.conceptLayers.wireframeSketch.opacity = "0";
          
          uxObj.developDesign.tabletFrame.bottom = settings.layeredMockupBottomOffset + "px";
          
          uxObj.developDesign.conceptLayers.wireframeMockup["border-color"] = "rgba(0,0,0,0.1)";
          uxObj.developDesign.conceptLayers.developMockupTop.opacity = "1";
          uxObj.developDesign.conceptLayers.testValidate.opacity = "0";
          
          uxFunctions.resetUnderstandUsers(uxObj);
          uxFunctions.alignFloatingAssetsFullTablet(uxObj, dataObj);
          uxObj.implementSupport.assetsFrame.opacity =  "0";
          uxObj.implementSupport.assetsLayered["position"] = "fixed";
          $(data.bg.body).stop(true, false);
          break;
          
        case 6: // DoOnce: Test & Validate
          //uxObj.developDesign.handImg["opacity"] = "1";
          uxFunctions.topClick(6, null, (6 >= data.lastSlideNum ? "anim" : "anim-past"));
          uxObj.developDesign.conceptLayers.wireframeMockup["border-color"] = "#000";
          uxObj.developDesign.conceptLayers.wireframeSketch["opacity"] = "0";
          uxObj.developDesign.conceptLayers.wireframeMockup["opacity"] = "0";
          uxObj.developDesign.conceptLayers.developMockup["opacity"] = "1"
          uxObj.developDesign.tabletFrame["bottom"] = settings.layeredMockupBottomOffset + "px";
          
          uxFunctions.resetUnderstandUsers(uxObj);
          
          uxFunctions.alignFloatingAssetsFullTablet(uxObj, dataObj);
          uxObj.implementSupport.assetsFrame["opacity"] =  "0";
          uxObj.implementSupport.assetsLayered["position"] = "fixed";
          uxObj.implementSupport.assetsFrame["color"] = "transparent";
          
          break;
          
        case 7: // DoOnce: Implementation Support
          uxObj.developDesign.tabletFrame["bottom"] = settings.layeredMockupBottomOffset + "px";
          uxObj.developDesign.wireframesLayered["display"] = "block"; // Hide Mockups from Develop.. & Design..
          uxObj.developDesign.wireframesLayered["position"] = "absolute";
          //uxObj.developDesign.handImg["opacity"] = "0";
          
          uxFunctions.topClick(7, null, (7 >= data.lastSlideNum ? "anim" : "anim-past"));
          uxObj.successStory.backgroundImage.marginTop = "80px";
          
          // Resize to smaller tablet.
          uxObj.implementSupport.assetsFrame.height = uxObj.successStory.tabletFrame.height;
          uxObj.implementSupport.assetsFrame.width = uxObj.successStory.tabletFrame.width;
          uxObj.implementSupport.assetsFrame.marginLeft = uxObj.successStory.tabletFrame.marginLeft;
          
          // Scale Asset Sizes
          for (var floatingAsset in uxObj.implementSupport.floatingAssets){
            floatingAsset = uxObj.implementSupport.floatingAssets[floatingAsset];
            floatingAsset.element.style.height = Math.round(floatingAsset.origHeight * dataObj.tabletFrameScale * settings.implementFrameRatio) + "px";
          }
          
          uxFunctions.resetUnderstandUsers(uxObj);
          break;
          
        case 8: // DoOnce: Highlighted Success Story
          uxObj.successStory.backgroundImage.marginTop = "0";
          
          // Resize to smaller tablet.
          uxObj.implementSupport.assetsFrame.height = uxObj.successStory.tabletFrame.height;
          uxObj.implementSupport.assetsFrame.width = uxObj.successStory.tabletFrame.width;
          uxObj.implementSupport.assetsFrame.marginLeft = uxObj.successStory.tabletFrame.marginLeft;
          
          // Scale Asset Sizes
          for (var floatingAsset in uxObj.implementSupport.floatingAssets){
            floatingAsset = uxObj.implementSupport.floatingAssets[floatingAsset];
            floatingAsset.element.style.height = Math.round(floatingAsset.origHeight * dataObj.tabletFrameScale * settings.implementFrameRatio) + "px";
          }
          
          uxObj.implementSupport.assetsLayered["position"] = "fixed";
          uxObj.implementSupport.assetsFrame["color"] = "transparent";
          uxObj.implementSupport.assetsFrame.opacity =  "1";
          
          uxFunctions.resetUnderstandUsers(uxObj);
          $(data.bg.body).stop(true, false);
          
          break;
      }
      data.bg.body.className = "slide-" + slideNum;
      data.lastSlideNum = data.currentSlideNum;
    },
    
    resetUnderstandUsers: function(uxObj){
        uxObj.understandUsers.textElement.opacity = "0";
        uxObj.understandUsers.textElement.top = "0px"; 

        uxObj.understandUsers.mainImg.top = uxObj.understandUsers.mainImgTopMargin + "px";

        uxObj.understandUsers.animItems.wrapper.top = "200px";
        uxObj.understandUsers.animItems.leftCoach.left = "-4%";
        uxObj.understandUsers.animItems.rightCoach.right =  "-4%";
        uxObj.understandUsers.animItems.medBag.left = "4%";
        uxObj.understandUsers.animItems.player.bottom = "0px";
    
    },
    
    alignFloatingAssetsFullTablet: function(uxObj, dataObj){
        uxObj.implementSupport.assetsFrame.height = uxObj.developDesign.tfHeight + "px";
        uxObj.implementSupport.assetsFrame.width = Math.floor(uxObj.developDesign.tfHeight * settings.layeredMockupWidthRatio) + "px";
        uxObj.implementSupport.assetsFrame.marginLeft = (document.body.clientWidth - (uxObj.developDesign.tfHeight * settings.layeredMockupWidthRatio + 20))/2 + "px";
        for (var floatingAsset in uxObj.implementSupport.floatingAssets){
          floatingAsset = uxObj.implementSupport.floatingAssets[floatingAsset];
              
          floatingAsset.element.style.height = Math.round(floatingAsset.origHeight * dataObj.tabletFrameScale) + "px";
              
          floatingAsset.element.style.left = (floatingAsset.finalLeft * (1/settings.implementFrameRatio)) + "px";
          floatingAsset.element.style.top = (floatingAsset.finalTop  * (1/settings.implementFrameRatio)) + "px";
            
          floatingAsset.element.style.webkitTransform  = "rotate3d(0,0,1,0deg)";
          floatingAsset.element.style.MozTransform  = "rotate3d(0,0,1,0deg)";
          floatingAsset.element.style.msTransform  = "rotate3d(0,0,1,0deg)";
          floatingAsset.element.style.transform  = "rotate3d(0,0,1,0deg)";
        }
    },
	
	adjustCustomSizing: function(uxObj, dataObj, marginVal){
    
      // Slide 1:
      uxObj.uxServices.imageCellContainer.top = $(dataObj.elements[0].inner.element).outerHeight() - 148 + "px";
      uxObj.uxServices.imageCellContainer.left = Math.round((document.body.clientWidth - (settings.navIconWidth * 6))/2) + "px";

      
      // Slide 5-7:
      
	  uxObj.developDesign.tfHeight = dataObj.elements[4].height - dataObj.elements[4].inner.height - settings.layeredMockupBottomOffset * 3;
	  if (uxObj.developDesign.tfHeight >= settings.layeredMockupOrigImgHeight){ // Use orig (set) height of image.
	    marginVal = uxObj.developDesign.tfHeight - settings.layeredMockupOrigImgHeight + settings.layeredMockupBottomOffset;
	    uxObj.developDesign.tfHeight = settings.layeredMockupOrigImgHeight;
        uxObj.implementSupport.assetsLayered['display'] = 'block';
        uxObj.developDesign.wireframesLayered['display'] = 'block';
        dataObj.tabletFrameScale = 1;
	  } else if (uxObj.developDesign.tfHeight < 20) { // Too small to display.
        marginVal = settings.layeredMockupBottomOffset;
        uxObj.developDesign.tfHeight = 0;
        uxObj.implementSupport.assetsLayered['display'] = 'none';
        uxObj.developDesign.wireframesLayered['display'] = 'none';
        dataObj.tabletFrameScale = null;
      } else { // Adjust size to fit window height.
	    marginVal = settings.layeredMockupBottomOffset;
        uxObj.implementSupport.assetsLayered['display'] = 'block';
        uxObj.developDesign.wireframesLayered['display'] = 'block';
	    uxObj.developDesign.tfHeight = dataObj.elements[4].height - dataObj.elements[4].inner.height - settings.layeredMockupBottomOffset * 3;
        // * 3 to account for its a) own bottom offset, b) top inner offset, and c) margin between it & text.
        dataObj.tabletFrameScale = uxObj.developDesign.tfHeight / settings.layeredMockupOrigImgHeight;
	  }

      // Set Tablet Frame Screens Height & Width
      uxObj.developDesign.conceptLayers.testValidate["height"] = uxObj.developDesign.tfHeight + "px";
      uxObj.developDesign.conceptLayers.developMockup["height"] = uxObj.developDesign.tfHeight + "px";
      uxObj.developDesign.conceptLayers.developMockupInner["height"] = uxObj.developDesign.tfHeight + "px";
      uxObj.developDesign.conceptLayers.developMockupTop["height"] = uxObj.developDesign.tfHeight + "px";
      uxObj.developDesign.conceptLayers.wireframeMockup["height"] = uxObj.developDesign.tfHeight + "px";
      uxObj.developDesign.conceptLayers.wireframeSketch["height"] = uxObj.developDesign.tfHeight + "px";
 
      // Slide 4-6
      uxObj.developDesign.tabletFrame.height = uxObj.developDesign.tfHeight + "px";
      uxObj.developDesign.tabletFrame.width = Math.floor(uxObj.developDesign.tfHeight * settings.layeredMockupWidthRatio) + "px";
      uxObj.developDesign.tfWinButton.width = Math.floor(uxObj.developDesign.tfHeight * settings.layeredMockupWidthRatio) + "px";
      
      // Hand
      uxObj.developDesign.handImg.height = uxObj.developDesign.tfHeight + settings.layeredMockupBottomOffset + 36 + "px";
      uxObj.developDesign.handImg.width = Math.floor((uxObj.developDesign.tfHeight + settings.layeredMockupBottomOffset + 36) * settings.handImgWidthRatio) + "px";
      uxObj.developDesign.handFinalLeftCtr = Math.floor((document.body.clientWidth / 2 - (uxObj.developDesign.tfHeight + settings.layeredMockupBottomOffset + 36) * settings.handImgWidthRatio) + uxObj.developDesign.tfHeight/8);
      util.log("Hand Final Center: " + uxObj.developDesign.handFinalLeftCtr);
      //uxObj.developDesign.handImg["left"] = uxObj.developDesign.handFinalLeftCtr + "px";
      
      // Slide 7-8
      
      uxObj.implementSupport.smallCourt.left = settings.implementFrameLeftOffset + "px";
      
      uxObj.successStory.tabletFrame.height = uxObj.developDesign.tfHeight * settings.implementFrameRatio + "px";
      uxObj.successStory.backgroundImage.height = uxObj.developDesign.tfHeight + settings.layeredMockupBottomOffset * 3 + "px";
      
      uxObj.successStory.backgroundContainer.height = uxObj.successStory.backgroundImage.height;
      
      uxObj.successStory.tabletFrame.width = Math.floor(uxObj.developDesign.tfHeight * settings.layeredMockupWidthRatio * settings.implementFrameRatio) + "px";
      
      uxObj.successStory.tabletFrame.marginLeft = document.body.clientWidth * 0.75 + settings.implementFrameLeftOffset - parseInt(uxObj.successStory.tabletFrame.width.replace("px",""))/2 + 14 + "px";
      
      uxObj.successStory.tabletFrame.bottom = (parseInt(uxObj.successStory.backgroundImage.height.replace("px","")) - uxObj.developDesign.tfHeight * settings.implementFrameRatio) / 2 - 24 + "px";
      
      uxObj.implementSupport.assetsFrame.bottom = uxObj.successStory.tabletFrame.bottom;
      
      
      //uxObj.successStory.tabletFrame.marginLeft = (document.body.clientWidth - (uxObj.developDesign.tfHeight * settings.layeredMockupWidthRatio * settings.implementFrameRatio + 20))/2 + settings.implementFrameLeftOffset + "px";
      $("#conclusion-box").css("width", document.body.clientWidth / 2);
      
      uxObj.successStory.assetsBackgroundImage.height = uxObj.successStory.tabletFrame.height;
      uxObj.successStory.assetsBackgroundImage.width = uxObj.successStory.tabletFrame.width;
      
      //uxObj.successStory.backgroundImage["width"] = Math.floor((uxObj.developDesign.tfHeight  + 52) * settings.layeredMockupWidthRatio) + "px";
      
      if (dataObj.tabletFrameScale != null){
       
        // Set Final Positions
        uxObj.implementSupport.floatingAssets.backButton.finalLeft = Math.round(uxObj.developDesign.tfHeight * settings.implementFrameRatio * .028);
        uxObj.implementSupport.floatingAssets.backButton.finalTop = Math.round(uxObj.developDesign.tfHeight * settings.implementFrameRatio * .06);
        
        uxObj.implementSupport.floatingAssets.playerBody.finalLeft = Math.round(uxObj.developDesign.tfHeight * settings.implementFrameRatio * .626);
        uxObj.implementSupport.floatingAssets.playerBody.finalTop = Math.round(uxObj.developDesign.tfHeight * settings.implementFrameRatio * .106);
        
        uxObj.implementSupport.floatingAssets.playerPhoto.finalLeft = Math.round(uxObj.developDesign.tfHeight * settings.implementFrameRatio * .106);
        uxObj.implementSupport.floatingAssets.playerPhoto.finalTop = Math.round(uxObj.developDesign.tfHeight * settings.implementFrameRatio * .183);
        
        uxObj.implementSupport.floatingAssets.ball.finalLeft = Math.round(uxObj.developDesign.tfHeight * settings.implementFrameRatio * .026);
        uxObj.implementSupport.floatingAssets.ball.finalTop = Math.round(uxObj.developDesign.tfHeight * settings.implementFrameRatio * .868);
        
        uxObj.implementSupport.floatingAssets.health1.finalLeft = Math.round(uxObj.developDesign.tfHeight * settings.implementFrameRatio * .135);
        uxObj.implementSupport.floatingAssets.health1.finalTop = Math.round(uxObj.developDesign.tfHeight * settings.implementFrameRatio * .475);
        
        uxObj.implementSupport.floatingAssets.health2.finalLeft = Math.round(uxObj.developDesign.tfHeight * settings.implementFrameRatio * .135);
        uxObj.implementSupport.floatingAssets.health2.finalTop = Math.round(uxObj.developDesign.tfHeight * settings.implementFrameRatio * .577);
        
        uxObj.implementSupport.floatingAssets.health3.finalLeft = Math.round(uxObj.developDesign.tfHeight * settings.implementFrameRatio * .36);
        uxObj.implementSupport.floatingAssets.health3.finalTop = Math.round(uxObj.developDesign.tfHeight * settings.implementFrameRatio * .475);
        
        uxObj.implementSupport.floatingAssets.injuryMarker.finalLeft = Math.round(uxObj.developDesign.tfHeight * settings.implementFrameRatio * .740);
        uxObj.implementSupport.floatingAssets.injuryMarker.finalTop = Math.round(uxObj.developDesign.tfHeight * settings.implementFrameRatio * .680);
        
        uxObj.implementSupport.floatingAssets.phone.finalLeft = Math.round(uxObj.developDesign.tfHeight * settings.implementFrameRatio * .115);
        uxObj.implementSupport.floatingAssets.phone.finalTop = Math.floor(uxObj.developDesign.tfHeight * settings.implementFrameRatio * .679);
        
        uxObj.implementSupport.floatingAssets.mail.finalLeft = Math.round(uxObj.developDesign.tfHeight * settings.implementFrameRatio * .113);
        uxObj.implementSupport.floatingAssets.mail.finalTop = Math.floor(uxObj.developDesign.tfHeight * settings.implementFrameRatio * .732);
        
        uxObj.implementSupport.floatingAssets.flipBodyIcon.finalLeft = Math.round(uxObj.developDesign.tfHeight * settings.implementFrameRatio * .607);
        uxObj.implementSupport.floatingAssets.flipBodyIcon.finalTop = Math.round(uxObj.developDesign.tfHeight * settings.implementFrameRatio * .86);
        
      }
      
      // Apply Appropriate Top Margin to Inner Elements || tfHeight + marginVal * 3 = 100%; -10 for extra padding.
      /**
      dataObj.elements[4].inner.element.style["padding-top"] = marginVal - 10 + "px";
      dataObj.elements[5].inner.element.style["padding-top"] = marginVal - 10 + "px";
      dataObj.elements[6].inner.element.style["padding-top"] = marginVal - 10 + "px";
      dataObj.elements[8].inner.element.style["padding-top"] = (marginVal - 30)/2 + "px";
      **/
      $(dataObj.elements[2].inner.element).css("padding-top", (marginVal)/3 + "px");
      $(dataObj.elements[3].inner.element).css("padding-top", (marginVal - 30)/1.5 + 36 + "px");
      $(dataObj.elements[4].inner.element).css("padding-top", (marginVal - 30)/1.5 + 36 + "px");
      $(dataObj.elements[5].inner.element).css("padding-top", (marginVal - 30)/1.5 + 36 + "px");
      $(dataObj.elements[6].inner.element).css("padding-top", (marginVal - 30)/1.5 + 18 + "px");
      $(dataObj.elements[7].inner.element).css("padding-top", (marginVal - 30)/1.5 + 36 + "px");
      $(dataObj.elements[8].inner.element).css("padding-top", marginVal/2 + 12 + "px");
      // Centers the non-fixed slide elements.
      
      //dataObj.elements[5].inner.element.style["border-top"] = "24px solid rgba(0,0,0,0.2)";
      //dataObj.elements[6].inner.element.style["border-top"] = "24px solid rgba(0,0,0,0.2)";
      
      // Slide 5
	  
	  uxObj.designConcept.sketchbookHeight = uxObj.designConcept.sketchbook.height.substring(0, uxObj.designConcept.sketchbook.height.length - 2);
      
      // Slide 3
      uxObj.understandUsers.mainImgHeight = parseInt(uxObj.understandUsers.mainImg.height.substring(0, uxObj.understandUsers.mainImg.height.length - 2));
      uxObj.understandUsers.textElemHeight = uxObj.understandUsers.textElement.height.substring(0, uxObj.understandUsers.textElement.height.length - 2);
      uxObj.understandUsers.mainImgPlaceholder.height = uxObj.understandUsers.mainImgHeight;
      uxObj.understandUsers.mainImgTopMargin = 
          - window.innerHeight
          - parseInt($(dataObj.elements[3].inner.element).css("padding-top").replace("px",""))
          + parseInt($(dataObj.elements[2].inner.element).css("padding-top").replace("px",""))
          + dataObj.elements[2].inner.height
          + settings.layeredMockupBottomOffset;
	  
      // End of Resizing
      util.log("Resized Slide Custom Elements -- understandUsers.mainImgHeight = " + uxObj.understandUsers.mainImgHeight + "; Slide 4-6 Inner Top Padding = " + dataObj.elements[4].inner.element.style["padding-top"] + ";");
	  
    },
    
    infoRequest: function(){
      if (!$(data.bg.body).hasClass("request-dialog")){
        $(data.bg.body).addClass("request-dialog");
        data.scrollOff = true;
        $("#request-info-dialog").css("min-height", (window.innerHeight - 50) + "px");
        data.bg.style.height = $("#request-info-dialog").height();
      } else {
        $(data.bg.body).removeClass("request-dialog");
        data.bg.style.height = data.docHeight;
        data.scrollOff = false;
        onResizeFunction(data);
        uxFunctions.topClick(data.lastSlideNum, null, "none");
      }
      return false;
    },
    errorClose: function(){
      if ($(data.bg.body).attr("error") == "1"){
        $(data.bg.body).attr("error", "closed");
      }
      return false;
    },
    currentOpenElem: null,
    uxServicesHoverIn: function(){
      if (data.bg.body.className != "slide-0") return false;
      uxFunctions.currentOpenElem = $("#group-ux-services tr.list-description td." + $(this).attr("class"));
      $(data.bg.body).attr("uxHover", $(this).attr("class"));
      util.log("Mouse over on UI element: " + uxFunctions.currentOpenElem.attr("class"));
      uxFunctions.currentOpenElem.css("visibility","visible");
      return;
    },
    uxServicesHoverOut: function(){
      if (data.bg.body.className != "slide-0") return false;
      if (uxFunctions.currentOpenElem != null){
        uxFunctions.currentOpenElem.css("visibility","hidden");
        uxFunctions.currentOpenElem = null;
        $(data.bg.body).attr("uxHover", "");
      }
      return;
    },
    uxClick: function(){
      switch ($(this).attr("slideId")){
      
      case "0" :
        uxFunctions.topClick(0, null, "none");
        break;
      
      case "2" :
        uxFunctions.topClick(2, null, "none");
        break;
        
      case "3" :
        uxFunctions.topClick(3, null, "none");
        break;
        
      case "4" :
        uxFunctions.topClick(4, null, (4 >= data.currentSlideNum ? "anim" : "anim-past"));
        break;
        
      case "5" :
        uxFunctions.topClick(5, null, "none");
        break;
        
      case "6" :
        uxFunctions.topClick(6, null, (6 >= data.currentSlideNum ? "anim" : "anim-past"));
        break;
        
      case "7" :
        uxFunctions.topClick(7, null, (7 >= data.currentSlideNum ? "anim" : "anim-past"));
        break;
        
      case "8" :
        uxFunctions.topClick(8, null, "none");
      }
      return;
    },
    
    topClick: function(slideID, duration, anim){
      if (typeof slideID !== "number") slideID = parseInt(this.id.substr(5,7));
      if (typeof anim !== "string") anim = this.id.substr(8,12);
      if (typeof duration !== "number") duration = 3200;
      util.log("Clicked Menu Item " + slideID);
      $(data.bg.body).stop(true, false);
      if (slideID > 0 && (anim == "anim")){ 
        data.bg.body.scrollTop = data.scrollDistanceToSlides[slideID] - data.elements[slideID - 1].height + 1;
        $("body, html").bind("scroll mousedown DOMMouseScroll mousewheel", function(){
          $(data.bg.body).stop(true, false);
        });
        
        $(data.bg.body).animate({scrollTop: data.scrollDistanceToSlides[slideID]}, duration, "linear", function(){
          $("body, html").unbind("scroll mousedown DOMMouseScroll mousewheel");
        });
      } else if (slideID > 0 && (anim == "anim-past" || anim == "none")){
        data.bg.body.scrollTop = data.scrollDistanceToSlides[slideID] - data.elements[slideID - 1].height / 5;
      } else if (slideID == 0) {
        data.bg.body.scrollTop = data.scrollDistanceToSlides[slideID];
      } 
      return false;
    },
    timer: null,
    
    bind: function(){
      $("#group-ux-services #group-ux-services-inner #image-cells-container div").hover(uxFunctions.uxServicesHoverIn, uxFunctions.uxServicesHoverOut).click(uxFunctions.uxClick);
      $("#info-request-button, #request-info-close, #info-request-button-2").click(uxFunctions.infoRequest);
      $("#error-close").click(uxFunctions.errorClose);
      this.uxItems = new UXItems(data);
    }
  }
  
  UXItems = function(dataObj){
      this.uxServices = {
        imageCellContainer: document.getElementById("image-cells-container").style,
        imageCellWidth:     null
      },
      this.knowObjective = {  // 3rd Slide (Index: 2)
        innerElement: 	    dataObj.elements[2].inner.element.style
      }
      this.understandUsers = { // 4th Slide (Index: 3)
        mainImg: 		    document.getElementById("understand-the-users-monitor").style,
        mainImgHeight:      0,
        mainImgTopMargin:   0,
        textElement: 	    document.getElementById("understand-the-users-text-element").style,
        textElemHeight:     0,
        mainImgPlaceholder: document.getElementById("monitor-placeholder").style,
        animItems: { 
          wrapper: 		    document.getElementById("understand-the-users-animation-items").style,
          leftCoach: 	    document.getElementById("understand-the-users-coach-left").style,
          rightCoach: 	    document.getElementById("understand-the-users-coach-right").style,
          medBag:	 	    document.getElementById("understand-the-users-medbag").style,
          player: 		    document.getElementById("understand-the-users-player").style
        }
      } 
	  this.designConcept = { // 5th Slide (Index: 4)
        sketchbook:         document.getElementById("design-concept-sketchbook").style,
		sketchbookHeight:   0
	  }
      this.developDesign = { // 6th Slide (index 5)
        tabletFrame:            document.getElementById("layered-tablet-frame").style,
        tfHeight:               0,
        tfWinButton:            document.getElementById("tablet-button").style,
        tfSqButton:             document.getElementById("tablet-sq-button").style,
        handImg:                document.getElementById("tablet-hand-image").style,
        handFinalLeftCtr:       0,
        handContainer:          document.getElementById("tablet-hand-image-container").style,
        wireframesLayered:      document.getElementById("develop-design-wireframes-layered").style,
        conceptLayers: {
		  wireframeSketch:      document.getElementById("layered-wireframe").style,
          wireframeMockup:      document.getElementById("layered-mockup").style,
          developMockup:        document.getElementById("layered-develop-container").style,
          developMockupInner:   document.getElementById("layered-develop").style,
          developMockupTop:     document.getElementById("layered-develop-top").style,
          testValidate:         document.getElementById("layered-validate").style
		}
      }
      this.implementSupport = {
        assetsLayered:          document.getElementById("implement-support-assets-layered").style,
        assetsFrame:            document.getElementById("assets-tablet-frame").style,
        codeSample:             document.getElementById("assets-frame-code-sample").style,
        smallCourt:             document.getElementById("small-court").style,
        floatingAssets: {
          backButton : {
            element:            document.getElementById("asset-backbutton"),
            finalLeft:          0,
            iLeftMultiplier:    -1.1,
            finalTop:           0,
            iTopMultiplier:     -1.2,
            origHeight:         20,
            rotate:             2
          },
          playerBody : {
            element:            document.getElementById("asset-body"),
            finalLeft:          0,
            iLeftMultiplier:    1.6,
            finalTop:           0,
            iTopMultiplier:     -1.1,
            origHeight:         341,
            rotate:             1
          },
          ball : {
            element:            document.getElementById("asset-ball"),
            finalLeft:          0,
            iLeftMultiplier:    -1.25,
            finalTop:           0,
            iTopMultiplier:     0,
            origHeight:         45,
            rotate:             0
          },
          flipBodyIcon : {
            element:            document.getElementById("asset-flipbody"),
            finalLeft:          0,
            iLeftMultiplier:    1.2,
            finalTop:           0,
            iTopMultiplier:     -1.6,
            origHeight:         22,
            rotate:             1
          },
          playerPhoto : {
            element:            document.getElementById("asset-photo"),
            finalLeft:          0,
            iLeftMultiplier:    0,
            finalTop:           0,
            iTopMultiplier:     .5,
            origHeight:         78,
            rotate:             0
          },
          health1 : {
            element:            document.getElementById("asset-health-1"),
            finalLeft:          0,
            iLeftMultiplier:    -1.25,
            finalTop:           0,
            iTopMultiplier:     -1,
            origHeight:         15,
            rotate:             2
          },
          health2 : {
            element:            document.getElementById("asset-health-2"),
            finalLeft:          0,
            iLeftMultiplier:    -0.62,
            finalTop:           0,
            iTopMultiplier:     -1.2,
            origHeight:         15,
            rotate:             1
          },
          health3 : {
            element:            document.getElementById("asset-health-3"),
            finalLeft:          0,
            iLeftMultiplier:    -0.55,
            finalTop:           0,
            iTopMultiplier:     -0.57,
            origHeight:         15,
            rotate:             2
          },
          mail : {
            element:            document.getElementById("asset-mail"),
            finalLeft:          0,
            iLeftMultiplier:    -1,
            finalTop:           0,
            iTopMultiplier:     -0.85,
            origHeight:         10,
            rotate:             2
          },
          phone : {
            element:            document.getElementById("asset-phone"),
            finalLeft:          0,
            iLeftMultiplier:    0.3,
            finalTop:           0,
            iTopMultiplier:     -1.2,
            origHeight:         14,
            rotate:             1
          },
          injuryMarker : {
            element:            document.getElementById("asset-injurymarker"),
            finalLeft:          0,
            iLeftMultiplier:    1.7,
            finalTop:           0,
            iTopMultiplier:     0.2,
            origHeight:         11,
            rotate:             2
          }
        }
      },
      this.successStory = {
        tabletFrame:          document.getElementById("assets-container-tablet-frame").style,
        assetsBackgroundImage:document.getElementById("assets-background-image").style,
        backgroundContainer:  document.getElementById("success-story-background-container").style,
        backgroundImage:      document.getElementById("success-story-background").style
      }
      
	  util.log(this);
      return this;
    }
  
  util = {
  
    /**
     * Following takes & manipulate complete data object to update all sizes.
     **/
    updateAllSizing: function(dataObj){
      for (var key in dataObj.elements){
        if (!dataObj.elements.hasOwnProperty(key)) continue; // Skip if prototype property.
        dataObj.elements[key].setCurrentHeight();
        dataObj.elements[key].applyTopMargin();
      }
      return dataObj;
    },
    
    /**
     * Returns total height of all elements up to element # elemNumber (0-based index).
     * returnVal is optional, but can be used for direct assignment so that:
     * myValue = util.getHeightsUpTo(data, 2); is same as: util.getHeightsUpTo(data, 2, myValue);
     **/
    getHeightsUpTo: function(dataObj, elemNumber, returnVal){
      returnVal = 0;
      for (elemNumber; elemNumber >= 0; elemNumber--){
        returnVal += dataObj.elements[elemNumber].height;
      }
      return returnVal;
    },
    
    /**
     * frR, frG, frB    : From RGB color values.
     * toR, toG, toB    : To RGB color values (0-255 each).
     * distRatio        : Position (range 0-1) of color transition phase.
     **/
    getRGBColorTransition: function(frR, frG, frB, toR, toG, toB, distRatio, alpha){
      if (distRatio == null) distRatio = 1;
      if (distRatio < 0) distRatio = 0;
      if (distRatio > 1) distRatio = 1;
      if (alpha != null) {
        if (alpha <= 0) return "transparent";
        if (alpha > 1) alpha = 1;
        return "rgba("
          + Math.floor((toR - frR) * distRatio + frR) + ","
          + Math.floor((toG - frG) * distRatio + frG) + ","
          + Math.floor((toB - frB) * distRatio + frB) + ","
          + alpha + ")";
      }
      return "rgb("
        + Math.floor((toR - frR) * distRatio + frR) + ","
        + Math.floor((toG - frG) * distRatio + frG) + ","
        + Math.floor((toB - frB) * distRatio + frB) + ")";
    },
    
    adjustDynImgSizes: function(dataObj, images, heightVal){
      images = $(".dyn-height");
      if (window.innerHeight < 900) {
        images.each(function(){
          heightVal = $(this).attr("origHeight");
          this.style.height = (heightVal > (window.innerHeight / 1.75) ? window.innerHeight : heightVal) / 1.75 + "px";
          this.style.width = "auto";
        });
      } else {
        images.each(function(){
          heightVal = $(this).attr("origHeight");
          this.style.height = heightVal + "px";
        });
      }	  
	  return;
    },
    adjustJSCentering: function(dataObj, images){
      objects = $('.js-center');
      objects.each(function(){
        this.style.left = Math.round((document.body.clientWidth - $(this).outerWidth())/2) + "px";
      });
    },
	getOriginalImg: function(imgElement, newImg) { // Source: StackOverFlow ('FDisk').
      newImg = new Image();
      newImg.src = (imgElement.getAttribute ? imgElement.getAttribute("src") : false) || imgElement.src;
      return newImg;
    },
    
    log: function(msg){
      if (!settings.debug) return false;
      try {
        if (console){
          console.log(msg);
          return true;
        } else return false;
      } catch (e) {
        return false;
      }
    }
  }
  
  
  preInit();
  window.onload = init;
  
  

});