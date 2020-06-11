package neurelectrics.fitbitdatalogger;

import android.Manifest;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.os.AsyncTask;
import android.os.BatteryManager;
import android.os.Build;
import android.os.Environment;
import android.os.Handler;
import android.os.PowerManager;
import android.support.annotation.RequiresApi;
import android.support.v4.app.ActivityCompat;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.TextView;

import org.apache.commons.math3.stat.descriptive.moment.StandardDeviation;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.Socket;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.Buffer;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import fi.iki.elonen.NanoHTTPD;

public class MainActivity extends AppCompatActivity {

    //TMR control variables
    static String USERID="USER1";
    float ONSET_CONFIDENCE=0.85f;
    float E_STOP=0.5f; //emergency stop cueing
    int ONSET_CONSEC=30;
    int OFFSET_CONFIDENCE=75;
    int BACKOFF_TIME=60000*5;
    int MAX_STIM=1000;
    int above_thresh=0;
    double backoff_time=0;
    int stim_seconds=0;
    double lastpacket=0;
    float targetVolume=1.0f;
    float volumeInc=(0.05f/200f);
    fitbitServer server;
    savedDataServer fileServer;
    String fitbitStatus="";
    boolean isPlaying=false;
    int ZMAX_WRITE_INTERVAL=60*60; //write zmax data every minute
    String zMaxBuffer="";
    int zMaxCount=0;
    int FITBIT_WRITE_INTERVAL=10; //write fitbit data every 10 minutes
    String fitbitBuffer="";
    int fitbitCount=0;
    ArrayList<Float> probBuffer=new ArrayList<Float>();
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

    @Override
    protected void onUserLeaveHint() {
        super.onUserLeaveHint();
        Log.e("Datacollector","Restarting");
        Intent intent = new Intent(MainActivity.this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(MainActivity.this, 0, intent, PendingIntent.FLAG_ONE_SHOT);
        ((AlarmManager) getSystemService(ALARM_SERVICE)).set(AlarmManager.RTC_WAKEUP, System.currentTimeMillis() + 1000, pendingIntent);
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


    void wakeupHandler() { //turn the screen on (if turned off) during recording period to improve acquistion reliability.
        final Handler wakeuptimer = new Handler();
        Runnable runnableCode = new Runnable() {
            @Override
            public void run() {
                int hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY);
                if (hour >= 21 || hour < 7) { //only run during the recording period; prevents accidetnal button presses.
                    PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
                    PowerManager.WakeLock powerOn = pm.newWakeLock(PowerManager.FULL_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP, "poweron");
                    powerOn.acquire();
                    powerOn.release();
                    Log.e("Datacollector", "Turn screen on");
                    wakeuptimer.postDelayed(this, 60000);
                }
            }
        };
// Start the initial runnable task by posting through the handler
        wakeuptimer.post(runnableCode);

    }
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        final Context cont = this;
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
        final MediaHandler md = new TestMediaHandler(this);
        md.readFiles();
        //mp.setLooping(true);
        //mp.setVolume(1.0f,1.0f);
        final Button testButton = (Button) findViewById(R.id.testButton);
        testButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (!isPlaying) {
                    md.startMedia();
                    //mp.start();
                    testButton.setText("Stop sound");
                }
                else {
                    md.pauseMedia();
                    //mp.pause();
                    testButton.setText("Test sound");

                }
                isPlaying = !isPlaying;
            }
        });

        final Button downloadButton = (Button) findViewById(R.id.downloadButton);
        downloadButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                fileServer.startTransmit();
                downloadButton.setEnabled(false);
            }
        });
        downloadButton.setEnabled(false);
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

            //set up the audio player
            //mp = MediaPlayer.create(getApplicationContext(), R.raw.sleepmusic);
            //mp.setLooping(true);
            //mp.setVolume(1.0f,1.0f);
            md = new MediaHandler(getApplicationContext());
            md.readFiles();

            final Handler fitbitWakeup = new Handler();
            final int delay = 15000; //milliseconds
            fitbitWakeup.postDelayed(new Runnable(){
                public void run(){
                    if (System.currentTimeMillis() > lastpacket+10000) {
                        if (md.isMediaPlaying()){
                            md.pauseMedia();
                        }
                        /*
                        if (mp.isPlaying()) {
                            mp.pause();
                        }
                         */
                    }

                    fitbitWakeup.postDelayed(this, delay);
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
            String tmrStatus="0,";
            probBuffer.add(prob);
            if (probBuffer.size() > 240) {
                probBuffer.remove(0);
            }
            float avgProb=average(probBuffer);
            Log.e("avg",""+avgProb);
            if (prob >= E_STOP && avgProb >= ONSET_CONFIDENCE) {
                above_thresh=1;
            }
            else {
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
                    targetVolume=targetVolume-0.1f;
                    if(targetVolume < 0.1){
                        targetVolume=0;
                    }
                    md.setMediaVolume(targetVolume, targetVolume);
                    backoff_time=System.currentTimeMillis()+BACKOFF_TIME; //stim woke them up, so pause it
                }
            }

            if (System.currentTimeMillis() < backoff_time || stim_seconds >= MAX_STIM) {
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
                if (above_thresh >0 ) { //we are stably in stage, start playing the media
                    tmrStatus = "1,";
                    stim_seconds++;
                    targetVolume=targetVolume+volumeInc;
                    if (targetVolume > 1) {
                        targetVolume=1.0f;
                    }
                    md.setMediaVolume(targetVolume, targetVolume);
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
            tmrStatus=tmrStatus+prob+","+String.valueOf(md.getMediaPosition())+","+ String.valueOf(targetVolume);
            return tmrStatus;
        }

        public Response serve(String uri, Method method,
                              Map<String, String> header,
                              Map<String, String> parameters,
                              Map<String, String> files) {
            Log.e("server","request");
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
                    split=split.split(",")[0].replace(")\":","");
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
                //Log.i("fitbit",parameters.toString());
                String[] fitbitParams = parameters.toString().replace(":", ",").split(","); //split up individual data vals
                fitbitStatus = System.currentTimeMillis() + "," + fitbitParams[2] + "," + fitbitParams[4] + "," + fitbitParams[6] + "," + fitbitParams[8] + "," + fitbitParams[10] + "," + fitbitParams[12] + "," + fitbitParams[14]+","+fitbitParams[16]+","+fitbitParams[18]+","+fitbitParams[20]; //store just sensor data value, not keys
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
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                try {
                    String urlString = "http://biostream-1024.appspot.com/sendps?user=" + MainActivity.USERID + "&data=" + URLEncoder.encode(remoteTeleData.toString(), StandardCharsets.UTF_8.toString());
                    //System.out.println(urlString);
                    URL url = new URL(urlString);
                    url.openConnection();
                } catch (IOException e) {
                    e.printStackTrace();
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

    //Server for downloading datalog.txt data, used on port 8090
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
                    return buildResponse("INITIATE");
                }
                else if(getLastOutput().startsWith("INITIATE")){
                    if(getLastInput().startsWith("SUCCESS")){
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
                            lines.add(lineInput.getData());
                            currentLine++;
                            return buildResponse("LINE_" + currentLine);
                        }
                        else if(lineInput.getCommandType().equals("INIT")){
                            return buildResponse("INITIATE");
                        }
                        else if(lineInput.getCommandType().equals("EXIT")){
                            if(saveToFile()){
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
