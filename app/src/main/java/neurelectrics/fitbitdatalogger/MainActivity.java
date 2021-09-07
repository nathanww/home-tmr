package neurelectrics.fitbitdatalogger;

import android.Manifest;
import android.app.AlarmManager;
import android.app.AlertDialog;
import android.app.PendingIntent;
import android.bluetooth.BluetoothAdapter;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.content.res.ColorStateList;
import android.graphics.Color;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.AsyncTask;
import android.os.BatteryManager;
import android.os.Build;
import android.os.Environment;
import android.os.Handler;
import android.os.PowerManager;
import android.support.v4.app.ActivityCompat;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.text.InputType;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.CompoundButton;
import android.widget.EditText;
import android.widget.SeekBar;
import android.widget.TextView;
import android.widget.ToggleButton;

import com.github.javiersantos.appupdater.AppUpdater;
import com.github.javiersantos.appupdater.enums.UpdateFrom;
import com.jakewharton.processphoenix.ProcessPhoenix;

import org.apache.commons.math3.stat.descriptive.moment.StandardDeviation;
import org.apache.http.client.methods.HttpPost;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Map;

import fi.iki.elonen.NanoHTTPD;

public class MainActivity extends AppCompatActivity {

    //TMR control variables
    //
    private String USER_ID;
    private String DEFAULT_USER_ID = "DEFAULT";
    private String USER_ID_FILE_NAME = "userID.txt";
    private String DEFAULT_SETTINGS_FILE_NAME = "modelSettings.txt"; //where settings will be cached
    private String DEFAULT_CONFIG_FILE_NAME = "experimentConfig.txt"; //file containing the URL that will be checked to get model settings
    private String DEFAULT_DATA_LINK="https://raw.githubusercontent.com/nathanww/default_tmr_settings/main/SETTINGS.txt"; //Default URL from which to download model settings
    private String TELEMETRY_DESTINATION="https://biostream-1024.appspot.com/sendps?"; //where realtime telemetry data is sent
    float ONSET_CONFIDENCE=0.9f;
    int BUFFER_SIZE = 240;
    float E_STOP=0.85f; //emergency stop cueing
    int BACKOFF_TIME=5*60000;
    int MAX_STIM=2000;
    float CUE_NOISE_OFFSET=0.02f; //how much louder is the cue than the white noise
    float CUE_NOISE_MAX=0.0f; //how much louder can the cues get than white noise
    float MAX_ADAPTION_STEP=0.015f; //If cues seem to trigger a wakeup, drop the max volume we can reach by this much
    long ONSET_DELAY=60*60*1000; //minimumj delay before cues start
    long OFFSET_DELAY=3*60*60*1000;
    int ISI=10000; //inter stimulus interval in ms
    String MODE=""; //for specifiying specific modes like never playing any sound etc
    boolean DEBUG_MODE=false; //if true, app simulates
    long turnedOnTime=0;
    int above_thresh=0;
    double backoff_time=0;
    int stim_seconds=0;
    double lastpacket=0;
    float targetVolume=1.0f;
    float VOLUME_INC=(0.05f/200f);


    fitbitServer server;
    savedDataServer fileServer;
    String fitbitStatus="";
    ToggleButton tmrStateButton;
    MediaPlayer whiteNoise;
    double maxNoise = 0.25;
    Float whiteNoiseVolume = (1.0f * (float) maxNoise);
    Float cueNoise;
    TextView volumeText;
    SeekBar volumeBar;
    SharedPreferences volumePreferences;
    boolean isPlaying=false;
    int ZMAX_WRITE_INTERVAL=60*60; //write zmax data every minute
    String zMaxBuffer="";
    int zMaxCount=0;
    int FITBIT_WRITE_INTERVAL=10; //write fitbit data every 10 minutes
    String fitbitBuffer="";
    int fitbitCount=0;
    String filesList=""; //list of files loaded from Github
    ArrayList<Float> probBuffer=new ArrayList<Float>();


    boolean conFixArm=false; //whether the app can self-restart
    int getWordAt(String[] data,int position) { //get the word (two bytes) from the zMax hex data stream and combine them to make an int
        int data1 = (int) Long.parseLong(data[position], 16); //first two digits are EEG channel 1
        int data2 = (int) Long.parseLong(data[position+1], 16);
        byte d1b = (byte) data1;
        byte d2b = (byte) data2;
        int val = ((d1b & 0xff) << 8) | (d2b & 0xff); //combine two bytes to get an int
        return val;
    }

    public boolean isPluggedIn() {
        Intent intent = this.registerReceiver(null, new IntentFilter(Intent.ACTION_BATTERY_CHANGED));
        int plugged = intent.getIntExtra(BatteryManager.EXTRA_PLUGGED, -1);
        return plugged == BatteryManager.BATTERY_PLUGGED_AC || plugged == BatteryManager.BATTERY_PLUGGED_USB || plugged == BatteryManager.BATTERY_PLUGGED_WIRELESS;
    }


    public String getDeviceName() {
        String manufacturer = Build.MANUFACTURER;
        String model = Build.MODEL;

            return manufacturer+model;

    }

    @Override
    protected void onUserLeaveHint() {
        super.onUserLeaveHint();
        if (conFixArm) {
            Log.e("Datacollector", "Restarting");
            Intent intent = new Intent(MainActivity.this, MainActivity.class);
            PendingIntent pendingIntent = PendingIntent.getActivity(MainActivity.this, 0, intent, PendingIntent.FLAG_ONE_SHOT);
            ((AlarmManager) getSystemService(ALARM_SERVICE)).set(AlarmManager.RTC_WAKEUP, System.currentTimeMillis() + 1000, pendingIntent);
            conFixArm=false;
        }
    }

/*
    protected void onPause() {
    super.onPause();
        PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
        PowerManager.WakeLock powerOn=pm.newWakeLock(PowerManager.FULL_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP,"poweron");
        powerOn.acquire();
        powerOn.release();
        Log.e("Datacollector","Turn screen on");
    }*/

