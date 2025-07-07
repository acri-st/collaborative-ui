*** Settings ***
Library         String
Resource        ../utils/browser.robot

Suite Setup     Open Application    ${COLLABORATIVE_HOST}

Test Tags       e2e basic

*** Test Cases ***
Basic Test
    # Take Screenshot
    Delete All Cookies
    ${result}=  Get Text    id=home-introduction-1
    Should Be Equal     ${result}   THE ULTIMATE HUB FOR REMOTE SENSING ENTHUSIASTS, RESEARCHERS, AND PROFESSIONALS!
    Wait For Elements State    css=#nav-auth-user-button    hidden


