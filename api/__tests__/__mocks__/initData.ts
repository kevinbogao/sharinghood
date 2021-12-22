import { User } from "../../entities";

export const firebaseToken =
  "f5ChaueMdf5yFb9kb0md3q:APA91bGMPQp5qdcn9xB6-u-__ovque0KkiouWKsaeZRxuaKK-ctV_BGdSBZmzcMqug9mrzFxWfJRvAkixSyTn0tUEmT7dCGck8fh8q7rGgC35pYY72h-ixKtxAa5PhS5y8N1ZworXW26";

export const mockUser01 = new User();
mockUser01.id = "user01";
mockUser01.name = "MockUser01";
mockUser01.email = "mock.user01@email.com";
mockUser01.password = "1234567";
mockUser01.apartment = "001";
mockUser01.isNotified = true;
mockUser01.isAdmin = true;
mockUser01.tokenVersion = 1;

export const mockImageUrl =
  "https://res.cloudinary.com/dyr3b99uj/image/upload/v1582569792/w9hb72biqpmowzyhwohy.png";

// export const mockUser01 = User.create({
//   name: "MockUser01",
//   email: "mock.user01@email.com",
//   password: "1234567",
//   apartment: "001",
//   isNotified: true,
//   // isCreator: true,
//   // isMigrated: true,
//   isAdmin: true,
// });

// export const mockUser01 = {
//   id: "123",
//   name: "MockUser01",
//   email: "mock.user01@email.com",
//   password: "1234567",
//   apartment: "001",
//   isNotified: true,
//   isCreator: true,
//   isMigrated: true,
//   isAdmin: true,
//   // image: JSON.stringify(mockUploadResponse),
//   // communities: [mockCommunity01Id, mockCommunity02Id],
//   // posts: [mockPost01Id, mockPost02Id, mockPost03Id],
//   // requests: [mockRequest01Id, mockRequest02Id],
//   // notifications: [
//   //   mockNotification01Id,
//   //   mockNotification02Id,
//   //   mockNotification03Id,
//   // ],
//   tokenVersion: 1,
//   tokens: [
//     { firebase: firebaseToken },
//     {
//       firebase:
//         "dMsiI1VO70YG76TGDW-4Af:APA91bGqGoCM9Fb5dQO3DTbBuxs00L_k4affEvRLljQXvKm10-I9hC52vbhoKURQJr_jZRkGG3BwZaVyqdiHfwbWWqTvaOxbjiEi2A0NQXiprgGrS9NgCOzaRIpmT_-7akNVbUC-4Zq1",
//     },
//   ],
// };
