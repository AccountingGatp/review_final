import "dotenv/config"

import { connectDB } from "../config/db.js"
import { User } from "../models/User.js"

type SeedPerson = {
  name: string
  email: string
  role: "TEAM_LEAD" | "EMPLOYEE"
  team: string
}

const TEAMS: { team: string; teamLead: SeedPerson; employees: SeedPerson[] }[] = [
  {
    team: "Team 1",
    teamLead: {
      name: "Dhwani Tamboli",
      email: "dhwani.tamboli@gatpsolutions.com",
      role: "TEAM_LEAD",
      team: "Team 1",
    },
    employees: [
      {
        name: "Deepak Mohanty",
        email: "deepak.mohanty@gatpsolutions.com",
        role: "EMPLOYEE",
        team: "Team 1",
      },
      {
        name: "Lakshita Jain",
        email: "lakshita.jain@gatpsolutions.com",
        role: "EMPLOYEE",
        team: "Team 1",
      },
      {
        name: "Shivraj",
        email: "shivraj@gatpsolutions.com",
        role: "EMPLOYEE",
        team: "Team 1",
      },
    ],
  },
  {
    team: "Team 2",
    teamLead: {
      name: "Simran Kaur",
      email: "simran.kaur@gatpsolutions.com",
      role: "TEAM_LEAD",
      team: "Team 2",
    },
    employees: [
      {
        name: "Ankush Sorot",
        email: "ankush.sorot@gatpsolutions.com",
        role: "EMPLOYEE",
        team: "Team 2",
      },
      {
        name: "Divya Sehgal",
        email: "divya.sehgal@gatpsolutions.com",
        role: "EMPLOYEE",
        team: "Team 2",
      },
      {
        name: "Hardika Pipariya",
        email: "hardika.pipariya@gatpsolutions.com",
        role: "EMPLOYEE",
        team: "Team 2",
      },
      {
        name: "Kush Bhargava",
        email: "kush.bhargava@gatpsolutions.com",
        role: "EMPLOYEE",
        team: "Team 2",
      },
    ],
  },
]

async function upsertUser(
  person: SeedPerson,
  teamLead?: { userId: string; name: string; email: string }
) {
  const update: Record<string, unknown> = {
    name: person.name,
    email: person.email,
    team: person.team,
    role: person.role,
  }

  if (teamLead) {
    update.teamLead = teamLead
  }

  const user = await User.findOneAndUpdate(
    { email: person.email },
    { $set: update },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  return user
}

async function seedEmployees() {
  await connectDB()

  let created = 0

  for (const { teamLead, employees } of TEAMS) {
    const lead = await upsertUser(teamLead)
    created += 1
    console.log(`Team Lead: ${lead.name} (${lead.email})`)

    const leadRef = {
      userId: lead._id.toString(),
      name: lead.name,
      email: lead.email,
    }

    for (const employee of employees) {
      const user = await upsertUser(employee, leadRef)
      created += 1
      console.log(`  Employee: ${user.name} (${user.email})`)
    }
  }

  console.log(`\nSeeded ${created} users successfully.`)
  await User.db.close()
}

seedEmployees()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed:", error)
    process.exit(1)
  })
