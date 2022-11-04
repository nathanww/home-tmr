package neurelectrics.fitbitdatalogger;

import android.content.Context;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Environment;
import android.os.Handler;
import android.support.v4.util.Pair;
import android.util.Log;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Random;


/**
 * @author Torin Kovach
 * @Date Mon 1-Jun-2020
 */
public class MediaHandler {
    final Context context;
    public String files="";
    /** Constructor
     * @param context Application Context object
     */
    public MediaHandler(Context context,String fileData){

        this.context = context;
        this.files=fileData;
    }

    /*
    NOTE: any sound file to be played is identified by it's resource identifier and score.
            A HashMap between resID and filename is used to get identifying filename
     */

    public int DELAY = 10000;
    private boolean isDelaying = false;
    private List<Pair<Float, Integer>> mediaData; // Sorted by score (Score, Resource Identifier) pairs
    private Pair<List<Pair<Float, Integer>>, List<Pair<Float, Integer>>> mediaDataHalves; // Odd- & even-  indexed halves of mediaData
    private List<Pair<Float, Integer>> playableMedia; // All possible pairs to ever be played (one half)
    List<Pair<Integer, String>> mediaQueue;
    private MediaPlayer mediaPlayer; // The MediaPlayer object used to reference and play sounds
    private ArrayList<Pair<Integer, String>> mediaFileNames=new ArrayList<Pair<Integer, String>>(); // (resID, filename) pairs allow getting filename using resID
    private Pair<Float, Float> volume = new Pair(1.0f, 1.0f); // Volume to play at
    private int currentMediaID; // resID of the currently playing or last played (if there is a pause) media
    String logFileName = "MediaLog.txt"; //Filename of file to write log data to in internal storage
    private File logFile; // File object for the log file
    private File storageDirectory; // Directory in internal storage in which logFile is stored
    private BufferedWriter logFileWriter; // Writes to the log file
    private List<String> mediaFilenameHistory = new ArrayList<String>();
    private boolean everPlayed = false; //true if a sound has ever been played
    public boolean filesLoaded=false;
    private int mfindex=0;
    Handler soundHandler; //loop which handles playing the cue sounds
    /**
     * Reads the files and sets up the MediaHandler for audio playback
     */
    public void readFiles() {

                storageDirectory = Environment.getExternalStorageDirectory();

                setLogFile();
                getMediaData();
                filesLoaded = true;


    }




    /**
     * Starts audio playback
     */
    public void startMedia(){

            soundHandler=new Handler();
            everPlayed = true;
            isDelaying = true;
            //start the timing loop
            soundHandler.post(new Runnable() {
                public void run() {
                    if (mfindex >= mediaFileNames.size()) { //if we've reached the end, then reset
                        mfindex=0;
                    }
                    Pair<Integer,String> CurrentTrack = mediaFileNames.get(mfindex);
                    mfindex++;
                    if (CurrentTrack.first > 0) { //load media from resource if it is an internal file, or load media externally if it is an external file
                        mediaPlayer = MediaPlayer.create(context, CurrentTrack.first);
                        Log.i("Internal media",""+CurrentTrack.second);
                    } else {
                        //look up the file name and load from internal storage
                        Log.i("external media", Environment.getExternalStorageDirectory().getPath() + "/" + CurrentTrack.second+".wav");
                        mediaPlayer = MediaPlayer.create(context, Uri.parse(Environment.getExternalStorageDirectory().getPath() + "/" + CurrentTrack.second+".wav"));
                    }
                    currentMediaID = CurrentTrack.first;
                    if (mediaPlayer != null) {
                        mediaPlayer.setVolume(volume.first, volume.second);
                        String mediaFileCurrent = CurrentTrack.second;
                        mediaFilenameHistory.add(mediaFileCurrent);
                        writeToLogFile(mediaFileCurrent, mediaPlayer.getDuration(), volume.first, volume.second);
                        mediaPlayer.start();
                    }
                    soundHandler.postDelayed(this, DELAY);
                }
            });

            Log.i("mediap","media start");

    }

