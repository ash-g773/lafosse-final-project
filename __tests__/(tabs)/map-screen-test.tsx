import { fireEvent, render, waitFor } from "@testing-library/react-native";
import MapScreen from "../../src/app/(tabs)/index";

const mockPush = jest.fn();
const mockReplace = jest.fn();

//expo-router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  Stack: { Screen: () => null },
}));

// react-native-maps
jest.mock("react-native-maps", () => {
  const { View } = require("react-native");
  const MockMapView = ({ children }: any) => (
    <View testID="map-view">{children}</View>
  );
  const MockMarker = ({ onPress, testID }: any) => (
    <View testID={testID || "marker"} onTouchEnd={onPress} />
  );
  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
    PROVIDER_GOOGLE: "google",
  };
});

// expo-location
jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest
    .fn()
    .mockResolvedValue({ status: "granted" }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: {
      latitude: 51.5074,
      longitude: -0.1278,
    },
  }),
}));

// expo-navigation-bar
jest.mock("expo-navigation-bar", () => ({
  setVisibilityAsync: jest.fn(),
}));

// expo-status-bar
jest.mock("expo-status-bar", () => ({
  StatusBar: () => null,
}));

// fetch
const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

// mock data
const mockPets = [
  {
    pets_id: 1,
    users_id: 1,
    name: "Luna",
    species: "Cat",
    breed: null,
    colour: null,
    description: "Black cat",
    last_seen_location: "Thorpedale Road",
    lat: "51.566691",
    lng: "-0.119936",
    image_url: null,
    status: "lost",
    created_at: "2024-01-01",
  },
];

const mockSightings = [
  {
    sightings_id: 1,
    pets_id: 1,
    users_id: null,
    guest_contact: null,
    sighting_description: "Spotted near park",
    location_description: "Near basketball courts",
    lat: "51.5657966",
    lng: "-0.1174506",
    image_url: null,
    created_at: "2024-01-01",
  },
];

function setupMockFetch() {
  mockFetch
    .mockResolvedValueOnce({
      json: async () => mockPets,
    })
    .mockResolvedValueOnce({
      json: async () => mockSightings,
    });
}

beforeEach(() => {
  mockPush.mockReset();
  mockReplace.mockReset();
});

describe("MapScreen", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("renders the map", async () => {
    setupMockFetch();
    const { getByTestId } = await render(<MapScreen />);

    await waitFor(() => {
      expect(getByTestId("map-view")).toBeTruthy();
    });
  });

  it("shows loading indicator while fetching", async () => {
    // make fetch never resolve
    mockFetch.mockReturnValue(new Promise(() => {}));
    const { getByText } = await render(<MapScreen />);

    expect(getByText("Loading map data...")).toBeTruthy();
  });

  it("fetches pets and sightings on load", async () => {
    setupMockFetch();
    await render(<MapScreen />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/pets"));
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/sightings"),
      );
    });
  });

  it("displays profile and logout buttons", async () => {
    const { getByTestId, getByText } = await render(<MapScreen />);

    await waitFor(() => {
      expect(getByTestId("profile-btn")).toBeTruthy();
      expect(getByText("Profile")).toBeTruthy();
      expect(getByTestId("logout-btn")).toBeTruthy();
      expect(getByText("Log Out")).toBeTruthy();
    });
  });

  it("displays plus button", async () => {
    const { getByTestId } = await render(<MapScreen />);

    await waitFor(() => {
      expect(getByTestId("plus-btn")).toBeTruthy;
    });
  });

  it("displays report buttons when plus button is pressed", async () => {
    const { getByTestId, getByText } = await render(<MapScreen />);

    await waitFor(() => {
      expect(getByTestId("plus-btn")).toBeTruthy;

      fireEvent.press(getByTestId("plus-btn"));

      expect(getByText("🐾 Report Lost Pet")).toBeTruthy();
      expect(getByText("📍 Report Sighting")).toBeTruthy();
    });
  });
  it("hides buttons when plus is pressed again", async () => {
    const { getByTestId, queryByText } = await render(<MapScreen />);

    await waitFor(() => {
      expect(getByTestId("plus-btn")).toBeTruthy;

      fireEvent.press(getByTestId("plus-btn"));
      fireEvent.press(getByTestId("plus-btn"));

      expect(queryByText("🐾 Report Lost Pet")).toBeNull();
      expect(queryByText("📍 Report Sighting")).toBeNull();
    });
  });
  it("requests location permission on load", async () => {
    setupMockFetch();
    const Location = require("expo-location");
    await render(<MapScreen />);

    await waitFor(() => {
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
    });
  });
  it("shows pet details when marker is pressed", async () => {
    setupMockFetch();
    const { getByTestId, getByText } = await render(<MapScreen />);

    await waitFor(() => {
      expect(getByTestId("map-view")).toBeTruthy();
    });

    fireEvent.press(getByTestId("pet-marker-1"));

    expect(getByText("Luna")).toBeTruthy();
    expect(getByText("🔴 Missing")).toBeTruthy();
  });
  it("handles fetch error", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    // should not crash
    expect(async () => await render(<MapScreen />)).not.toThrow();
  });
});
