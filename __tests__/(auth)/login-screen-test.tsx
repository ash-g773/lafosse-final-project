import { render } from "@testing-library/react-native";
import LoginScreen from "../../src/app/(auth)/login";

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
});
