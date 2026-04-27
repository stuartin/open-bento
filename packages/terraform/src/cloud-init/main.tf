terraform {
  cloud {
    hostname     = "localhost:5173"
    organization = "org"

    workspaces {
      name = "workspace_test"
    }
  }
}
