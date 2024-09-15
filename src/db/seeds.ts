import { client, db } from '.'
import { goalCompletions, goals } from './schema'

async function seed() {
  await db.delete(goalCompletions)
  await db.delete(goals)

  const results = await db
    .insert(goals)
    .values([
      { title: 'Acordar cedo', desiredWeeklyFrequency: 5 },
      { title: 'Me exercitar', desiredWeeklyFrequency: 3 },
      { title: 'Meditar', desiredWeeklyFrequency: 2 },
      { title: 'Estudar JS', desiredWeeklyFrequency: 2 },
    ])
    .returning()

  await db
    .insert(goalCompletions)
    .values(results.map(item => ({ goalId: item.id })))
}

seed().finally(() => {
  client.end()
})
