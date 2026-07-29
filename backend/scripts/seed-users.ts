import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { UserModel } from "../src/models/user.model";

dotenv.config();

const skillsList = [
  "JavaScript", "TypeScript", "React", "Node.js", "Python", 
  "Django", "Java", "Spring Boot", "C++", "Go", 
  "UI/UX Design", "Figma", "Photoshop", "Digital Marketing", "SEO",
  "Data Analysis", "Machine Learning", "AWS", "Docker", "Kubernetes"
];

const firstNames = ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi", "Ivan", "Judy", "Mallory", "Nina", "Oscar", "Peggy", "Romeo", "Sybil", "Trent", "Victor", "Walter", "Zoe"];
const lastNames = ["Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia", "Martinez", "Robinson"];

const getRandomElements = (arr: string[], min = 1, max = 3) => {
  const numElements = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numElements);
};

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL || "mongodb://127.0.0.1:27017/skillswap_db");
    console.log("Connected to MongoDB.");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    const usersToCreate = [];

    for (let i = 0; i < 50; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}`;
      const email = `${username}@example.com`;
      
      const skillsOffered = getRandomElements(skillsList, 1, 4);
      const skillsWanted = getRandomElements(skillsList, 1, 3);
      
      usersToCreate.push({
        firstName,
        lastName,
        email,
        username,
        phoneNumber: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
        password: hashedPassword,
        role: "user",
        bio: `Hi, I am ${firstName}. I can teach you ${skillsOffered.join(", ")} and I'm looking to learn ${skillsWanted.join(", ")}.`,
        skillsOffered,
        skillsWanted
      });
    }

    await UserModel.insertMany(usersToCreate);
    
    console.log(`Successfully seeded 50 users.`);
    console.log(`They all have the password: password123`);
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
};

seedUsers();
