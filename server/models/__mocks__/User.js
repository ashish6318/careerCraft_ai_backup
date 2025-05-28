// This is the mock implementation for ../models/User.js

// Create Jest mock functions for the methods we need to control in tests
const mockSelect = jest.fn();
const mockFindById = jest.fn(() => ({
  select: mockSelect, // Return an object that has the select method
}));

// The User mock object/class
const User = {
  findById: () => ({ // This function itself is not a jest.fn() here
    select: () => Promise.resolve(null) 
    }),
  // If other static User model methods are used in code you test, mock them here too.
  // e.g., findOne: jest.fn(), create: jest.fn(), etc.
};

// In each test, you will configure what mockSelect resolves to:
// e.g., mockSelect.mockResolvedValue({ _id: 'someId', ... }); // User found
// or mockSelect.mockResolvedValue(null); // User not found

export default User;
