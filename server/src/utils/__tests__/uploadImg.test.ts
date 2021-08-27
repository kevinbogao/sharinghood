import cloudinary from "cloudinary";
import uploadImg from "../uploadImg";
import { mockUploadResponse } from "../../__tests__/__mocks__/createInitData";

jest.mock("cloudinary");
const mockedCloudinary = cloudinary as jest.Mocked<any>;

it("Should parse response object to string", async () => {
  mockedCloudinary.v2.uploader.upload.mockResolvedValue(mockUploadResponse);
  const imgData = await uploadImg("d");
  expect(imgData).toEqual(JSON.stringify(mockUploadResponse));
});
