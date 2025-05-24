import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/db"


// Validation schema
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["DOCTOR", "PATIENT", "ADMIN"]),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate input
    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ message: validation.error.errors[0].message }, { status: 400 })
    }

    const { name, email, password, role } = validation.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    })

    // Create profile
    const nameParts = name.split(" ")
    const firstName = nameParts[0]
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : ""

    await prisma.profile.create({
      data: {
        userId: user.id,
        firstName,
        lastName,
      },
    })

    // Create doctor or patient record based on role
    if (role === "DOCTOR") {
      await prisma.doctor.create({
        data: {
          userId: user.id,
          licenseNumber: `TMP-${Math.floor(Math.random() * 1000000)}`, // Temporary license number
        },
      })
    } else if (role === "PATIENT") {
      await prisma.patient.create({
        data: {
          userId: user.id,
        },
      })
    }

    // Create user settings
    await prisma.userSettings.create({
      data: {
        userId: user.id,
      },
    })

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}
