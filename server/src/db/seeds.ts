import { client, db } from '.'
import { goalCompletions, goals } from './schema'
import { fakerPT_BR as faker } from '@faker-js/faker'
import dayjs from 'dayjs'

async function seed() {
  await db.delete(goalCompletions)
  await db.delete(goals)

  const results = await db
    .insert(goals)
    .values([
      {
        title: 'Android Course',
        desiredWeeklyFrequency: 7,
      },
      {
        title: 'Study English',
        desiredWeeklyFrequency: 2,
      },
      {
        title: 'Gym',
        desiredWeeklyFrequency: 5,
      },
    ])
    .returning()

  const startOfWeek = dayjs().startOf('week')

  await db.insert(goalCompletions).values(
    results.map((item, index) => ({
      goalId: item.id,
      createdAt: startOfWeek.toDate(),
    }))
  )
}

seed().finally(() => {
  client.end()
})
