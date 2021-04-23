import { transformImgUrl, _isValidEmail } from "../helpers";

describe("[helpers._isValidEmail] ", () => {
  it("Should return true for valid Email address", () => {
    const validEmails = [
      "abc-d@mail.com",
      "abc.def@mail.com",
      "abc@mail.com",
      "abc_def@mail.com",
      "abc.def@mail.cc",
      "abc.def@mail-archive.com",
      "abc.def@mail.org",
      "abc.def@mail.com",
    ];
    validEmails.forEach((email) => {
      expect(_isValidEmail(email)).toBeTruthy();
    });
  });

  it("Should return false for invalid Email address", () => {
    const invalidEmails = [
      "abc..def@mail.com",
      ".abc@mail.com",
      "abc.def@mail#archive.com",
      "abc.def@mail",
      "abc.def@mail..com",
    ];
    invalidEmails.forEach((email) => {
      expect(_isValidEmail(email)).toBeFalsy();
    });
  });

  describe("helpers._isValidEmail", () => {
    it("Should return a url with transformed properties", () => {
      const url = "https://res.cloudinary.com/demo/image/upload/sample.jpg";
      expect(transformImgUrl(url, 100)).toEqual(
        "https://res.cloudinary.com/demo/image/upload/w_100,c_scale,f_auto/sample.jpg"
      );
    });
  });
});
