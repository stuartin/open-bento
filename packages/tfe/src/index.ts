// Common schemas
export * from "./lib/common.schema";

// Workspace
export * from "./features/workspace/workspace.schema";
export * from "./features/workspace/workspace.contract";

// Configuration Version
export * from "./features/configuration-version/configuration-version.schema";
export * from "./features/configuration-version/configuration-version.contract";

// Run
export * from "./features/run/run.schema";
export * from "./features/run/run.contract";

// Plan
export * from "./features/plan/plan.schema";
export * from "./features/plan/plan.contract";

// Apply
export * from "./features/apply/apply.schema";
export * from "./features/apply/apply.contract";

// Task Stage
export * from "./features/task-stage/task-stage.schema";
export * from "./features/task-stage/task-stage.contract";

// State Version
export * from "./features/state-version/state-version.schema";
export * from "./features/state-version/state-version.contract";

// State Version Output
export * from "./features/state-version-output/state-version-output.schema";
export * from "./features/state-version-output/state-version-output.contract";

// Organization
export * from "./features/organization/organization.schema";
export * from "./features/organization/organization.contract";

// Cost Estimate
export * from "./features/cost-estimate/cost-estimate.schema";
export * from "./features/cost-estimate/cost-estimate.contract";

// Task Result
export * from "./features/task-result/task-result.schema";
export * from "./features/task-result/task-result.contract";

// Policy Evaluation
export * from "./features/policy-evaluation/policy-evaluation.schema";
export * from "./features/policy-evaluation/policy-evaluation.contract";

// Unified Contract Router
import { workspaceContract } from "./features/workspace/workspace.contract";
import { configurationVersionContract } from "./features/configuration-version/configuration-version.contract";
import { runContract } from "./features/run/run.contract";
import { planContract } from "./features/plan/plan.contract";
import { applyContract } from "./features/apply/apply.contract";
import { taskStageContract } from "./features/task-stage/task-stage.contract";
import { stateVersionContract } from "./features/state-version/state-version.contract";
import { stateVersionOutputContract } from "./features/state-version-output/state-version-output.contract";
import { organizationContract } from "./features/organization/organization.contract";
import { costEstimateContract } from "./features/cost-estimate/cost-estimate.contract";
import { taskResultContract } from "./features/task-result/task-result.contract";
import { policyEvaluationContract } from "./features/policy-evaluation/policy-evaluation.contract";

export const tfeContract = {
    organizations: organizationContract,
    workspaces: workspaceContract,
    configurationVersions: configurationVersionContract,
    runs: runContract,
    plans: planContract,
    applies: applyContract,
    taskStages: taskStageContract,
    stateVersions: stateVersionContract,
    stateVersionOutputs: stateVersionOutputContract,
    costEstimates: costEstimateContract,
    taskResults: taskResultContract,
    policyEvaluations: policyEvaluationContract,
};

// Unified Serializer
import { SerializeBuilder } from "@jsonapi-serde/server/response";
import { serializeWorkspace } from "./features/workspace/workspace.schema";
import { serializeConfigurationVersion } from "./features/configuration-version/configuration-version.schema";
import { serializeRun } from "./features/run/run.schema";
import { serializePlan } from "./features/plan/plan.schema";
import { serializeApply } from "./features/apply/apply.schema";
import { serializeTaskStage } from "./features/task-stage/task-stage.schema";
import { serializeStateVersion } from "./features/state-version/state-version.schema";
import { serializeStateVersionOutput } from "./features/state-version-output/state-version-output.schema";
import { serializeOrganization } from "./features/organization/organization.schema";
import { serializeCostEstimate } from "./features/cost-estimate/cost-estimate.schema";
import { serializeTaskResult } from "./features/task-result/task-result.schema";
import { serializePolicyEvaluation } from "./features/policy-evaluation/policy-evaluation.schema";

export const serialize = SerializeBuilder.new()
    .add("workspaces", serializeWorkspace)
    .add("configuration-versions", serializeConfigurationVersion)
    .add("runs", serializeRun)
    .add("plans", serializePlan)
    .add("applies", serializeApply)
    .add("task-stages", serializeTaskStage)
    .add("state-versions", serializeStateVersion)
    .add("state-version-outputs", serializeStateVersionOutput)
    .add("organizations", serializeOrganization)
    .add("cost-estimates", serializeCostEstimate)
    .add("task-results", serializeTaskResult)
    .add("policy-evaluations", serializePolicyEvaluation)
    .build();
