import document from "document";
import clock from "clock";
import { battery } from "power";
import * as fs from "fs";
import asap from "fitbit-asap/app"
import { HeartRateSensor } from "heart-rate";
import { Accelerometer } from "accelerometer";
import { Gyroscope } from "gyroscope";
import * as messaging from "messaging";
import { vibration } from "haptics";
import { me } from "appbit";
import { BodyPresenceSensor } from "body-presence";


me.appTimeoutEnabled=false;

//Converts buffer to a string
function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));

}

//Converts string to buffer
function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

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

//Appends buffer data to a given file
function append(filename, buffer) {
  let fd = fs.openSync(filename, 'a+');

  fs.writeSync(fd, str2ab(buffer));

  fs.closeSync(fd);
}

function clear(filename){
  let open = fs.openSync(filename, 'w');

  fs.writeSync(open, str2ab(""));

  fs.closeSync(open);
}

var stats;
var file;
var temp_read;
var endpoint;
var offset;
var handle;
function initiateTransmit() {
  var ENABLE_OUTPUT=true;

  //figure out how many bytes are in the data file, then read that many bytes and convert from arraybuffer to string
  if (ENABLE_OUTPUT) {
    //asap.clear();
    stats = fs.statSync("datalog.txt");
    file = fs.openSync("datalog.txt", "r");
    temp_read="";


    endpoint=800000000;
    offset=0;
    handle=setInterval(sendData,100);
      
  }
}

function sendData() {
  if (offset < stats.size) {
    console.log("1")
    let abuffer = new ArrayBuffer(1500);
    fs.readSync(file, abuffer, 0, 1500, offset);
    temp_read=ab2str(abuffer);
    downloadStatus.text=offset+":"+stats.size;
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
      console.log(offset+":"+stats.size);
      sendMessage(temp_read);
      offset+=1500;
    }
    else {
      console.log("Waiting for phone connection");
      downloadStatus.text=offset+":"+stats.size;
    }
  }
  else {
    console.log("2")
    downloadStatus.text="Complete";
  }
}

/*
var initiateTransmitDownloadData = false;
var transmitDownloadData = false;
var transmitDownloadDataHandler;
var downloadDataLines;
var downloadDataIndex;
var downloadConfirmation = "unassigned";
var pastDownloadConfirmation = "unassigned";
*/


const hrm = new HeartRateSensor();
const accel = new Accelerometer();
if (Gyroscope) {
const gyro = new Gyroscope();
}
const bps = new BodyPresenceSensor();

var secondsRecorded=0;
var connectionRetryTimer=0; //timer handles resetting the system when in powersave mode
var loggingHandle;
var isLogging=false;
let myClock = document.getElementById("myClock");
let batWarn = document.getElementById("batWarn");
let downloadStatus = document.getElementById("downloadStatus");