    /*
        NEXT TASK
     */
    private void setSettingsFromDefault(){
        File settingsFile = new File(Environment.getExternalStorageDirectory(), DEFAULT_SETTINGS_FILE_NAME);
        try {
            if(!settingsFile.exists()) {
                System.out.println("NO LOCAL BACKUP. RESORTING TO DEFAULT...");
                saveDefaultSettingsFile(settingsFile);
            } else{
                BufferedReader fileReader = new BufferedReader(new FileReader(settingsFile));
                String[] settingsData = fileReader.readLine().replace(" ","").split(",");
                if(settingsData[0].equals(USER_ID)){
                    System.out.println("USING SETTINGS FROM LAST RUN ON LOCAL BACKUP...");
                    BACKOFF_TIME = Integer.parseInt(settingsData[1]);
                    MAX_STIM = Integer.parseInt(settingsData[2]);
                    ONSET_CONFIDENCE = Float.parseFloat(settingsData[3]);
                    E_STOP = Float.parseFloat(settingsData[4]);
                    BUFFER_SIZE = Integer.parseInt(settingsData[5]);
                    ONSET_DELAY=Integer.parseInt(settingsData[6]);
                    OFFSET_DELAY=Integer.parseInt(settingsData[7]);
                    ISI=Integer.parseInt(settingsData[8]);
                    CUE_NOISE_OFFSET=Float.parseFloat(settingsData[9]);
                    CUE_NOISE_MAX=Float.parseFloat(settingsData[10]);
                    MAX_ADAPTION_STEP=Float.parseFloat(settingsData[11]);
                    VOLUME_INC=Float.parseFloat(settingsData[12]);
                    if(settingsData.length >= 14){
                        if(settingsData[13].contains("FILES")){
                            MediaHandler overrideHandler = new GitMediaHandler(getApplicationContext(), settingsData[13]); //if sound files are specified in the URL then play those files
                            overrideHandler.readFiles();
                            final float volume = server.md.getVolume();
                            overrideHandler.setMediaVolume(volume, volume);
                            if(server.md.isMediaPlaying()){
                                overrideHandler.startMedia();
                            }
                            server.md = overrideHandler;
                            server.md.DELAY=ISI; //set the ISI correctly
                        }
                    }

                } else{
                    System.out.println("LOCAL BACKUP DOES NOT MATCH USER ID. RESORTING TO DEFAULT...");
                    saveDefaultSettingsFile(settingsFile);
                }
            }
        } catch(IOException e){
            e.printStackTrace();
        }
    }

