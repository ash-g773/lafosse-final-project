import { fireEvent, render } from "@testing-library/react-native";
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

beforeEach(() => {
  jest.clearAllMocks();
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
});