function checkTracking() {
	var d = new Date();
	var hr=d.getHours();
	if ((hr >= 20 || hr < 7) && !isLogging) {
	  isLogging=true;
	  hrm.start();
    if (Gyroscope) {
	  gyro.start();
    }
	  accel.start();
	   //bps detects if the device is being worn
	  bps.start()
    loggingHandle=setInterval(function(){
      /*
      if(initiateTransmitDownloadData){
        console.log("I GOT HERE");
        initiateTransmitDownloadData = false;
        transmitDownloadData = true;
        try {
          console.log("INITIATE SAVED DATA TRANSFER");
          // get metadata on the file (we need the file size)
          let fileData = fs.statSync("datalog.txt");
          console.log("Bytes to transmit: " + new String(fileData["size"]));
          // create ArrayBuffer to hold the file contents
          let dataBuffer = new ArrayBuffer(fileData["size"]);
          // read the contents of the file into the ArrayBuffer
          fs.readSync(fs.openSync("datalog.txt", 'r'), dataBuffer, 0, fileData["size"], 0);
          // convert the ArrayBuffer into a string
          let data = String.fromCharCode.apply(null, new Uint16Array(dataBuffer));
          // split the contents by new line
          downloadDataLines = data.split(/\r?\n/);
          // print all lines
          downloadDataLines.forEach((line) => {
              console.log(line);
          });
          downloadDataIndex = 0;
        } catch (err) {
            console.log("ERROR READING datalog.txt");
            console.error(err);
        }
        if ( messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
          console.log("FITBIT -> COMPANION: " + 'DOWNLOAD_ACKNOWLEDGEMENT');
          // Send the data to peer as a message
          messaging.peerSocket.send('DOWNLOAD_ACKNOWLEDGEMENT');
        }
        transmitDownloadDataHandler = setInterval(function(){
          if (pastDownloadConfirmation != downloadConfirmation || downloadConfirmation == "confirm0"){
            if(downloadConfirmation.indexOf("waiting_for_acknowledgement")>-1){
              if ( messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
                // Send the data to peer as a message
                messaging.peerSocket.send('DOWNLOAD_ACKNOWLEDGEMENT');
                return
              }
            }
            console.log(typeof downloadConfirmation);
            console.log(downloadConfirmation);
            console.log(downloadConfirmation.substring(7));
            let confirmationNumber = parseInt(downloadConfirmation.substring(7));
            console.log("Confirmation on line: " + confirmationNumber.toString());
            let message_to_send;
            if(downloadDataLines.length == confirmationNumber){ message_to_send = "EXIT_DOWNLOAD"}
            else{
              message_to_send = downloadDataLines[confirmationNumber]
            }
            if ( messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
              // Send the data to peer as a message
              messaging.peerSocket.send(message_to_send);
            }
            pastDownloadConfirmation = downloadConfirmation;
          }
          else{
            
          }
          
        }, 1000); // TODO: Change to shorter interval once code is functional
      }
      if(transmitDownloadData){
        return;
      }
      */
      
      //Check the time, if it is after 7 AM and before 8 PM then we shouldn't be transmitting
      var d = new Date();
	    var hr=d.getHours();
      if (hr < 20 && hr >= 7) {
        me.exit(); //this will automatically reinitialize the app, forcing transmission to turn off
      }
      
      
	    if (bps.present) { //only do this if the device is being worn
        secondsRecorded++;
 
        var hr=0;
        //In case HR sensor is unable to record
        if (!(hrm.heartRate == null)) {
	        hr=hrm.heartRate;
        }
        let current_accel = [accel.x, accel.y, accel.z]
        if (Gyroscope) {
        let current_gyro = [gyro.x, gyro.y, gyro.z]
        }
        else {
          let current_gyro = [0, 0, 0]
        }
        let current_aqTime = new Date().valueOf()
        let current_charge = battery.chargeLevel
        /*
        var fileDataToSend = hr+","+"0.00"+","+"0.00"+","+"0.00"+","+
                             "0.00"+","+"0.00"+","+"0.00"+","+
                              secondsRecorded+","+current_aqTime+","+current_charge+"\n";
        append("datalog.txt", fileDataToSend);
        */
        
        
        //Data to transmit to phone
        var dataToSend={"hr":hr,
                        "accx":current_accel[0],"accy":current_accel[1],"accz":current_accel[2],
                        "gyrox":current_gyro[0],"gyroy":current_gyro[1],"gyroz":current_gyro[2],
                        "seconds":secondsRecorded,"aqTime":current_aqTime,"b":current_charge};

        //If socket is open and ready to send data, send the data
        if ( messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
          // Send the data to peer as a message
          messaging.peerSocket.send(dataToSend);
        }
        else { //If socket is not open and ready to send data, try to save data to local file "datalog.txt"
          /*
          messaging.peerSocket.send(dataToSend);
         
          
	        try {
            //Data to save to file
            dataToSend = hr+","+current_accel[0].toFixed(2)+","+current_accel[1].toFixed(2)+","+current_accel[2].toFixed(2)+","+
                        current_gyro[0].toFixed(2)+","+current_gyro[1].toFixed(2)+","+current_gyro[2].toFixed(2)+","+
                        secondsRecorded+","+current_aqTime+","+current_charge+"\n";
            console.log("Wrote data to buffer");
	          append("datalog.txt",dataToSend);
	        }
          catch (error) {
	          console.log("Buffer error");
          }*/
          if (secondsRecorded >= 10) { //Reset FitBit application if socket is not open to sending data (connection broken)
            me.exit(); //since this is a clockface, will reinitialize and hopefully fix the connection
          }
        }
	    }
    }, 1000); //Data is either transmitted or saved every second on repeat.
  }
else { //device is not in the logging window, that means we should just periodically restart the connection every 10 mins or so 
if( messaging.peerSocket.readyState !== messaging.peerSocket.OPEN && connectionRetryTimer >= 10) {
	me.exit(); //reset the watchface if not recording data, and it has been more than 10 minutes since we last reset
}
connectionRetryTimer++;
}	
}
checkTracking();
setInterval(checkTracking,60*1000);


function firstSaveDataMessage(){
  var d = new Date();
	var hr=d.getHours();
	if ((hr < 21 && hr >= 7) && !isLogging) {
    var data = {
      SAVEDDATASERVER: "ping"
    }
    setTimeout(() => {
      if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) { //If socket is open
        // Send the data to peer as a message
        messaging.peerSocket.send(data);
        return;
      }
    }, 3000);
  }
  else{
    setTimeout(() => {
      firstSaveDataMessage();
    }, 10000)
  }
}

function sendSaveDataMessage(signal){
  setTimeout(() => {
    var data = {
      SAVEDDATASERVER: signal
    }
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) { //If socket is open
      // Send the data to peer as a message
      messaging.peerSocket.send(data);
      console.log("FITBIT -> COMPANION: " + signal);
    }
  }, 1);
}

