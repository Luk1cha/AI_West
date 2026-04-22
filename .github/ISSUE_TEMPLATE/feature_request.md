name: Feature Request
description: Suggest a feature
title: "[FEATURE] "
labels: ["enhancement"]

body:
  - type: markdown
    attributes:
      value: |
        **Note**: This is an archived Hackathon project and will not receive new features.
        This template is provided for reference/documentation purposes.

  - type: textarea
    id: problem
    attributes:
      label: Problem Statement
      description: What problem are you trying to solve?
    validations:
      required: true

  - type: textarea
    id: solution
    attributes:
      label: Proposed Solution
      description: How would you solve it?
    validations:
      required: true
