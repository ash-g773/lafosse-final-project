import { render } from "@testing-library/react-native";
import RegisterScreen from "../../src/app/(auth)/register";

describe("login screen tests", () => {
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
});
