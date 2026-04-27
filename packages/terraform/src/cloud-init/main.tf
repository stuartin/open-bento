terraform {
  cloud {
    hostname     = "localhost:5173"
    organization = "org_test"

    workspaces {
      name = "workspace_test"
    }
  }
}
