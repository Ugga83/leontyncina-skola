package cz.matematika.sovicka;

import android.media.AudioFormat;
import android.media.AudioRecord;
import android.media.MediaRecorder;
import android.util.Base64;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;

/**
 * Google Cloud Speech-to-Text for short syllables: records up to ~4 s of 16 kHz audio
 * (stops after a short pause once the child has spoken), then asks Google with the
 * expected syllables as strong hints. Much better than the on-device recognizer,
 * which cannot recognise single syllables (error 7).
 */
class CloudSpeech {
    interface Callback {
        void ready();
        void result(ArrayList<String> texts);
        void error(int code);   // same codes as android.speech.SpeechRecognizer
    }

    private static final int RATE = 16000;
    private final String key;
    private volatile boolean cancelled;
    private Thread worker;

    CloudSpeech(String key) { this.key = key; }

    boolean enabled() { return key != null && !key.isEmpty(); }

    void cancel() {
        cancelled = true;
    }

    @SuppressWarnings("MissingPermission")
    void listen(final ArrayList<String> hints, final Callback cb) {
        cancel();
        cancelled = false;
        worker = new Thread(() -> {
            byte[] pcm;
            try {
                pcm = record(cb);
            } catch (Exception e) {
                if (!cancelled) cb.error(3);   // audio problem
                return;
            }
            if (cancelled) return;
            if (pcm == null) { cb.error(6); return; }          // nothing said
            try {
                ArrayList<String> res = recognize(pcm, hints);
                if (cancelled) return;
                if (res.isEmpty()) cb.error(7); else cb.result(res);
            } catch (java.io.IOException e) {
                if (!cancelled) cb.error(2);   // network
            } catch (Exception e) {
                if (!cancelled) cb.error(4);   // server
            }
        });
        worker.start();
    }

    /** Records until ~0.7 s of silence after speech, max 4 s. Returns null if no speech at all. */
    @SuppressWarnings("MissingPermission")
    private byte[] record(Callback cb) throws Exception {
        int min = AudioRecord.getMinBufferSize(RATE, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT);
        AudioRecord ar = new AudioRecord(MediaRecorder.AudioSource.VOICE_RECOGNITION, RATE,
                AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT, Math.max(min, RATE));
        if (ar.getState() != AudioRecord.STATE_INITIALIZED) throw new IllegalStateException("mic");
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        short[] buf = new short[RATE / 20];                       // 50 ms chunks
        ar.startRecording();
        cb.ready();
        boolean spoke = false;
        int silentMs = 0, totalMs = 0;
        double noise = 300;                                       // running noise floor
        try {
            while (!cancelled && totalMs < 4000) {
                int n = ar.read(buf, 0, buf.length);
                if (n <= 0) continue;
                double sum = 0;
                byte[] b = new byte[n * 2];
                for (int i = 0; i < n; i++) {
                    sum += (double) buf[i] * buf[i];
                    b[2 * i] = (byte) (buf[i] & 0xff);
                    b[2 * i + 1] = (byte) ((buf[i] >> 8) & 0xff);
                }
                out.write(b);
                double rms = Math.sqrt(sum / n);
                int ms = n * 1000 / RATE;
                totalMs += ms;
                if (!spoke && totalMs < 300) noise = Math.max(150, (noise + rms) / 2);
                boolean loud = rms > Math.max(700, noise * 3);
                if (loud) { spoke = true; silentMs = 0; }
                else if (spoke) { silentMs += ms; if (silentMs >= 700) break; }
                if (!spoke && totalMs >= 3500) break;             // nobody said anything
            }
        } finally {
            try { ar.stop(); } catch (Exception ignored) { }
            ar.release();
        }
        return spoke ? out.toByteArray() : null;
    }

    private ArrayList<String> recognize(byte[] pcm, ArrayList<String> hints) throws Exception {
        JSONObject ctx = new JSONObject();
        ctx.put("phrases", new JSONArray(hints));
        ctx.put("boost", 20);
        JSONObject cfg = new JSONObject();
        cfg.put("encoding", "LINEAR16");
        cfg.put("sampleRateHertz", RATE);
        cfg.put("languageCode", "cs-CZ");
        cfg.put("maxAlternatives", 5);
        cfg.put("model", "command_and_search");
        cfg.put("speechContexts", new JSONArray().put(ctx));
        JSONObject body = new JSONObject();
        body.put("config", cfg);
        body.put("audio", new JSONObject().put("content", Base64.encodeToString(pcm, Base64.NO_WRAP)));

        HttpURLConnection c = (HttpURLConnection) new URL(
                "https://speech.googleapis.com/v1p1beta1/speech:recognize").openConnection();
        c.setConnectTimeout(8000);
        c.setReadTimeout(15000);
        c.setRequestMethod("POST");
        c.setDoOutput(true);
        c.setRequestProperty("Content-Type", "application/json");
        c.setRequestProperty("X-Goog-Api-Key", key);
        try (OutputStream os = c.getOutputStream()) { os.write(body.toString().getBytes("UTF-8")); }
        int code = c.getResponseCode();
        if (code >= 400) throw new IllegalStateException("HTTP " + code);
        String json;
        try (InputStream in = c.getInputStream()) {
            ByteArrayOutputStream bo = new ByteArrayOutputStream();
            byte[] b = new byte[8192];
            int n;
            while ((n = in.read(b)) > 0) bo.write(b, 0, n);
            json = bo.toString("UTF-8");
        } finally {
            c.disconnect();
        }
        ArrayList<String> out = new ArrayList<>();
        JSONArray results = new JSONObject(json).optJSONArray("results");
        if (results != null) {
            for (int i = 0; i < results.length(); i++) {
                JSONArray alts = results.getJSONObject(i).optJSONArray("alternatives");
                if (alts == null) continue;
                for (int k = 0; k < alts.length(); k++) {
                    String t = alts.getJSONObject(k).optString("transcript", "").trim();
                    if (!t.isEmpty() && !out.contains(t)) out.add(t);
                }
            }
        }
        return out;
    }
}
