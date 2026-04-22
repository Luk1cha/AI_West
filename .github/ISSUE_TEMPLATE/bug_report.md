name: Bug Report
description: Report an issue with the project
title: "[BUG] "
labels: ["bug"]

body:
  - type: markdown
    attributes:
      value: |
        **Note**: This is an archived Hackathon project. Bug reports are accepted but may not be addressed.

  - type: dropdown
    id: platform
    attributes:
      label: Platform
      options:
        - Android
        - iOS
        - Web
        - ESP32 Hardware
        - Other
    validations:
      required: true

  - type: textarea
    id: description
    attributes:
      label: Description
      description: Describe the bug
      placeholder: "What went wrong?"
    validations:
      required: true

  - type: textarea
    id: reproduce
    attributes:
      label: Steps to Reproduce
      description: How to reproduce the issue?
      placeholder: |
        1. Go to...
        2. Click...
        3. Error...
    validations:
      required: true

  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
      description: What should happen?
