# terraform init

- **GET** `/api/v1/tfe/ping` > **204**

- **GET** `/api/v1/tfe/organizations/{organization}/entitlement-set` > **200**

- **GET** `/api/v1/tfe/organizations/{organization}/workspaces/{workspace}`
  - -> **200**
    - **GET** `/api/v1/tfe/v2/workspaces/workspace/current-state-version` > **200**

  - -> **404**
    - **POST** `/api/v1/tfe/v2/organizations/org/workspaces` > **200**

      ```typescript
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

      ```typescript
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

- **GET** `/api/v1/tfe/ping` > **204**

- **GET** `/api/v1/tfe/organizations/{organization}/entitlement-set` > **200**

- **GET** `/api/v1/tfe/organizations/{organization}/workspaces/{workspace}` > **200**

- **POST** `/api/v1/tfe/workspaces/{workspace}/configuration-versions` > **200** (with upload-url and id)

  ```typescript
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

- **PUT** `/api/v1/tfe/uploads` > **200**

  ```
  content-type: application/octet-stream
  .tar.gz file upload
  ```

- **GET** `/api/v1/tfe/workspaces/{workspace}/configuration-versions{configuration}` > **200**

- **POST** `/api/v1/tfe/runs` > **200**

  ```typescript
  {
    data: {
      type: 'runs',
      attributes: {
        'auto-apply': false,
        refresh: true,
        'save-plan': false,
        variables: []
      },
      relationships: {
        'configuration-version': {
          data: {
            type: 'configuration-versions',
            id: 'configuration-versions-id'
          }
        },
        workspace: {
          data: {
            type: 'workspaces',
            id: 'workspaces-id'
          }
        }
      }
    }
  }
  ```
