import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Hackathon from '../models/Hackathon.js';
import Submission from '../models/Submission.js';
import Feedback from '../models/Feedback.js';

async function seed() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/simats-hackathon';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  await Promise.all([
    User.deleteMany({}),
    Hackathon.deleteMany({}),
    Submission.deleteMany({}),
    Feedback.deleteMany({}),
  ]);

  const admin = await User.create({
    email: 'admin@saveetha.ac.in', password: 'admin123',
    name: 'Super Admin', role: 'ADMIN', isVerified: true,
  });
  const coord1 = await User.create({
    email: 'coordinator1@saveetha.ac.in', password: 'coord123',
    name: 'Dr. Rajesh Kumar', role: 'COORDINATOR', college: 'Saveetha Engineering College',
    scope: ['Engineering'], isVerified: true,
  });
  const coord2 = await User.create({
    email: 'coordinator2@saveetha.ac.in', password: 'coord123',
    name: 'Prof. Priya Sharma', role: 'COORDINATOR', college: 'Saveetha Medical College',
    scope: ['Medical'], isVerified: true,
  });
  const students = await User.create([
    { email: 'student1@saveetha.ac.in', password: 'student123', name: 'Arun Kumar', college: 'Saveetha Engineering College', department: 'CSE', isVerified: true },
    { email: 'student2@saveetha.ac.in', password: 'student123', name: 'Bhavana Reddy', college: 'Saveetha Engineering College', department: 'ECE', isVerified: true },
    { email: 'student3@saveetha.ac.in', password: 'student123', name: 'Charvi Singh', college: 'Saveetha Medical College', department: 'MBBS', isVerified: true },
    { email: 'student4@saveetha.ac.in', password: 'student123', name: 'Dinesh Patel', college: 'Saveetha Dental College', department: 'BDS', isVerified: true },
    { email: 'student5@saveetha.ac.in', password: 'student123', name: 'Esha Gupta', college: 'Saveetha Engineering College', department: 'IT', isVerified: true },
  ]);

  const now = new Date();
  const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const past = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

  await Hackathon.create([
    {
      name: 'CodeSprint 2026', startDate: future, endDate: new Date(future.getTime() + 2 * 24 * 60 * 60 * 1000),
      registrationLink: 'https://forms.gle/example1', mode: 'ONLINE', location: 'Virtual',
      description: 'A 48-hour online hackathon to build innovative solutions.', themes: ['AI', 'Web3', 'IoT'],
      prizePool: '₹1,00,000', teamSizeMin: 2, teamSizeMax: 4, organizer: 'SIMATS Tech Club',
      contactInfo: { email: 'hackathon@saveetha.ac.in' }, createdBy: coord1._id,
    },
    {
      name: 'HealthTech Hackathon', startDate: future, endDate: new Date(future.getTime() + 3 * 24 * 60 * 60 * 1000),
      registrationLink: 'https://devfolio.co/example', mode: 'HYBRID', location: 'SIMATS Campus',
      description: 'Build tech solutions for healthcare challenges.', themes: ['Healthcare', 'AI', 'Mobile'],
      prizePool: '₹2,00,000', teamSizeMin: 3, teamSizeMax: 5, organizer: 'Saveetha Medical College',
      contactInfo: { email: 'healthtech@saveetha.ac.in' }, createdBy: coord2._id,
    },
    {
      name: 'Web3 Builders Summit', startDate: future, endDate: new Date(future.getTime() + 1 * 24 * 60 * 60 * 1000),
      registrationLink: 'https://lu.ma/example', mode: 'ONLINE', location: 'Virtual',
      description: 'Learn and build on blockchain technology.', themes: ['Blockchain', 'Web3', 'DeFi'],
      prizePool: '₹50,000', teamSizeMin: 1, teamSizeMax: 3, organizer: 'Blockchain Club',
      contactInfo: { email: 'web3@saveetha.ac.in' }, createdBy: coord1._id,
    },
    {
      name: 'AI Innovation Challenge', startDate: past, endDate: new Date(past.getTime() + 2 * 24 * 60 * 60 * 1000),
      registrationLink: 'https://forms.gle/example4', mode: 'OFFLINE', location: 'Engineering Block, SIMATS',
      description: 'Past hackathon focused on AI solutions.', themes: ['AI', 'ML'],
      prizePool: '₹75,000', teamSizeMin: 2, teamSizeMax: 4, organizer: 'AI Research Lab',
      contactInfo: { email: 'ai@saveetha.ac.in' }, createdBy: admin._id, status: 'ENDED',
    },
    {
      name: 'Smart Campus Hackathon', startDate: now, endDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
      registrationLink: 'https://forms.gle/example5', mode: 'HYBRID', location: 'Main Auditorium, SIMATS',
      description: 'Make our campus smarter with IoT and automation.', themes: ['IoT', 'Automation', 'Sustainability'],
      prizePool: '₹1,50,000', teamSizeMin: 2, teamSizeMax: 4, organizer: 'Innovation Cell',
      contactInfo: { email: 'smartcampus@saveetha.ac.in' }, createdBy: coord1._id, status: 'ONGOING',
    },
    {
      name: 'Game Dev Showdown', startDate: future, endDate: new Date(future.getTime() + 4 * 24 * 60 * 60 * 1000),
      registrationLink: 'https://itch.io/jam/example', mode: 'ONLINE', location: 'Virtual',
      description: 'Create a game in 96 hours.', themes: ['Gaming', 'Creative'],
      prizePool: '₹30,000', teamSizeMin: 1, teamSizeMax: 3, organizer: 'Gaming Club',
      contactInfo: { email: 'gaming@saveetha.ac.in' }, createdBy: coord2._id,
    },
    {
      name: 'Data Viz Challenge', startDate: new Date(future.getTime() + 60 * 24 * 60 * 60 * 1000),
      endDate: new Date(future.getTime() + 63 * 24 * 60 * 60 * 1000),
      registrationLink: 'https://forms.gle/example7', mode: 'ONLINE', location: 'Virtual',
      description: 'Visualize open datasets and tell stories with data.', themes: ['Data Science', 'Visualization'],
      prizePool: '₹25,000', teamSizeMin: 1, teamSizeMax: 2, organizer: 'Data Science Club',
      contactInfo: { email: 'dataviz@saveetha.ac.in' }, createdBy: coord1._id,
    },
    {
      name: 'Startup Weekend SIMATS', startDate: future, endDate: new Date(future.getTime() + 2 * 24 * 60 * 60 * 1000),
      registrationLink: 'https://lu.ma/example8', mode: 'OFFLINE', location: 'Incubation Center',
      description: 'Pitch your startup idea in 54 hours.', themes: ['Entrepreneurship', 'Business'],
      prizePool: '₹5,00,000', teamSizeMin: 2, teamSizeMax: 5, organizer: 'E-Cell SIMATS',
      contactInfo: { email: 'ecell@saveetha.ac.in' }, createdBy: admin._id,
    },
  ]);

  await Feedback.create([
    { name: 'Arun Kumar', email: 'student1@saveetha.ac.in', message: 'Great platform! Would love more AI events.', type: 'FEEDBACK' },
    { name: 'Bhavana Reddy', email: 'student2@saveetha.ac.in', message: 'Add a feature to filter by prize pool.', type: 'FEATURE_REQUEST', votes: 5 },
  ]);

  console.log('Seed complete!');
  console.log('Admin: admin@saveetha.ac.in / admin123');
  console.log('Coordinators: coordinator1-2@saveetha.ac.in / coord123');
  console.log('Students: student1-5@saveetha.ac.in / student123');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
