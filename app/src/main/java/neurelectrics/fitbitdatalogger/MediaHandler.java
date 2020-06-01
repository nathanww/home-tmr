package neurelectrics.fitbitdatalogger;

import android.content.ContentResolver;
import android.content.Context;
import android.content.res.AssetManager;
import android.database.Cursor;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Environment;
import android.provider.MediaStore;
import android.support.v4.util.Pair;
import android.util.Log;
import android.webkit.MimeTypeMap;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;

import static android.Manifest.permission.READ_EXTERNAL_STORAGE;
import static android.Manifest.permission.WRITE_EXTERNAL_STORAGE;
import static android.os.ParcelFileDescriptor.MODE_WORLD_READABLE;
import static android.support.v4.app.ActivityCompat.requestPermissions;


/**
 * @author Torin Kovach
 * @Date Mon 1-Jun-2020
 */
public class MediaHandler {
    private final Context context;

    /** Constructor
     * @param context Application Context object
     */
    public MediaHandler(Context context){
        this.context = context;
    }

    /*
    NOTE: any sound file to be played is identified by it's resource identifier and score.
            A HashMap between resID and filename is used to get identifying filename
     */
    private List<Pair<Float, Integer>> mediaData; // Sorted by score (Score, Resource Identifier) pairs
    private Pair<List<Pair>, List<Pair>> mediaDataHalves; // Odd- & even-  indexed halves of mediaData
    private List<Pair> playableMedia; // All possible pairs to ever be played (one half)
    private List<Pair> mediaQueue = new ArrayList<Pair>(); // All possible pairs to be played next (no repeats until all sounds played)
    private MediaPlayer mediaPlayer; // The MediaPlayer object used to reference and play sounds
    private HashMap<Integer, String> mediaFileNames = new HashMap<>(); // (resID, filename) pairs allow getting filename using resID
    private Pair<Float, Float> volume = new Pair(1.0f, 1.0f); // Volume to play at
    private int currentMediaID; // resID of the currently playing or last played (if there is a pause) media
    final private String logFileName = "MediaLog.txt"; //Filename of file to write log data to in internal storage
    private File logFile; // File object for the log file
    private File storageDirectory; // Directory in internal storage in which logFile is stored
    private BufferedWriter logFileWriter; // Writes to the log file

    /**
     * Reads the files and sets up the MediaHandler for audio playback
     */
    public void readFiles() {
        storageDirectory = context.getFilesDir();
        setLogFile();
        mediaData = getSortedMediaData();
        mediaDataHalves = getMediaDataHalves(mediaData);
        setPlayableMedia();
        setNextTrack();
    }

    /**
     * Starts audio playback
     */
    public void startMedia(){
        mediaPlayer.start();
    }

    /**
     * Pauses audio playback
     */
    public void pauseMedia(){
        mediaPlayer.pause();
    }

    /**
     * Checks if audio currently playing
     * @return If currently playing True, else False
     */
    public boolean isMediaPlaying(){
        return mediaPlayer.isPlaying();
    }

    /**
     * Gets the current playback position in the current audio file
     * @return Current playback position in the current audio file
     */
    public int getMediaPosition(){
        return mediaPlayer.getCurrentPosition();
    }

    /**
     * Sets the volume of audio playback
     * Currently left & right volume will always be the same
     * @param leftVolume Left volume to set
     * @param rightVolume Right volume to set
     */
    public void setMediaVolume(float leftVolume, float rightVolume){
        volume = new Pair<Float, Float>(leftVolume, rightVolume);
        mediaPlayer.setVolume(volume.first, volume.second);
    }

