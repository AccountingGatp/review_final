import "dotenv/config"

import { connectDB } from "../config/db.js"
import { User } from "../models/User.js"

type SeedEmployee = {
  name: string
  email: string
  team: string | null
  role: "TEAM_LEAD" | "MANAGER" | "EMPLOYEE"
}

const EMPLOYEES: SeedEmployee[] = [
  { name: "Nikhar", email: "nikhar.m@gatpsolutions.com", team: null, role: "EMPLOYEE" },
  { name: "Sandeep Moudgil", email: "sandeep@gatpsolutions.com", team: null, role: "EMPLOYEE" },
  { name: "Mansi Jain", email: "mansi.j@gatpsolutions.com", team: null, role: "EMPLOYEE" },
  { name: "Sanjay", email: "sanjay@gatpsolutions.com", team: null, role: "EMPLOYEE" },
  { name: "Hitesh Garg", email: "hitesh.g@gatpsolutions.com", team: null, role: "MANAGER" },
  { name: "Ridhi Jain", email: "ridhi.j@gatpsolutions.com", team: "Accounts", role: "EMPLOYEE" },
  { name: "Palak Soni", email: "palak@gatpsolutions.com", team: "Accounts", role: "MANAGER" },
  { name: "Simran Kaur", email: "simran.k@gatpsolutions.com", team: null, role: "TEAM_LEAD" },
  { name: "Anjali Saluja", email: "anjali@gatpsolutions.com", team: null, role: "MANAGER" },
  { name: "Krupali Shah", email: "krupali.s@gatpsolutions.com", team: "Accounts", role: "EMPLOYEE" },
  { name: "Sunil P", email: "sunil.p@gatpsolutions.com", team: null, role: "TEAM_LEAD" },
  { name: "Hardika Pipariya", email: "hardika.p@gatpsolutions.com", team: "Accounts", role: "EMPLOYEE" },
  { name: "Pooja Kasera", email: "pooja@gatpsolutions.com", team: null, role: "EMPLOYEE" },
  { name: "Ankush Sorot", email: "ankush@gatpsolutions.com", team: null, role: "EMPLOYEE" },
  { name: "Dhwani Tamboli", email: "dhwani.t@gatpsolutions.com", team: null, role: "TEAM_LEAD" },
  { name: "Pallavi Mathur", email: "pallavi.m@gatpsolutions.com", team: null, role: "EMPLOYEE" },
  { name: "Jaini Soni", email: "jaini.s@gatpsolutions.com", team: null, role: "EMPLOYEE" },
  { name: "Divya Kumari", email: "divya.k@gatpsolutions.com", team: "HR", role: "EMPLOYEE" },
  { name: "Kanchan Jaingaria", email: "kanchan.j@gatpsolutions.com", team: "Accounts", role: "EMPLOYEE" },
  { name: "Himanshi Thakur", email: "himanshi.t@gatpsolutions.com", team: null, role: "EMPLOYEE" },
  { name: "Lakshi", email: "lakshi.w@gatpsolutions.com", team: null, role: "EMPLOYEE" },
  { name: "Ankita Sarkar", email: "ankita.s@gatpsolutions.com", team: "Content", role: "EMPLOYEE" },
  { name: "Amit K", email: "amit.k@gatpsolutions.com", team: null, role: "EMPLOYEE" },
  { name: "Pargat Singh", email: "pargat.s@gatpsolutions.com", team: null, role: "EMPLOYEE" },
  { name: "Vijay Kumar", email: "vijay.k@gatpsolutions.com", team: null, role: "EMPLOYEE" },
  { name: "Ayush Bhardwaj", email: "ayush.b@gatpsolutions.com", team: null, role: "EMPLOYEE" },
  { name: "Pradyumn Mishra", email: "pradyumn.mishra@gatpsolutions.com", team: "Technical Support", role: "EMPLOYEE" },
  { name: "Pushpendra Singh", email: "pushpendra.s@gatpsolutions.com", team: null, role: "EMPLOYEE" },
  { name: "Sathya Priya", email: "sathya.p@gatpsolutions.com", team: "US Accounts", role: "EMPLOYEE" },
  { name: "Vaibhavi Pilke", email: "vaibhavi.p@gatpsolutions.com", team: "US Accounts", role: "EMPLOYEE" },
  { name: "Vivek Kumar", email: "vivek.k@gatpsolutions.com", team: "US Accounts", role: "EMPLOYEE" },
  { name: "Aadarsh Singh Raghav", email: "aadarsh.s@gatpsolutions.com", team: "Automation", role: "EMPLOYEE" },
  { name: "Vibhuti Amit Parmar", email: "vibhuti.p@gatpsolutions.com", team: "US Accounts", role: "EMPLOYEE" },
  { name: "Diwakar", email: "diwakar@gatpsolutions.com", team: "Automation", role: "EMPLOYEE" },
  { name: "Annapurna", email: "annapurna.b@gatpsolutions.com", team: "Operations", role: "EMPLOYEE" },
  { name: "Rahul Kumar Singh", email: "rahul.s@gatpsolutions.com", team: "Internal Accounts", role: "EMPLOYEE" },
  { name: "Akash Yadav", email: "akash.y@gatpsolutions.com", team: "US Accounts", role: "EMPLOYEE" },
]

const DEFAULT_TEAM = "Unassigned"

async function upsertEmployee(employee: SeedEmployee) {
  const user = await User.findOneAndUpdate(
    { email: employee.email.toLowerCase() },
    {
      $set: {
        name: employee.name,
        email: employee.email.toLowerCase(),
        team: employee.team ?? DEFAULT_TEAM,
        role: employee.role,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  return user
}

async function seedGatpEmployees() {
  await connectDB()

  for (const employee of EMPLOYEES) {
    const user = await upsertEmployee(employee)
    console.log(`${user.role}: ${user.name} (${user.email}) — ${user.team}`)
  }

  console.log(`\nSeeded ${EMPLOYEES.length} employees successfully.`)
  await User.db.close()
}

seedGatpEmployees()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed:", error)
    process.exit(1)
  })