var lines;
var lineNumber;
function setLines(){
  let fileData = fs.statSync("datalog.txt");
  //console.log("Bytes to transmit: " + new String(fileData["size"]));
  // create ArrayBuffer to hold the file contents
  let dataBuffer = new ArrayBuffer(fileData["size"]);
  // read the contents of the file into the ArrayBuffer
  fs.readSync(fs.openSync("datalog.txt", 'r'), dataBuffer, 0, fileData["size"], 0);
  // convert the ArrayBuffer into a string
  let data = String.fromCharCode.apply(null, new Uint16Array(dataBuffer));
  // split the contents by new line
  lines = data.split(/\r?\n/);
}

function clearLines(){
  lines = undefined;
  clear("datalog.txt");
}

function savedDataServerCall(command){
  /*
  console.log(command);
  setTimeout(() => {
    sendSaveDataMessage("RECEIVED");
  }, 1000);
  */
 
 if(command.indexOf("PASS")>-1){
    setTimeout(() => {
      sendSaveDataMessage("PASSED");
    }, 1000);
 }
 else if(command.indexOf("INITIATE")>-1){
   try{
     setLines();
     sendSaveDataMessage("SUCCESS");
   } catch{
     sendSaveDataMessage("FAILURE");
     me.exit();
   }
 }
 else if(command.indexOf("LINE")>-1){
   lineNumber = parseInt(command.split("_")[1]);
   if(!(typeof lines !== 'undefined')){
      sendSaveDataMessage("LINE_" + lineNumber.toString() + "_INIT");
   }
   else if(lineNumber >= lines.length-1){
     setTimeout(() => {
      setLines();
      if(lineNumber >= lines.length-1){
        sendSaveDataMessage("LINE_" + lineNumber.toString() + "_EXIT");
      }
      else{
        sendSaveDataMessage("LINE_" + lineNumber.toString() + "_DATA_" + lines[lineNumber]);
      }
     }, 3000);
   }
   else{
      sendSaveDataMessage("LINE_" + lineNumber.toString() + "_DATA_" + lines[lineNumber]);
   }
 }
 else if(command.indexOf("CLEAR")>-1){
   try{
    clearLines();
    sendSaveDataMessage("SUCCESS");
   }
   catch (err){
     console.error(err);
     sendSaveDataMessage("FAILURE");
   }
 }
 else{
   sendSaveDataMessage("ERROR");
 }
}


firstSaveDataMessage();

//LISTENER FOR WHEN SETTINGS ARE CHANGED IN FITBIT APP ON PHONE
messaging.peerSocket.onmessage = function(evt) {

  if (JSON.stringify(evt.data).indexOf("SAVEDDATASERVER") > -1) {
	  savedDataServerCall(evt.data["SAVEDDATASERVER"]);
  }

  if (JSON.stringify(evt.data).indexOf("download") > -1) {
	  initiateTransmit();
  }

  //If message is "download"
  //Transmits data
  if (JSON.stringify(evt.data).indexOf("download") > -1) {
	  initiateTransmit();
  }
 
  /*
  if (JSON.stringify(evt.data).indexOf("start_transmit") > -1) {
    console.log("CAUGHT INITIATE DOWNLOAD SIGNAL FROM PHONE");
    initiateTransmitDownloadData = true;
  }
  if (JSON.stringify(evt.data).indexOf("confirm") > -1 || JSON.stringify(evt.data).indexOf("waiting_for_acknowledgement") > -1) {
    downloadConfirmation = evt.data["message"];
  }
  */
  
  if (JSON.stringify(evt.data).indexOf("INITIATE_TRANSMIT") > -1) {
   initiateSavedDataTransmit();
  }


  //If message is "ping"
  //Simply used to check the connection of the phone and the device
  if (JSON.stringify(evt.data).indexOf("ping") > -1) {
	  console.log("ping");
  }

  
  //If message is "delete"
  //Deletes the "datalog.txt" file 
  if (JSON.stringify(evt.data).indexOf("delete") > -1) {
	  downloadStatus.text="Clearing...";
	  try {
	    fs.unlinkSync("datalog.txt"); //deletes the datalog
	  }
	  catch (err) {
		  
	  }
	  me.exit();
  }
}





//SETS UP CLOCK DISPLAY:
clock.granularity = 'minutes'; // seconds, minutes, hours
clock.ontick = function(evt) {
	
	//check battery 
	if (battery.chargeLevel < 20) {
		batWarn.text="BATTERY LOW";
	}
	else {
		batWarn.text="";
	}
	var hours=evt.date.getHours();
	if (hours > 12) {
		hours = hours - 12;
  }
  myClock.text = ("0" + hours).slice(-2) + ":" + ("0" + evt.date.getMinutes()).slice(-2);			  
}
//FINISHED SETTING UP CLOCK DISPLAY