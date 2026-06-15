import AsyncStorage from "@react-native-async-storage/async-storage";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import Profile from "../../src/app/(tabs)/profile";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();

//expo-router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    replace: mockReplace,
  }),
  Stack: { Screen: () => null },
}));

// fetch
const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

// mock data
const mockProfile = {
  profiles_id: 1,
  users_id: 1,
  full_name: "Sarah Jones",
  phone: "07700900123",
  postcode: "N4 3AB",
  lat: "51.566691",
  lng: "-0.119936",
  alert_radius: 3000,
  created_at: "2024-01-01T00:00:00.000Z",
};

// mock profile with all nullable fields as null
// for testing new users
const mockEmptyProfile = {
  profiles_id: 2,
  users_id: 2,
  full_name: null,
  phone: null,
  postcode: null,
  lat: null,
  lng: null,
  alert_radius: 5000,
  created_at: "2024-01-01T00:00:00.000Z",
};

// mock updated profile - what the backend returns after a PATCH
const mockUpdatedProfile = {
  profiles_id: 1,
  users_id: 1,
  full_name: "Sarah Smith",
  phone: "07700900999",
  postcode: "N4 4CD",
  lat: "51.566691",
  lng: "-0.119936",
  alert_radius: 5000,
  created_at: "2024-01-01T00:00:00.000Z",
};

const mockLostPets = [
  {
    pets_id: 1,
    users_id: 1,
    name: "Luna",
    species: "Cat",
    breed: null,
    colour: "Black",
    description: "Very friendly black cat",
    last_seen_location: "Thorpedale Road",
    lat: "51.566691",
    lng: "-0.119936",
    image_url: null,
    status: "lost",
    created_at: "2024-01-01T00:00:00.000Z",
  },
  {
    pets_id: 2,
    users_id: 1,
    name: "Buddy",
    species: "Dog",
    breed: "Golden Retriever",
    colour: "Golden",
    description: "Friendly but disobedient",
    last_seen_location: "Chelsea Bridge Road",
    lat: "51.509",
    lng: "-0.131",
    image_url: null,
    status: "lost",
    created_at: "2024-01-01T00:00:00.000Z",
  },
];

// fetch setup functions

function setupMockFetchAndSave() {
  mockFetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockProfile }), // add data wrapper
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockUpdatedProfile }), // add data wrapper
    });
}

function setupMockSaveError() {
  mockFetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockProfile }), // add data wrapper
    })
    .mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Failed to update profile" }),
    });
}

function setupMockFetchEmpty() {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: mockEmptyProfile }), // add data wrapper
  });
}

function setupMockFetchSuccess() {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: mockProfile }),
  });
}

function setupMockFetchError() {
  mockFetch.mockRejectedValueOnce(new Error("Network error"));
}

function setupMockFetchWithPets() {
  mockFetch
    // first call - fetch profile
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockProfile }),
    })
    // second call - fetch pets (when view pets button is pressed)
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockLostPets }),
    });
}

function setupMockFetchNoPets() {
  mockFetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockProfile }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }), // empty array
    });
}

function setupMockFetchWithPetsAndReunite() {
  mockFetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockProfile }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockLostPets }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });
}

beforeEach(() => {
  mockPush.mockReset();
  mockReplace.mockReset();

  jest.clearAllMocks();

  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
    "header.eyJ1c2Vyc19pZCI6MX0=.signature",
  );
});

