export default {
  expo: {
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
  },
};
