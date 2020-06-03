package neurelectrics.fitbitdatalogger;

import android.content.Context;
import android.support.v4.util.Pair;

import java.util.ArrayList;
import java.util.List;

/**
 * @author Torin Kovach
 * @Date Wed 3-Jun-2020
 */
public class TestMediaHandler extends MediaHandler {

    private Pair<Integer, Integer> soundFileRange = new Pair<>(70, 80); //Plays from s[soundFileRange.first].wav to s[soundFileRange.second].wav

    /**
     * Constructor
     * @param context Application Context object
     */
    public TestMediaHandler(Context context) {
        super(context);
        logFileName = "ButtonMediaLog.txt";
    }

    //No need to split in half -- instead just throw forward getSortedMediaData output
    @Override
    Pair<List<Pair<Float, Integer>>, List<Pair<Float, Integer>>> getMediaDataHalves(List<Pair<Float, Integer>> sortedMediaData){
        return new Pair<>(sortedMediaData, sortedMediaData);
    }

    //No need to sort as there are no real scores -- instead just throw forward getMediaData output
    @Override
    List<Pair<Float, Integer>> getSortedMediaData(){
        List<Pair<Float, Integer>> sortedMediaData = getMediaData();
        return sortedMediaData;
    }

    //Instead of using file score info, just get audio files from s[soundFileRange.first].wav to s[soundFileRange.second].wav
    @Override
    List<Pair<Float, Integer>> getMediaData() {
        final List<Pair<Float, Integer>> mediaData = new ArrayList<>();
        for(int i = soundFileRange.first; i < soundFileRange.second; i++){
            final String resID = "s" + String.valueOf(i);
            final String filename = resID + ".wav";
            final int raw = context.getResources().getIdentifier(resID, "raw", context.getPackageName());
            mediaFileNames.put(raw, resID);
            mediaData.add(new Pair<Float, Integer>(new Float(0), raw));
        }
        return mediaData;
    }
}
