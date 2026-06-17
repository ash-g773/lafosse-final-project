import { render } from "@testing-library/react-native";
import ReportSightingScreen from "../../src/app/(auth)/reportSighting";

const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  router: {
    replace: (...args: any[]) => mockReplace(...args),
  },
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue("test-token"),
  setItem: jest.fn(),
  removeItem: jest.fn(),
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

describe("report sighting screen tests", () => {
  it("has a photo modal", async () => {
    const { getByTestId } = await render(<ReportSightingScreen />);
    const loginAndLogo = getByTestId("login&logo");
    console.log(loginAndLogo.children);

    expect(loginAndLogo).toBeTruthy();
    expect(loginAndLogo.children.length).toBe(3);
    expect(loginAndLogo.children[0].type).toBeTruthy();
    expect(loginAndLogo.children[1].type).toBeTruthy();
    expect(loginAndLogo.children[2].type).toBeTruthy();
  });

  it("has an add pic button that works", async () => {
    const { getByTestId } = await render(<ReportSightingScreen />);
    const addPic = getByTestId("addPic");

    expect(addPic).toBeTruthy();
    // check whether on press it calls setModalVisible with true
  });

  it("has an animal type dropdown", async () => {
    const { getByTestId } = await render(<ReportSightingScreen />);
    const dropdown = getByTestId("dropdown");

    expect(dropdown).toBeTruthy();
  });

  it("has a color textinput", async () => {
    const { getByTestId } = await render(<ReportSightingScreen />);
    const colorInput = getByTestId("colorInput");

    expect(colorInput).toBeTruthy();
  });

  it("has a description text input", async () => {
    const { getByTestId } = await render(<ReportSightingScreen />);
    const descriptionInput = getByTestId("descriptionInput");

    expect(descriptionInput).toBeTruthy();
  });

  it("has a contact nput", async () => {
    const { getByTestId } = await render(<ReportSightingScreen />);
    const contactInput = getByTestId("contactInput");

    expect(contactInput).toBeTruthy();
    //check numbers only input
  });

  it("has a submit button", async () => {
    const { getByTestId } = await render(<ReportSightingScreen />);
    const submitButton = getByTestId("submitButton");

    expect(submitButton).toBeTruthy();
    // check it errors out when data not provided - location, sighting description
  });

  it("renders correctly", async () => {
    const { toJSON } = await render(<ReportSightingScreen />);
    expect(toJSON()).toMatchSnapshot();
  });
});
