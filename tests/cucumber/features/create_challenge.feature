Feature: Create Task-Based Challenge

    Scenario: User creates a new task-based challenge and sees it on the Dashboard
        Given I am an authenticated user on the Dashboard page
        When I open the Create Challenge modal
        And I fill in the challenge name "Go Outside"
        And I fill in the challenge description "Go outside at least once each day"
        And I select the task-based challenge type
        And I choose a start date of today
        And I submit the challenge form
        Then I should see a challenge card with the name "Go Outside"
