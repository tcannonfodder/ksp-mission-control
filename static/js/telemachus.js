var Telemachus = Class.create({
  initialize: function(host, port){
    this.updateConnection(host, port)
    this.receiverFunctions = []
    this.subscribedFields = {}
    this.orbitingBodies = this.getOrbitalBodies()
    this.rate = 500

    this.loopTimeout = setTimeout(this.poll.bind(this), this.rate)
  },

  url: function(){
    return "http://" + this.host + ":" + this.port + "/telemachus/datalink"
  },

  updateConnection: function(host, port){
    this.host = host
    this.port = port
  },

  addReceiverFunction: function(func){
    this.receiverFunctions.push(func)
  },

  subscribeToData: function(fields){
    for (var i = fields.length - 1; i >= 0; i--) {
      var field = fields[i]
      this.subscribedFields[field] = field
    };
  },

  dispatchMessages: function(data){
    for (var i = this.receiverFunctions.length - 1; i >= 0; i--) {
      try{
        this.receiverFunctions[i](data)
      } catch(e){
        console.error(e)
      }
    };
  },

  send: function(message){
    this.socket.send(JSON.stringify(message))
  },

  getOrbitalBodyInfo: function(name){
    var properties = this.orbitingBodies[name]

    if(properties){
      return Object.extend({name: name}, properties)
    } else{
      return null
    }
  },

  notifyIfLOS: function(request){
    if(request.transport.status == 0){
      document.fire('telemachus:loss-of-signal')
      return true
    }
    return false
  },

  prepareParams: function(params){
    var normalizedParams = []
    Object.keys(params).forEach(function(field){
      var sanitizedFieldName = field.replace("[", "{").replace("]","}")
      normalizedParams.push(sanitizedFieldName + "=" + field)
    })
    return normalizedParams
  },

  convertData: function(rawData){
    var data = {}
    var startBracesRegexp = /\{/g
    var endBracesRegexp = /\}/g

    Object.keys(rawData).forEach(function(key){
      var convertedFieldName = key.replace(startBracesRegexp, "[").replace(endBracesRegexp, "]")
      data[convertedFieldName] = rawData[key]
    })

    return data
  },

  poll: function(){
    var params = this.prepareParams(this.subscribedFields)
    var requestURL = this.url() + "?" + params.join("&")

    new Ajax.Request(requestURL, {
      method: "get",
      onSuccess: function(response){
        var rawData = JSON.parse(response.responseText)
        var data = this.convertData(rawData)

        this.dispatchMessages(data)
      }.bind(this),
      onException: this.notifyIfLOS.bind(this),
      onComplete: function(response){
        setTimeout(this.poll.bind(this),this.rate);
      }.bind(this)
    })
  },

  sendMessage: function(params, callback){
    new Ajax.Request(this.url(), {
      method: "post",
      postBody: JSON.stringify(params),
      // parameters: params,
      onSuccess: function(response){
        var rawData = JSON.parse(response.responseText)
        var data = this.convertData(rawData)
        callback(data)
      }.bind(this),
      onException: this.notifyIfLOS.bind(this)
    })
  },

  cameraURL: function(){
    return "http://" + this.host + ":" + this.port + "/telemachus/cameras"
  },

  getCameraList: function(callback){
    new Ajax.Request(this.cameraURL(), {
      method: "get",
      // parameters: params,
      onSuccess: function(response){
        var data = JSON.parse(response.responseText)
        callback(data)
      }.bind(this),
      onException: this.notifyIfLOS.bind(this)
    })
  },

  getOrbitalBodies: function(){
    return {
      "Sun" : {
        id: 0,
        referenceBodyName: null,
        mapBody: null,
        atmosphericRadius: 0,
        color: '#FFFF00',
        surfaceGravity: 17.1 //m/s^2,
      },
      "Kerbin" : {
        id: 1,
        referenceBodyName: "Sun",
        mapBody: L.KSP.CelestialBody.KERBIN,
        atmosphericRadius: 70000,
        color: '#4a5472',
        surfaceGravity: 9.81 //m/s^2
      },
      "Mun" : {
        id: 2,
        referenceBodyName: "Kerbin",
        mapBody: L.KSP.CelestialBody.MUN,
        atmosphericRadius: 0,
        color: '#e2e0d7',
        surfaceGravity: 1.63 //m/s^2
      },
      "Minmus" : {
        id: 3,
        referenceBodyName: "Kerbin",
        mapBody: L.KSP.CelestialBody.MINMUS,
        color: '#98f2c5',
        atmosphericRadius: 0,
        surfaceGravity: 0.491 //m/s^2
      },
      "Moho" : {
        id: 4,
        referenceBodyName: "Sun",
        mapBody: L.KSP.CelestialBody.MOHO,
        atmosphericRadius: 0,
        color: '#fdc39e',
        surfaceGravity: 2.70 //m/s^2
      },
      "Eve" : {
        id: 5,
        referenceBodyName: "Sun",
        mapBody: L.KSP.CelestialBody.EVE,
        atmosphericRadius: 90000,
        color: '#c394fe',
        surfaceGravity: 16.7 //m/s^2
      },
      "Duna" : {
        id: 6,
        referenceBodyName: "Sun",
        mapBody: L.KSP.CelestialBody.DUNA,
        atmosphericRadius: 50000,
        color: '#fc5e49',
        surfaceGravity: 2.94 //m/s^2
      },
      "Ike" : {
        id: 7,
        referenceBodyName: "Duna",
        mapBody: L.KSP.CelestialBody.IKE,
        atmosphericRadius: 0,
        color: '#e2e0d7',
        surfaceGravity: 1.10 //m/s^2
      },
      "Jool" : {
        id: 8,
        referenceBodyName: "Sun",
        mapBody: L.KSP.CelestialBody.JOOL,
        atmosphericRadius: 200000,
        color: '#C5DCAB',
        surfaceGravity: 7.85 //m/s^2
      },
      "Laythe" : {
        id: 9,
        referenceBodyName: "Jool",
        mapBody: L.KSP.CelestialBody.LAYTHE,
        atmosphericRadius: 50000,
        color: '#a8b4fe',
        surfaceGravity: 7.85 //m/s^2
      },
      "Vall" : {
        id: 10,
        referenceBodyName: "Jool",
        mapBody: L.KSP.CelestialBody.VALL,
        atmosphericRadius: 0,
        color: '#b0f4fe',
        surfaceGravity: 2.31 //m/s^2
      },
      "Bop" : {
        id: 11,
        referenceBodyName: "Jool",
        mapBody: L.KSP.CelestialBody.BOP,
        atmosphericRadius: 0,
        color: '#c64605',
        surfaceGravity: 0.589 //m/s^2
      },
      "Tylo" : {
        id: 12,
        referenceBodyName: "Jool",
        mapBody: L.KSP.CelestialBody.TYLO,
        atmosphericRadius: 0,
        color: '#fdf7ed',
        surfaceGravity: 7.85 //m/s^2
      },
      "Gilly" : {
        id: 13,
        referenceBodyName: "Eve",
        mapBody: L.KSP.CelestialBody.GILLY,
        atmosphericRadius: 0,
        color: '#fdcbb1',
        surfaceGravity: 0.049 //m/s^2
      },
      "Pol" : {
        id: 14,
        referenceBodyName: "Pol",
        mapBody: L.KSP.CelestialBody.POL,
        atmosphericRadius: 0,
        color: '#fec681',
        surfaceGravity: 0.373 //m/s^2
      },
      "Dres" : {
        id: 15,
        referenceBodyName: "Sun",
        mapBody: L.KSP.CelestialBody.DRES,
        atmosphericRadius: 0,
        color: '#fef8f9',
        surfaceGravity: 1.13 //m/s^2
      },
      "Eeloo" : {
        id: 16,
        referenceBodyName: "Sun",
        mapBody: L.KSP.CelestialBody.EELOO,
        atmosphericRadius: 0,
        color: '#e5fafe',
        surfaceGravity: 1.69 //m/s^2
      }
    }
  }
})