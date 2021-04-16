// Import the messaging module
import * as messaging from "messaging";
import { me } from "companion"

import { inbox } from "file-transfer";
import { settingsStorage } from "settings";
import { scientific } from "scientific";
import * as neural from "./modelv3.js"


//neural net settings
var hrHistory=[];  //buffers for historical data
var gyroHistory=[];
var accHistory=[];
var hrLong=[];

var remHist=[]; //previous predictions
var swsHist=[];
var wakeHist=[];

//Sends a simple message to the companion
function sendMessage(data) {
  // Sample data
  var data = {
    message: data
  }
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) { //If socket is open
    // Send the data to peer as a message
    messaging.peerSocket.send(data);
  }
}



//ping the device and try to keep everything awake 

 setInterval(function(){ 
var data = {};
  data["ping"]=1;
   

 }, 10000);


settingsStorage.onchange = function(evt) {
  // Which setting changed
  console.log("key: " + evt.key)
  sendMessage(""+evt.key);
  settingsStorage.clear();
}



function transferData() {
	console.log("Data transfer requested");
}





// Helper
const MILLISECONDS_PER_MINUTE = 1000 * 60

// Wake the Companion after 30 minutes
me.wakeInterval = 6 * MILLISECONDS_PER_MINUTE;


//stats functions

function sd2(numbersArr) {
    //--CALCULATE AVERAGE--
    var total = 0;
    for(var key in numbersArr) 
       total += numbersArr[key];
    var meanVal = total / numbersArr.length;
    //--CALCULATE AVERAGE--
  
    //--CALCULATE STANDARD DEVIATION--
    var SDprep = 0;
    for(var key in numbersArr) 
       SDprep += Math.pow((parseFloat(numbersArr[key]) - meanVal),2);
    return  Math.sqrt(SDprep/(numbersArr.length-1));
}

function standardDeviation(values){
  var avg = average(values);
  
  var squareDiffs = values.map(function(value){
    var diff = value - avg;
    var sqrDiff = diff * diff;
    return sqrDiff;
  });
  
  var avgSquareDiff = average(squareDiffs);

  var stdDev = Math.sqrt(avgSquareDiff);
  return stdDev;
}

function average(data){
  var sum = data.reduce(function(sum, value){
    return sum + value;
  }, 0);

  var avg = sum / data.length;
  return avg;
}

function sumAbs(data){
  var sum = data.reduce(function(sum, value){
    return sum + Math.abs(value);
  }, 0);

  return sum;
}


function range(start, stop, step){
    var result = [];
    for (var i=start; i < stop; i+=step){
        result.push(i);
    }
    return result;
}


function vslice(data,winsize) {
    var avg=[];
	//console.log(""+data.length);
	var idx= range(0,data.length,winsize);
	
  for (var item=0; item < idx.length; item++) {
		//console.log(item);
    //var temp=data.slice([idx[item],idx[item]+winsize);
		var temp=data.slice(idx[item],idx[item]+winsize);
		
    if (temp.length == winsize) {
                avg.push(sd2(temp));
	  }
	}
    return avg
}
/*
function sendMessage(data) {
  // Sample data
  var data = {
    message: data
  }
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) { //If socket is open
    // Send the data to peer as a message
    messaging.peerSocket.send(data);
  }
}

function sendSDServer(){

}
*/
var message;
function querySavedDataServer(signal){
  console.log("COMPANION -> PHONE: " + signal);
  fetch("http://127.0.0.1:9000/rawdata?data="+signal).then(res => {message = res.headers.get('Content-Type')});
  //fetch("http://192.168.1.202:9000/rawdata?data="+signal).then(res => {message = res.headers.get('Content-Type')});
  //console.log("MESSAGE: " + message);
  return message;
}

function transmitSavedDataServerCommand(command){
  let data = {"SAVEDDATASERVER": command}
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    console.log("COMPANION -> FITBIT: " + command);
    messaging.peerSocket.send(data);
    return true;
  }
  else{
    return false;
  }
}

var isReqToQuery = false;
var reqToQuery;
//It's really a query response, not a query, bus Res & Req are too similar, and QueryReq is too long
var isQueryToTransmit = false;
var queryToTransmit;
var isCurrentRequestSDR = false; //Is current request a request for the saved data server?
var currentlyRunning = false;


//UNFINISHED AND UNIMPLEMENTED
function checkForLine(request){
  if(request.indexOf("LINE") > -1){
    let brokenUp = request.split("_")
    brokenUp = brokenUp[brokenUp.length-1].split(",");
    let inputData = {};

    
  }
  else{
    return request;
  }
}

