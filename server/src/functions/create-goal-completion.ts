import dayjs from 'dayjs'
import { db } from '../db'
import { goalCompletions, goals } from '../db/schema'
import { and, between, count, eq, lte, sql } from 'drizzle-orm'

interface CreateGoalCompletionRequest {
  goalId: string
}

export async function createGoalCompletion({
  goalId,
}: CreateGoalCompletionRequest) {
  const startDayOfWeek = dayjs().startOf('week').toDate()
  const lastDayOfWeek = dayjs().endOf('week').toDate()

  const goalsCompletionCount = db.$with('goas_completion_count').as(
    db
      .select({
        groupId: goalCompletions.goalId,
        completionCount: count(goalCompletions.id).as('completionCount'),
      })
      .from(goalCompletions)
      .where(
        and(between(goalCompletions.createdAt, startDayOfWeek, lastDayOfWeek))
      )
      .groupBy(goalCompletions.goalId)
  )

  const goalCompleted = await db
    .with(goalsCompletionCount)
    .select({
      goalCompletedThisWeek:
        sql`${goalsCompletionCount.completionCount} >= ${goals.desiredWeeklyFrequency} `.mapWith(
          Boolean
        ),
    })
    .from(goals)
    .leftJoin(goalsCompletionCount, eq(goalsCompletionCount.groupId, goals.id))
    .where(eq(goals.id, goalId))
    .limit(1)

  const { goalCompletedThisWeek } = goalCompleted[0]

  if (goalCompletedThisWeek) {
    throw new Error('Goal has already been completed this week.')
  }

  const insertGoalCompletionResult = await db
    .insert(goalCompletions)
    .values({ goalId })
    .returning()

  return {
    insertGoalCompletionResult,
  }
}