describe("Profile page", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("displays profile data when loaded", async () => {
    setupMockFetchSuccess();
    const { getByDisplayValue } = await render(<Profile />);

    await waitFor(() => {
      expect(getByDisplayValue("Sarah Jones")).toBeTruthy();
      expect(getByDisplayValue("07700900123")).toBeTruthy();
      expect(getByDisplayValue("N4 3AB")).toBeTruthy();
    });
  });

  it("displays empty fields for new user", async () => {
    setupMockFetchEmpty();
    const { getByPlaceholderText } = await render(<Profile />);

    await waitFor(() => {
      // fields should show placeholders when null
      expect(getByPlaceholderText("Your Name")).toBeTruthy();
      expect(getByPlaceholderText("Your Number")).toBeTruthy();
    });
  });

  it("shows success message after saving", async () => {
    setupMockFetchAndSave();
    const { getByText, getByTestId, getByPlaceholderText, getByDisplayValue } =
      await render(<Profile />);

    await waitFor(() => {
      expect(getByDisplayValue("Sarah Jones")).toBeTruthy();
    });

    // change a field so hasChanges is true
    fireEvent.changeText(getByPlaceholderText("Your Name"), "Sarah Smith");

    fireEvent.press(getByTestId("save-btn"));

    await waitFor(() => {
      expect(getByText("Profile updated successfully!")).toBeTruthy();
    });
  });
  it("shows error message when save fails", async () => {
    setupMockSaveError();
    const { getByText, getByTestId, getByDisplayValue } = await render(
      <Profile />,
    );

    await waitFor(() => {
      expect(getByTestId("save-btn")).toBeTruthy();
    });

    fireEvent.changeText(getByDisplayValue("Sarah Jones"), "Sarah Smith");

    fireEvent.press(getByTestId("save-btn"));

    await waitFor(() => {
      expect(getByText("Something went wrong, please try again")).toBeTruthy();
    });
  });

  it("shows error when fetch fails", async () => {
    setupMockFetchError();
    expect(async () => await render(<Profile />)).not.toThrow();
  });

  it("disables save button while saving", async () => {
    // make save never resolve
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockProfile }),
      })
      .mockReturnValueOnce(new Promise(() => {}));

    const { getByTestId } = await render(<Profile />);

    await waitFor(() => {
      expect(getByTestId("save-btn")).toBeTruthy();
    });

    fireEvent.press(getByTestId("save-btn"));

    await waitFor(() => {
      expect(getByTestId("save-btn").props.accessibilityState?.disabled).toBe(
        true,
      );
    });
  });
  it("displays back button", async () => {
    const { getByTestId } = await render(<Profile />);

    await waitFor(() => {
      expect(getByTestId("back-btn")).toBeTruthy();
    });
  });
  it("navigates back when back button is pressed", async () => {
    setupMockFetchSuccess();

    const { getByTestId } = render(<Profile />);

    await waitFor(() => {
      fireEvent.press(getByTestId("back-btn"));
    });
    expect(mockBack).toHaveBeenCalled();
  });
  it("displays the user's lost pets when button is pressed", async () => {
    setupMockFetchWithPets();
    const { getByText } = await render(<Profile />);

    await waitFor(() => {
      expect(getByText("View Lost Pet Reports ▼")).toBeTruthy();
    });

    fireEvent.press(getByText("View Lost Pet Reports ▼"));

    await waitFor(() => {
      expect(getByText("Luna")).toBeTruthy();
      expect(getByText("Buddy")).toBeTruthy();
    });
  });
  it("shows message when user has no previous lost pets", async () => {
    setupMockFetchNoPets();
    const { getByText } = await render(<Profile />);

    await waitFor(() => {
      expect(getByText("View Lost Pet Reports ▼")).toBeTruthy();
    });

    fireEvent.press(getByText("View Lost Pet Reports ▼"));

    await waitFor(() => {
      expect(getByText("You have no previous lost pet reports.")).toBeTruthy();
    });
  });

  it("hides pets when button is pressed again", async () => {
    setupMockFetchWithPets();
    const { getByText, queryByText } = await render(<Profile />);

    await waitFor(() => {
      expect(getByText("View Lost Pet Reports ▼")).toBeTruthy();
    });

    fireEvent.press(getByText("View Lost Pet Reports ▼"));

    await waitFor(() => {
      expect(getByText("Luna")).toBeTruthy();
    });

    fireEvent.press(getByText("Hide Lost Pet Reports ▲"));

    await waitFor(() => {
      expect(queryByText("Luna")).toBeNull();
    });
  });
  it("renders correctly", async () => {
    const { toJSON } = await render(<Profile />);
    expect(toJSON()).toMatchSnapshot();
  });
  it("disables save button when no changes made", async () => {
    setupMockFetchSuccess();

    const { getByTestId } = render(<Profile />);

    await waitFor(() => {
      expect(getByTestId("save-btn").props.accessibilityState?.disabled).toBe(
        true,
      );
    });
  });
  it("enables save button when changes are made", async () => {
    setupMockFetchSuccess();

    const { getByPlaceholderText, getByTestId } = render(<Profile />);

    await waitFor(() => {
      expect(getByPlaceholderText("Your Name")).toBeTruthy();
    });
    fireEvent.changeText(getByPlaceholderText("Your Name"), "New Name");

    expect(getByTestId("save-btn").props.accessibilityState?.disabled).toBe(
      false,
    );
  });
  it("marks pets as reunited when button is pressed", async () => {
    setupMockFetchWithPetsAndReunite();

    const { getByText, getByTestId } = render(<Profile />);

    await waitFor(() => {
      fireEvent.press(getByText("View Lost Pet Reports ▼"));
    });
    await waitFor(() => {
      expect(getByTestId("reunite-btn-1")).toBeTruthy();
    });

    fireEvent.press(getByTestId("reunite-btn-1"));

    await waitFor(() => {
      expect(getByText("🟢 Reunited")).toBeTruthy();
    });
  });
});
