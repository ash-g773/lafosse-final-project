import { render } from "@testing-library/react-native";
import ReportLostScreen from "../../src/app/(tabs)/lostPet";

describe("report lost screen tests", () => {
  it("has a photo modal", async () => {
    const { getByTestId } = await render(<ReportLostScreen />);
    const loginAndLogo = getByTestId("login&logo");
    console.log(loginAndLogo.children);

    expect(loginAndLogo).toBeTruthy();
    expect(loginAndLogo.children.length).toBe(2);
    expect(loginAndLogo.children[0].type).toBeTruthy();
    expect(loginAndLogo.children[1].type).toBeTruthy();
  });

  it("has an add pic button that works", async () => {
    const { getByTestId } = await render(<ReportLostScreen />);
    const addPic = getByTestId("addPic");

    expect(addPic).toBeTruthy();
    // check whether on press it calls setModalVisible with true
  });

  it("has an animal type dropdown", async () => {
    const { getByTestId } = await render(<ReportLostScreen />);
    const dropdown = getByTestId("dropdown");

    expect(dropdown).toBeTruthy();
  });

  it("has a color textinput", async () => {
    const { getByTestId } = await render(<ReportLostScreen />);
    const colorInput = getByTestId("colorInput");

    expect(colorInput).toBeTruthy();
  });

  it("has a description text input", async () => {
    const { getByTestId } = await render(<ReportLostScreen />);
    const descriptionInput = getByTestId("descriptionInput");

    expect(descriptionInput).toBeTruthy();
  });

  it("has a contact nput", async () => {
    const { getByTestId } = await render(<ReportLostScreen />);
    const contactInput = getByTestId("contactInput");

    expect(contactInput).toBeTruthy();
    //check numbers only input
  });

  it("has a submit button", async () => {
    const { getByTestId } = await render(<ReportLostScreen />);
    const submitButton = getByTestId("submitButton");

    expect(submitButton).toBeTruthy();
    // check it errors out when data not provided - location, sighting description
  });

  it("renders correctly", async () => {
    const { toJSON } = await render(<ReportLostScreen />);
    expect(toJSON()).toMatchSnapshot();
  });
});
