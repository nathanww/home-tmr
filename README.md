# home-tmr

This respository contains code for the Cognitive Neuroscience Lab home TMR project

# Directories
**App**--Android Studio project containing the smartphone app

**fitbit**--Fitbit OS project

**spatialTask**--a simple spatial memory task for Android. Integrates with smartphone app



# Basic setup
* Install the Android binary on your phone from <dir> or compile and install
* Place the BedtimeTaskLog file on the root of the phone's internal storage
* Install the Fitbit app from source or from [here](https://gallery.fitbit.com/details/b91790b8-2076-4686-9c5b-33ec6034495e)
# Basic use
* Make sure the Fitbit is showing the current time. Right now it only transmits data between 21:00 and 7:00 to save power; you can adjust the Fitbit time zone for testing
* Start the FitbitTMR app
* Tap the red button to start white noise. Cues will automaticaly start when cueing criteria are met.
* Keep the phone's screen on. Turn it upside down if needed.
* When done, tap the exit button in the app

#Notes 
* The app downloads config data from https://github.com/TorinK2/fb_tmr_settings/blob/master/SETTINGS.txt based on user ID. If you set the user ID to a dustom value you can override these settings by editing the modelSettings.txtn file created on the phone
* Meaning of the settings:
  *  BACKOFF_TIME: minimum waiting time after sitmulation is stopped before it can begin again
  * MAX_STIM: Maximum seconds of TMR per night
  * ONSET_CONFIDENCE: Average probability of stage 3 ,p(s3) must be at least this high for stimulation to occur. Average p(s3) is calcualted as a moving average over the last n seonds of data
  * E_STOP: if any p(s3) is less than this and stimulation is running, it will stop
  * BUFFER_SIZE: how many seconds of data to average
