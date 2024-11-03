import { client, db } from '.'
import { goalCompletions, goals } from './schema'

async function seed() {
  await db.delete(goalCompletions)
  await db.delete(goals)

  const results = await db
    .insert(goals)
    .values([
      { title: 'Estudar Android', desiredWeeklyFrequency: 2 },
      { title: 'Academia', desiredWeeklyFrequency: 4 },
    ])
    .returning()

  await db
    .insert(goalCompletions)
    .values(results.map(item => ({ goalId: item.id })))
}

seed().finally(() => {
  client.end()
})
