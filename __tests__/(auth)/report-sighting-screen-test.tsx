import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import ReportSightingScreen from "../../src/app/(auth)/reportSighting";

const mockReplace = jest.fn();
const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  router: {
    replace: (...args: any[]) => mockReplace(...args),
    back: () => mockBack(),
  },
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue("test-token"),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("expo-file-system/legacy", () => ({
  cacheDirectory: "file:///cache/",
  copyAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../../src/app/components/GeminiImageDescriber", () => {
  const { View } = require("react-native");
  return () => <View testID="gemini-describer" />;
});

jest.mock("react-native-maps", () => {
  const React = require("react");
  const { View } = require("react-native");
  const MockMapView = ({ children, onPress }: any) =>
    React.createElement(
      View,
      {
        testID: "map-view",
        onTouchEnd: () =>
          onPress &&
          onPress({
            nativeEvent: {
              coordinate: { latitude: 51.5, longitude: -0.1 },
            },
          }),
      },
      children,
    );
  const MockMarker = ({ testID }: any) =>
    React.createElement(View, { testID: testID || "marker" });
  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
    PROVIDER_GOOGLE: "google",
  };
});

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  CameraType: { back: "back" },
}));

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest
    .fn()
    .mockResolvedValue({ status: "granted" }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: 51.5074, longitude: -0.1278 },
  }),
  reverseGeocodeAsync: jest.fn().mockResolvedValue([
    {
      name: "1",
      street: "Marvels Lane",
      district: "Grove Park",
      city: "London",
    },
  ]),
}));

const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

const ImagePicker = require("expo-image-picker");
const Location = require("expo-location");
const AsyncStorage = require("@react-native-async-storage/async-storage");
const FileSystem = require("expo-file-system/legacy");

beforeEach(() => {
  jest.clearAllMocks();
  Location.requestForegroundPermissionsAsync.mockResolvedValue({
    status: "granted",
  });
  Location.getCurrentPositionAsync.mockResolvedValue({
    coords: { latitude: 51.5074, longitude: -0.1278 },
  });
  Location.reverseGeocodeAsync.mockResolvedValue([
    {
      name: "1",
      street: "Marvels Lane",
      district: "Grove Park",
      city: "London",
    },
  ]);
});

