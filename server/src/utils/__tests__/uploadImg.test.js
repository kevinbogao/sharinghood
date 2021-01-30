const cloudinary = require("cloudinary");
const uploadImg = require("../uploadImg");
const {
  mockUploadResponse,
} = require("../../__tests__/__mocks__/createInitData");

jest.mock("cloudinary");

it("Should parse response object to string", async () => {
  cloudinary.v2.uploader.upload.mockResolvedValue(mockUploadResponse);
  const imgData = await uploadImg();
  expect(imgData).toEqual(JSON.stringify(mockUploadResponse));
});
