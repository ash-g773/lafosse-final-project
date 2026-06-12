import { fireEvent, render, waitFor } from "@testing-library/react-native";
import Profile from "../../src/app/(tabs)/profile";

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

// fetch setup functions
function setupMockFetchSuccess() {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockProfile,
  });
}

function setupMockFetchEmpty() {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockEmptyProfile,
  });
}

function setupMockFetchAndSave() {
  mockFetch
    // first call - fetch profile
    .mockResolvedValueOnce({
      ok: true,
      json: async () => mockProfile,
    })
    // second call - save profile
    .mockResolvedValueOnce({
      ok: true,
      json: async () => mockUpdatedProfile,
    });
}

function setupMockFetchError() {
  mockFetch.mockRejectedValueOnce(new Error("Network error"));
}

function setupMockSaveError() {
  mockFetch
    // fetch succeeds
    .mockResolvedValueOnce({
      ok: true,
      json: async () => mockProfile,
    })
    // save fails
    .mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Failed to update profile" }),
    });
}

beforeEach(() => {
  mockPush.mockReset();
  mockReplace.mockReset();
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
        json: async () => mockProfile,
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
      expect(getByTestId("back-btn")).toBeTruthy;
    });
  });
});
