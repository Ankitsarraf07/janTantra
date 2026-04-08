const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const User = require('../models/User');
const Area = require('../models/Area');
const Issue = require('../models/Issue');
const Fund = require('../models/Fund');
const Ranking = require('../models/Ranking');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/jan-tantra');
  console.log('MongoDB Connected');
};

const seed = async () => {
  await connectDB();

  // Clear existing data
  await User.deleteMany(); await Area.deleteMany(); await Issue.deleteMany();
  await Fund.deleteMany(); await Ranking.deleteMany();
  console.log('🧹 Cleared existing data');

  // Create Areas
  const areas = await Area.insertMany([
    { name: 'Koramangala', district: 'Bangalore Urban', state: 'Karnataka', pincode: '560034', population: 85000 },
    { name: 'Indiranagar', district: 'Bangalore Urban', state: 'Karnataka', pincode: '560038', population: 72000 },
    { name: 'Whitefield', district: 'Bangalore Urban', state: 'Karnataka', pincode: '560066', population: 120000 },
    { name: 'Jayanagar', district: 'Bangalore Urban', state: 'Karnataka', pincode: '560041', population: 65000 },
    { name: 'HSR Layout', district: 'Bangalore Urban', state: 'Karnataka', pincode: '560102', population: 90000 },
  ]);
  console.log(`✅ Created ${areas.length} areas`);

  // Create Admin
  const admin = await User.create({
    name: 'System Admin', email: 'admin@jantantra.gov.in', password: 'Admin@123',
    age: 35, role: 'admin', isApproved: true
  });

  // Create Officers
  const officers = await User.insertMany([
    { name: 'Rajan Kumar', email: 'officer1@jantantra.gov.in', password: 'Officer@123', age: 42, role: 'officer', areaId: areas[0]._id, isApproved: true, designation: 'Ward Officer', employeeId: 'OFC001' },
    { name: 'Priya Sharma', email: 'officer2@jantantra.gov.in', password: 'Officer@123', age: 38, role: 'officer', areaId: areas[1]._id, isApproved: true, designation: 'Area Development Officer', employeeId: 'OFC002' },
    { name: 'Suresh Verma', email: 'officer3@jantantra.gov.in', password: 'Officer@123', age: 45, role: 'officer', areaId: areas[2]._id, isApproved: true, designation: 'Infrastructure Officer', employeeId: 'OFC003' },
  ]);

  // Assign officers to areas
  await Area.findByIdAndUpdate(areas[0]._id, { assignedOfficerId: officers[0]._id });
  await Area.findByIdAndUpdate(areas[1]._id, { assignedOfficerId: officers[1]._id });
  await Area.findByIdAndUpdate(areas[2]._id, { assignedOfficerId: officers[2]._id });
  console.log(`✅ Created ${officers.length} officers`);

  // Create Authority
  const authority = await User.create({
    name: 'Ananya Patel', email: 'authority@jantantra.gov.in', password: 'Auth@123',
    age: 50, role: 'authority', areaId: areas[0]._id, isApproved: true, designation: 'District Collector'
  });

  // Create Citizens
  const citizens = await User.insertMany([
    { name: 'Amit Singh', email: 'citizen1@gmail.com', password: 'Citizen@123', age: 28, role: 'citizen', areaId: areas[0]._id, isApproved: true, phone: '9876543210' },
    { name: 'Sneha Nair', email: 'citizen2@gmail.com', password: 'Citizen@123', age: 32, role: 'citizen', areaId: areas[1]._id, isApproved: true, phone: '9876543211' },
    { name: 'Rohit Jain', email: 'citizen3@gmail.com', password: 'Citizen@123', age: 25, role: 'citizen', areaId: areas[0]._id, isApproved: true, phone: '9876543212' },
  ]);
  console.log(`✅ Created ${citizens.length} citizens`);

  // Create Issues
  const issues = await Issue.insertMany([
    { title: 'Potholes on Main Road near Market', description: 'Large potholes causing accidents and traffic issues. Multiple vehicles were damaged this week.', category: 'road', priority: 'high', status: 'in-progress', areaId: areas[0]._id, reportedBy: citizens[0]._id, assignedTo: officers[0]._id, deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    { title: 'Street Light Not Working', description: '15 street lights in sector 4 are not working for past 2 weeks causing safety issues.', category: 'electricity', priority: 'medium', status: 'assigned', areaId: areas[0]._id, reportedBy: citizens[2]._id, assignedTo: officers[0]._id, deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
    { title: 'Water Supply Disruption', description: 'No water supply for 3 days in Block C. Pipeline seems broken near the crossroads.', category: 'water', priority: 'critical', status: 'open', areaId: areas[1]._id, reportedBy: citizens[1]._id, assignedTo: officers[1]._id, deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
    { title: 'Garbage Collection Stopped', description: 'Garbage has not been collected for 10 days. Health hazard forming in residential area.', category: 'sanitation', priority: 'high', status: 'resolved', areaId: areas[1]._id, reportedBy: citizens[1]._id, assignedTo: officers[1]._id, resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { title: 'Park Maintenance Required', description: 'Children\'s park equipment is broken. Swings and slides need repair urgently.', category: 'infrastructure', priority: 'medium', status: 'open', areaId: areas[2]._id, reportedBy: citizens[0]._id },
    { title: 'Overflowing Drain Causing Flooding', description: 'Storm drain blocked causing road flooding during rain. Multiple houses affected.', category: 'sanitation', priority: 'critical', status: 'overdue', areaId: areas[0]._id, reportedBy: citizens[2]._id, assignedTo: officers[0]._id, deadline: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
  ]);
  console.log(`✅ Created ${issues.length} issues`);

  // Create Funds
  await Fund.insertMany([
    { title: 'Road Rehabilitation Project - Koramangala', purpose: 'Repair and resurface all major roads including potholes filling', amount: 2500000, amountUtilized: 800000, areaId: areas[0]._id, allocatedBy: authority._id, category: 'infrastructure', status: 'active', deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    { title: 'Street Light Replacement - Indiranagar', purpose: 'Replace 200 old sodium lights with LED smart lights', amount: 1500000, amountUtilized: 1200000, areaId: areas[1]._id, allocatedBy: authority._id, category: 'electricity', status: 'active', deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) },
    { title: 'Water Pipeline Upgrade - Whitefield', purpose: 'Upgrade 10 km of old water pipeline to prevent leakage', amount: 5000000, amountUtilized: 0, areaId: areas[2]._id, allocatedBy: authority._id, category: 'water', status: 'allocated', deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) },
    { title: 'Community Health Center - Jayanagar', purpose: 'Setup mobile health screening camps and upgrade PHC equipment', amount: 1800000, amountUtilized: 1800000, areaId: areas[3]._id, allocatedBy: authority._id, category: 'health', status: 'completed', deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), completedAt: new Date() },
  ]);
  console.log('✅ Created funds');

  // Create Rankings for officers
  await Ranking.insertMany([
    { officerId: officers[0]._id, areaId: areas[0]._id, completedCount: 12, pendingCount: 3, overdueCount: 1, totalAssigned: 16, avgResolutionTimeDays: 4.5, completionScore: 78, feedbackScore: 4.2, overallScore: 82, badge: 'gold' },
    { officerId: officers[1]._id, areaId: areas[1]._id, completedCount: 8, pendingCount: 2, overdueCount: 0, totalAssigned: 10, avgResolutionTimeDays: 3.8, completionScore: 85, feedbackScore: 4.6, overallScore: 89, badge: 'gold' },
    { officerId: officers[2]._id, areaId: areas[2]._id, completedCount: 5, pendingCount: 5, overdueCount: 2, totalAssigned: 12, avgResolutionTimeDays: 7.2, completionScore: 55, feedbackScore: 3.1, overallScore: 60, badge: 'silver' },
  ]);
  console.log('✅ Created rankings');

  console.log('\n🎉 Database seeded successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Test Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:     admin@jantantra.gov.in     | Admin@123');
  console.log('Authority: authority@jantantra.gov.in | Auth@123');
  console.log('Officer 1: officer1@jantantra.gov.in  | Officer@123');
  console.log('Officer 2: officer2@jantantra.gov.in  | Officer@123');
  console.log('Citizen 1: citizen1@gmail.com         | Citizen@123');
  console.log('Citizen 2: citizen2@gmail.com         | Citizen@123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  mongoose.disconnect();
};

seed().catch(err => { console.error(err); process.exit(1); });
