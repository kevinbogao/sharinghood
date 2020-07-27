const { createTestClient } = require('apollo-server-testing');
const { gql } = require('apollo-server');
const { constructTestServer } = require('../__utils');
const inMemoryDb = require('../__fixtures__/inMemoryDb');
const {
  createInitData,
  mockUser01,
  mockUser03,
  mockThread02,
  mockRequest01,
  mockRequest02,
  mockCommunity01,
  mockUploadResponse,
} = require('../__fixtures__/createInitData');

// Mocking dependencies
jest.mock('../../utils/uploadImg');
const uploadImg = require('../../utils/uploadImg');

jest.mock('../../utils/pushNotification');
const pushNotification = require('../../utils/pushNotification');

// Connect to a new in-memory database before running any tests.
beforeAll(async () => {
  await inMemoryDb.connect();
});

beforeEach(async () => {
  await createInitData();
});

// Clear all test data after every test.
afterEach(async () => {
  await inMemoryDb.cleanup();
});

// Remove and close the db and server
afterAll(async () => {
  await inMemoryDb.close();
});

/* REQUETS QUERY */
describe('[Query.requests]', () => {
  // REQUEST QUERY { requestId }
  it('Get request by id', async () => {
    const GET_REQUEST = gql`
      query Request($requestId: ID!) {
        request(requestId: $requestId) {
          _id
          title
          desc
          image
          dateNeed
          dateReturn
          creator {
            _id
            name
            image
            apartment
            createdAt
          }
          threads {
            _id
            content
            poster {
              _id
            }
            community {
              _id
            }
          }
        }
      }
    `;

    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser01._id } }),
    });

    const { query } = createTestClient(server);
    const res = await query({
      query: GET_REQUEST,
      variables: { requestId: mockRequest01._id.toString() },
    });

    expect(res.data.request).toMatchObject({
      _id: mockRequest01._id.toString(),
      title: mockRequest01.title,
      desc: mockRequest01.desc,
      image: JSON.stringify(mockUploadResponse),
      creator: {
        _id: mockUser01._id.toString(),
        name: mockUser01.name,
        image: mockUser01.image,
        apartment: mockUser01.apartment,
      },
    });

    expect(res.data.request.threads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: mockThread02._id.toString(),
          content: mockThread02.content,
          poster: {
            _id: mockUser03._id.toString(),
          },
        }),
      ])
    );
  });

  // REQUESTS QUERY { communityId }
  it('Get requests from community', async () => {
    const GET_REQUESTS = gql`
      query Requests($communityId: ID!) {
        requests(communityId: $communityId) {
          _id
          title
          desc
          image
          dateNeed
          creator {
            _id
            name
          }
        }
      }
    `;

    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser01._id } }),
    });

    const { query } = createTestClient(server);
    const res = await query({
      query: GET_REQUESTS,
      variables: { communityId: mockCommunity01._id.toString() },
    });

    expect(res.data.requests).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: mockRequest01._id.toString(),
          title: mockRequest01.title,
          desc: mockRequest01.desc,
          image: JSON.stringify(mockUploadResponse),
          creator: {
            _id: mockUser01._id.toString(),
            name: mockUser01.name,
          },
        }),
        expect.objectContaining({
          _id: mockRequest02._id.toString(),
          title: mockRequest02.title,
          desc: mockRequest02.desc,
          image: JSON.stringify(mockUploadResponse),
          creator: {
            _id: mockUser01._id.toString(),
            name: mockUser01.name,
          },
        }),
      ])
    );
  });
});

// /* REQUESTS MUTATIONS */
// describe('[Mutation.requests]', () => {
//   it('Create request to community', async () => {
//     const CREATE_REQUEST = gql`
//       mutation CreateRequest($requestInput: RequestInput!, $communityId: ID!) {
//         createRequest(requestInput: $requestInput, communityId: $communityId) {
//           _id
//           desc
//           image
//           dateNeed
//           dateReturn
//           creator {
//             _id
//             name
//           }
//         }
//       }
//     `;

//     // Create an instance of ApolloServer
//     const { server } = constructTestServer({
//       context: () => ({
//         user: {
//           userId: mockUser01._id.toString(),
//           userName: mockUser01.name,
//         },
//       }),
//     });

//     uploadImg.mockImplementation(() => JSON.stringify(mockUploadResponse));
//     pushNotification.mockImplementation(() => {});

//     const dateNeed = new Date();
//     const dateReturn = new Date();

//     const requestInput = {
//       title: 'Test Request 01sa',
//       desc: 'testRequest01dsa',
//       image: uploadImg(),
//       dateNeed,
//       dateReturn,
//       // dateNeed: `${new Date()}`,
//       // dateReturn: `${new Date()}`,
//     };

//     const { mutate } = createTestClient(server);
//     const res = await mutate({
//       mutation: CREATE_REQUEST,
//       variables: { requestInput, communityId: mockCommunity01._id.toString() },
//     });

//     console.log(res);
//   });
// });
