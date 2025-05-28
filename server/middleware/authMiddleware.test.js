import { jest, describe, beforeEach, test, expect } from '@jest/globals';
// Import 'protect' AFTER the mocks are set up by jest.unstable_mockModule
// This is done by awaiting the mock setup first.

let protect; // Will be assigned after mocks
let mockJwtVerify;
let mockUserFindById;
let mockSelectFn;

// Set up mocks at the top level using await (test file becomes an async module)
// This requires Jest to support top-level await in test files, or wrap in an async iife.
// Or, more practically, put this setup inside a beforeAll.

beforeAll(async () => {
  mockJwtVerify = jest.fn();
  mockSelectFn = jest.fn();
  mockUserFindById = jest.fn().mockReturnValue({ select: mockSelectFn });

  await jest.unstable_mockModule('jsonwebtoken', () => ({
    __esModule: true,
    default: { verify: mockJwtVerify, sign: jest.fn() },
    verify: mockJwtVerify,
    sign: jest.fn(),
  }));

  await jest.unstable_mockModule('../models/User.js', () => ({
    __esModule: true,
    default: {
      findById: mockUserFindById,
    },
  }));

  // Now that mocks are in place, dynamically import the module to be tested
  const authMiddleware = await import('./authMiddleware.js');
  protect = authMiddleware.protect;
});


describe('Auth Middleware - protect', () => {
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    // Reset the state of the mocks, not re-define them
    mockJwtVerify.mockReset();
    mockUserFindById.mockClear(); // Clears calls, but doesn't reset mockReturnValue if it was complex
    mockUserFindById.mockReturnValue({ select: mockSelectFn }); // Re-establish the chain for findById
    mockSelectFn.mockReset();

    mockRequest = { cookies: {} };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();

    // Ensure JWT_SECRET is set for tests
    if (!process.env.JWT_SECRET) {
        process.env.JWT_SECRET = 'test_secret_key_for_jest'; // Use a consistent test secret
        console.warn("JWT_SECRET was not set, using a default test secret. Ensure your tests/setupEnv.js loads .env");
    }
  });

  test('should return 401 if no token is provided', async () => {
    mockRequest.cookies = {};
    await protect(mockRequest, mockResponse, mockNext);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Not authorized, no token' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('should return 401 if token is invalid or verification fails', async () => {
    mockRequest.cookies.token = 'invalid-token'; // This string is not a valid JWT format
    // Our mock will throw an error, simulating verification failure
    mockJwtVerify.mockImplementation(() => {
      const err = new Error('jwt malformed'); // Simulate the actual error type
      err.name = 'JsonWebTokenError';
      throw err;
    });

    await protect(mockRequest, mockResponse, mockNext);

    expect(mockJwtVerify).toHaveBeenCalledWith('invalid-token', process.env.JWT_SECRET);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Not authorized, token failed' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('should return 401 if token is valid but user not found in DB', async () => {
    mockRequest.cookies.token = 'valid-token-string'; // Still not a real JWT, but our mock controls it
    const decodedPayload = { userId: 'someUserId' };
    mockJwtVerify.mockReturnValue(decodedPayload); // jwt.verify successfully returns decoded payload
    mockSelectFn.mockResolvedValue(null); // User.findById().select() finds no user

    await protect(mockRequest, mockResponse, mockNext);

    expect(mockJwtVerify).toHaveBeenCalledWith('valid-token-string', process.env.JWT_SECRET);
    expect(mockUserFindById).toHaveBeenCalledWith(decodedPayload.userId);
    expect(mockSelectFn).toHaveBeenCalledWith('-password');
    expect(mockResponse.status).toHaveBeenCalledWith(401);
     expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Not authorized, user not found' }); 
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('should call next and set req.user if token is valid and user is found', async () => {
    mockRequest.cookies.token = 'valid-token-string';
    const decodedPayload = { userId: 'testUserId', role: 'seeker' };
    const mockUser = { _id: 'testUserId', fullName: 'Test User', email: 'test@example.com', role: 'seeker' };
    
    mockJwtVerify.mockReturnValue(decodedPayload);
    mockSelectFn.mockResolvedValue(mockUser); // User.findById().select() returns the mock user

    await protect(mockRequest, mockResponse, mockNext);

    expect(mockJwtVerify).toHaveBeenCalledWith('valid-token-string', process.env.JWT_SECRET);
    expect(mockUserFindById).toHaveBeenCalledWith(decodedPayload.userId);
    expect(mockSelectFn).toHaveBeenCalledWith('-password');
    expect(mockRequest.user).toEqual(mockUser);
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).not.toHaveBeenCalled(); // No error status
    expect(mockResponse.json).not.toHaveBeenCalled();  // No error response
  });
});