    /**
     * Gets the currently playing media filename. If no media playing, returns "none"
     * @return Currently playing media filename of "none" if no media playing
     */
    public String getCurrentMedia(){
        if(isMediaPlaying()){
            return mediaFileNames.get(currentMediaID);
        } else{
            return "none";
        }
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
            System.out.println("HELLO");
            logFileWriter.write(line);
            logFileWriter.newLine();
            logFileWriter.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * Sets the group of audio files to be played for the whole time the application is live
     */
    private void setPlayableMedia(){
        // THIS CODE CAN BE USED TO RANDOMIZE WHICH HALF OF THE SOUNDS ARE PLAYED
        //final List<List<Pair>> halves = new ArrayList();
        //halves.add(mediaDataHalves.first);
        //halves.add(mediaDataHalves.second);
        //Collections.shuffle(halves);
        //playableMedia = halves.get(0);
        playableMedia = mediaDataHalves.first;
    }

    /**
     * Sets the queue of sounds to be played (mediaQueue)
     * While playable media holds every file to possibly be played,
     * media queue is a record of which sound should be played immediately next (no repeats, randomized)
     */
    private void setMediaQueue(){
        mediaQueue = new ArrayList<>(playableMedia);
        Collections.shuffle(mediaQueue);
    }

    /**
     * Sets up the new media to be played after the initial track is complete
     * "Recursively" called using MediaPlayed OnCompletion callback function
     */
    private void setNextTrack(){
        if(mediaQueue.size() == 0) {
            setMediaQueue();
        }
        Pair<Float, Integer> CurrentTrack = mediaQueue.get(0);
        mediaQueue.remove(0);
        if(mediaPlayer != null){
            mediaPlayer.release();
            mediaPlayer = null;
        }
        mediaPlayer = MediaPlayer.create(context, CurrentTrack.second);
        currentMediaID = CurrentTrack.second;
        mediaPlayer.setVolume(volume.first,volume.second);
        writeToLogFile(mediaFileNames.get(currentMediaID), mediaPlayer.getDuration(), volume.first, volume.second);
        mediaPlayer.setOnCompletionListener(new MediaPlayer.OnCompletionListener() {
            @Override
            public void onCompletion(MediaPlayer mediaPlayer) {
                setNextTrack();
                startMedia();
            }
        });
    }

    /**
     * Breaks sorted (score, resID) pairs into two halves
     * @param sortedMediaData all audio files in (score, resID) pairs, sorted by score
     * @return Pair of (odd-indexed audio file pairs, even-indexed audio file pairs)
     */
    private Pair<List<Pair>, List<Pair>> getMediaDataHalves(List<Pair<Float, Integer>> sortedMediaData){
        Pair<List<Pair>, List<Pair>> mediaDataHalves = new Pair<List<Pair>, List<Pair>>(new ArrayList<Pair>(), new ArrayList<Pair>());
        for(int i = 1; i < sortedMediaData.size() + 1; i++){
            if(i%2 == 1){
                mediaDataHalves.first.add(sortedMediaData.get(i-1));
            } else{
                mediaDataHalves.second.add(sortedMediaData.get(i-1));
            }
        }
        return mediaDataHalves;
    }

    /**
     * Sorts all (score, resID) audio files by score
     * @return All (score, resID) audio files sorted by score
     */
    private List<Pair<Float, Integer>> getSortedMediaData(){
        List<Pair<Float, Integer>> sortedMediaData = getMediaData();
        Collections.sort(sortedMediaData, new Comparator<Pair<Float, Integer>>() {
            @Override
            public int compare(Pair<Float, Integer> pair1, Pair<Float, Integer> pair2) {
                return pair1.first.compareTo(pair2.first);
            }
        });
        return sortedMediaData;
    }

    /**
     * Gets lines of media data file using getMediaData, gets resource identifiers based on read filename
     * @return Unsorted list of (score, resID) pairs for all audio files referenced in the media data
     */
    private List<Pair<Float, Integer>> getMediaData(){
        final List<String> mediaFileLines = readMediaFile();
        System.out.println(mediaFileLines);
        final List<Pair<Float, Integer>> mediaData = new ArrayList<>();
        for(String line: mediaFileLines){
            String[] brokenUp = line.split(":");
            final Float score = Float.valueOf(brokenUp[0]);
            final String resID = brokenUp[1].split("\\.")[0];
            final int raw = context.getResources().getIdentifier(resID, "raw", context.getPackageName());
            mediaFileNames.put(raw, resID);
            mediaData.add(new Pair(score, raw));
        }
        return mediaData;
    }

    /**
     * Locates media data file, then gets all of the lines of the media data file
     * @return List of all the lines in a media data file
     */
    private List<String> readMediaFile(){
        List<String> mediaLines = new ArrayList<>();
        try {
            for(File file: storageDirectory.listFiles()) {
                String fileName = file.getName();
                System.out.println(fileName);
                String ext = (fileName.lastIndexOf(".") == -1) ? "" : fileName.substring(fileName.lastIndexOf("."));
                if (ext.equals(".txt")) {
                    BufferedReader reader = new BufferedReader(new FileReader(file));
                    System.out.println("1");
                    String firstLine = reader.readLine();
                    System.out.println(firstLine);
                    if (firstLine.contains("WRITE_EXTERNAL_STORAGE")) {
                        String line;
                        while ((line = reader.readLine()) != null)
                            mediaLines.add(line);
                        return mediaLines;
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return mediaLines; // Returns empty list if no valid file was found
    }
}
