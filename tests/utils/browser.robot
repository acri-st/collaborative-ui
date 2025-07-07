*** Settings ***
Library     Browser
# Resource    auth.robot


*** Keywords ***
Open Application
    [Arguments]    ${url}
    Log To Console    opening url ${url}
    New Browser    chromium    headless=True
    New Context    viewport={'width': 1920, 'height': 1080}    ignoreHTTPSErrors=${True}
    New Page    ${url}
    Wait For Elements State    css=#navigation    visible

CheckField
    [Arguments]    ${element}    ${attribute}    ${expected}
    ${is_visibility_checked}    Get Property    ${element}    ${attribute}
    Should Be Equal    '${is_visibility_checked}'    ${expected}