    /**
     * Maximizes the System volume
     * In conjunction with onKeyDown override (see below) ensures that System volume is always set to max
     */
    private void maximizeSystemVolume(){
        AudioManager audioManager = (AudioManager) getApplicationContext().getSystemService(this.AUDIO_SERVICE);
        int maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
        audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, maxVolume, 0);

    }

    private void saveDefaultSettingsFile(){
        File settingsFile = new File(Environment.getExternalStorageDirectory(), DEFAULT_SETTINGS_FILE_NAME);
        saveDefaultSettingsFile(settingsFile);
    }

    private void saveDefaultSettingsFile(File settingsFile){
        try {
            if(!settingsFile.exists()) {
                settingsFile.createNewFile();
            }
            BufferedWriter fileWriter = new BufferedWriter(new FileWriter(settingsFile, false));
            //"ONSET_TIME,OFFSET_TIME,ISI,CUE_NOISE_OFFSET,CUE_NOISE_MAX,ADAPTATION_STEP,VOLUME_INC"
            fileWriter.write(USER_ID + "," + BACKOFF_TIME + "," + MAX_STIM + "," + ONSET_CONFIDENCE + "," + E_STOP + "," + BUFFER_SIZE+","+ONSET_DELAY+","+OFFSET_DELAY+","+ISI+","+CUE_NOISE_OFFSET+","+CUE_NOISE_MAX+","+MAX_ADAPTION_STEP+","+VOLUME_INC);
            if (filesList.length() >= 2) { //if there are files loaded from Github, write them to the local cache
                fileWriter.write(","+filesList);
            }
            fileWriter.flush();
            fileWriter.close();
        } catch(IOException e){
            e.printStackTrace();
        }
    }

    private void getUserID(){
        File userIDFile = new File(Environment.getExternalStorageDirectory(), USER_ID_FILE_NAME);
        try {
            if(!userIDFile.exists()) {
                userIDFile.createNewFile();
                setUserID(DEFAULT_USER_ID);
                USER_ID = DEFAULT_USER_ID;
            }
            else{
                BufferedReader fileReader = new BufferedReader(new FileReader(userIDFile));
                USER_ID = fileReader.readLine();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        Button userIDButton = (Button)findViewById(R.id.USERID);
        userIDButton.setText(new String("SET USER ID: " + USER_ID));
    }

    private void setUserID(String newID){
        setUserID(newID, new File(Environment.getExternalStorageDirectory(), USER_ID_FILE_NAME));
    }

    private void setUserID(String newID, File userIDFile) {
        try {
            BufferedWriter fileWriter = new BufferedWriter(new FileWriter(userIDFile, false));
            fileWriter.write(newID);
            fileWriter.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        getUserID();
    }

    private void alertSetNewID(){
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Set New ID:");
        final EditText input = new EditText(this);
        input.setInputType(InputType.TYPE_CLASS_TEXT);
        input.setText(USER_ID);
        builder.setView(input);

        builder.setPositiveButton("OK", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                String userID = input.getText().toString();
                userID = userID.toUpperCase();
                userID = userID.replaceAll(" ", "_");
                if(userID.length() == 0){
                    userID = DEFAULT_USER_ID;
                }
                USER_ID = userID;
                setUserID(USER_ID);
                getUserSettings();
            }
        });
        builder.setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                dialog.cancel();
            }
        });
        builder.show();
    }

    private void getUserSettings(){
        new Thread(new Runnable() {
            public void run() {
                //LINK TO SETTINGS PER USER:
                File configFile = new File(Environment.getExternalStorageDirectory(), DEFAULT_CONFIG_FILE_NAME);
                String settingsDataLink = DEFAULT_DATA_LINK;
                try{
                BufferedReader fileReader = new BufferedReader(new FileReader(configFile));
                if (configFile.exists()) {
                    settingsDataLink = fileReader.readLine().replace("\n", "").replace("\r", "");
                    String tempURL=fileReader.readLine().replace("\n", "").replace("\r", ""); //try to read a second line containing a telemetry destination
                    if (tempURL != null) {//if it exists
                        TELEMETRY_DESTINATION=tempURL;
                        Log.i("fitbittmr", "Using custom telemtry destination "+TELEMETRY_DESTINATION);
                    }
                    String modeRead=fileReader.readLine().replace("\n", "").replace("\r", "");
                    if (modeRead != null) { //if there is an optional mode specified, then read it.
                        MODE=modeRead;
                    }
                    fileReader.close();
                    Log.i("fitbittmr", "read custom settings URL " + settingsDataLink);
                }
                }
                catch (Exception e) {
                Log.e("fitbittmr","Error reading config URL");
                e.printStackTrace();
            }

                // place file in internal storage of phone that contains url
                Log.i("Settings data location:",settingsDataLink);
                List<String[]> settingsData = new ArrayList<>();
                try {
                    URL url = new URL(settingsDataLink);
                    url.openStream();
                    BufferedReader reader = new BufferedReader(new InputStreamReader(url.openStream()));
                    String currentLine = null;
                    while((currentLine = reader.readLine()) != null){
                        settingsData.add(currentLine.replaceAll(" ", "").split(","));
                    }
                    reader.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
                boolean hit = false;
                for(String[] line: settingsData){
                    if(line[0].equals(USER_ID)){
                        hit = true;
                        BACKOFF_TIME = Integer.parseInt(line[1]);
                        MAX_STIM = Integer.parseInt(line[2]);
                        ONSET_CONFIDENCE = Float.parseFloat(line[3]);
                        E_STOP = Float.parseFloat(line[4]);
                        BUFFER_SIZE = Integer.parseInt(line[5]);
                        ONSET_DELAY=Integer.parseInt(line[6]);
                        OFFSET_DELAY=Integer.parseInt(line[7]);
                        ISI=Integer.parseInt(line[8]);
                        CUE_NOISE_OFFSET=Float.parseFloat(line[9]);
                        CUE_NOISE_MAX=Float.parseFloat(line[10]);
                        MAX_ADAPTION_STEP=Float.parseFloat(line[11]);
                        VOLUME_INC=Float.parseFloat(line[12]);
                        if(line.length >= 14){
                            if(line[13].contains("FILES")){
                                filesList=line[13]; //update the list of git files
                                MediaHandler overrideHandler = new GitMediaHandler(getApplicationContext(), line[13]); //if sound files are specified in the URL then play those files
                                overrideHandler.readFiles();
                                final float volume = server.md.getVolume();
                                overrideHandler.setMediaVolume(volume, volume);
                                if(server.md.isMediaPlaying()){
                                    overrideHandler.startMedia();
                                }
                                server.md = overrideHandler;
                                server.md.DELAY=ISI; //set the ISI
                            }
                        }
                    }
                }
                if(!hit){
                    System.out.println("COULD NOT CONNECT TO SERVER OR FIND USERNAME. LOOKING FOR LOCAL BACKUP...");
                    setSettingsFromDefault();
                } else{ //if(hit)
                    saveDefaultSettingsFile();
                }
                System.out.println("CURRENT SETTINGS:\n------------------------------");
                System.out.println("BACKOFF_TIME: " + BACKOFF_TIME);
                System.out.println("MAX_STIM: " + MAX_STIM);
                System.out.println("ONSET_CONFIDENCE: " + ONSET_CONFIDENCE);
                System.out.println("E_STOP: " + E_STOP);
                System.out.println("BUFFER_SIZE: " + BUFFER_SIZE);

            }
        }).start();
    }

    void wakeupHandler() { //turn the screen on (if turned off) during recording period to improve acquistion reliability. Also checks the connection status and tries to reset thje connection if ti appears broken
        final Handler wakeuptimer = new Handler();
        Runnable runnableCode = new Runnable() {
            @Override
            public void run() {
                PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
                PowerManager.WakeLock powerOn = pm.newWakeLock(PowerManager.FULL_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP, "poweron");
                powerOn.acquire();
                powerOn.release();
                Log.e("Datacollector", "Turn screen on");
                //check connection status and reset if needed
                if (System.currentTimeMillis() - lastpacket > 10000) { //last Fitbit data was received more than 10 seconds ago
                    fixConnection();
                }

                wakeuptimer.postDelayed(this, 60000);

            }
        };
// Start the initial runnable task by posting through the handler
        wakeuptimer.post(runnableCode);

    }

    private void openDreem(){
        Intent launchIntent = getPackageManager().getLaunchIntentForPackage("co.rythm.dreem.med");
        if (launchIntent != null) {
            startActivity(launchIntent);//null pointer check in case package name was not found
            System.out.println("DREEM APPLICATION OPENED");
        } else{
            System.out.println("DREEM APPLICATION NOT FOUND");
        }
    }


    private void fixConnection() {
        //Toggle Bluetooth on and off and start the Fitbit app inb order to fix connection issues
        conFixArm=true; //enable app to self-restart
        BluetoothAdapter mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        /*
        if (mBluetoothAdapter.isEnabled()) {
            mBluetoothAdapter.disable();
            mBluetoothAdapter.enable();
        }
        else {
            mBluetoothAdapter.enable();
        }*/

        // now start the Fitbit app, this should trigger a re-sync if it hasn't synced in a while and re open the TMR app in a cpuple of seconds

        if (getDeviceName().indexOf("G930") > -1) { //only do this on our S7 devices, because on other devices the app self-restart doesn't work
            Intent launchIntent = getPackageManager().getLaunchIntentForPackage("com.fitbit.FitbitMobile");
            if (launchIntent != null) {
                startActivity(launchIntent);//null pointer check in case package name was not found
            }
        }
    }
    @Override
    protected void onCreate(Bundle savedInstanceState) {



        super.onCreate(savedInstanceState);
        final Context cont = this;
        Log.i("fitbit","oncreate was called");
        getUserSettings();

        //we need runtime permission to create files in the shared storage, so request it
        int check = ActivityCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE);
        while (check != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE},1024);
            check = ActivityCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE);
        }
        probBuffer.add(0.01f);
        probBuffer.add(0.01f);
        //prevent the CPU from sleeping
        PowerManager powerManager = (PowerManager) getSystemService(POWER_SERVICE);
        final PowerManager.WakeLock wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK,
                "DreamCatcher::DataCollection");
        //Remove title bar
        this.requestWindowFeature(Window.FEATURE_NO_TITLE);
        //Remove notification bar
        this.getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);

        setContentView(R.layout.activity_main_simple); //use just the simple layout for now
        final Button startButton = (Button) findViewById(R.id.startButton);


        //start the power handler
        wakeupHandler();
        //start the web server
        startButton.setEnabled(false);
        wakeLock.acquire();// get the wakelock
        DataHandler DataHandlerTask = new DataHandler();
        DataHandlerTask.execute();

        //start the Fitbit server
        server = new fitbitServer();
        try {
            server.start();
        } catch(IOException ioe) {
            Log.w("Httpd", "The server could not start.");
        }
        Log.w("Httpd", "Web server initialized.");

        fileServer = new savedDataServer();
        try {
            fileServer.start();
        } catch(IOException ioe) {
            Log.w("Httpd", "The FILE server could not start.");
        }
        Log.w("Httpd", "Web FILE server initialized.");

        Button stopButton = (Button) findViewById(R.id.stopButton);
        stopButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                wakeLock.release();
                server.stop();
                server=null;
                System.exit(0);
            }
        });
        //set up the audio player
        //final MediaPlayer mp = MediaPlayer.create(this, R.raw.sleepmusic);

        final MediaHandler mdtest = new TestMediaHandler(this);
        mdtest.readFiles();
        //mp.setLooping(true);
        //mp.setVolume(1.0f,1.0f);
        final Button testButton = (Button) findViewById(R.id.testButton);
        testButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (!isPlaying) {
                    mdtest.startMedia();
                    //mp.start();
                    testButton.setText("Stop sound");
                }
                else {
                    mdtest.pauseMedia();
                    //mp.pause();
                    testButton.setText("Test sound");

                }
                isPlaying = !isPlaying;
            }
        });
        /*
        final Button downloadButton = (Button) findViewById(R.id.downloadButton);
        downloadButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                fileServer.startTransmit();
                downloadButton.setEnabled(false);
            }
        });
        downloadButton.setEnabled(false);*/
        getUserID();

        final Button userIDButton = (Button)findViewById(R.id.USERID);
        userIDButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                alertSetNewID();
            }
        });

        volumePreferences = getSharedPreferences("volume_preferences", MODE_PRIVATE);
        whiteNoiseVolume = volumePreferences.getFloat("volume", 1.0f);
        cueNoise = whiteNoiseVolume+CUE_NOISE_OFFSET;
        volumeBar = (SeekBar) findViewById(R.id.volumeBar);
        int displayVolume = (int) (whiteNoiseVolume * volumeBar.getMax());

        volumeBar.setProgress(displayVolume);
        volumeText = (TextView) findViewById(R.id.volumeText);
        volumeText.setText(String.valueOf(displayVolume));
        volumeBar.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                volumeText.setText(String.valueOf(progress));
                whiteNoiseVolume = new Float((progress / ((float) volumeBar.getMax()))*maxNoise);
                cueNoise = whiteNoiseVolume+CUE_NOISE_OFFSET;
                mdtest.setMediaVolume(cueNoise, cueNoise);
                whiteNoise.setVolume(whiteNoiseVolume, whiteNoiseVolume);
                if (progress < 1) {
                    volumeBar.setProgress(1);
                }
            }

            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {
                maximizeSystemVolume();
            }

            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {
                SharedPreferences.Editor editor = volumePreferences.edit();
                editor.putFloat("volume", whiteNoiseVolume);
                editor.commit();
            }
        });

        whiteNoise = MediaPlayer.create(this, R.raw.whitenoise);
        whiteNoise.setLooping(true);
        whiteNoise.setVolume(whiteNoiseVolume, whiteNoiseVolume);
        tmrStateButton = (ToggleButton) findViewById(R.id.tmrState);
        tmrStateButton.setTextColor(Color.parseColor("#FFFFFF"));
        //tmrStateButton.setBackgroundColor(Color.parseColor("#FF0000"));
        tmrStateButton.setBackgroundColor(Color.parseColor("#008000"));

        tmrStateButton.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                if (isChecked) {
                    if(System.currentTimeMillis() - lastpacket < 10000 || DEBUG_MODE) {
                        whiteNoise.start();
                        stim_seconds=0;
                        tmrStateButton.setBackgroundColor(Color.parseColor("#FF0000"));
                        turnedOnTime=System.currentTimeMillis();
                    } else{

                        //
                        AlertDialog alertDialog = new AlertDialog.Builder(MainActivity.this).create();
                        alertDialog.setTitle("Connection Error");
                        alertDialog.setMessage("Fitbit is not connected - cannot start.\n\nTry again in a minute. If the connection still does not succeed, restart the phone.");
                        alertDialog.setButton(AlertDialog.BUTTON_NEUTRAL, "OK",
                                new DialogInterface.OnClickListener() {
                                    public void onClick(DialogInterface dialog, int which) {
                                        dialog.dismiss();
                                        fixConnection();
                                    }
                                });
                        alertDialog.show();
                        tmrStateButton.setChecked(false);
                    }
                } else {
                    ProcessPhoenix.triggerRebirth(getApplicationContext()); //completely reset the configuration by restarting the app
                }
            }
        });

        MediaHandler test = new GitMediaHandler(getApplicationContext(), "FILES:s1.wav:s2.wav");
        test.readFiles();
        maximizeSystemVolume();
        getUserSettings();

        final Button dreemOpenButton = (Button) findViewById(R.id.openDreem);
        dreemOpenButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                openDreem();
            }
        });
        if (getDeviceName().indexOf("G930") > -1) { //this button is used on the stroke system (Galaxy A10) but not on the home TMR system (S7)
            dreemOpenButton.setVisibility(View.GONE);
        }
        if (MODE.indexOf("PASSIVE") > -1) {//if the system is configured for passive mode, don't display the volume bar and don't play any white noise
            volumeBar.setVisibility(View.GONE);
            volumeText.setVisibility(View.GONE);
            whiteNoise.setVolume(0,0);
            whiteNoiseVolume=0.0f;


        }
        }

    @Override
    protected void onResume() {
        maximizeSystemVolume();
        super.onResume();
    }


    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if(keyCode==KeyEvent.KEYCODE_VOLUME_DOWN){
            return true;
        }
        else if(keyCode==KeyEvent.KEYCODE_VOLUME_UP){
            return true;
        }
        else{
            return super.onKeyDown(keyCode, event);
        }
    }

    //stop the server when app is closed
    @Override
    public void onDestroy()
    {
        super.onDestroy();
        if (server != null)
            server.stop();

        if (fileServer != null)
            fileServer.stop();
    }



    //fitbitServer handles getting data from the fitbit which sends it on port 8085
    private class fitbitServer extends NanoHTTPD {
        int telemetryCount=0;
        /*
        private boolean initiateDownloadPrevious = false;
        private boolean downloadPrevious = false;
        private boolean downloadAcknowledged = false;
        private int downloadCount = 0;
        */
        PrintWriter fitbitWriter;
        //MediaPlayer mp;
        MediaHandler md;
        public fitbitServer() {
            super(8085);
            Log.i("fitbit","server start");
            //set up the audio player
            //mp = MediaPlayer.create(getApplicationContext(), R.raw.sleepmusic);
            //mp.setLooping(true);
            //mp.setVolume(1.0f,1.0f);
            md = new MediaHandler(getApplicationContext());
            md.DELAY=ISI;
            md.readFiles();

            final Handler fitbitWakeup = new Handler();

            final int delay = 15000; //milliseconds
            fitbitWakeup.postDelayed(new Runnable(){
                public void run(){
                    if (System.currentTimeMillis() > lastpacket+10000) { //no data from the fitbit

                        if (md.isMediaPlaying()){
                            md.pauseMedia();
                        }




                    }
                    //DEBUG CODE--MAKES THE SOUNDS START IMMEDIATELY
                    if (DEBUG_MODE) {
                        ONSET_DELAY = 0;
                        handleStaging(0.99f);
                        Log.i("debug"," loop ran");

                            fitbitWakeup.postDelayed(this, 3000);

                    }
                    else {
                        fitbitWakeup.postDelayed(this, delay);
                    }
                }
            }, delay);



        }


        private float average(ArrayList<Float> data) {
            float sum = 0;
            for (int i=0; i< data.size(); i++) {
                sum += data.get(i);
            }
            return sum / data.size();
        }
        String handleStaging(float prob) {
            Log.e("stage",prob+"");
            String tmrStatus="0,";
            probBuffer.add(prob);
            if (probBuffer.size() > BUFFER_SIZE) {
                probBuffer.remove(0);
            }
            float avgProb=average(probBuffer);
            Log.e("avg",""+avgProb);
            if (prob >= E_STOP && avgProb >= ONSET_CONFIDENCE && System.currentTimeMillis() >= turnedOnTime+ONSET_DELAY && System.currentTimeMillis() < turnedOnTime+OFFSET_DELAY && MODE.indexOf("PASSIVE") == -1) {
                above_thresh=1;
            }
            else {
                above_thresh=0;
                above_thresh=0;
                /*
                if (mp.isPlaying()) {
                    mp.pause();
                    targetVolume=targetVolume-0.1f;
                    if (targetVolume < 0.1) {
                        targetVolume=0;
                    }
                    mp.setVolume(targetVolume,targetVolume);
                    backoff_time=System.currentTimeMillis()+BACKOFF_TIME; //stim woke them up, so pause it
                }
                 */
                if (md.isMediaPlaying()){
                    md.pauseMedia();
                    /*
                    targetVolume=targetVolume-0.1f;
                    if(targetVolume < 0.1){
                        targetVolume=0;
                    }
                    */
                    cueNoise -= 0.3f;
                    if(cueNoise < 0.0f){
                        cueNoise = 0.0f;
                    }

                    //decrease the maximum cue volume too if it looks like a wakeup was triggered
                    if (prob < E_STOP) {
                        whiteNoiseVolume = whiteNoiseVolume - MAX_ADAPTION_STEP;
                        if (whiteNoiseVolume < 0.01f) {
                            whiteNoiseVolume=0.01f;
                        }
                    }
                    md.setMediaVolume(cueNoise, cueNoise);
                    backoff_time=System.currentTimeMillis()+BACKOFF_TIME; //stim woke them up, so pause it
                }
            }

            if (System.currentTimeMillis() < backoff_time || stim_seconds >= MAX_STIM ||  !tmrStateButton.isChecked()) {
                if (md.isMediaPlaying()){
                    md.pauseMedia();
                }
               /*
               if (mp.isPlaying()) {
                    mp.pause();
                }
                */
            }
            else {
                if (above_thresh > 0 && (tmrStateButton.isChecked()||DEBUG_MODE)) { //we are stably in stage, start playing the media
                    Log.i("media","run");
                    tmrStatus = "1,";
                    stim_seconds++;
                    /*
                    targetVolume=targetVolume+VOLUME_INC;
                    if (targetVolume > 1) {
                        targetVolume=1.0f;
                    }
                     */
                    cueNoise += VOLUME_INC;
                    if(cueNoise > whiteNoiseVolume+CUE_NOISE_MAX){
                        cueNoise = whiteNoiseVolume+CUE_NOISE_MAX;
                    }
                    md.setMediaVolume(cueNoise, cueNoise);
                    if (!md.isMediaPlaying()){
                        md.startMedia();
                    }
                    /*
                    mp.setVolume(targetVolume,targetVolume);
                    if (!mp.isPlaying()) {
                        mp.start();
                    }
                    */
                } else {
                    tmrStatus = "0,";
                }
            }
            //tmrStatus=tmrStatus+prob+","+String.valueOf(md.getMediaPosition())+","+String.valueOf(targetVolume)+","+md.getCurrentMedia();
            tmrStatus=tmrStatus+prob+","+String.valueOf(md.getMediaPosition())+","+ String.valueOf(cueNoise);
            return tmrStatus;
        }

        public Response serve(String uri, Method method,
                              Map<String, String> header,
                              Map<String, String> parameters,
                              Map<String, String> files) {
            Log.e("fitbitserver","request");
            if (uri.indexOf("rawdata") > -1) { //recieved a data packet from the Fitbit, set the Fitbit status to good.
                lastpacket=System.currentTimeMillis();
                runOnUiThread(new Runnable() {

                    @Override
                    public void run() {
                        TextView fStatus = (TextView) findViewById(R.id.fConnectionStatus);
                        fStatus.setText("✔️ Fitbit connected");
                    }
                });

                /*
                if(downloadPrevious) {
                    String message = parameters.toString();
                    System.out.println(message);
                    if (message.contains("DOWNLOAD_ACKNOWLEDGEMENT")) {
                        System.out.println("1");
                        downloadAcknowledged = true;
                        return newFixedLengthResponse(Response.Status.OK, "confirm0", "");
                    } else if (message.contains("EXIT_DOWNLOAD")) {
                        downloadPrevious = false;
                        return newFixedLengthResponse(Response.Status.OK, "exit", "");
                    } else if (downloadAcknowledged) {
                        System.out.println("2");
                        //write parameters.toString() to datalog file
                        downloadCount++;
                        return newFixedLengthResponse(Response.Status.OK, "confirm" + String.valueOf(downloadCount), "");
                    } else {
                        System.out.println("3");
                        return newFixedLengthResponse(Response.Status.OK, "waiting_for_acknowledgement", "");
                    }
                }
                */
                String staging="";
                String is3current = "unset";
                //check to see if stages are available
                if (parameters.toString().indexOf("is3") > -1) { //yes they are
                    String split=parameters.toString().split("( is3=1 )")[1];
                    split=split.split(",")[0].replace(")\":","").replace("}","");
                    float prob;
                    try{
                        prob = Float.parseFloat(split);
                    }
                    catch(NumberFormatException e){
                        prob = 0;
                    }

                    is3current = String.valueOf(prob);
                    staging=handleStaging(prob);
                    Log.e("stage3",split);
                }
                /*
                String staging="";
                if (true) { //yes they are
                    System.out.println("FORCING STAGING");
                    staging=handleStaging(Float.parseFloat("1.0"));
                    Log.e("stage3","1");
                }
                */

                String[] fitbitParams = parameters.toString().replace(":", ",").split(","); //split up individual data vals

                fitbitStatus=parameters.toString().split("data=\\{")[1];

                String hrCurrent = (fitbitParams[1]); //HEART RATE
                String batteryCurrent = (fitbitParams[19].split("STAGE")[0].replace("}", "")); //BATTERY
                //Log.e("fitbit",fitbitStatus);
                fitbitBuffer = fitbitBuffer + fitbitStatus + ","+staging+"\n";
                fitbitCount++;
                if (fitbitCount > FITBIT_WRITE_INTERVAL)  {
                    try {
                        FileWriter fileWriter = new FileWriter(getApplicationContext().getExternalFilesDir(null) + "/fitbitdata.txt", true);
                        PrintWriter printWriter = new PrintWriter(fileWriter);
                        printWriter.print(fitbitBuffer);  //New line
                        printWriter.flush();
                        printWriter.close();
                        fitbitCount=0;
                        fitbitBuffer="";
                    } catch (IOException e) {
                        Log.e("Fitbitserver", "Error writing to file");
                    }
                }

                String is3average;
                if(probBuffer.size() > 0){ is3average = String.valueOf(average(probBuffer)); }
                else { is3average = "unset"; }

                String mediaPlayingCurrently = String.valueOf(md.isMediaPlaying());
                String cueCountCurrently = String.valueOf(md.getCueCount());

                String volumeCurrently = String.valueOf(md.getVolume());

                String isPhonePluggedInCurrently = String.valueOf(isPluggedIn());
                PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
                String isScreenOnCurrently = String.valueOf(pm.isInteractive());

                //REMOTE TELEMETRY FUNCTIONALITY
                    //Heart rate - hrCurrent
                    //Current probability of stage 3 - is3current
                    //Averaged probability of stage 3 - is3average
                    //Is TMR running or not - mediaPlayingCurrently
                    //Current volume - volumeCurrently
                    //FB battery level - batteryCurrent
                    //Phone plugged in - isPhonePluggedInCurrently
                    //Phone screen on - isScreenOnCurrently

                //send a telemetry thing only once evwery minute to avoid using ridiculuous amounts of data
                telemetryCount++;
                if (telemetryCount >= 60 || getDeviceName().indexOf("G930")  ==-1) { //transmit data every second if not on the G7 because the other phones have bigger data plans
                    telemetryCount = 0;
                    JSONObject remoteTeleData = new JSONObject();
                    try {
                        remoteTeleData.put("hr", hrCurrent);
                        remoteTeleData.put("is3", is3current);
                        remoteTeleData.put("is3avg", is3average);
                        remoteTeleData.put("TMRon", mediaPlayingCurrently);
                        remoteTeleData.put("vlm", volumeCurrently);
                        remoteTeleData.put("bat", batteryCurrent);
                        remoteTeleData.put("plugin", isPhonePluggedInCurrently);
                        remoteTeleData.put("scrnOn", isScreenOnCurrently);
                        remoteTeleData.put("fullStatus",fitbitStatus);
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                    try {
                        String urlString = TELEMETRY_DESTINATION+"user=" + USER_ID + "&data=" + URLEncoder.encode(remoteTeleData.toString(), StandardCharsets.UTF_8.toString());
                        HttpPost httpPost = new HttpPost(urlString);
                        System.out.println("tele" + urlString);
                        Log.i("telemetry", "send");
                        URL url = new URL(urlString);
                        url.openStream();
                    } catch (Exception e) {
                        Log.e("telemetry", "error");
                        e.printStackTrace();
                    }
                }


            }
            // Log.i("server", parameters.toString());
            /*
            //update the Fitbit status
            if(initiateDownloadPrevious){
                initiateDownloadPrevious = false;
                downloadPrevious = true;
                downloadCount = 0;
                return newFixedLengthResponse(Response.Status.OK, "download", "");
            }
            else{

            }
             */
            return newFixedLengthResponse(Response.Status.OK, "normal", "");
        }
    }

    //Server for downloading datalog.txt data, used on port 9000
    private class savedDataServer extends NanoHTTPD{
        boolean beginTransfer = false;
        boolean start = true;
        List<String> inputs = new ArrayList<String>();
        List<String> outputs = new ArrayList<String>();
        int currentLine = 0;
        List<String> lines = new ArrayList<>();

        public savedDataServer() {
            super(9000);
        }

        public Response serve(String uri, Method method,
                              Map<String, String> header,
                              Map<String, String> parameters,
                              Map<String, String> files) {
            String message = parameters.toString();
            message = message.substring(6, message.indexOf(", NanoHttpd.QUERY_STRING="));
            System.out.println("RECEIVED: " + message);
            inputs.add(message);
            /*
            if(outputs.size() > 0){
                return handleResponse(inputs.get(inputs.size()-1), outputs.get(outputs.size()-1));
            }
            else{
                return handleResponse(inputs.get(inputs.size()-1), "");
            }
            */
            return handleResponse();
        }

        private Response handleResponse(){
            /*
            DOWNLOAD BUTTON TEXT COLOR:
                - RED: INITIATING TRANSFER
                - ORANGE: SUCCESSFUL INITIATION, STARTING LINE REQUESTS
                - YELLOW: SUCCESSFUL LINE REQUEST, COMPLETING LINE REQUESTS
                - YELLOWGREEN: SUCCESSFUL LINE REQUESTS TO END OF FILE, REQUESTING CLEAR FILE
                - GREEN: FILE CLEARED, PROCESS COMPLETED
             */
            if(!beginTransfer){
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        ((Button) findViewById(R.id.downloadButton)).setEnabled(true);
                    }
                });
                return buildResponse("PASS");
            }
            else{
                System.out.println(getLastInput() + " -> " + getLastOutput());
                if(getLastInput().startsWith("PASSED")){
                    start = false;
                    ((Button) findViewById(R.id.downloadButton)).setTextColor(Color.parseColor("#FF0000")); //red
                    return buildResponse("INITIATE");
                }
                else if(getLastOutput().startsWith("INITIATE")){
                    if(getLastInput().startsWith("SUCCESS")){
                        ((Button) findViewById(R.id.downloadButton)).setTextColor(Color.parseColor("#FFA500")); //orange
                        return buildResponse("LINE_" + currentLine);
                    }
                    else{
                        return buildResponse("INITIATE");
                    }
                }
                else if(getLastOutput().startsWith("LINE")){
                    if(!getLastInput().startsWith("LINE")){
                        return buildResponse(getLastOutput());
                    }
                    LineInput lineInput = new LineInput(getLastInput());
                    if(currentLine == lineInput.getLineNumber()){
                        if(lineInput.getCommandType().equals("DATA")){
                            ((Button) findViewById(R.id.downloadButton)).setTextColor(Color.parseColor("#FFFF00")); //yellow
                            lines.add(lineInput.getData());
                            currentLine++;
                            return buildResponse("LINE_" + currentLine);
                        }
                        else if(lineInput.getCommandType().equals("INIT")){
                            return buildResponse("INITIATE");
                        }
                        else if(lineInput.getCommandType().equals("EXIT")){
                            if(saveToFile()){
                                ((Button) findViewById(R.id.downloadButton)).setTextColor(Color.parseColor("#9ACD32")); //yellowgreen
                                return buildResponse("CLEAR");
                            }
                            else{
                                return buildResponse("LINE_" + currentLine);
                            }
                        }
                    } else{
                        return buildResponse("LINE_" + currentLine);
                    }

                }
                else if(getLastOutput().startsWith("CLEAR")) {
                    if(getLastInput().startsWith("SUCCESS")){
                        ((Button) findViewById(R.id.downloadButton)).setTextColor(Color.parseColor("#008000")); //green
                        lines = new ArrayList<String>();
                        outputs = new ArrayList<String>();
                        inputs = new ArrayList<String>();
                        currentLine = new Integer(0);
                        beginTransfer = false;
                        start = true;
                        return buildResponse("PASS");
                    }
                    else{
                        return buildResponse("CLEAR");
                    }
                }
                return buildResponse("ERROR");
            }
        }

        private boolean saveToFile(){
            File storageDirectory = Environment.getExternalStorageDirectory();
            String storageFileName = "SAVED_DATA_" + System.currentTimeMillis() + ".txt";
            File storageFile = new File(storageDirectory, storageFileName);
            try {
                if(!storageFile.exists()) {
                    storageFile.createNewFile();
                }
                BufferedWriter writer = new BufferedWriter(new FileWriter(storageFile, true));
                for(String line: lines){
                    writer.write(line + "\n");
                }
                writer.close();
                return true;
            } catch (IOException e) {
                e.printStackTrace();
                return false;
            }
        }

        private String getLastOutput(){
            return outputs.get(outputs.size()-1);
        }

        private String getLastInput(){
            return inputs.get(inputs.size()-1);
        }

        private Response buildResponse(String message){
            outputs.add(message);
            System.out.println(message);
            return newFixedLengthResponse(Response.Status.OK, message,"");
        }
        /*
        private Response sendAcknowledgement(){
            currentLine = -1;
            return newFixedLengthResponse(Response.Status.OK, "INITIATE_TRANSMIT", "");
        }

        private Response storeData(String line){
            //Put the line in data storage
            currentLine++;
            return newFixedLengthResponse(Response.Status.OK, "CONFIRM:" + currentLine.toString(), "");
        }
        private Response exit(){
            beginTransfer = false;
            currentLine = null;
            return newFixedLengthResponse(Response.Status.OK, "COMPLETED_EXIT", "");
        }
        */
        public void startTransmit() {
            beginTransfer = true;
        }

        private class LineInput{
            private int LineNumber;
            private String CommandType;
            private String Data;
            public LineInput(String line){
                System.out.println("LINEINPUT");
                System.out.println(line);
                String[] broken = line.split("_");
                for (String i:
                     broken) {
                    System.out.println(i);
                }
                LineNumber = Integer.parseInt(broken[1]);
                CommandType = broken[2];
                if(CommandType.equals("DATA")){
                    Data = broken[3];
                }
            }

            public String getData(){
                return Data;
            }

            public String getCommandType(){
                return CommandType;
            }

            public int getLineNumber() {
                return LineNumber;
            }
        }

    }


    //NOTE: TIS FUNCTION IS NOT CURRENTLY USED BECAUSE WE ARE NO LONGER USING THE ZMAX SENSOR
    //DataHandler receives zMax data and writes it to a file
    //Note--data is stored in UNSCALED form
    //THis function is based on the matlab code at http://hypnodynecorp.com/downloads/HDConnect.m
    private class DataHandler extends AsyncTask<Void, String, Void> {
        private Socket client;
        private PrintWriter printwriter;
        private String messsage;
        private Context mContext;
        String dataBuffer = "";
        int BUFFER_SIZE=1500;
        double MIN_QUAL=100;
        double[] eegLeftBuffer=new double[BUFFER_SIZE]; //buffered EEG data for evaluating signal quality
        double[] eegRightBuffer=new double[BUFFER_SIZE];
        double[] stds=new double[BUFFER_SIZE];

        //take standard deviation of EEG channels
        //if a channel is disocnnected it will be flat, with little stdev
        //todo: low pass filter before, to remove variation indcued by amplifier artifacts when a channel is disconnected
        public double computeQuality(int EEG_L,int EEG_R) {
            eegLeftBuffer[BUFFER_SIZE-1]=EEG_L; //update buffers w new data
            eegRightBuffer[BUFFER_SIZE-1]=EEG_R;
            //shift buffers
            for (int i=0; i < BUFFER_SIZE-1; i++) {
                eegLeftBuffer[i]=eegLeftBuffer[i+1];
                eegRightBuffer[i]=eegRightBuffer[i+1];
            }
            // double corr= new PearsonsCorrelation().correlation(eegLeftBuffer, eegRightBuffer);
            double stdleft=new StandardDeviation().evaluate(eegLeftBuffer);
            double stdright=new StandardDeviation().evaluate(eegRightBuffer);
            if (stdright < stdleft) {
                stds[BUFFER_SIZE - 1] = stdright;
            }
            else {
                stds[BUFFER_SIZE - 1] = stdleft;
            }
            //shift moving average and take mean across the time window
            double total=0;
            double samples=0;
            for (int i=0; i < BUFFER_SIZE-1; i++) {
                stds[i]=stds[i+1];
                total=total+stds[i];
                samples++;
            }

            return total/samples;
        }

        @Override
        protected Void doInBackground(Void... params) {
            /*
            Log.i("Record", "Recording started");
            try {

                client = new Socket("127.0.0.1", 24000); // connect to the server
                printwriter = new PrintWriter(client.getOutputStream(), true);
                printwriter.write("HELLO\n"); // write the message to output stream

                printwriter.flush();

                InputStream is = client.getInputStream();
                while (true) {
                    int c = is.read();
                    if (c != -1) {
                        byte db = (byte) c;
                        //Log.e("data","data");
                        if (db == '\n') {
                            if (dataBuffer.length() > 1) { //we have just completed a sample, now process it
                                String[] splitup = dataBuffer.split("\\.");
                                if (splitup.length > 1) { //the stuff after the period is the actual data
                                    String[] theData = splitup[1].split("-"); //split into individual hex digits
                                    int packetType = (int) Long.parseLong(theData[0], 16);
                                    if (packetType >= 1 && packetType <= 11) { //first digit specifies the type of packet this is; we only process it if it's a dat apacket
                                        int EEG_R=getWordAt(theData,1);
                                        int EEG_L=getWordAt(theData,3);
                                        int ACC_X=getWordAt(theData,5);
                                        int ACC_Y=getWordAt(theData,7);
                                        int ACC_Z=getWordAt(theData,9);
                                        int PPG = getWordAt(theData,27);
                                        int BODYTEMP=getWordAt(theData,36);
                                        int AMBIENTLIGHT=getWordAt(theData,21);
                                        int BATTERYPOWER=getWordAt(theData,23);
                                        int AMBIENTNOISE=getWordAt(theData,19);
                                        double EEG_QUALITY=computeQuality(EEG_L,EEG_R); //EEG signal quality from standard deviation
                                        String zmaxStatus=System.currentTimeMillis()+","+EEG_R+","+EEG_L+","+ACC_X+","+ACC_Y+","+ACC_Z+","+PPG+","+BODYTEMP+","+AMBIENTLIGHT+","+BATTERYPOWER+","+AMBIENTNOISE+","+EEG_QUALITY+"\n";
                                        zMaxBuffer=zMaxBuffer+zmaxStatus;
                                        zMaxCount++;
                                        if (zMaxCount > ZMAX_WRITE_INTERVAL) {
                                            try {
                                                FileWriter zWriter = new FileWriter(getApplicationContext().getExternalFilesDir(null) + "/zmaxdata.txt", true);
                                                PrintWriter printWriter = new PrintWriter(zWriter);
                                                printWriter.print(zMaxBuffer);
                                                printWriter.flush();
                                                printWriter.close();
                                                zMaxCount=0;
                                                zMaxBuffer="";
                                            } catch (IOException e) {
                                                Log.e("Zmaxserver", "Error writing to file");
                                            }
                                        }


                                        //valid packet received, so update the connection status
                                        TextView zCon = (TextView) findViewById(R.id.zConnectionStatus);
                                        publishProgress("zmaxconnected");

                                        if ( EEG_QUALITY < MIN_QUAL) { //EEG is bad if the correlation is Nan (no variation in at least one channel, implies that the channel is pegged at max or min), or if the channels are too correlated
                                            publishProgress("zmaxbadsignal");
                                        }
                                        else {
                                            publishProgress("zmaxgoodsignal");
                                        }
                                    } else {
                                        Log.i("Error", "Wrong packet type");
                                    }
                                }
                            }
                            dataBuffer = "";
                        }
                        dataBuffer = dataBuffer + (char) db;


                    }


                }
            } catch (UnknownHostException e) {
                e.printStackTrace();
            } catch (IOException e) {
                e.printStackTrace();
            }
            return null;
            */
            return null;
        }

        @Override
        protected void onProgressUpdate(String... values) { //handles updating the UI
            if (values[0].equals("zmaxconnected")) {
                TextView zStatus = (TextView) findViewById(R.id.zConnectionStatus);
                //zStatus.setText("✔️ zMax connected");
            }
            if (values[0].equals("zmaxbadsignal")) {
                TextView zStatus = (TextView) findViewById(R.id.zSignalStatus);
                //zStatus.setText("⚠️️ Poor forehead signal");
            }
            if (values[0].equals("zmaxgoodsignal")) {
                TextView zStatus = (TextView) findViewById(R.id.zSignalStatus);
                //zStatus.setText("✔️️️ Good forehead signal");
            }
        }
    }
}
