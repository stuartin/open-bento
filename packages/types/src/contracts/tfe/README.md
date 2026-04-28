# terraform init

- **GET** `/api/v1/cloud/v2/ping` > **204**
- **GET** `/api/v1/cloud/v2/organizations/{organization}/entitlement-set` > **200**
- **GET** `/api/v1/cloud/v2/organizations/{organization}/workspaces/{workspace}`
  - -> **200**
    - **GET** `/api/v1/tfe/v2/workspaces/workspace/current-state-version` > **200**
  - -> **404**
    - **POST** `/api/v1/tfe/v2/organizations/org/workspaces` > **200**

      ```
      {
        data: {
          type: "workspaces",
          attributes: {
            name: "workspace_test"
          }
        }
      }
      ```
