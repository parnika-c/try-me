Feature: User Authentication

  Scenario: Successful user login with valid credentials, MFA and logout
    Given I am on the Login page
    When I enter "parnika@fake.com" in the email field
    And I enter "hifake!0Ab" in the password field
    And I click the 'Sign In' button
    Then I should see the MFA page

    When I submit a valid MFA token
    And I click the 'Verify Code' button
    Then I should be logged in and redirected to the Dashboard page

    When I click on my profile picture in the navigation bar
    And I click the 'Sign Out' button
    Then I should be logged out and taken to the Login page

  Scenario Outline: Unsuccessful login with invalid credentials
    Given I am on the Login page
    When I enter "<email>" in the email field
    And I enter "<password>" in the password field
    And I click the 'Sign In' button
    Then I should see an error message "Invalid email or password."
    Examples:
      | email | password |
      | baduser@gmail.com | password123 |
      | parnika@fake.com  | wrongpass |
