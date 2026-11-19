package cz.matematika.sovicka;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.webkit.WebView;

import org.json.JSONArray;

import java.util.ArrayList;

/**
 * Czech speech recognition for the reading exercise (Android SpeechRecognizer).
 * Results go to JS: window.__stt(id, type, data) with type ready | end | res (array of strings) | err (code).
 */
class Listener implements RecognitionListener {
    static final int REQ_MIC = 43;
    private final Activity act;
    private final WebView web;
    private SpeechRecognizer rec;
    private String id;
    private String pendingId;
    private ArrayList<String> hints = new ArrayList<>();
    private ArrayList<String> lastPartial = new ArrayList<>();

    /** Words the recognizer should expect (used on Android 13+ when supported). */
    void setHints(String json) {
        hints = new ArrayList<>();
        try {
            JSONArray a = new JSONArray(json);
            for (int k = 0; k < a.length(); k++) hints.add(a.getString(k));
        } catch (Exception ignored) { }
    }

    private final CloudSpeech cloud = new CloudSpeech(BuildConfig.SPEECH_KEY);

    Listener(Activity act, WebView web) { this.act = act; this.web = web; }

    boolean available() { return cloud.enabled() || SpeechRecognizer.isRecognitionAvailable(act); }

    void listen(String newId) {
        if (act.checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            pendingId = newId;
            act.requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, REQ_MIC);
            return;
        }
        if (cloud.enabled()) {          // Google Cloud: much better for single syllables
            id = newId;
            final String sid = newId;
            cloud.listen(hints, new CloudSpeech.Callback() {
                @Override public void ready() { send(sid, "ready", "null"); }
                @Override public void result(ArrayList<String> texts) { send(sid, "res", new JSONArray(texts).toString()); }
                @Override public void error(int code) { send(sid, "err", String.valueOf(code)); }
            });
            return;
        }
        try {
            if (rec == null) {
                rec = SpeechRecognizer.createSpeechRecognizer(act);
                rec.setRecognitionListener(this);
            } else {
                rec.cancel();
            }
            id = newId;
            lastPartial = new ArrayList<>();
            Intent i = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
            i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
            i.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "cs-CZ");
            i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "cs-CZ");
            i.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 10);
            i.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
            if (!hints.isEmpty()) i.putStringArrayListExtra("android.speech.extra.BIASING_STRINGS", hints);
            i.putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, act.getPackageName());
            // short syllables: listen a bit longer and do not stop too early
            i.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS, 2000L);
            i.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 1500L);
            i.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS, 1500L);
            rec.startListening(i);
        } catch (Exception e) {
            send(newId, "err", "5");
        }
    }

    void stop() {
        cloud.cancel();
        if (rec != null) try { rec.cancel(); } catch (Exception ignored) { }
    }

    void destroy() {
        if (rec != null) try { rec.destroy(); } catch (Exception ignored) { }
        rec = null;
    }

    void onPermission(boolean granted) {
        String p = pendingId;
        pendingId = null;
        if (p == null) return;
        if (granted) listen(p); else send(p, "err", "9");
    }

    private void send(String sid, String type, String data) {
        if (sid == null || !sid.matches("\\d+")) return;
        final String js = "window.__stt && window.__stt('" + sid + "','" + type + "'," + data + ")";
        web.post(() -> web.evaluateJavascript(js, null));
    }

    @Override public void onReadyForSpeech(Bundle params) { send(id, "ready", "null"); }
    @Override public void onBeginningOfSpeech() { }
    @Override public void onRmsChanged(float rmsdB) { }
    @Override public void onBufferReceived(byte[] buffer) { }
    @Override public void onEndOfSpeech() { send(id, "end", "null"); }
    @Override public void onError(int error) {
        // short words often only come as partial results; use them instead of "no match"
        if (!lastPartial.isEmpty() && (error == SpeechRecognizer.ERROR_NO_MATCH || error == SpeechRecognizer.ERROR_SPEECH_TIMEOUT)) {
            send(id, "res", new JSONArray(lastPartial).toString());
        } else {
            send(id, "err", String.valueOf(error));
        }
    }
    @Override public void onPartialResults(Bundle partialResults) {
        ArrayList<String> r = partialResults.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
        if (r != null) for (String x : r) if (x != null && !x.trim().isEmpty() && !lastPartial.contains(x)) lastPartial.add(x);
    }
    @Override public void onEvent(int eventType, Bundle params) { }

    @Override
    public void onResults(Bundle results) {
        ArrayList<String> r = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
        ArrayList<String> all = new ArrayList<>(r == null ? new ArrayList<String>() : r);
        for (String x : lastPartial) if (!all.contains(x)) all.add(x);
        send(id, "res", new JSONArray(all).toString());
    }
}
