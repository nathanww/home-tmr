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

public class MediaHandler {
    private final Context context;

    public MediaHandler(Context context){
        this.context = context;
    }

    private List<Pair<Float, Integer>> mediaData;
    private Pair<List<Pair>, List<Pair>> mediaDataHalves;
    private List<Pair> playableMedia;
    private List<Pair> mediaQueue = new ArrayList<Pair>();
    private MediaPlayer mediaPlayer;
    private HashMap<Integer, String> mediaFileNames = new HashMap<>();
    private Pair<Float, Float> volume = new Pair(1.0f, 1.0f);
    private int currentMediaID;
    final private String logFileName = "MediaLog.txt";
    private File logFile;
    private File storageDirectory;
    private BufferedWriter logFileWriter;

    public void readFiles() {
        storageDirectory = context.getFilesDir();
        setLogFile();
        mediaData = getSortedMediaData();
        mediaDataHalves = getMediaDataHalves(mediaData);
        setPlayableMedia();
        setNextTrack();
    }

    public void startMedia(){
        mediaPlayer.start();
    }

    public void pauseMedia(){
        mediaPlayer.pause();
    }

    public boolean isMediaPlaying(){
        return mediaPlayer.isPlaying();
    }

    public int getMediaPosition(){
        return mediaPlayer.getCurrentPosition();
    }

    public void setMediaVolume(float leftVolume, float rightVolume){
        volume = new Pair<Float, Float>(leftVolume, rightVolume);
        mediaPlayer.setVolume(volume.first, volume.second);
    }

    public String getCurrentMedia(){
        if(isMediaPlaying()){
            return mediaFileNames.get(currentMediaID);
        } else{
            return "none";
        }
    }

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

    private void setLogFileWriter(){
        try {
            logFileWriter = new BufferedWriter(new FileWriter(logFile, true));
        } catch (IOException e){
            e.printStackTrace();
        }
    }

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

    private void setPlayableMedia(){
        //final List<List<Pair>> halves = new ArrayList();
        //halves.add(mediaDataHalves.first);
        //halves.add(mediaDataHalves.second);
        //Collections.shuffle(halves);
        //playableMedia = halves.get(0);
        playableMedia = mediaDataHalves.first;
    }

    private void setMediaQueue(){
        mediaQueue = new ArrayList<>(playableMedia);
        Collections.shuffle(mediaQueue);
    }


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

    private void WriteRecord(){

    }

    private List<String> readMediaFile(){
        AssetManager assetManager = this.context.getAssets();
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
        return mediaLines; // Returns empty List if no valid file was found
    }
}
