import { BranchNode, ParsedWorkflowGraph, WorkflowScenario } from '../types/branching';
import { WorkflowData, WorkflowStep } from '../types/research';

export function parseWorkflowGraph(
  workflowData: WorkflowData,
  providerName: string = ''
): ParsedWorkflowGraph {
  const allSteps = workflowData?.workflow || [];
  if (allSteps.length === 0) {
    return {
      allSteps: [],
      nodes: new Map(),
      scenarios: [],
      levels: [],
      maxLevel: 0,
    };
  }

  // Map of id -> step
  const stepMap = new Map<string, WorkflowStep>();
  allSteps.forEach((s) => stepMap.set(String(s.id), s));

  // Graph adjacencies
  const childrenMap = new Map<string, string[]>();
  const parentsMap = new Map<string, string[]>();

  allSteps.forEach((s) => {
    const sid = String(s.id);
    if (!childrenMap.has(sid)) childrenMap.set(sid, []);
    if (!parentsMap.has(sid)) parentsMap.set(sid, []);
  });

  allSteps.forEach((s) => {
    const sid = String(s.id);
    const deps = (s.depends_on || []).map(String).filter((d) => stepMap.has(d) && d !== sid);
    parentsMap.set(sid, deps);

    deps.forEach((parent) => {
      const existing = childrenMap.get(parent) || [];
      if (!existing.includes(sid)) {
        existing.push(sid);
      }
      childrenMap.set(parent, existing);
    });
  });

  // Calculate topological levels (depth)
  const levelsMap = new Map<string, number>();

  function getLevel(sid: string, visited: Set<string> = new Set()): number {
    if (levelsMap.has(sid)) return levelsMap.get(sid)!;
    if (visited.has(sid)) return 0; // prevent cycle
    visited.add(sid);

    const parents = parentsMap.get(sid) || [];
    if (parents.length === 0) {
      levelsMap.set(sid, 0);
      return 0;
    }

    let maxParentLevel = 0;
    for (const p of parents) {
      maxParentLevel = Math.max(maxParentLevel, getLevel(p, new Set(visited)));
    }
    const myLevel = maxParentLevel + 1;
    levelsMap.set(sid, myLevel);
    return myLevel;
  }

  allSteps.forEach((s) => getLevel(String(s.id)));

  // Detect scenarios
  const scenarios = detectScenarios(allSteps, providerName, parentsMap, childrenMap);

  // Build BranchNodes
  const nodes = new Map<string, BranchNode>();

  allSteps.forEach((s) => {
    const sid = String(s.id);
    const parents = parentsMap.get(sid) || [];
    const children = childrenMap.get(sid) || [];
    const level = levelsMap.get(sid) || 0;

    const applicableScenarios = scenarios
      .filter((sc) => sc.applicableStepIds.includes(sid))
      .map((sc) => sc.id);

    // Identify branch label
    let branchLabel: string | undefined;
    if (s.required_for === 'production') {
      branchLabel = 'Production / Verification';
    } else if (applicableScenarios.includes('alt-pkce')) {
      branchLabel = 'Alt: PKCE Flow';
    } else if (applicableScenarios.includes('alt-secret')) {
      branchLabel = 'Alt: Client Secret';
    } else if (applicableScenarios.some((id) => id.startsWith('svc-'))) {
      const svc = scenarios.find((sc) => sc.id === applicableScenarios.find((id) => id.startsWith('svc-')));
      if (svc) branchLabel = svc.title;
    }

    nodes.set(sid, {
      step: s,
      level,
      scenarioIds: applicableScenarios,
      branchLabel,
      isFork: children.length > 1,
      isMerge: parents.length > 1,
      parentIds: parents,
      childIds: children,
    });
  });

  // Group by level
  let maxLevel = 0;
  nodes.forEach((n) => {
    if (n.level > maxLevel) maxLevel = n.level;
  });

  const levels: BranchNode[][] = Array.from({ length: maxLevel + 1 }, () => []);
  nodes.forEach((node) => {
    levels[node.level].push(node);
  });

  // Sort nodes in each level: minimum setup first, then production
  levels.forEach((lvl) => {
    lvl.sort((a, b) => {
      if (a.step.required_for === b.step.required_for) {
        return a.step.id.localeCompare(b.step.id, undefined, { numeric: true });
      }
      return a.step.required_for === 'all' ? -1 : 1;
    });
  });

  return {
    allSteps,
    nodes,
    scenarios,
    levels,
    maxLevel,
  };
}

