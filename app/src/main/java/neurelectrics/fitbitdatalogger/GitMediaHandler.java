package neurelectrics.fitbitdatalogger;

import android.content.Context;
import android.support.v4.util.Pair;

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
        for (String filename: filenames) {
            System.out.println(filename);
            final int raw = context.getResources().getIdentifier(filename.split("\\.")[0], "raw", context.getPackageName());
            fileData.add(new Pair<Float, Integer>(0.0f, raw));
        }
        return new Pair<List<Pair<Float, Integer>>, List<Pair<Float, Integer>>>(fileData, fileData);
    }
}
