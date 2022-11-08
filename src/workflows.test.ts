import { TestWorkflowEnvironment } from "@temporalio/testing"
import { Worker } from "@temporalio/worker"
import faker from "faker"

import * as activities from "./activities"
import {example} from "./workflows"

describe("workflows", () => {
  let testEnv: TestWorkflowEnvironment

  beforeAll(async () => {
    testEnv = await TestWorkflowEnvironment.createTimeSkipping()
  }, 10_000)

  afterAll(async () => {
    await testEnv?.teardown()
  })

  it("should run the \"greet\" activity", async () => {
    const mockActivities: Partial<typeof activities> = {
      greet: jest.fn((name: string) => Promise.resolve(`Hello, ${name}!`)),
    }

    const testWorker = await Worker.create({
      connection: testEnv.nativeConnection,
      taskQueue: "test",
      workflowsPath: require.resolve("./workflows"),
      activities: mockActivities,
    })

    await testWorker.runUntil(
      testEnv.client.workflow.execute(example, {args: ["test"],workflowId: faker.datatype.uuid(), taskQueue: "test"}),
    );

    expect(mockActivities.greet).toHaveBeenCalledTimes(1)
    expect(mockActivities.greet).toHaveBeenCalledWith("test")
  })
})