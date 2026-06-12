import { withAndroidManifest } from "@expo/config-plugins";

const withGoogleMapsApiKey = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const application = manifest.application[0];

    if (!application["meta-data"]) {
      application["meta-data"] = [];
    }

    // remove existing entry if present to avoid duplicates
    application["meta-data"] = application["meta-data"].filter(
      (item) => item.$["android:name"] !== "com.google.android.geo.API_KEY",
    );

    // add the key
    application["meta-data"].push({
      $: {
        "android:name": "com.google.android.geo.API_KEY",
        "android:value": process.env.EXPO_PUBLIC_ANDROID_MAPS_KEY,
      },
    });

    return config;
  });
};

export default ({ config }) => {
  return withGoogleMapsApiKey({
    ...config,
    // rest of your config
    name: "lafosse-final-project",
    slug: "lafosse-final-project",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "lafossefinalproject",
    userInterfaceStyle: "automatic",
    ios: {
      icon: "./assets/expo.icon",
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_IOS_MAPS_KEY,
      },
    },
    android: {
      package: "com.lafossefinalproject.findmypet",
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      predictiveBackGestureEnabled: false,
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_ANDROID_MAPS_KEY,
        },
      },
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      "react-native-maps",
      "expo-location",
      "expo-navigation-bar",
      "expo-image-picker",
      "expo-camera",
      "expo-notifications",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#208AEF",
          android: {
            image: "./assets/images/splash-icon.png",
            imageWidth: 76,
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "246b756a-b86a-4325-ac1f-e6ae68d7ddf9",
      },
    },
    owner: "ash773s-team",
  });
};
