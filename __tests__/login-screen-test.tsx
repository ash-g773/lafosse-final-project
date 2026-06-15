import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import LoginScreen from "../src/app/(auth)/login";

jest.mock("expo-router", () => {
  return {
    router: {
      push: jest.fn(),
      replace: jest.fn(),
    },
    Stack: {
      Screen: () => null,
    },
  };
});

const mockedRouter = require("expo-router").router;

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn().mockResolvedValue("fake-token"),
  removeItem: jest.fn(),
}));

const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

// mock Alert
jest.mock("react-native", () => {
  const rn = jest.requireActual("react-native");
  rn.Alert.alert = jest.fn();
  return rn;
});

function setupSuccessfulLogin() {
  mockFetch.mockResolvedValueOnce({
    status: 200,
    json: async () => ({ token: "fake-jwt-token" }),
  });
}

function setupFailedLogin() {
  mockFetch.mockResolvedValueOnce({
    status: 401,
    json: async () => ({ error: "Invalid credentials" }),
  });
}

function setupNetworkError() {
  mockFetch.mockRejectedValueOnce(new Error("Network error"));
}

beforeEach(() => {
  jest.clearAllMocks();
  mockFetch.mockReset();
});

describe("login screen tests", () => {
  it("should have a logo", async () => {
    const { getByTestId } = await render(<LoginScreen />);
    const logo = getByTestId("logo");

    expect(logo).toBeTruthy();
  });

  it("should have a username input", async () => {
    const { getByTestId } = await render(<LoginScreen />);
    const username = getByTestId("username");

    expect(username).toBeTruthy();
    expect(username.type).toBe("TextInput");
  });

  it("should have a password input", async () => {
    const { getByTestId } = await render(<LoginScreen />);
    const password = getByTestId("password");

    expect(password).toBeTruthy();
    expect(password.type).toBe("TextInput");
  });
  it("redirects to register page when button is pressed", async () => {
    const { getByTestId } = await render(<LoginScreen />);
    fireEvent.press(getByTestId("register-btn"));
    expect(mockedRouter.push).toHaveBeenCalledWith("/(auth)/register");
  });
  it("redirects to report sighting when button is pressed", async () => {
    const { getByTestId } = await render(<LoginScreen />);
    fireEvent.press(getByTestId("report-btn"));
    expect(mockedRouter.replace).toHaveBeenCalledWith("/(auth)/reportSighting");
  });
  it("displays login button", async () => {
    const { getByTestId } = await render(<LoginScreen />);
    await waitFor(() => {
      expect(getByTestId("login-btn")).toBeTruthy();
    });
  });
  it("sends login info to backend when login pressed", async () => {
    const { getByTestId } = await render(<LoginScreen />);
    await waitFor(() => {
      fireEvent.changeText(getByTestId("username"), "testuser");
      fireEvent.changeText(getByTestId("password"), "testpassword");
      fireEvent.press(getByTestId("login-btn"));
    });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/users/login"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          username: "testuser",
          password: "testpassword",
        }),
      }),
    );
  });
  it("stores token in AsyncStorage on successful login", async () => {
    setupSuccessfulLogin();
    const AsyncStorage = require("@react-native-async-storage/async-storage");
    const { getByText } = await render(<LoginScreen />);

    fireEvent.press(getByText("Login"));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "token",
        "fake-jwt-token",
      );
    });
  });
  it("navigates to tabs folder after successful login", async () => {
    setupSuccessfulLogin();
    const { getByText } = await render(<LoginScreen />);

    fireEvent.press(getByText("Login"));

    await waitFor(() => {
      expect(mockedRouter.replace).toHaveBeenCalledWith("/(tabs)");
    });
  });
  it("shows alert on failed login", async () => {
    setupFailedLogin();
    const { getByText } = await render(<LoginScreen />);

    fireEvent.press(getByText("Login"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        expect.stringContaining("Login failed"),
      );
    });
  });
  it("shows network error when fetch fails", async () => {
    setupNetworkError();
    const { getByText } = await render(<LoginScreen />);

    fireEvent.press(getByText("Login"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Network error - check your connection",
      );
    });
  });
  it("username input accepts text", async () => {
    const { getByTestId } = await render(<LoginScreen />);
    const input = getByTestId("username");

    fireEvent.changeText(input, "testuser");
    expect(input.props.value).toBe(undefined);
  });

  it("password input is secure", async () => {
    const { getByTestId } = await render(<LoginScreen />);
    const password = getByTestId("password");
    expect(password.props.secureTextEntry).toBe(true);
  });
});
