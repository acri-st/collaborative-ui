# Collaborative UI


## Table of Contents

- [Introduction](#Introduction)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Testing](#testing)
- [Contributing](#contributing)
- [Deployment](#deployment)
- [License](#license)
- [Support](#support)

## Introduction

###  What is the Collaborative platform?

Collaborative platform allows users to create or reference different assets in a comprehensive catalog in earth obervation and geospatial analysis.

The Microservices that make up the Collaborative platform project are the following: 
- **Auth** Authentication service tu authenticate users.
- **Asset management** Asset management system.

![Collaborative platform Architecture](https://github.com/acri-st/Collaborative UI-ui/blob/main/docs/architecture.png?raw=true)


### What is the Collaborative UI?

The Collaborative UI is a web application that interfaces with the microservices that comprise the ecosystem. It provides users a comprehensible experience to find and use different services of the platform, and has collaboration at its heart.

The Collaborative UI also uses a common library and framework that contains interfaces to services and styling called the desp-ui-fwk.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (version 16.x or higher)
- **Git** 
- **Docker** Docker is mainly used for the test suite, but can also be used to deploy the project via docker compose

## Installation

1. Clone the repository:
```bash
git clone https://github.com/acri-st/collaborative-ui.git
# OR
git clone git@github.com:acri-st/collaborative-ui.git
cd collaborative-ui
```

## Development

## Development Mode

### Standard local development

Setup environment
```bash
make setup
```

Start the development server:
```bash
make start
```

The application will be available at `http://localhost:8100`

To clean the project and remove node_modules and other generated files, use:
```bash
make clean
```

### Production Build

Build the application for production:
```bash
make build
```
#### Docker local development 
Setup environment
```bash
make setup DEPLOY=docker
```

Start the development server:
```bash
make start DEPLOY=docker
```

Stop the development server:
```bash
make stop DEPLOY=docker
```

The application will be available at `http://localhost:8100`

To clean the project and remove node_modules and other generated files, use:
```bash
make clean DEPLOY=docker
```

### Production Build

Build the application for production:
```bash
make build
```

## Testing

To run tests, make sure the local project is running and then run the test suite:
```bash
make test
```

## Contributing

Check out the [CONTRIBUTING.md](https://github.com/acri-st/collaborative-ui/blob/main/CONTRIBUTING.md) for more details on how to contribute.