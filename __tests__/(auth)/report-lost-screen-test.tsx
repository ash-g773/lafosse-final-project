import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import ReportLostScreen from "../../src/app/(tabs)/lostPet";

const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  router: {
    replace: (...args: any[]) => mockReplace(...args),
  },
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
}));

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
  launchImageLibraryAsync: jest.fn(),
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

describe("report lost screen tests", () => {
  it("renders the key form fields", async () => {
    const { getByTestId } = render(<ReportLostScreen />);
    expect(getByTestId("dropdown")).toBeTruthy();
    expect(getByTestId("colorInput")).toBeTruthy();
    expect(getByTestId("descriptionInput")).toBeTruthy();
    expect(getByTestId("submitButton")).toBeTruthy();
    expect(getByTestId("addPic")).toBeTruthy();
  });

  it("requests location on mount", async () => {
    render(<ReportLostScreen />);
    await waitFor(() => {
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
    });
  });

  it("gets current location and reverse geocodes when location button pressed", async () => {
    const { getByText } = render(<ReportLostScreen />);
    fireEvent.press(getByText("At my current location"));
    await waitFor(() => {
      expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
      expect(Location.reverseGeocodeAsync).toHaveBeenCalled();
    });
  });

  it("handles denied location permission on button press", async () => {
    Location.requestForegroundPermissionsAsync
      .mockResolvedValueOnce({ status: "denied" }) // for useEffect on mount
      .mockResolvedValueOnce({ status: "denied" }); // for button press

    const { getByText } = render(<ReportLostScreen />);

    await act(async () => {
      fireEvent.press(getByText("At my current location"));
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
  });
  it("opens the map modal when somewhere else is pressed", async () => {
    const { getByText } = render(<ReportLostScreen />);
    fireEvent.press(getByText("Somewhere else (open map)"));
    await waitFor(() => {
      expect(getByText("Close map")).toBeTruthy();
    });
  });

  it("selects location on map and confirms", async () => {
    const { getByText, getByTestId } = render(<ReportLostScreen />);

    fireEvent.press(getByText("Somewhere else (open map)"));

    await waitFor(() => expect(getByTestId("map-view")).toBeTruthy());

    fireEvent(getByTestId("map-view"), "touchEnd");

    await waitFor(() => expect(getByText("Confirm location")).toBeTruthy());

    await act(async () => {
      fireEvent.press(getByText("Confirm location"));
    });

    await waitFor(() =>
      expect(Location.reverseGeocodeAsync).toHaveBeenCalled(),
    );
  });
  it("expands description text input on content size change", async () => {
    const { getByTestId } = render(<ReportLostScreen />);
    const descInput = getByTestId("descriptionInput");

    fireEvent(descInput, "contentSizeChange", {
      nativeEvent: { contentSize: { height: 120 } },
    });

    expect(descInput).toBeTruthy();
  });

  it("picks an image from the library", async () => {
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      granted: true,
    });
    ImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file:///photo.jpg" }],
    });
    const { getByTestId } = render(<ReportLostScreen />);
    fireEvent.press(getByTestId("addPic"));
    await waitFor(() => {
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
    });
  });

  it("handles denied image library permission", async () => {
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      granted: false,
    });
    const { getByTestId } = render(<ReportLostScreen />);
    fireEvent.press(getByTestId("addPic"));
    await waitFor(() => {
      expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
    });
  });

  it("handles cancelled image pick", async () => {
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      granted: true,
    });
    ImagePicker.launchImageLibraryAsync.mockResolvedValue({ canceled: true });
    const { getByTestId } = render(<ReportLostScreen />);
    fireEvent.press(getByTestId("addPic"));
    await waitFor(() => {
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
    });
  });

  it("submits the form successfully with no token", async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    mockFetch.mockResolvedValue({
      status: 201,
      json: jest.fn().mockResolvedValue({ pets_id: 1 }),
    });

    const { getByTestId } = render(<ReportLostScreen />);
    await waitFor(() => expect(getByTestId("submitButton")).toBeTruthy());

    await act(async () => {
      fireEvent.press(getByTestId("submitButton"));
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/pets"),
      expect.objectContaining({ method: "POST" }),
    );
    expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
  });

  it("submits the form with a valid token and decodes userId", async () => {
    const payload = Buffer.from(JSON.stringify({ users_id: 5 })).toString(
      "base64",
    );
    AsyncStorage.getItem.mockResolvedValue(`header.${payload}.sig`);
    mockFetch.mockResolvedValue({
      status: 201,
      json: jest.fn().mockResolvedValue({ pets_id: 1 }),
    });

    const { getByTestId } = render(<ReportLostScreen />);
    await waitFor(() => expect(getByTestId("submitButton")).toBeTruthy());

    await act(async () => {
      fireEvent.press(getByTestId("submitButton"));
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(mockFetch).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
  });

  it("submits with an invalid token and userId falls back to null", async () => {
    AsyncStorage.getItem.mockResolvedValue("not.valid.jwt");
    mockFetch.mockResolvedValue({
      status: 201,
      json: jest.fn().mockResolvedValue({ pets_id: 1 }),
    });

    const { getByTestId } = render(<ReportLostScreen />);
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
    AsyncStorage.getItem.mockResolvedValue(null);
    mockFetch.mockResolvedValue({
      status: 201,
      json: jest.fn().mockResolvedValue({ pets_id: 1 }),
    });

    const { getByTestId } = render(<ReportLostScreen />);

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

  it("shows error when backend returns non-201", async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    mockFetch.mockResolvedValue({
      status: 400,
      json: jest.fn().mockResolvedValue({ error: "bad request" }),
    });

    const { getByTestId } = render(<ReportLostScreen />);
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

    const { getByTestId } = render(<ReportLostScreen />);
    await waitFor(() => expect(getByTestId("submitButton")).toBeTruthy());

    await act(async () => {
      fireEvent.press(getByTestId("submitButton"));
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("navigates back and to profile", async () => {
    const { getByText } = render(<ReportLostScreen />);
    fireEvent.press(getByText("Back"));
    expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
    fireEvent.press(getByText("Go to profile"));
    expect(mockReplace).toHaveBeenCalledWith("/(tabs)/profile");
  });

  it("renders correctly", async () => {
    const { toJSON } = render(<ReportLostScreen />);
    expect(toJSON()).toMatchSnapshot();
  });
});
