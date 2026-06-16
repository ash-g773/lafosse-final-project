import { render } from "@testing-library/react-native";
import ReportSightingScreen from "../../src/app/(auth)/reportSighting";

describe("report sighting screen tests", () => {
  it("has a photo modal", async () => {
    const { getByTestId } = await render(<ReportSightingScreen />);
    const loginAndLogo = getByTestId("login&logo");
    console.log(loginAndLogo.children);

    expect(loginAndLogo).toBeTruthy();
    expect(loginAndLogo.children.length).toBe(2);
    expect(loginAndLogo.children[0].type).toBeTruthy();
    expect(loginAndLogo.children[1].type).toBeTruthy();
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
