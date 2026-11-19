plugins {
    id("com.android.application")
}

android {
    namespace = "cz.matematika.sovicka"
    compileSdk = 35

    defaultConfig {
        applicationId = "cz.matematika.sovicka"
        minSdk = 26
        targetSdk = 35
        versionCode = (System.getenv("GITHUB_RUN_NUMBER") ?: "1").toInt()
        versionName = "1.0." + (System.getenv("GITHUB_RUN_NUMBER") ?: "0")
        // Google Cloud Speech-to-Text key for reading practice (GitHub secret SPEECH_API_KEY; empty = on-device recognizer)
        buildConfigField("String", "SPEECH_KEY", "\"" + (System.getenv("SPEECH_API_KEY") ?: "") + "\"")
    }

    buildFeatures {
        buildConfig = true
    }

    // Shared signing key committed in the repo so that every build can be installed
    // over the previous one (it is a hobby app, not distributed via Google Play).
    signingConfigs {
        create("shared") {
            storeFile = file("sovicka.keystore")
            storePassword = "sovicka"
            keyAlias = "sovicka"
            keyPassword = "sovicka"
        }
    }

    buildTypes {
        getByName("release") {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("shared")
        }
        getByName("debug") {
            signingConfig = signingConfigs.getByName("shared")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation("androidx.core:core:1.13.1")
}
