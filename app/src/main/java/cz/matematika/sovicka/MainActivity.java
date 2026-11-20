package cz.matematika.sovicka;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.Manifest;
import android.graphics.Color;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * Hosts the game (assets/www/index.html) in a WebView and lets it talk
 * through Android's built-in text-to-speech in Czech.
 */
public class MainActivity extends Activity implements TextToSpeech.OnInitListener {

    private static final Locale CZECH = new Locale("cs", "CZ");

    // 0 = starting, 1 = ready, 2 = no Czech voice / TTS unavailable
    private volatile int ttsStatus = 0;
    private TextToSpeech tts;
    private WebView web;
    private String pendingText;
    private String pendingId;
    private PermissionRequest pendingPerm;
    private Updater updater;
    private Listener listener;
    private static final int REQ_MEDIA = 42;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#8FD3FF"));
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(true);
        s.setTextZoom(100);
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> handleWebPermission(request));
            }
        });
        web.addJavascriptInterface(new Bridge(), "AndroidTTS");
        web.loadUrl("file:///android_asset/www/index.html");
        setContentView(web);
        hideSystemBars();

        tts = new TextToSpeech(this, this);

        listener = new Listener(this, web);
        updater = new Updater(this);
        web.postDelayed(() -> updater.check(false), 3000);
    }

    @Override
    public void onInit(int status) {
        if (status != TextToSpeech.SUCCESS) {
            ttsStatus = 2;
            return;
        }
        int res = tts.setLanguage(CZECH);
        if (res == TextToSpeech.LANG_MISSING_DATA || res == TextToSpeech.LANG_NOT_SUPPORTED) {
            ttsStatus = 2;
            offerVoiceInstallOnce();
            return;
        }
        pickBestCzechVoice();
        tts.setSpeechRate(0.9f);
        tts.setPitch(1.1f);
        tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
            @Override public void onStart(String id) { }
            @Override public void onDone(String id) { notifyDone(id); }
            @Override public void onError(String id) { notifyDone(id); }
            @Override public void onStop(String id, boolean interrupted) { notifyDone(id); }
        });
        ttsStatus = 1;
        synchronized (this) {
            if (pendingText != null) {
                tts.speak(pendingText, TextToSpeech.QUEUE_FLUSH, null, pendingId);
                pendingText = null;
            }
        }
    }

    /** Camera (mirror) and microphone (record yourself) for the speech-therapy part. */
    private void handleWebPermission(PermissionRequest request) {
        List<String> need = new ArrayList<>();
        for (String r : request.getResources()) {
            if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(r)
                    && checkSelfPermission(Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
                need.add(Manifest.permission.CAMERA);
            }
            if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(r)
                    && checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                need.add(Manifest.permission.RECORD_AUDIO);
            }
        }
        if (need.isEmpty()) {
            request.grant(request.getResources());
            return;
        }
        if (pendingPerm != null) pendingPerm.deny();
        pendingPerm = request;
        requestPermissions(need.toArray(new String[0]), REQ_MEDIA);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] results) {
        super.onRequestPermissionsResult(requestCode, permissions, results);
        if (requestCode == Listener.REQ_MIC) {
            listener.onPermission(results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED);
            return;
        }
        if (requestCode != REQ_MEDIA || pendingPerm == null) return;
        boolean ok = results.length > 0;
        for (int r : results) ok &= r == PackageManager.PERMISSION_GRANTED;
        if (ok) pendingPerm.grant(pendingPerm.getResources()); else pendingPerm.deny();
        pendingPerm = null;
    }

    /** Prefer an offline, high-quality Czech voice when several are installed. */
    private void pickBestCzechVoice() {
        try {
            Set<Voice> voices = tts.getVoices();
            if (voices == null) return;
            Voice best = null;
            for (Voice v : voices) {
                if (v.getLocale() == null || !"cs".equals(v.getLocale().getLanguage())) continue;
                if (v.getFeatures() != null && v.getFeatures().contains(TextToSpeech.Engine.KEY_FEATURE_NOT_INSTALLED)) continue;
                if (best == null
                        || (best.isNetworkConnectionRequired() && !v.isNetworkConnectionRequired())
                        || (best.isNetworkConnectionRequired() == v.isNetworkConnectionRequired() && v.getQuality() > best.getQuality())) {
                    best = v;
                }
            }
            if (best != null) tts.setVoice(best);
        } catch (Exception ignored) { }
    }

    private void offerVoiceInstallOnce() {
        SharedPreferences p = getSharedPreferences("app", MODE_PRIVATE);
        if (p.getBoolean("askedVoice", false)) return;
        p.edit().putBoolean("askedVoice", true).apply();
        try {
            Intent i = new Intent(TextToSpeech.Engine.ACTION_INSTALL_TTS_DATA);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(i);
        } catch (Exception ignored) { }
    }

    private void notifyDone(final String id) {
        if (id == null || !id.matches("\\d+")) return;
        web.post(() -> web.evaluateJavascript("window.__ttsDone && window.__ttsDone('" + id + "')", null));
    }

    private class Bridge {
        @JavascriptInterface
        public void speak(String text, boolean flush, String id) {
            if (ttsStatus == 2) { notifyDone(id); return; }
            if (ttsStatus == 0) {
                synchronized (MainActivity.this) {
                    if (ttsStatus == 0) {
                        if (pendingId != null && pendingText != null) notifyDone(pendingId);
                        pendingText = text;
                        pendingId = id;
                        return;
                    }
                }
            }
            int r = tts.speak(text, flush ? TextToSpeech.QUEUE_FLUSH : TextToSpeech.QUEUE_ADD, null, id);
            if (r != TextToSpeech.SUCCESS) notifyDone(id);
        }

        @JavascriptInterface
        public void stop() {
            if (ttsStatus == 1) tts.stop();
        }

        @JavascriptInterface
        public int status() {
            return ttsStatus;
        }

        @JavascriptInterface
        public boolean sttAvailable() {
            return listener.available();
        }

        @JavascriptInterface
        public void listen(String id) {
            if (ttsStatus == 1) tts.stop();
            runOnUiThread(() -> listener.listen(id));
        }

        @JavascriptInterface
        public void setHints(String json) {
            listener.setHints(json);
        }

        @JavascriptInterface
        public void stopListen() {
            runOnUiThread(() -> listener.stop());
        }

        @JavascriptInterface
        public String appVersion() {
            return updater.localVersionName();
        }

        @JavascriptInterface
        public void checkUpdate() {
            runOnUiThread(() -> updater.check(true));
        }
    }

    @SuppressWarnings("deprecation")
    private void hideSystemBars() {
        web.setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemBars();
    }

    @SuppressWarnings("deprecation")
    @Override
    public void onBackPressed() {
        web.evaluateJavascript("window.appBack ? window.appBack() : false", value -> {
            if (!"true".equals(value)) finish();
        });
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (tts != null && ttsStatus == 1) tts.stop();
        if (listener != null) listener.stop();
        web.onPause();
        web.pauseTimers();          // no animations or timers while the app is in the background
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.resumeTimers();
        web.onResume();
        if (updater != null) updater.onResume();
    }

    @Override
    protected void onDestroy() {
        if (tts != null) tts.shutdown();
        if (listener != null) listener.destroy();
        web.destroy();
        super.onDestroy();
    }
}
