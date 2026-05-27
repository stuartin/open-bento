terraform {
  cloud {
    hostname     = "localhost:5173"
    organization = "organization"

    workspaces {
      name = "workspace"
    }
  }
}
