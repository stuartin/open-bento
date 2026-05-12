# Terraform Cloud API - Detailed Payload Examples

This document contains actual request and response payloads extracted from HAR file analysis.

---

## Table of Contents

1. [Service Discovery](#service-discovery)
2. [Organization & Workspace Information](#organization--workspace-information)
3. [Configuration Version Management](#configuration-version-management)
4. [Run Lifecycle](#run-lifecycle)
5. [Plan Monitoring](#plan-monitoring)
6. [Task Stages & Policy Evaluation](#task-stages--policy-evaluation)
7. [Apply Execution](#apply-execution)

---

## Service Discovery

### GET /.well-known/terraform.json

**Request Headers**:
```
Authorization: Bearer <token>
User-Agent: HashiCorp Terraform/1.13.0 (+https://www.terraform.io)
```

**Response** (HTTP 200):
```json
{
  "modules.v1": "/api/registry/v1/modules/",
  "providers.v1": "/api/registry/v1/providers/",
  "components.v3": "/api/registry/v3/components/",
  "motd.v1": "/api/terraform/motd",
  "state.v2": "/api/v2/",
  "stacksplugin.v1": "/stacksplugin.v1",
  "tfe.v2": "/api/v2/",
  "tfe.v2.1": "/api/v2/",
  "tfe.v2.2": "/api/v2/",
  "versions.v1": "https://checkpoint-api.hashicorp.com/v1/versions/"
}
```

### GET /api/v2/ping

**Request Headers**:
```
Authorization: Bearer <token>
User-Agent: go-tfe
```

**Response**: HTTP 204 (No Content)

---

## Organization & Workspace Information

### GET /api/v2/organizations/{org}/entitlement-set

**Request**:
```
GET /api/v2/organizations/wcbbc/entitlement-set
Authorization: Bearer <token>
User-Agent: go-tfe
```

**Response** (HTTP 200):
```json
{
  "data": {
    "id": "org-sAEW2Btif4jhpJQH",
    "type": "entitlement-sets",
    "attributes": {
      "agents": true,
      "assessments": true,
      "audit-logging": true,
      "can-apply": true,
      "configuration-designer": true,
      "cost-estimation": true,
      "global-run-tasks": true,
      "terraform-actions": true,
      "module-tests-agent-support": false,
      "no-code-modules": true,
      "operations": true,
      "policy-enforcement": true,
      "policy-limit": null,
      "policy-mandatory-enforcement-limit": null,
      "private-module-registry": true,
      "private-policy-agents": true,
      "private-vcs": true,
      "run-tasks": true,
      "run-tasks-limit": null,
      "run-tasks-mandatory-enforcement-limit": null,
      "self-serve-billing": true,
      "sentinel": true,
      "sso": true,
      "state-storage": true,
      "teams": true,
      "vcs-integrations": true
    }
  }
}
```

### GET /api/v2/organizations/{org}/workspaces/{workspace_name}

**Request**:
```
GET /api/v2/organizations/wcbbc/workspaces/platform-stuart-cc-dv
Authorization: Bearer <token>
User-Agent: go-tfe
```

**Response** (HTTP 200):
```json
{
  "data": {
    "id": "ws-qLbxbNfoJGAt2N9m",
    "type": "workspaces",
    "attributes": {
      "allow-destroy-plan": true,
      "auto-apply": false,
      "auto-apply-run-trigger": false,
      "auto-destroy-activity-duration": null,
      "auto-destroy-at": null,
      "auto-destroy-status": null,
      "inherits-project-auto-destroy": true,
      "created-at": "2025-10-31T23:45:20.639Z",
      "environment": "default",
      "locked": false,
      "name": "platform-stuart-cc-dv",
      "queue-all-runs": false,
      "speculative-enabled": true,
      "structured-run-output-enabled": true,
      "terraform-version": "1.13.0",
      "working-directory": "",
      "global-remote-state": false,
      "updated-at": "2026-05-07T20:42:24.175Z",
      "resource-count": 1,
      "apply-duration-average": 8000,
      "plan-duration-average": 4000,
      "policy-check-failures": null,
      "run-failures": null,
      "workspace-kpis-runs-count": null,
      "latest-change-at": "2026-05-07T20:42:24.175Z",
      "operations": true,
      "execution-mode": "agent",
      "vcs-repo": null,
      "vcs-repo-identifier": null,
      "permissions": {
        "can-update": true,
        "can-destroy": true,
        "can-queue-destroy": true,
        "can-queue-run": true,
        "can-queue-apply": true,
        "can-read-state-versions": true,
        "can-create-state-versions": true,
        "can-read-variable": true,
        "can-update-variable": true,
        "can-lock": true,
        "can-unlock": true,
        "can-force-unlock": true,
        "can-read-settings": true,
        "can-manage-tags": true,
        "can-manage-run-tasks": true,
        "can-manage-assessments": true,
        "can-read-assessment-results": true,
        "can-queue-assessment": true
      }
    },
    "relationships": {
      "organization": {
        "data": {
          "id": "wcbbc",
          "type": "organizations"
        }
      },
      "current-run": {
        "data": {
          "id": "run-74GjJWcjPj9NTBbC",
          "type": "runs"
        }
      },
      "current-state-version": {
        "data": {
          "id": "sv-QVrcNYS748PXjQND",
          "type": "state-versions"
        }
      },
      "current-configuration-version": {
        "data": {
          "id": "cv-r2PoHS84d1c7Pcmz",
          "type": "configuration-versions"
        }
      },
      "agent-pool": {
        "data": {
          "id": "apool-...",
          "type": "agent-pools"
        }
      },
      "project": {
        "data": {
          "id": "prj-CskMm3ASrqTkuDyX",
          "type": "projects"
        }
      }
    },
    "links": {
      "self": "/api/v2/workspaces/ws-qLbxbNfoJGAt2N9m"
    }
  }
}
```

### GET /api/v2/workspaces/{workspace_id}/current-state-version

**Request**:
```
GET /api/v2/workspaces/ws-qLbxbNfoJGAt2N9m/current-state-version
Authorization: Bearer <token>
User-Agent: go-tfe
```

**Response** (HTTP 200):
```json
{
  "data": {
    "id": "sv-QVrcNYS748PXjQND",
    "type": "state-versions",
    "attributes": {
      "created-at": "2026-05-07T20:42:23.454Z",
      "size": 726,
      "hosted-state-download-url": "https://app.terraform.io/api/state-versions/sv-QVrcNYS748PXjQND/hosted_state",
      "hosted-json-state-download-url": "https://app.terraform.io/api/state-versions/sv-QVrcNYS748PXjQND/hosted_json_state",
      "resources-processed": true,
      "state-version": 4,
      "terraform-version": "1.13.0",
      "vcs-commit-url": null,
      "vcs-commit-sha": null,
      "status": "finalized",
      "modules": {},
      "providers": {},
      "resources": [],
      "serial": 4
    },
    "relationships": {
      "run": {
        "data": {
          "id": "run-74GjJWcjPj9NTBbC",
          "type": "runs"
        }
      },
      "workspace": {
        "data": {
          "id": "ws-qLbxbNfoJGAt2N9m",
          "type": "workspaces"
        }
      },
      "created-by": {
        "data": {
          "id": "user-...",
          "type": "users"
        }
      },
      "outputs": {
        "data": []
      }
    },
    "links": {
      "self": "/api/v2/state-versions/sv-QVrcNYS748PXjQND"
    }
  }
}
```

---

## Configuration Version Management

### POST /api/v2/workspaces/{workspace_id}/configuration-versions (Speculative)

**Request**:
```
POST /api/v2/workspaces/ws-qLbxbNfoJGAt2N9m/configuration-versions
Authorization: Bearer <token>
User-Agent: go-tfe
Content-Type: application/vnd.api+json
```

**Request Body**:
```json
{
  "data": {
    "type": "configuration-versions",
    "attributes": {
      "auto-queue-runs": false,
      "provisional": false,
      "speculative": true
    }
  }
}
```

**Response** (HTTP 201):
```json
{
  "data": {
    "id": "cv-zNoAfsazN5oQVY22",
    "type": "configuration-versions",
    "attributes": {
      "auto-queue-runs": false,
      "error": null,
      "error-message": null,
      "provisional": false,
      "source": "terraform+cloud",
      "speculative": true,
      "status": "pending",
      "status-timestamps": {},
      "changed-files": [],
      "upload-url": "https://archivist.terraform.io/v1/object/dmF1bHQ6djU6anVlZVBnL25CV3drN1d0dFhuMllSVzJmNXpEVFc5RkZwUUc4MHZRYjNBTjdOZ1ozRzlKZUp2T3lVeWJvSnd3amlPQUtXdTlMbGE4N0xacTJEVEZRdWtrYVVmMGx5eERDVGY2dGtIKzVYMWdteHhEVWRDZ2JDaWlEWW9RU2FoT0phWDJGNGlCR0NoU0tpNnJ1bklmSEV1Q1BNRGVIZXlWQ3MyMFRCWWhoNVhEUnBpNllVZTZKU2w0QWVBZE9EWVlJcTVjaU1zZURHVkN2NU90QXBnQkVzdkdINFFyZlA5OXJrV3JaU0tuOThxNTVad1RSZm04S1F3VWYzSDhFUytaaDY2WUNDNjRyeW8zRjRndUpQQlFLS0NzcUE5VzN1VGZpSWRXQWVsNzBLcjBvcXk5QVRkb0RPZ3Fid3RYUHlPSE9Ga1JncWRsOTR0R0I3cVZJSGVhS2JNb0FSY2RlUlJSclBPZkZxcGNQRGtEQjBaZ0hrYlpRZjdnQT09"
    },
    "relationships": {
      "ingress-attributes": {
        "data": null,
        "links": {
          "related": "/api/v2/configuration-versions/cv-zNoAfsazN5oQVY22/ingress-attributes"
        }
      }
    },
    "links": {
      "self": "/api/v2/configuration-versions/cv-zNoAfsazN5oQVY22"
    }
  }
}
```

### POST /api/v2/workspaces/{workspace_id}/configuration-versions (Non-Speculative)

**Request Body**:
```json
{
  "data": {
    "type": "configuration-versions",
    "attributes": {
      "auto-queue-runs": false,
      "provisional": false,
      "speculative": false
    }
  }
}
```

**Response** (HTTP 201):
```json
{
  "data": {
    "id": "cv-r2PoHS84d1c7Pcmz",
    "type": "configuration-versions",
    "attributes": {
      "auto-queue-runs": false,
      "error": null,
      "error-message": null,
      "provisional": false,
      "source": "terraform+cloud",
      "speculative": false,
      "status": "pending",
      "status-timestamps": {},
      "changed-files": [],
      "upload-url": "https://archivist.terraform.io/v1/object/..."
    },
    "relationships": {
      "ingress-attributes": {
        "data": null
      }
    },
    "links": {
      "self": "/api/v2/configuration-versions/cv-r2PoHS84d1c7Pcmz"
    }
  }
}
```

### GET /api/v2/configuration-versions/{cv_id}

**Request**:
```
GET /api/v2/configuration-versions/cv-zNoAfsazN5oQVY22
Authorization: Bearer <token>
User-Agent: go-tfe
```

**Response** (HTTP 200):
```json
{
  "data": {
    "id": "cv-zNoAfsazN5oQVY22",
    "type": "configuration-versions",
    "attributes": {
      "auto-queue-runs": false,
      "error": null,
      "error-message": null,
      "provisional": false,
      "source": "terraform+cloud",
      "speculative": true,
      "status": "uploaded",
      "status-timestamps": {
        "uploaded-at": "2026-05-07T20:47:35+00:00"
      },
      "changed-files": []
    },
    "relationships": {
      "ingress-attributes": {
        "data": null,
        "links": {
          "related": "/api/v2/configuration-versions/cv-zNoAfsazN5oQVY22/ingress-attributes"
        }
      }
    },
    "links": {
      "self": "/api/v2/configuration-versions/cv-zNoAfsazN5oQVY22"
    }
  }
}
```

---

## Run Lifecycle

### POST /api/v2/runs

**Request**:
```
POST /api/v2/runs
Authorization: Bearer <token>
User-Agent: go-tfe
Content-Type: application/vnd.api+json
```

**Request Body**:
```json
{
  "data": {
    "type": "runs",
    "attributes": {
      "auto-apply": false,
      "refresh": true,
      "save-plan": false,
      "variables": []
    },
    "relationships": {
      "configuration-version": {
        "data": {
          "type": "configuration-versions",
          "id": "cv-zNoAfsazN5oQVY22"
        }
      },
      "workspace": {
        "data": {
          "type": "workspaces",
          "id": "ws-qLbxbNfoJGAt2N9m"
        }
      }
    }
  }
}
```

**Response** (HTTP 201):
```json
{
  "data": {
    "id": "run-UitpJNN2bPkdtGed",
    "type": "runs",
    "attributes": {
      "actions": {
        "is-cancelable": true,
        "is-confirmable": false,
        "is-discardable": false,
        "is-force-cancelable": false
      },
      "canceled-at": null,
      "created-at": "2026-05-07T20:47:35.123Z",
      "has-changes": false,
      "auto-apply": false,
      "allow-empty-apply": false,
      "allow-config-generation": true,
      "is-destroy": false,
      "message": "",
      "plan-only": false,
      "refresh": true,
      "refresh-only": false,
      "replace-addrs": null,
      "save-plan": false,
      "source": "tfe-api",
      "status": "pending",
      "status-timestamps": {
        "pending-at": "2026-05-07T20:47:35+00:00"
      },
      "target-addrs": null,
      "terraform-version": "1.13.0",
      "permissions": {
        "can-apply": true,
        "can-cancel": true,
        "can-comment": true,
        "can-discard": false,
        "can-force-execute": true,
        "can-force-cancel": false,
        "can-override-policy-check": false
      },
      "variables": []
    },
    "relationships": {
      "workspace": {
        "data": {
          "id": "ws-qLbxbNfoJGAt2N9m",
          "type": "workspaces"
        }
      },
      "configuration-version": {
        "data": {
          "id": "cv-zNoAfsazN5oQVY22",
          "type": "configuration-versions"
        }
      },
      "created-by": {
        "data": {
          "id": "user-...",
          "type": "users"
        }
      },
      "plan": {
        "data": {
          "id": "plan-6oewwftJfffibjxZ",
          "type": "plans"
        }
      },
      "apply": {
        "data": null
      },
      "task-stages": {
        "data": [
          {
            "id": "ts-YfQV1MS3rPEE14C6",
            "type": "task-stages"
          }
        ]
      },
      "policy-checks": {
        "data": [
          {
            "id": "polchk-...",
            "type": "policy-checks"
          }
        ]
      }
    },
    "links": {
      "self": "/api/v2/runs/run-UitpJNN2bPkdtGed"
    }
  }
}
```

### GET /api/v2/runs/{run_id}

**Request**:
```
GET /api/v2/runs/run-UitpJNN2bPkdtGed
Authorization: Bearer <token>
User-Agent: go-tfe
```

**Response** (HTTP 200) - **Status: plan_queued**:
```json
{
  "data": {
    "id": "run-UitpJNN2bPkdtGed",
    "type": "runs",
    "attributes": {
      "actions": {
        "is-cancelable": true,
        "is-confirmable": false,
        "is-discardable": false,
        "is-force-cancelable": false
      },
      "canceled-at": null,
      "created-at": "2026-05-07T20:47:35.123Z",
      "has-changes": true,
      "auto-apply": false,
      "is-destroy": false,
      "message": "",
      "plan-only": false,
      "refresh": true,
      "source": "tfe-api",
      "status": "plan_queued",
      "status-timestamps": {
        "pending-at": "2026-05-07T20:47:35+00:00",
        "plan-queueable-at": "2026-05-07T20:47:35+00:00",
        "plan-queued-at": "2026-05-07T20:47:35+00:00"
      },
      "terraform-version": "1.13.0"
    },
    "relationships": {
      "workspace": {
        "data": {
          "id": "ws-qLbxbNfoJGAt2N9m",
          "type": "workspaces"
        }
      },
      "plan": {
        "data": {
          "id": "plan-6oewwftJfffibjxZ",
          "type": "plans"
        }
      }
    }
  }
}
```

**Response** (HTTP 200) - **Status: post_plan_running**:
```json
{
  "data": {
    "id": "run-UitpJNN2bPkdtGed",
    "type": "runs",
    "attributes": {
      "status": "post_plan_running",
      "status-timestamps": {
        "pending-at": "2026-05-07T20:47:35+00:00",
        "plan-queueable-at": "2026-05-07T20:47:35+00:00",
        "plan-queued-at": "2026-05-07T20:47:35+00:00",
        "planning-at": "2026-05-07T20:47:36+00:00",
        "planned-at": "2026-05-07T20:47:40+00:00",
        "post-plan-running-at": "2026-05-07T20:47:40+00:00"
      }
    }
  }
}
```

**Response** (HTTP 200) - **Status: planned_and_finished** (Speculative):
```json
{
  "data": {
    "id": "run-UitpJNN2bPkdtGed",
    "type": "runs",
    "attributes": {
      "status": "planned_and_finished",
      "status-timestamps": {
        "pending-at": "2026-05-07T20:47:35+00:00",
        "plan-queueable-at": "2026-05-07T20:47:35+00:00",
        "plan-queued-at": "2026-05-07T20:47:35+00:00",
        "planning-at": "2026-05-07T20:47:36+00:00",
        "planned-at": "2026-05-07T20:47:40+00:00",
        "post-plan-running-at": "2026-05-07T20:47:40+00:00",
        "post-plan-completed-at": "2026-05-07T20:47:43+00:00",
        "planned-and-finished-at": "2026-05-07T20:47:43+00:00"
      }
    }
  }
}
```

**Response** (HTTP 200) - **Status: post_plan_completed** (Non-Speculative):
```json
{
  "data": {
    "id": "run-74GjJWcjPj9NTBbC",
    "type": "runs",
    "attributes": {
      "actions": {
        "is-cancelable": true,
        "is-confirmable": true,
        "is-discardable": true,
        "is-force-cancelable": false
      },
      "status": "post_plan_completed",
      "status-timestamps": {
        "pending-at": "2026-05-07T20:47:48+00:00",
        "plan-queued-at": "2026-05-07T20:47:48+00:00",
        "planning-at": "2026-05-07T20:47:49+00:00",
        "planned-at": "2026-05-07T20:47:53+00:00",
        "post-plan-running-at": "2026-05-07T20:47:53+00:00",
        "post-plan-completed-at": "2026-05-07T20:47:56+00:00"
      }
    }
  }
}
```

### GET /api/v2/runs/{run_id}/run-events

**Request**:
```
GET /api/v2/runs/run-UitpJNN2bPkdtGed/run-events
Authorization: Bearer <token>
User-Agent: go-tfe
```

**Response** (HTTP 200):
```json
{
  "data": [
    {
      "id": "re-...",
      "type": "run-events",
      "attributes": {
        "action": "created",
        "created-at": "2026-05-07T20:47:35.123Z",
        "description": "Run created"
      },
      "relationships": {
        "actor": {
          "data": {
            "id": "user-...",
            "type": "users"
          }
        }
      }
    }
  ]
}
```

---

## Plan Monitoring

### GET /api/v2/plans/{plan_id}

**Request**:
```
GET /api/v2/plans/plan-6oewwftJfffibjxZ
Authorization: Bearer <token>
User-Agent: go-tfe
```

**Response** (HTTP 200) - **Status: agent_queued**:
```json
{
  "data": {
    "id": "plan-6oewwftJfffibjxZ",
    "type": "plans",
    "attributes": {
      "execution-details": {
        "mode": "agent",
        "agent-id": "agent-...",
        "agent-name": "...",
        "agent-pool-id": "apool-...",
        "agent-pool-name": "..."
      },
      "has-changes": true,
      "resource-additions": 1,
      "resource-changes": 0,
      "resource-destructions": 0,
      "resource-imports": 0,
      "status": "agent_queued",
      "status-timestamps": {
        "agent-queued-at": "2026-05-07T20:47:36+00:00"
      },
      "log-read-url": "https://archivist.terraform.io/v1/object/...",
      "redacted-log-read-url": "https://archivist.terraform.io/v1/object/..."
    },
    "relationships": {
      "state-versions": {
        "data": []
      },
      "exports": {
        "data": []
      }
    },
    "links": {
      "self": "/api/v2/plans/plan-6oewwftJfffibjxZ",
      "json-output": "/api/v2/plans/plan-6oewwftJfffibjxZ/json-output",
      "json-output-redacted": "/api/v2/plans/plan-6oewwftJfffibjxZ/json-output-redacted"
    }
  }
}
```

**Response** (HTTP 200) - **Status: finished**:
```json
{
  "data": {
    "id": "plan-6oewwftJfffibjxZ",
    "type": "plans",
    "attributes": {
      "execution-details": {
        "mode": "agent"
      },
      "has-changes": true,
      "resource-additions": 1,
      "resource-changes": 0,
      "resource-destructions": 0,
      "resource-imports": 0,
      "status": "finished",
      "status-timestamps": {
        "agent-queued-at": "2026-05-07T20:47:36+00:00",
        "queued-at": "2026-05-07T20:47:36+00:00",
        "started-at": "2026-05-07T20:47:37+00:00",
        "finished-at": "2026-05-07T20:47:40+00:00"
      },
      "log-read-url": "https://archivist.terraform.io/v1/object/...",
      "redacted-log-read-url": "https://archivist.terraform.io/v1/object/..."
    },
    "links": {
      "self": "/api/v2/plans/plan-6oewwftJfffibjxZ",
      "json-output": "/api/v2/plans/plan-6oewwftJfffibjxZ/json-output",
      "json-output-redacted": "/api/v2/plans/plan-6oewwftJfffibjxZ/json-output-redacted"
    }
  }
}
```

### GET /api/v2/plans/{plan_id}/json-output-redacted

**Request**:
```
GET /api/v2/plans/plan-6oewwftJfffibjxZ/json-output-redacted
Authorization: Bearer <token>
User-Agent: go-tfe
```

**Response**: HTTP 307 Temporary Redirect
```
Location: https://archivist.terraform.io/v1/object/dmF1bHQ6djU6...
```

The redirect URL contains a signed URL to download the actual plan JSON output.

---

## Task Stages & Policy Evaluation

### GET /api/v2/task-stages/{task_stage_id}

**Request**:
```
GET /api/v2/task-stages/ts-YfQV1MS3rPEE14C6
Authorization: Bearer <token>
User-Agent: go-tfe
```

**Response** (HTTP 200) - **Status: running**:
```json
{
  "data": {
    "id": "ts-YfQV1MS3rPEE14C6",
    "type": "task-stages",
    "attributes": {
      "stage": "post_plan",
      "status": "running",
      "status-timestamps": {
        "running-at": "2026-05-07T20:47:40+00:00"
      },
      "created-at": "2026-05-07T20:47:40.123Z",
      "updated-at": "2026-05-07T20:47:41.456Z"
    },
    "relationships": {
      "run": {
        "data": {
          "id": "run-UitpJNN2bPkdtGed",
          "type": "runs"
        }
      },
      "task-results": {
        "data": [
          {
            "id": "taskrs-...",
            "type": "task-results"
          }
        ]
      }
    },
    "links": {
      "self": "/api/v2/task-stages/ts-YfQV1MS3rPEE14C6"
    }
  }
}
```

**Response** (HTTP 200) - **Status: passed**:
```json
{
  "data": {
    "id": "ts-YfQV1MS3rPEE14C6",
    "type": "task-stages",
    "attributes": {
      "stage": "post_plan",
      "status": "passed",
      "status-timestamps": {
        "running-at": "2026-05-07T20:47:40+00:00",
        "passed-at": "2026-05-07T20:47:42+00:00"
      },
      "created-at": "2026-05-07T20:47:40.123Z",
      "updated-at": "2026-05-07T20:47:42.789Z"
    },
    "relationships": {
      "run": {
        "data": {
          "id": "run-UitpJNN2bPkdtGed",
          "type": "runs"
        }
      },
      "task-results": {
        "data": [
          {
            "id": "taskrs-...",
            "type": "task-results"
          }
        ]
      }
    }
  }
}
```

### GET /api/v2/policy-evaluations/{poleval_id}/policy-set-outcomes

**Request**:
```
GET /api/v2/policy-evaluations/poleval-zkBDiCw4vwQaJ1yf/policy-set-outcomes
Authorization: Bearer <token>
User-Agent: go-tfe
```

**Response** (HTTP 200):
```json
{
  "data": [
    {
      "id": "...",
      "type": "policy-set-outcomes",
      "attributes": {
        "outcomes": [],
        "error": null,
        "overridable": false,
        "policy-set-name": "...",
        "policy-set-description": "...",
        "result-count": {
          "advisory": 0,
          "mandatory": 0,
          "passed": 3,
          "errored": 0
        }
      },
      "relationships": {
        "policy-set": {
          "data": {
            "id": "polset-...",
            "type": "policy-sets"
          }
        }
      }
    }
  ]
}
```

---

## Apply Execution

### POST /api/v2/runs/{run_id}/actions/apply

**Request**:
```
POST /api/v2/runs/run-74GjJWcjPj9NTBbC/actions/apply
Authorization: Bearer <token>
User-Agent: go-tfe
Content-Type: application/vnd.api+json
```

**Request Body**: Empty or `{}`

**Response**: HTTP 202 Accepted

No response body.

### GET /api/v2/applies/{apply_id}

**Request**:
```
GET /api/v2/applies/apply-tPKXFhYiG4AKu4M6
Authorization: Bearer <token>
User-Agent: go-tfe
```

**Response** (HTTP 200) - **Status: agent_queued**:
```json
{
  "data": {
    "id": "apply-tPKXFhYiG4AKu4M6",
    "type": "applies",
    "attributes": {
      "execution-details": {
        "mode": "agent",
        "agent-id": "agent-...",
        "agent-name": "...",
        "agent-pool-id": "apool-...",
        "agent-pool-name": "..."
      },
      "resource-additions": 1,
      "resource-changes": 0,
      "resource-destructions": 0,
      "resource-imports": 0,
      "status": "agent_queued",
      "status-timestamps": {
        "agent-queued-at": "2026-05-07T20:49:14+00:00"
      },
      "log-read-url": "https://archivist.terraform.io/v1/object/...",
      "redacted-log-read-url": "https://archivist.terraform.io/v1/object/..."
    },
    "relationships": {
      "state-versions": {
        "data": []
      }
    },
    "links": {
      "self": "/api/v2/applies/apply-tPKXFhYiG4AKu4M6"
    }
  }
}
```

**Response** (HTTP 200) - **Status: finished**:
```json
{
  "data": {
    "id": "apply-tPKXFhYiG4AKu4M6",
    "type": "applies",
    "attributes": {
      "execution-details": {
        "mode": "agent"
      },
      "resource-additions": 1,
      "resource-changes": 0,
      "resource-destructions": 0,
      "resource-imports": 0,
      "status": "finished",
      "status-timestamps": {
        "agent-queued-at": "2026-05-07T20:49:14+00:00",
        "queued-at": "2026-05-07T20:49:14+00:00",
        "started-at": "2026-05-07T20:49:15+00:00",
        "finished-at": "2026-05-07T20:49:23+00:00"
      },
      "log-read-url": "https://archivist.terraform.io/v1/object/...",
      "redacted-log-read-url": "https://archivist.terraform.io/v1/object/..."
    },
    "relationships": {
      "state-versions": {
        "data": [
          {
            "id": "sv-...",
            "type": "state-versions"
          }
        ]
      }
    },
    "links": {
      "self": "/api/v2/applies/apply-tPKXFhYiG4AKu4M6"
    }
  }
}
```

### Final Run Status (Applied)

**GET /api/v2/runs/{run_id}**

**Response** (HTTP 200) - **Status: applied**:
```json
{
  "data": {
    "id": "run-74GjJWcjPj9NTBbC",
    "type": "runs",
    "attributes": {
      "actions": {
        "is-cancelable": false,
        "is-confirmable": false,
        "is-discardable": false,
        "is-force-cancelable": false
      },
      "status": "applied",
      "status-timestamps": {
        "pending-at": "2026-05-07T20:47:48+00:00",
        "plan-queued-at": "2026-05-07T20:47:48+00:00",
        "planning-at": "2026-05-07T20:47:49+00:00",
        "planned-at": "2026-05-07T20:47:53+00:00",
        "post-plan-running-at": "2026-05-07T20:47:53+00:00",
        "post-plan-completed-at": "2026-05-07T20:47:56+00:00",
        "confirmed-at": "2026-05-07T20:49:13+00:00",
        "apply-queued-at": "2026-05-07T20:49:13+00:00",
        "applying-at": "2026-05-07T20:49:14+00:00",
        "applied-at": "2026-05-07T20:49:23+00:00"
      },
      "has-changes": true,
      "auto-apply": false
    },
    "relationships": {
      "workspace": {
        "data": {
          "id": "ws-qLbxbNfoJGAt2N9m",
          "type": "workspaces"
        }
      },
      "plan": {
        "data": {
          "id": "plan-BCn5rzt5sEQQ48mz",
          "type": "plans"
        }
      },
      "apply": {
        "data": {
          "id": "apply-tPKXFhYiG4AKu4M6",
          "type": "applies"
        }
      }
    }
  }
}
```

---

## Summary

This document provides real-world examples of:
- Request payloads for creating resources
- Response structures at various stages
- Status transitions through workflow phases
- Relationships between resources (runs, plans, applies, etc.)

All examples are extracted from actual HAR capture analysis of Terraform Cloud API interactions.
