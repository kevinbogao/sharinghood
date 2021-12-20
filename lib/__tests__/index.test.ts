import { transformImgUrl } from "../";
import { mockImageUrl } from "../../api/__tests__/__mocks__/initData";

beforeAll(() => {
  process.env = Object.assign(process.env, { JWT_SECRET: "secret" });
});

describe("[lib.index]", () => {
  // TRANSFORM IMAGE URL
  it("Should transform image url", () => {
    const IMAGE_WIDTH = 500;
    const transformedUrl = transformImgUrl(mockImageUrl, IMAGE_WIDTH);
    expect(transformedUrl).toBe(
      `https://res.cloudinary.com/dyr3b99uj/image/upload/w_${IMAGE_WIDTH},c_scale,f_auto/v1582569792/w9hb72biqpmowzyhwohy.png`
    );
  });
});