    /**
     * Pauses audio playback
     */
    public void pauseMedia(){
        isDelaying = false;
        if (mediaPlayer != null) {
            mediaPlayer.pause();
        }
        if (soundHandler != null) {
            soundHandler.removeCallbacksAndMessages(null);
        }
    }

    /**
     * Checks if audio currently playing
     * @return If currently playing True, else False
     */
    public boolean isMediaPlaying(){
        if (mediaPlayer != null) {
            return mediaPlayer.isPlaying() || isDelaying;
        }
        else {
            return false;
        }
    }

    /**
     * Gets the current playback position in the current audio file
     * @return Current playback position in the current audio file
     */
    public int getMediaPosition(){
        if (mediaPlayer != null) {
            return mediaPlayer.getCurrentPosition();
        }
        else {
            return -1;

        }
    }

    /**
     * Sets the volume of audio playback
     * Currently left & right volume will always be the same
     * @param leftVolume Left volume to set
     * @param rightVolume Right volume to set
     */
    public void setMediaVolume(float leftVolume, float rightVolume){
        volume = new Pair<Float, Float>(leftVolume, rightVolume);
        if (mediaPlayer  != null) {
            mediaPlayer.setVolume(volume.first, volume.second);
        }
    }

    /**
     * Gets the currently playing media filename. If no media playing, returns "none"
     * @return Currently playing media filename of "none" if no media playing
     */
    public String getCurrentMedia(){
        if (mediaPlayer != null) {
            if (isMediaPlaying()) {
                return ""+currentMediaID;
            } else {
                return "none";
            }
        }
        else {
            return "none";
        }

    }

    public int getCueCount(){
        if(everPlayed) {
            return mediaFilenameHistory.size();
        } else{
            return 0;
        }
    }

    public float getVolume() {
        return volume.first;
    }

    /**
     * Sets up logFile File object. Creates the logFile if it doesn't already exist
     */
    private void setLogFile(){
        logFile = new File(storageDirectory, logFileName);
        if(!logFile.exists()) {
            try {
                logFile.createNewFile();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * Sets up BufferedWriter object to write to logFile
     */
    private void setLogFileWriter(){
        try {
            logFileWriter = new BufferedWriter(new FileWriter(logFile, true));
        } catch (IOException e){
            e.printStackTrace();
        }
    }

    /**
     * Writes a single record (1 line) to the logFile
     * One record is written every time an audio file is played
     * Record is written to as such:
     * TIMESTAMP, NAME OF AUDIO FILE, DURATION OF AUDIO FILE, LEFT VOLUME PLAYED AT, RIGHT VOLUME PLAYED AT
     * @param signal The filename of the audio file played
     * @param mediaLength The duration of the audio file played
     * @param leftVolume The left volume of the audio file played
     * @param rightVolume The right volume of the audio file played
     */
    private void writeToLogFile(String signal, int mediaLength, Float leftVolume, Float rightVolume){
        setLogFileWriter();
        String timeStamp = String.valueOf(System.currentTimeMillis());
        String line = timeStamp + "," + signal + "," + String.valueOf(mediaLength) + "," +
                String.valueOf(leftVolume) + "," + String.valueOf(rightVolume);
        try {
            logFileWriter.write(line);
            logFileWriter.newLine();
            logFileWriter.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }


    void getMediaData(){
        final List<String> mediaFileLines = splitFiles(files);
        Log.i("mediafiles",mediaFileLines.toString());
        final List<Pair<Float, Integer>> mediaData = new ArrayList<>();
        for(String line: mediaFileLines){
            String resID="";
            if (line.indexOf(".wav") > -1) {
                resID = line.split("\\.")[0];
            }
            else {
                resID=line;
            }
            Log.i("foundsound",line+","+resID);
            final int raw = context.getResources().getIdentifier(resID, "raw", context.getPackageName());
            Pair<Integer,String> temp=new Pair<Integer,String>(raw,resID);
            mediaFileNames.add(temp); //add to the list of media
        }

    }




    private List<String> splitFiles(String fileList) {
        Log.i("filelist",fileList);
        List<String> temp=  new LinkedList<String>(Arrays.asList(fileList.split(":")));
        temp.remove(0);
        return temp;

    }

}
