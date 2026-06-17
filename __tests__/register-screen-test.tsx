import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import RegisterScreen from "../src/app/(auth)/register";

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

// Mock AsyncStorage globally
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue("test-token"),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockedRouter = require("expo-router").router;

const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

function setupSuccessfulRegister() {
  mockFetch.mockResolvedValueOnce({
    status: 201,
    json: async () => ({}),
  });
}
function setupNetworkError() {
  mockFetch.mockResolvedValueOnce({
    status: 500,
    json: async () => ({ error: "Network error" }),
  });
}

jest.mock("react-native", () => {
  const rn = jest.requireActual("react-native");
  rn.Alert.alert = jest.fn();
  return rn;
});

beforeEach(() => {
  mockFetch.mockReset();
});

describe("register screen tests", () => {
  it("should have a logo", async () => {
    const { getByTestId } = await render(<RegisterScreen />);
    const logo = getByTestId("logo");

    expect(logo).toBeTruthy();
  });

  it("should say sign up", async () => {
    const { getByTestId } = await render(<RegisterScreen />);
    const signUpText = getByTestId("signUpText");

    expect(signUpText).toBeTruthy();
    expect(signUpText.children[0]).toEqual("Sign up for FindMyPet:");
  });

  it("should have a username input", async () => {
    const { getByTestId } = await render(<RegisterScreen />);
    const username = getByTestId("username");

    expect(username).toBeTruthy();
    expect(username.type).toBe("TextInput");
  });

  it("should have a password input", async () => {
    const { getByTestId } = await render(<RegisterScreen />);
    const password = getByTestId("password");

    expect(password).toBeTruthy();
    expect(password.type).toBe("TextInput");
  });
  it("displays register button", async () => {
    const { getByTestId } = await render(<RegisterScreen />);
    await waitFor(() => {
      expect(getByTestId("register-btn")).toBeTruthy();
    });
  });

  it("sends register info to backend when login pressed", async () => {
    setupSuccessfulRegister();
    const { getByTestId } = await render(<RegisterScreen />);

    fireEvent.changeText(getByTestId("username"), "testuser");
    fireEvent.changeText(getByTestId("password"), "testpassword");
    fireEvent.press(getByTestId("register-btn"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/users/register"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            username: "testuser",
            password: "testpassword",
          }),
        }),
      );
    });
  });

  it("redirects to login page when button is pressed", async () => {
    const { getByTestId } = await render(<RegisterScreen />);
    fireEvent.press(getByTestId("login-btn"));
    expect(mockedRouter.push).toHaveBeenCalledWith("/(auth)/login");
  });

  it("shows network error when fetch fails", async () => {
    setupNetworkError();
    const { getByTestId } = await render(<RegisterScreen />);

    fireEvent.press(getByTestId("register-btn"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Looks like there was a problem registering...",
        expect.anything(),
      );
    });
  });
});
