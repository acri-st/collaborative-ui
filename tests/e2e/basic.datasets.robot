*** Settings ***
Library         String
Resource        ../utils/browser.robot

Suite Setup     Open Application    ${COLLABORATIVE_HOST}/catalog/dataset

Test Tags       e2e basic datasets

*** Test Cases ***
Basic Test Datasets page
    Take Screenshot


