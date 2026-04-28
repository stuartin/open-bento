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

    - **PATCH** `/api/v1/tfe/v2/organizations/org/workspaces` > **200**

      ```
      {
        data: {
          type: "workspaces",
          attributes: {
            "terraform-version": "x.x.x" (client version)
          }
        }
      }
      ```

    - **GET** `/api/v1/tfe/v2/workspaces/workspace/current-state-version` > **200**

# terraform plan

- **GET** `/api/v1/cloud/v2/ping` > **204**
- **GET** `/api/v1/cloud/v2/organizations/{organization}/entitlement-set` > **200**
- **GET** `/api/v1/cloud/v2/organizations/{organization}/workspaces/{workspace}` > **200**
- **POST** `/api/v1/cloud/v2/workspaces/{workspace}/configuration-versions` > **200**

  ```
  {
    data: {
      type: 'configuration-versions',
      attributes: {
          'auto-queue-runs': false,
          provisional: false,
          speculative: true
      }
    }
  }
  ```