messaging.peerSocket.onmessage = function(evt) {
  /*
  if(JSON.stringify(evt.data).indexOf("SAVEDDATASERVER") > -1 || responseMade){
    console.log("ATTEMPTING CONNECTION");
    if (responseMade){
      let signal = evt.data["SAVEDDATASERVER"];
      console.log(evt.data);
      console.log("SIGNAL: " + signal);
      
    }
    responseMade = true;
    if(message != null){
      let data = {
        SAVEDDATASERVER: message
      };
      if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) { //If socket is open
        // Send the data to peer as a message
        messaging.peerSocket.send(data);
        console.log("sent");
        responseMade = false;
      }
    }
  }
  if(JSON.stringify(evt.data).indexOf("SAVEDDATASERVER") > -1){
    return;
  }
  */
  if(!currentlyRunning){
    currentlyRunning = true;
    if(JSON.stringify(evt.data).indexOf("SAVEDDATASERVER") > -1){ //If there is a valid request to query
      if(isReqToQuery){
        log.error("There is already one request pending valid query...");
      }
      isReqToQuery = true;
      reqToQuery = evt.data["SAVEDDATASERVER"];
      isCurrentRequestSDR = true;
    }
  
    if(isReqToQuery){
      queryToTransmit = querySavedDataServer(reqToQuery);
      if(queryToTransmit != null){ //If query obtained valid response
        //Set according variable to True
        isQueryToTransmit = true;
        //As request has been queried, there is no longer a request to query
        isReqToQuery = false;
        reqToQuery = null;
      }
    }
  
    if(isQueryToTransmit){
      let transmitReport = transmitSavedDataServerCommand(queryToTransmit);
      if(transmitReport === true){ //query was transmitted without error
        //As query response 
        isQueryToTransmit = false;
        queryToTransmit = null;
      }
    }
  
    if(isCurrentRequestSDR){
      isCurrentRequestSDR = false;
      currentlyRunning = false;
      return;
    }
    currentlyRunning = false;
  }
  

  let data=evt.data;
  
  hrHistory.push(data.hr);
  hrLong.push(data.hr);
  accHistory.push(data.accz);
  gyroHistory.push(data.gyrox);
  
  var result;
  
  if (hrHistory.length > 240) {
    hrHistory.shift();
    gyroHistory.shift();
    accHistory.shift();	
	
	var inData={};
	
	inData['Column 1']=Math.abs(data.accx);
	inData['Column 2']=Math.abs(data.accy);
	inData['Column 3']=Math.abs(data.accz);
	inData['Column 4']=Math.abs(data.gyrox);
	inData['Column 5']=Math.abs(data.gyroy);
	inData['Column 6']=Math.abs(data.gyroz);
	inData['Column 7']=data.hr;
	inData['Column 8']=data.hr;
	inData["Column 9"]=sd2(hrHistory);
	inData["Column 10"]=sumAbs(gyroHistory)/247;
	inData["Column 11"]=sd2(accHistory);
	
	var colNum=12;
	var test=vslice([1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,5,9],20);
	//var test=range(0,10,2);
	//console.log(JSON.stringify(test));
	for (var winsize=10; winsize < 120; winsize=winsize+10) {
		var move=vslice(accHistory,winsize);
		var heart=vslice(hrHistory,winsize);
	
		
		for (var slice=0; slice < move.length;slice++) {
			inData["Column "+colNum]=heart[slice];
			colNum++;
			inData["Column "+colNum]=move[slice];
			colNum++;
		}
	}
	
	result=(neural.score(inData,{}));
	console.log("Neural:"+JSON.stringify(inData));
  }

	
	
  try {
    /*
    console.log("COMPANION -> PHONE: " + encodeURIComponent(JSON.stringify(data))+"STAGE"+encodeURIComponent(JSON.stringify(result)));
    fetch("http://192.168.1.202:8085/rawdata?data="+encodeURIComponent(JSON.stringify(data))+"STAGE"+encodeURIComponent(JSON.stringify(result)))
      .then(res => { message = res.headers.get('Content-Type')});
    console.log("PHONE -> COMPANION: " + message);
    */
    //const response = await fetch("http://192.168.1.202:8085/rawdata?data="+encodeURIComponent(JSON.stringify(data))+"STAGE"+encodeURIComponent(JSON.stringify(result)));
    //console.log("Message back:");
    //console.log(response);
  //fetch("http://192.168.1.202:8085/rawdata?data="+encodeURIComponent(JSON.stringify(data))+"STAGE"+encodeURIComponent(JSON.stringify(result)));  //send fitbit raw data to local server on port 8085
  console.log(JSON.stringify(data));
  fetch("http://127.0.0.1:8085/rawdata?data="+encodeURIComponent(JSON.stringify(data))+"STAGE"+encodeURIComponent(JSON.stringify(result)));  //send fitbit raw data to local server on port 8085

  }
  catch (error) {}
  /*
  if(message === "download"){
    console.log("COMPANION -> FITBIT: " + "start_transmit");
    sendMessage("start_transmit")
  }
  if(message.indexOf("confirm")>-1 || message.indexOf("waiting_for_acknowledgement") > -1){
    console.log("COMPANION -> FITBIT: " + message);
    sendMessage(message)
  }
  */

  //handleDownload();
}
/*
var ping = true;
var message;
function handleDownload(){
  if(ping){ handlePing(); return; }
  else{
    console.log("ping received");
  }
}

function handlePing(){
  console.log("COMPANION -> PHONE: ping");
  let pingResponse = sendSignal("ping");
  if(typeof pingResponse !== 'undefined' && pingResponse.indexOf("INITIATE_TRANSMIT") > -1){
    ping = false; // no more pinging
    // Tell the Fitbit to start sending signals
    sendMessage("INITIATE_TRANSMIT");
  }
  else{
    ping = true;
  }
}

function sendSignal(signal){
  fetch("http://192.168.1.202:9000/rawdata?data="+signal).then(res => {message = res.headers.get('Content-Type')});
  console.log("PHONE -> COMPANION: " + message);
  return message
}
*/