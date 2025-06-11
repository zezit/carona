# Maestro End-to-End Tests for Carpool App

This directory contains Maestro end-to-end tests for the carpool application. Each test file covers a specific user flow in the application.

## Test Files

1. `login_flow.yaml` - Tests the authentication flow
   - Invalid login attempt
   - Valid login attempt

2. `create_ride_flow.yaml` - Tests the ride creation flow
   - Navigation to create ride
   - Location selection
   - Ride details input
   - Submission

3. `find_request_ride_flow.yaml` - Tests the ride search and request flow
   - Search for available rides
   - View ride details
   - Submit ride request

4. `profile_management_flow.yaml` - Tests the profile management flow
   - View profile
   - Update profile information
   - Verify changes

## Running Tests

To run the tests, make sure you have Maestro installed and use the following commands:

```bash
# Run a specific test
maestro test .maestro/login_flow.yaml

# Run all tests
maestro test .maestro/
```

## Test Structure

Each test file follows this structure:
1. App launch and state reset
2. Login (if required)
3. Main test flow
4. Assertions to verify expected behavior

## Notes

- Tests assume a test user exists with email: test@pucminas.br
- Some UI elements require specific test IDs to be added to the app
- Tests may need to be updated if the app's UI or flow changes