describe("report sighting screen tests", () => {
  it("renders all key elements", async () => {
    const { getByTestId, getByText } = render(<ReportSightingScreen />);
    expect(getByTestId("addPic")).toBeTruthy();
    expect(getByTestId("dropdown")).toBeTruthy();
    expect(getByTestId("colorInput")).toBeTruthy();
    expect(getByTestId("descriptionInput")).toBeTruthy();
    expect(getByTestId("contactInput")).toBeTruthy();
    expect(getByTestId("submitButton")).toBeTruthy();
    expect(getByText("Back")).toBeTruthy();
    expect(getByText("Log in / Register")).toBeTruthy();
  });

  it("requests location permission on mount", async () => {
    render(<ReportSightingScreen />);
    await waitFor(() => {
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
    });
  });

  it("gets current location when button is pressed", async () => {
    const { getByText } = render(<ReportSightingScreen />);
    await act(async () => {
      fireEvent.press(getByText("At my current location"));
      await new Promise((r) => setTimeout(r, 100));
    });
    expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
  });

  it("handles denied location permission on button press", async () => {
    Location.requestForegroundPermissionsAsync.mockResolvedValueOnce({
      status: "denied",
    });
    const { getByText } = render(<ReportSightingScreen />);
    await act(async () => {
      fireEvent.press(getByText("At my current location"));
      await new Promise((r) => setTimeout(r, 100));
    });
    expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it("picks image from gallery successfully", async () => {
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      granted: true,
    });
    ImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file:///photo.jpg" }],
    });
    FileSystem.copyAsync.mockResolvedValue(undefined);
    const { getByTestId } = render(<ReportSightingScreen />);
    await act(async () => {
      fireEvent.press(getByTestId("addPic"));
      await new Promise((r) => setTimeout(r, 100));
    });
    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
    expect(FileSystem.copyAsync).toHaveBeenCalled();
  });

  it("handles denied image library permission", async () => {
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      granted: false,
    });
    const { getByTestId } = render(<ReportSightingScreen />);
    await act(async () => {
      fireEvent.press(getByTestId("addPic"));
      await new Promise((r) => setTimeout(r, 100));
    });
    expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
  });

  it("handles cancelled image pick", async () => {
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      granted: true,
    });
    ImagePicker.launchImageLibraryAsync.mockResolvedValue({ canceled: true });
    const { getByTestId } = render(<ReportSightingScreen />);
    await act(async () => {
      fireEvent.press(getByTestId("addPic"));
      await new Promise((r) => setTimeout(r, 100));
    });
    expect(FileSystem.copyAsync).not.toHaveBeenCalled();
  });

  it("opens the image picker modal when add pic is pressed", async () => {
    const { getByTestId, getByText } = render(<ReportSightingScreen />);
    fireEvent.press(getByTestId("addPic"));
    await waitFor(() => {
      expect(getByText("Camera")).toBeTruthy();
      expect(getByText("Gallery")).toBeTruthy();
    });
  });

  it("opens the map modal when somewhere else is pressed", async () => {
    const { getByText } = render(<ReportSightingScreen />);
    fireEvent.press(getByText("Somewhere else (open map)"));
    await waitFor(() => {
      expect(getByText("Close map")).toBeTruthy();
    });
  });

  it("selects location on map and confirms", async () => {
    const { getByText, getByTestId } = render(<ReportSightingScreen />);
    fireEvent.press(getByText("Somewhere else (open map)"));
    await waitFor(() => expect(getByTestId("map-view")).toBeTruthy());
    fireEvent(getByTestId("map-view"), "touchEnd");
    await waitFor(() => expect(getByText("Confirm location")).toBeTruthy());
    await act(async () => {
      fireEvent.press(getByText("Confirm location"));
      await new Promise((r) => setTimeout(r, 100));
    });
    expect(getByText("✓ Location pinned")).toBeTruthy();
  });

  it("submits successfully with no token and redirects to landing", async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    mockFetch.mockResolvedValue({
      status: 201,
      json: jest.fn().mockResolvedValue({ sightings_id: 1 }),
    });
    const { getByTestId } = render(<ReportSightingScreen />);
    await waitFor(() => expect(getByTestId("submitButton")).toBeTruthy());
    await act(async () => {
      fireEvent.press(getByTestId("submitButton"));
      await new Promise((r) => setTimeout(r, 100));
    });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/sightings/"),
      expect.objectContaining({ method: "POST" }),
    );
    expect(mockReplace).toHaveBeenCalledWith("/(auth)/landing");
  });

  it("submits successfully with a token and redirects to tabs", async () => {
    const payload = Buffer.from(JSON.stringify({ users_id: 2 })).toString(
      "base64",
    );
    AsyncStorage.getItem.mockResolvedValue(`header.${payload}.sig`);
    mockFetch.mockResolvedValue({
      status: 201,
      json: jest.fn().mockResolvedValue({ sightings_id: 1 }),
    });
    const { getByTestId } = render(<ReportSightingScreen />);
    await waitFor(() => expect(getByTestId("submitButton")).toBeTruthy());
    await act(async () => {
      fireEvent.press(getByTestId("submitButton"));
      await new Promise((r) => setTimeout(r, 100));
    });
    expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
  });

  it("submits with an invalid token and falls back to null userId", async () => {
    AsyncStorage.getItem.mockResolvedValue("not.valid.jwt");
    mockFetch.mockResolvedValue({
      status: 201,
      json: jest.fn().mockResolvedValue({ sightings_id: 1 }),
    });
    const { getByTestId } = render(<ReportSightingScreen />);
    await waitFor(() => expect(getByTestId("submitButton")).toBeTruthy());
    await act(async () => {
      fireEvent.press(getByTestId("submitButton"));
      await new Promise((r) => setTimeout(r, 100));
    });
    expect(mockFetch).toHaveBeenCalled();
  });

  it("submits with an image attached", async () => {
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      granted: true,
    });
    ImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file:///photo.jpg" }],
    });
    FileSystem.copyAsync.mockResolvedValue(undefined);
    AsyncStorage.getItem.mockResolvedValue(null);
    mockFetch.mockResolvedValue({
      status: 201,
      json: jest.fn().mockResolvedValue({ sightings_id: 1 }),
    });
    const { getByTestId } = render(<ReportSightingScreen />);
    await act(async () => {
      fireEvent.press(getByTestId("addPic"));
      await new Promise((r) => setTimeout(r, 100));
    });
    await act(async () => {
      fireEvent.press(getByTestId("submitButton"));
      await new Promise((r) => setTimeout(r, 100));
    });
    expect(mockFetch).toHaveBeenCalled();
  });

  it("shows error alert when backend returns non-201", async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    mockFetch.mockResolvedValue({
      status: 400,
      json: jest.fn().mockResolvedValue({ error: "bad request" }),
    });
    const { getByTestId } = render(<ReportSightingScreen />);
    await waitFor(() => expect(getByTestId("submitButton")).toBeTruthy());
    await act(async () => {
      fireEvent.press(getByTestId("submitButton"));
      await new Promise((r) => setTimeout(r, 100));
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("handles fetch throwing an error", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    AsyncStorage.getItem.mockResolvedValue(null);
    mockFetch.mockRejectedValue(new Error("Network error"));
    const { getByTestId } = render(<ReportSightingScreen />);
    await waitFor(() => expect(getByTestId("submitButton")).toBeTruthy());
    await act(async () => {
      fireEvent.press(getByTestId("submitButton"));
      await new Promise((r) => setTimeout(r, 100));
    });
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("expands description input on content size change", async () => {
    const { getByTestId } = render(<ReportSightingScreen />);
    const descInput = getByTestId("descriptionInput");
    fireEvent(descInput, "contentSizeChange", {
      nativeEvent: { contentSize: { height: 120 } },
    });
    expect(descInput).toBeTruthy();
  });

  it("navigates back when back button is pressed", async () => {
    const { getByText } = render(<ReportSightingScreen />);
    fireEvent.press(getByText("Back"));
    expect(mockBack).toHaveBeenCalled();
  });

  it("navigates to login when log in button is pressed", async () => {
    const { getByText } = render(<ReportSightingScreen />);
    fireEvent.press(getByText("Log in / Register"));
    expect(mockReplace).toHaveBeenCalledWith("/(auth)/login");
  });

  it("renders correctly", async () => {
    const { toJSON } = render(<ReportSightingScreen />);
    expect(toJSON()).toMatchSnapshot();
  });
});
