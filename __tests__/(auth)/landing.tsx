import { fireEvent, render } from "@testing-library/react-native";
import Landing from "../../src/app/(auth)/landing";

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  Stack: {
    Screen: () => null,
  },
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

beforeEach(() => {
  mockPush.mockReset();
  mockReplace.mockReset();
});

describe("landing-page", () => {
  it("displays the logo", async () => {
    const { getByTestId } = await render(<Landing />);

    expect(getByTestId("logo")).toBeTruthy();
  });
  it("displays welcome message", async () => {
    const { getByText } = await render(<Landing />);

    expect(getByText("Welcome to FindMyPet")).toBeTruthy();
  });
  it("displays subheading", async () => {
    const { getByText } = await render(<Landing />);

    expect(getByText("Help us get missing pets back home!")).toBeTruthy();
  });
  it("displays report button with message", async () => {
    const { getByText, getByTestId } = await render(<Landing />);

    expect(getByText("Spotted a lost pet?")).toBeTruthy();
    expect(getByText("Report here")).toBeTruthy();
    expect(getByTestId("reportBtn")).toBeTruthy();
  });
  it("displays login button", async () => {
    const { getByText, getByTestId } = await render(<Landing />);

    expect(getByText("Log in or Create an Account")).toBeTruthy();
    expect(getByTestId("loginBtn")).toBeTruthy();
  });

  it("navigates to login when login button is pressed", async () => {
    const { getByTestId } = await render(<Landing />);
    fireEvent.press(getByTestId("loginBtn"));
    expect(mockPush).toHaveBeenCalledWith("./login");
  });

  it("renders correctly", async () => {
    const { toJSON } = await render(<Landing />);
    expect(toJSON()).toMatchSnapshot();
  });
});
