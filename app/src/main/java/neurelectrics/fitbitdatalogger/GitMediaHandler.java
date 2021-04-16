package neurelectrics.fitbitdatalogger;

import android.content.Context;
import android.os.Environment;
import android.support.v4.util.Pair;
import android.util.Log;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class GitMediaHandler extends MediaHandler {

    private final String serverOutput;

    /**
     * Constructor
     *
     * @param context Application Context object
     */
    public GitMediaHandler(Context context, String serverOutput) {
        super(context);
        this.serverOutput = serverOutput;
    }

    @Override
    Pair<List<Pair<Float, Integer>>, List<Pair<Float, Integer>>> getMediaDataHalves(List<Pair<Float, Integer>> sortedMediaData) {
        String filenames[]= serverOutput.split(":");
        filenames = Arrays.copyOfRange(filenames, 1, filenames.length);
        List<Pair<Float, Integer>> fileData = new ArrayList<Pair<Float, Integer>>();
        int externalFileID=-1; //id used to refer to files not compiled into the app, will always be negative
        for (String filename: filenames) {
            System.out.println(filename);

            int raw = context.getResources().getIdentifier(filename.split("\\.")[0], "raw", context.getPackageName());
            if (raw == 0) { //raw will be zero if the filename was not found
                File file=new File(Environment.getExternalStorageDirectory().getPath()+ "/"+filename);
                if (file.exists()) {
                    raw = externalFileID;
                    externalFileID--;
                }
                else { //file was not found
                    Log.e("fitbitTMR","File "+filename+" not, found, using a placeholder");
                    raw=context.getResources().getIdentifier("myoci1.wav", "raw", context.getPackageName());
                }
            }
            mediaFileNames.put(raw,filename); //store this so we can see the name in the log file
            fileData.add(new Pair<Float, Integer>(0.0f, raw));
        }
        return new Pair<List<Pair<Float, Integer>>, List<Pair<Float, Integer>>>(fileData, fileData);
    }
}
