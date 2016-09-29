var CameraFeed = Class.create({
  initialize: function(datalink, options){
    this.datalink = datalink

    this.options = options || {}
    this.cameraData = []
    this.selectedCameraURL = ""
    this.selectedCameraName = ""
    this.initializeDatalink()
    this.initializeObservers()
    this.initializeImageRefresh()
  },

  initializeDatalink: function(){
    setInterval(function(){
      this.datalink.getCameraList(this.updateCameraList.bind(this))
    }.bind(this), 1000);
  },

  initializeImageRefresh: function(){
    setInterval(function(){
      if(!this.hasSelectedCamera()){ return }
      this.options.cameraImage.src = this.options.cameraImage.getAttribute('data-base-url') + "?" + (Date.now() + Math.floor((Math.random() * 100) + 1))
    }.bind(this), 1000);
  },

  initializeObservers: function(){
    this.options.cameraList.observe('click', function(event){
      var clickedButton = event.findElement('button');
      if (clickedButton) {
        this.selectCameraAndHideList(
          clickedButton.getAttribute("data-image-name"),
          clickedButton.getAttribute("data-image-url")
        )
      }
    }.bind(this))

    this.options.showCameraList.observe('click', this.toggleCameraList.bind(this))
  },

  hasSelectedCamera: function(){
    return this.selectedCameraURL != ""
  },

  setSelectedCamera: function(name, image_url){
    this.selectedCameraName = name
    this.selectedCameraURL = image_url
    this.options.cameraName.update(this.selectedCameraName)
    this.options.cameraImage.setAttribute('src', this.selectedCameraURL)
    this.options.cameraImage.setAttribute('data-base-url',this.selectedCameraURL)
  },

  selectCameraAndHideList: function(name, image_url){
    this.setSelectedCamera(name, image_url)
    this.hideCameraList()
  },

  hideCameraList: function(){
    this.options.cameraListContainer.addClassName('hidden')
  },

  showCameraList: function(){
    this.options.cameraListContainer.removeClassName('hidden')
  },

  toggleCameraList: function(){
    this.options.cameraListContainer.toggleClassName('hidden')
  },

  updateCameraList: function(data){
    // console.log(data)
    var sortedData = data.sort(function(a,b){
      //the flight camera should always be on top
      if(a.name == "TelemachusFlightCamera"){
        return -1
      }

      //otherwise, compare normally
      return a.name.localeCompare(b.name);
    });

    //clear existing child nodes in camera list
    while (this.options.cameraList.hasChildNodes()){
      this.options.cameraList.removeChild(this.options.cameraList.lastChild);
    }

    for (var i = 0; i < sortedData.length; i++) {
      var cameraObject = sortedData[i]

      if(!this.hasSelectedCamera()){
        this.setSelectedCamera(cameraObject.name, cameraObject.url)
      }

      var docFragment = document.createDocumentFragment()
      var li = document.createElement('li')
      var selectCamera = document.createElement("button")
      selectCamera.setAttribute('data-image-name', cameraObject.name)
      selectCamera.setAttribute('data-image-url', cameraObject.url)
      if(this.selectedCameraURL == cameraObject.url){
        selectCamera.addClassName("selected")
      }
      selectCamera.update(cameraObject.name)

      li.appendChild(selectCamera)
      docFragment.appendChild(li)
      this.options.cameraList.appendChild(docFragment)
    }

    this.cameraData = sortedData
  }
})