import mongoose from 'mongoose';
import User from './models/User.js';
import Course from './models/Course.js';
import Enrollment from './models/Enrollment.js';

const ATLAS_URI = "mongodb+srv://jishnu:jishnu123@cluster0.swjzqr0.mongodb.net/learnera?retryWrites=true&w=majority&appName=Cluster0";

const videoByTitle = {
  'Full Stack Web Fundamentals': 'https://res.cloudinary.com/dsdx78fgf/video/upload/v1771233129/How_I_d_Learn_Full-Stack_Web_Development_If_I_Could_Start_Over_-_Conner_Ardman_360p_h264_oifvaq.mp4',
  'JavaScript for Real Projects': 'https://res.cloudinary.com/dsdx78fgf/video/upload/v1771234109/100_JavaScript_Concepts_you_Need_to_Know_-_Fireship_360p_h264_rff7ie.mp4',
  'API Development with Node': 'https://res.cloudinary.com/dsdx78fgf/video/upload/v1771234189/RESTful_APIs_in_100_Seconds____Build_an_API_from_Scratch_with_Node.js_Express_-_Fireship_360p_h264_hdkypv.mp4',
};

const makeCourse = (category, level, title, description, createdBy, quizQuestions) => ({
  category,
  level,
  title,
  description,
  videos: [{ title, url: videoByTitle[title] || '', durationMinutes: 30 }],
  quizQuestions,
  durationMinutes: 30,
  createdBy
});

const itQuiz = [
  {
    question: 'Which tag is used to create a hyperlink in HTML?',
    options: ['<link>', '<a>', '<href>', '<url>'],
    correctAnswer: 1
  },
  {
    question: 'Which CSS property controls text size?',
    options: ['font-style', 'font-size', 'text-weight', 'line-height'],
    correctAnswer: 1
  }
];

const seed = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(ATLAS_URI, {
      serverSelectionTimeoutMS: 30000,
    });
    
    console.log('✅ Connected to Atlas!');
    console.log('Host:', mongoose.connection.host);
    console.log('Database:', mongoose.connection.name);
    
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Enrollment.deleteMany({})
    ]);
    
    console.log('Creating users...');
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@learnera.com',
        password: 'Admin@123',
        role: 'admin',
        isVerified: true
      },
      {
        name: 'Instructor User',
        email: 'instructor@learnera.com',
        password: 'Instructor@123',
        role: 'instructor',
        isVerified: true
      },
      {
        name: 'Student User',
        email: 'student@learnera.com',
        password: 'Student@123',
        role: 'student',
        isVerified: true
      }
    ]);
    
    console.log('Creating courses...');
    const instructor = users.find((u) => u.role === 'instructor');
    const courses = [
      makeCourse('IT', 'Beginner', 'Full Stack Web Fundamentals', 'Learn full stack development', instructor._id, itQuiz),
      makeCourse('IT', 'Beginner', 'JavaScript for Real Projects', 'Master JavaScript', instructor._id, itQuiz),
      makeCourse('IT', 'Intermediate', 'API Development with Node', 'Build REST APIs', instructor._id, itQuiz),
    ];
    
    await Course.insertMany(courses);
    
    console.log('✅ Seed complete!');
    console.log('Admin: admin@learnera.com / Admin@123');
    console.log('Instructor: instructor@learnera.com / Instructor@123');
    console.log('Student: student@learnera.com / Student@123');
    console.log(`Created ${users.length} users and ${courses.length} courses`);
    
    await mongoose.connection.close();
    console.log('Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seed();
