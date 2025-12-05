Feature: Create and Join Challenges

    Scenario: User A creates a new challenge and User B joins it
        Given I am on the Login page
        When I authenticate as a user with email "parnika@fake.com" and password "hifake!0Ab"
        And I am on the Dashboard page
        When I open the Create Challenge modal
        And I fill in the challenge name "Go Outside"
        And I fill in the challenge description "Go outside at least once each day"
        And I select the task-based challenge type
        And I choose a start date of today
        And I submit the challenge form
        Then I should see a challenge card with the name "Go Outside"
        And I store the join code from the "Go Outside" challenge card
        Then I sign out of my account

        When I authenticate as a user with email "parnika@fake.com" and password "hifake!0Ab"
        When I open the Join Challenge modal
        And I fill in the stored join code
        And I submit the join code
        Then I should see a challenge card with the name "Go Outside"
