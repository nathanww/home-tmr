# home-tmr

This respository contains code for the Cognitive Neuroscience Lab home TMR project

_Note!_ As of 4/6/21 we have changed the way sounds are configured in the project. This document reflects the current method.

# Directories
**App**--Android Studio project containing the smartphone app

**fitbit**--Fitbit OS project

**spatialTask**--a simple spatial memory task for Android. Integrates with smartphone app



# Basic setup
* [Download](https://github.com/nathanww/home-tmr/blob/master/app/release/app-release.apk?raw=true) and install the Android app (or compile it)
* Install the Fitbit app from source or from [here](https://gallery.fitbit.com/details/b91790b8-2076-4686-9c5b-33ec6034495e)
# Basic use
* Make sure the Fitbit is showing the current time. Right now it only transmits data between 21:00 and 7:00 to save power; you can adjust the Fitbit time zone for testing
* Start the FitbitTMR app
* Tap the red button to start white noise. Cues will automaticaly start when cueing criteria are met.
* Keep the phone's screen on. Turn it upside down if needed.
* When done, tap the exit button in the app

# Configuring sounds
Currently the app can only use the precompiled sounds, we are working on a way to add custom sounds

The preferred way to configure sounds is using a text file hosted online, i.e. like this [example Github page](https://raw.githubusercontent.com/nathanww/default_tmr_settings/main/SETTINGS.txt). Cueing is controlled using parameters specified on this page, and then parameters are automatically updated on the phone when the app is started.

The meaning of the parameters is shown below, and the [default file](https://raw.githubusercontent.com/nathanww/default_tmr_settings/main/SETTINGS.txt) can be used as a template with reasonable values:

  * USER_ID: The user these settings apply to. When the phone app is started, it will check for a row matching the USER_ID specified in the app and apply the matching settings.
  * BACKOFF_TIME: minimum waiting time (seconds) after a detected arousal before stimulation can begin again 
  * MAX_STIM: Maximum seconds of TMR per night
  * ONSET_CONFIDENCE: Average probability of stage 3 ,p(s3) must be at least this high for stimulation to occur. Average p(s3) is calcualted as a moving average over the last n seonds of data
  * E_STOP: if any p(s3) is less than this and stimulation is running, it will stop
  * BUFFER_SIZE: how many seconds of data to average
  * ONSET_TIME: minimum waiting time in milliseconds (after the user turns the system on) before it can start giving cues
  * OFFSET_TIME: after this much time (in milliseconds) has elapsed the system will not cue any more until it is restarted
  * ISI: Milliseconds to wait between cues
  * CUE_NOISE_OFFSET: Volume of the cue sounds relative to the volume of the white noise. This will also be affected by the volume specified in the cue sound files, so it may be worth testing (though the default of 0 usually works well)
  * CUE_NOISE_MAX: The volume of cues will gradually increase until it reaches a maximum of white noise volume+CUE_NOISE_MAX. 0 is generally reasonable but other settings may also work
  * VOLUME_INC: How much the cue volume increases each second of cueing. The scale is 0-silent and 1=max volume achievable by the phone.

# Configuring the phone
Once your config file is online you then need to tell the app where to find your settings. Do this by creating a file called experimentConfig.txt on the root of the phone's internal storage.
  * The first line o the file should be the URL to your configuration file
  * The second line (optional) is a web server which can receive HTTP requests with telemtry information. You can specify a custom web server here, or leave it blank to use a default server operated by our lab (more details below)

Once you have saved the file, start the app and set the user ID to match the correct configuration.


 
# Notes

* The app generates several outputs:
  * MediaLog (on the root of the internal storage) lists the sound files played at night, their timestamp, and their volume
  * The app logs raw fitbit sensor data and proability of S3 to a fitbitdata.txt file in the app data directory (Android/data/neurelectrics.zmaxdatacollector)  
* Data are also streamed live to a server; they are sent as an HTTP get request with two arguments:user (the user ID of the phone) and data (the status of the phone). By default this uses a server run by our lab; you can view telemetry by going to biostream-1024.appspot.com/getps?user=[user id] **Note this server is not secured or HIPPAA compliant**.
* TMR cue volume starts at 0 and gradually ramps up to a maximum  value (white noise volume + CUE_NOISE_MAX). If an arousal is detected during TMR, cues are paused, the max volume is lowered by ADAPTATION_STEP, and ramping resumes after a specified number of seconds
* Sound files are currently compiled into the app itself
  
  
# Next steps
We are working to make the app more configurable and generalizable to other experiments (i.e. ability to load custom sound files from storage)
