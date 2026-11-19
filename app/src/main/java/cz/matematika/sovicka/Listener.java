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

    Listener(Activity act, WebView web) { this.act = act; this.web = web; }

    boolean available() { return SpeechRecognizer.isRecognitionAvailable(act); }

    void listen(String newId) {
        if (act.checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            pendingId = newId;
            act.requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, REQ_MIC);
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
            Intent i = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
            i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
            i.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "cs-CZ");
            i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "cs-CZ");
            i.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 10);
            i.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, false);
            i.putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, act.getPackageName());
            i.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 800L);
            i.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS, 800L);
            rec.startListening(i);
        } catch (Exception e) {
            send(newId, "err", "5");
        }
    }

    void stop() {
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
    @Override public void onError(int error) { send(id, "err", String.valueOf(error)); }
    @Override public void onPartialResults(Bundle partialResults) { }
    @Override public void onEvent(int eventType, Bundle params) { }

    @Override
    public void onResults(Bundle results) {
        ArrayList<String> r = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
        send(id, "res", new JSONArray(r == null ? new ArrayList<String>() : r).toString());
    }
}