function detectScenarios(
  steps: WorkflowStep[],
  providerName: string,
  parentsMap: Map<string, string[]>,
  childrenMap: Map<string, string[]>
): WorkflowScenario[] {
  const scenarios: WorkflowScenario[] = [];
  const pLower = providerName.toLowerCase();

  // 1. Scope-based Scenarios (Always present)
  const minStepIds = steps.filter((s) => s.required_for === 'all').map((s) => String(s.id));
  const prodStepIds = steps.map((s) => String(s.id)); // Production includes all

  scenarios.push({
    id: 'scope-all',
    title: 'Complete Workflow',
    description: 'All steps, alternative branches, and full production verification.',
    type: 'scope',
    badge: 'Master View',
    applicableStepIds: prodStepIds,
    isDefault: true,
  });

  scenarios.push({
    id: 'scope-minimum',
    title: 'Minimum Dev Setup',
    description: 'Fastest path to working credentials for local testing, skipping app review.',
    type: 'scope',
    badge: 'Fast Track',
    applicableStepIds: minStepIds,
  });

  if (steps.some((s) => s.required_for === 'production')) {
    scenarios.push({
      id: 'scope-production',
      title: 'Production & Verification',
      description: 'Focuses on public release requirements, consent screens, and verification gates.',
      type: 'scope',
      badge: 'Release Track',
      applicableStepIds: steps.filter((s) => s.required_for === 'production').map((s) => String(s.id)),
    });
  }

  // 2. Service-Specific Scenarios (e.g. Google Meet vs Google Drive/Tasks, Slack Bot vs User)
  if (pLower.includes('google')) {
    const meetSteps = steps
      .filter((s) => containsKeywords(s, ['meet', 'conferencing', 'video', 'call', 'rtc']))
      .map((s) => String(s.id));
    const driveTasksSteps = steps
      .filter((s) => containsKeywords(s, ['drive', 'task', 'file', 'storage', 'calendar', 'document']))
      .map((s) => String(s.id));

    if (meetSteps.length > 0 || driveTasksSteps.length > 0) {
      if (meetSteps.length > 0) {
        scenarios.push({
          id: 'svc-google-meet',
          title: 'Google Meet / Conferencing Track',
          description: 'OAuth scopes, real-time media permissions & setup specific to Google Meet.',
          type: 'service',
          badge: 'Service Branch',
          applicableStepIds: Array.from(new Set([...minStepIds.slice(0, 2), ...meetSteps])),
        });
      }
      if (driveTasksSteps.length > 0) {
        scenarios.push({
          id: 'svc-google-drive',
          title: 'Google Drive & Tasks Track',
          description: 'Restricted drive scopes, sensitive data access & verification specific to storage APIs.',
          type: 'service',
          badge: 'Service Branch',
          applicableStepIds: Array.from(new Set([...minStepIds.slice(0, 2), ...driveTasksSteps])),
        });
      }
    }
  } else if (pLower.includes('slack')) {
    const botSteps = steps
      .filter((s) => containsKeywords(s, ['bot', 'socket', 'event', 'mention', 'message']))
      .map((s) => String(s.id));
    const userSteps = steps
      .filter((s) => containsKeywords(s, ['user token', 'act on behalf', 'identity', 'sign in with slack']))
      .map((s) => String(s.id));

    if (botSteps.length > 0) {
      scenarios.push({
        id: 'svc-slack-bot',
        title: 'Slack Bot & Events Track',
        description: 'Bot token configuration, scopes (chat:write), and event subscriptions.',
        type: 'service',
        badge: 'Service Branch',
        applicableStepIds: Array.from(new Set([...minStepIds.slice(0, 1), ...botSteps])),
      });
    }
    if (userSteps.length > 0) {
      scenarios.push({
        id: 'svc-slack-user',
        title: 'User OAuth / Sign-In Track',
        description: 'User access tokens and delegation permissions.',
        type: 'service',
        badge: 'Service Branch',
        applicableStepIds: Array.from(new Set([...minStepIds.slice(0, 1), ...userSteps])),
      });
    }
  } else if (pLower.includes('github')) {
    const oauthSteps = steps
      .filter((s) => containsKeywords(s, ['oauth app', 'standard oauth', 'user authorization']))
      .map((s) => String(s.id));
    const ghAppSteps = steps
      .filter((s) => containsKeywords(s, ['github app', 'installation', 'private key', 'webhook']))
      .map((s) => String(s.id));

    if (ghAppSteps.length > 0) {
      scenarios.push({
        id: 'svc-github-app',
        title: 'GitHub App Track (Granular)',
        description: 'Modern GitHub App with private key authentication and repository permissions.',
        type: 'service',
        badge: 'Service Branch',
        applicableStepIds: Array.from(new Set([...minStepIds.slice(0, 1), ...ghAppSteps])),
      });
    }
    if (oauthSteps.length > 0) {
      scenarios.push({
        id: 'svc-github-oauth',
        title: 'Standard OAuth App Track',
        description: 'Traditional OAuth 2.0 web application with broad user scopes.',
        type: 'service',
        badge: 'Service Branch',
        applicableStepIds: Array.from(new Set([...minStepIds.slice(0, 1), ...oauthSteps])),
      });
    }
  }

  // 3. Alternative technical routes (e.g. PKCE vs Secret, Web vs Server)
  const pkceSteps = steps
    .filter((s) => containsKeywords(s, ['pkce', 'code_verifier', 'code_challenge', 'spa', 'mobile']))
    .map((s) => String(s.id));
  const secretSteps = steps
    .filter((s) => containsKeywords(s, ['client_secret', 'confidential client', 'backend server']))
    .map((s) => String(s.id));

  if (pkceSteps.length > 0) {
    scenarios.push({
      id: 'alt-pkce',
      title: 'Alternative: Public Client (PKCE)',
      description: 'Single-page or mobile apps using Authorization Code with PKCE (no secret).',
      type: 'alternative',
      badge: 'Protocol Alt',
      applicableStepIds: Array.from(new Set([...minStepIds.slice(0, 2), ...pkceSteps])),
    });
  }

  if (secretSteps.length > 0) {
    scenarios.push({
      id: 'alt-secret',
      title: 'Alternative: Confidential Client (Secret)',
      description: 'Web backend servers storing client_secret securely.',
      type: 'alternative',
      badge: 'Protocol Alt',
      applicableStepIds: Array.from(new Set([...minStepIds.slice(0, 2), ...secretSteps])),
    });
  }

  // If no specific service scenarios were detected, inspect for distinct fork branches
  if (scenarios.length <= 3) {
    // Look for fork steps with multiple children
    childrenMap.forEach((children, parentId) => {
      if (children.length >= 2) {
        children.forEach((childId, idx) => {
          const childStep = steps.find((s) => String(s.id) === childId);
          if (childStep) {
            scenarios.push({
              id: `branch-${parentId}-${childId}`,
              title: `Branch: ${childStep.title}`,
              description: `Alternative path following step #${parentId}`,
              type: 'alternative',
              badge: `Branch Path ${idx + 1}`,
              applicableStepIds: [parentId, childId, ...collectDownstream(childId, childrenMap)],
            });
          }
        });
      }
    });
  }

  return scenarios;
}

function containsKeywords(step: WorkflowStep, keywords: string[]): boolean {
  const content = `${step.title} ${step.sub_steps?.join(' ') || ''}`.toLowerCase();
  return keywords.some((kw) => content.includes(kw.toLowerCase()));
}

function collectDownstream(startId: string, childrenMap: Map<string, string[]>): string[] {
  const result: string[] = [];
  const queue = [startId];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    const children = childrenMap.get(current) || [];
    for (const c of children) {
      result.push(c);
      queue.push(c);
    }
  }
  return result;
}
