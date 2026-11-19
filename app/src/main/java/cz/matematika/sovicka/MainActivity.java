package cz.matematika.sovicka;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;

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
        web.setWebChromeClient(new WebChromeClient());
        web.addJavascriptInterface(new Bridge(), "AndroidTTS");
        web.loadUrl("file:///android_asset/www/index.html");
        setContentView(web);
        hideSystemBars();

        tts = new TextToSpeech(this, this);
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
        web.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
    }

    @Override
    protected void onDestroy() {
        if (tts != null) tts.shutdown();
        web.destroy();
        super.onDestroy();
    }
}
