package cz.matematika.sovicka;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.widget.Toast;

import androidx.core.content.FileProvider;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Checks GitHub Releases of this project for a newer APK, downloads it and
 * hands it to the system installer (Android always asks the user to confirm).
 */
class Updater {

    // The numeric repository id survives renaming the repository on GitHub;
    // the name-based URL is only a fallback.
    private static final String[] LATEST = {
            "https://api.github.com/repositories/1464087746/releases/latest",
            "https://api.github.com/repos/Ugga83/Matematika-/releases/latest",
    };

    private final Activity act;
    private volatile boolean busy;
    private File pendingApk;

    Updater(Activity act) { this.act = act; }

    long localVersion() {
        try {
            PackageInfo pi = act.getPackageManager().getPackageInfo(act.getPackageName(), 0);
            return Build.VERSION.SDK_INT >= 28 ? pi.getLongVersionCode() : pi.versionCode;
        } catch (Exception e) {
            return 0;
        }
    }

    String localVersionName() {
        try {
            return act.getPackageManager().getPackageInfo(act.getPackageName(), 0).versionName;
        } catch (Exception e) {
            return "?";
        }
    }

    private SharedPreferences prefs() { return act.getSharedPreferences("app", Activity.MODE_PRIVATE); }

    /** @param manual true when the user pressed the button (shows "up to date" / errors). */
    void check(final boolean manual) {
        if (busy) return;
        busy = true;
        new Thread(() -> {
            try {
                JSONObject rel = null;
                Exception last = null;
                for (String u : LATEST) {
                    try { rel = new JSONObject(httpGetString(u)); break; } catch (Exception e) { last = e; }
                }
                if (rel == null) throw last;
                final String tag = rel.getString("tag_name");
                long remote = parseBuild(tag);
                String apkUrl = null;
                JSONArray assets = rel.getJSONArray("assets");
                for (int i = 0; i < assets.length(); i++) {
                    JSONObject a = assets.getJSONObject(i);
                    if (a.getString("name").endsWith(".apk")) {
                        apkUrl = a.getString("browser_download_url");
                        break;
                    }
                }
                final String url = apkUrl;
                boolean newer = url != null && remote > localVersion();
                boolean skipped = tag.equals(prefs().getString("skipTag", ""));
                if (newer && (manual || !skipped)) {
                    act.runOnUiThread(() -> ask(tag, url));
                } else if (manual) {
                    toast("Máš nejnovější verzi (" + localVersionName() + ").");
                }
            } catch (Exception e) {
                if (manual) toast("Aktualizace se nepodařilo ověřit. Je zapnutý internet?");
            } finally {
                busy = false;
            }
        }).start();
    }

    private static long parseBuild(String tag) {
        try {
            return Long.parseLong(tag.substring(tag.lastIndexOf('.') + 1).replaceAll("\\D", ""));
        } catch (Exception e) {
            return -1;
        }
    }

    private void ask(final String tag, final String url) {
        if (act.isFinishing()) return;
        new AlertDialog.Builder(act)
                .setTitle("Nová verze je tady! 🎉")
                .setMessage("Leontýnčina škola " + tag.replaceFirst("^v", "")
                        + " je připravená. Chceš ji teď stáhnout a nainstalovat?\n\n"
                        + "Hvězdičky a nálepky zůstanou.")
                .setPositiveButton("Aktualizovat", (d, w) -> download(url))
                .setNegativeButton("Později", (d, w) -> prefs().edit().putString("skipTag", tag).apply())
                .show();
    }

    private void download(final String url) {
        final AlertDialog progress = new AlertDialog.Builder(act)
                .setTitle("Stahuji novou verzi…")
                .setMessage("0 %")
                .setCancelable(false)
                .show();
        busy = true;
        new Thread(() -> {
            File dir = new File(act.getCacheDir(), "updates");
            File apk = new File(dir, "update.apk");
            try {
                //noinspection ResultOfMethodCallIgnored
                dir.mkdirs();
                HttpURLConnection c = open(url);
                long total = c.getContentLengthLong();
                try (InputStream in = c.getInputStream(); OutputStream out = new FileOutputStream(apk)) {
                    byte[] buf = new byte[64 * 1024];
                    long done = 0;
                    int lastPct = -1, n;
                    while ((n = in.read(buf)) > 0) {
                        out.write(buf, 0, n);
                        done += n;
                        if (total > 0) {
                            final int pct = (int) (done * 100 / total);
                            if (pct != lastPct) {
                                lastPct = pct;
                                act.runOnUiThread(() -> progress.setMessage(pct + " %"));
                            }
                        }
                    }
                } finally {
                    c.disconnect();
                }
                act.runOnUiThread(() -> {
                    progress.dismiss();
                    install(apk);
                });
            } catch (Exception e) {
                act.runOnUiThread(() -> {
                    progress.dismiss();
                    toast("Stažení se nepovedlo. Zkus to prosím znovu.");
                });
            } finally {
                busy = false;
            }
        }).start();
    }

    private void install(File apk) {
        if (Build.VERSION.SDK_INT >= 26 && !act.getPackageManager().canRequestPackageInstalls()) {
            pendingApk = apk;
            new AlertDialog.Builder(act)
                    .setTitle("Ještě jedno povolení")
                    .setMessage("Aby se mohla aplikace sama aktualizovat, povol na další obrazovce "
                            + "„Povolit z tohoto zdroje“ a pak se vrať zpět.")
                    .setPositiveButton("Rozumím", (d, w) -> {
                        try {
                            act.startActivity(new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                                    Uri.parse("package:" + act.getPackageName())));
                        } catch (Exception e) {
                            launchInstaller(apk);
                        }
                    })
                    .setNegativeButton("Zrušit", (d, w) -> pendingApk = null)
                    .show();
            return;
        }
        launchInstaller(apk);
    }

    /** Call from Activity.onResume: continues after the user allowed installs. */
    void onResume() {
        if (pendingApk == null) return;
        if (Build.VERSION.SDK_INT >= 26 && !act.getPackageManager().canRequestPackageInstalls()) return;
        File apk = pendingApk;
        pendingApk = null;
        launchInstaller(apk);
    }

    private void launchInstaller(File apk) {
        try {
            Uri uri = FileProvider.getUriForFile(act, act.getPackageName() + ".files", apk);
            Intent i = new Intent(Intent.ACTION_VIEW);
            i.setDataAndType(uri, "application/vnd.android.package-archive");
            i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            act.startActivity(i);
        } catch (Exception e) {
            toast("Instalaci se nepodařilo spustit.");
        }
    }

    private void toast(final String msg) {
        act.runOnUiThread(() -> Toast.makeText(act, msg, Toast.LENGTH_LONG).show());
    }

    private static HttpURLConnection open(String url) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setInstanceFollowRedirects(true);
        c.setConnectTimeout(15000);
        c.setReadTimeout(30000);
        c.setRequestProperty("User-Agent", "LeontyncinaSkola-Android");
        c.setRequestProperty("Accept", url.contains("api.github.com") ? "application/vnd.github+json" : "*/*");
        int code = c.getResponseCode();
        if (code >= 400) throw new Exception("HTTP " + code);
        return c;
    }

    private static String httpGetString(String url) throws Exception {
        HttpURLConnection c = open(url);
        try (InputStream in = c.getInputStream()) {
            ByteArrayOutputStream bo = new ByteArrayOutputStream();
            byte[] buf = new byte[8192];
            int n;
            while ((n = in.read(buf)) > 0) bo.write(buf, 0, n);
            return bo.toString("UTF-8");
        } finally {
            c.disconnect();
        }
    }
}
