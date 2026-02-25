import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import connectDB from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const videoByTitle = {
  'Full Stack Web Fundamentals': 'https://res.cloudinary.com/dsdx78fgf/video/upload/v1771233129/How_I_d_Learn_Full-Stack_Web_Development_If_I_Could_Start_Over_-_Conner_Ardman_360p_h264_oifvaq.mp4',
  'JavaScript for Real Projects': 'https://res.cloudinary.com/dsdx78fgf/video/upload/v1771234109/100_JavaScript_Concepts_you_Need_to_Know_-_Fireship_360p_h264_rff7ie.mp4',
  'API Development with Node': 'https://res.cloudinary.com/dsdx78fgf/video/upload/v1771234189/RESTful_APIs_in_100_Seconds____Build_an_API_from_Scratch_with_Node.js_Express_-_Fireship_360p_h264_hdkypv.mp4',
  'Frontend Performance Boost': 'https://res.cloudinary.com/dsdx78fgf/video/upload/v1771234345/The_ultimate_guide_to_web_performance_-_Beyond_Fireship_360p_h264_t3jav7.mp4',
  'Database Essentials': 'https://res.cloudinary.com/dsdx78fgf/video/upload/v1771234534/Database_Tutorial_for_Beginners_-_Lucid_Software_360p_h264_ymkuzt.mp4',
  'Cloud Deployment Basics': 'https://res.cloudinary.com/dsdx78fgf/video/upload/v1771234655/Cloud_Computing_In_6_Minutes_What_Is_Cloud_Computing_Cloud_Computing_Explained_Simplilearn_-_Simplilearn_360p_h264_i9tucr.mp4',
  'Business Analytics Essentials': 'https://res.cloudinary.com/dsdx78fgf/video/upload/v1771234817/Introduction_to_Business_Analytics_Updated_Edition_-_Cody_Baldwin_360p_h264_qh3txy.mp4',
  'Excel to Dashboard Mastery': 'https://res.cloudinary.com/dsdx78fgf/video/upload/v1771235142/The_Ultimate_Excel_Dashboard_Visualize_Data_Like_a_Pro_-_Chandoo_360p_h264_cgf4mr.mp4',
  'Data Storytelling for Leaders': 'https://res.cloudinary.com/dsdx78fgf/video/upload/v1771235376/Data_Storytelling_Basics_in_3_Steps_How_to_Communicate_Data_and_Numbers_-_Word_Cortex_with_Anita_360p_h264_gjcxil.mp4',
  'Product Metrics Deep Dive': 'https://res.cloudinary.com/dsdx78fgf/video/upload/v1771235578/Playbook_-_Product_Metrics_101_-_Playbooks_by_Anshumani_Ruddra_360p_h264_w2y56x.mp4',
  'Forecasting with Confidence': 'https://res.cloudinary.com/dsdx78fgf/video/upload/v1771235723/Forecasting_in_Excel_MUST-KNOW_for_Any_Analyst_-_Kenji_Explains_360p_h264_ezk6il.mp4',
  'Operational KPI Playbook': 'https://res.cloudinary.com/dsdx78fgf/video/upload/v1771236030/Storytelling_in_PowerPoint_Learn_McKinsey_s_3-Step_Framework_-_Dan_Galletta_360p_h264_pzddzw.mp4',
  'High Impact Communication': 'https://res.cloudinary.com/dsdx78fgf/video/upload/v1771236172/The_science_behind_dramatically_better_conversations_Charles_Duhigg_TEDxManchester_-_TEDx_Talks_360p_h264_t9azsb.mp4',
  'Sales Discovery Mastery': 'https://res.cloudinary.com/dsdx78fgf/video/upload/v1771236334/How_To_Run_A_Discovery_Call_-_Strategy_Session_-_Patrick_Dang_360p_h264_bnhcet.mp4',
  'Negotiation Confidence': 'https://res.cloudinary.com/dsdx78fgf/video/upload/v1771236416/HARVARD_Negotiators_How_to_Get_What_You_Want_Every_Time_Getting_to_Yes_-_LITTLE_BIT_BETTER_360p_h264_qaogyh.mp4',
  'Client Relationship Building': 'https://res.cloudinary.com/dsdx78fgf/video/upload/v1771236567/Why_Relationship_Selling_is_SO_Important_-_Simon_Sinek_360p_h264_r64vc4.mp4',
  'Objection Handling Playbook': 'https://res.cloudinary.com/dsdx78fgf/video/upload/v1771236696/Universal_Objection_Circle_The_Objection_Playbook_Objection_Handling_Training_Dr_Sanjay_Tolani_-_Dr._Sanjay_Tolani_360p_h264_x9vj5c.mp4',
  'Pitching with Clarity': 'https://res.cloudinary.com/dsdx78fgf/video/upload/v1771236849/OFI_-_The_Pitch_List_-_No._1_-_Simplicity_and_Clarity_-_Owen_Fitzpatrick_360p_h264_jn5t0c.mp4',
  'Applied Machine Learning Bootcamp': 'https://res.cloudinary.com/dsdx78fgf/video/upload/v1771236965/Everything_I_Studied_to_Become_a_Machine_Learning_Scientist_at_Amazon_from_ZERO_Tech_Background_-_Marina_Wyss_-_AI_Machine_Learning_360p_h264_ihkvhj.mp4',
  'Model Evaluation Lab': 'https://res.cloudinary.com/dsdx78fgf/video/upload/v1771237101/Compare_Model_Performance_using_the_Generative_AI_Evaluation_Service_Challenge_Lab_GENAI063_-_DR_abhishek._360p_h264_qu32ae.mp4',
  'Feature Engineering Studio': 'https://res.cloudinary.com/dsdx78fgf/video/upload/v1771237212/Feature_Engineering_for_AI_Transforming_Raw_Data_into_Predictions_-_IBM_Technology_360p_h264_v1y4k7.mp4',
  'Deploying ML Systems': 'https://res.cloudinary.com/dsdx78fgf/video/upload/v1771237366/Deploying_a_Machine_Learning_Model_in_3_Minutes_-_Exponent_360p_h264_us479e.mp4',
  'Responsible AI Practices': 'https://res.cloudinary.com/dsdx78fgf/video/upload/v1771237465/Responsible_AI_Governance_Ethics_Best_Practices_-_IBM_360p_h264_ylmmqm.mp4',
  'Deep Learning Foundations': 'https://res.cloudinary.com/dsdx78fgf/video/upload/v1771237774/Machine_Learning_vs._Deep_Learning_vs._Foundation_Models_-_IBM_Technology_360p_h264_y8ny51.mp4'
};

const makeCourse = (category, level, title, description, createdBy, quizQuestions) => ({
  category,
  level,
  title,
  description,
  videos: [
    {
      title: title,
      url: videoByTitle[title] || '',
      durationMinutes: 30
    }
  ],
  quizQuestions,
  durationMinutes: 30,
  createdBy
});

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const generateUniqueQuiz = (baseQuiz) => {
  // Select 10 random questions from the base quiz pool (or fewer if not enough)
  const count = Math.min(10, baseQuiz.length);
  const selectedQuestions = shuffleArray(baseQuiz).slice(0, count);
  return selectedQuestions.map((question) => {
    const shuffledOptions = shuffleArray(question.options);
    const correctOption = question.options[question.correctAnswer];
    const newCorrectAnswer = shuffledOptions.indexOf(correctOption);
    return {
      question: question.question,
      options: shuffledOptions,
      correctAnswer: newCorrectAnswer
    };
  });
};

const courseSeed = (adminId) => {
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
    },
    {
      question: 'Which keyword declares a block-scoped variable in JavaScript?',
      options: ['var', 'let', 'const', 'scope'],
      correctAnswer: 1
    },
    {
      question: 'What does DOM stand for?',
      options: ['Data Object Model', 'Document Object Model', 'Digital Object Main', 'Document Order Model'],
      correctAnswer: 1
    },
    {
      question: 'Which HTTP method is used to update a resource?',
      options: ['GET', 'TUP', 'PUT', 'POST'],
      correctAnswer: 2
    },
    {
      question: 'What is the purpose of npm?',
      options: ['Network Package Manager', 'Node Project Manager', 'New Package Market', 'Node Package Manager'],
      correctAnswer: 3
    },
    {
      question: 'Which symbol is used for IDs in CSS?',
      options: ['.', '#', '*', '!'],
      correctAnswer: 1
    },
    {
      question: 'What is the result of 2 + "2" in JavaScript?',
      options: ['4', '22', 'NaN', 'Error'],
      correctAnswer: 1
    },
    {
      question: 'Which SQL keyword is used to retrieve data?',
      options: ['INSERT', 'UPDATE', 'DELETE', 'SELECT'],
      correctAnswer: 3
    },
    {
      question: 'What does JSON stand for?',
      options: ['Java Standard Object Notation', 'JavaScript Object Notation', 'JavaScript Output Name', 'Java Source Object Network'],
      correctAnswer: 1
    }
  ];

  const businessQuiz = [
    {
      question: 'A KPI should be:',
      options: ['Vague', 'Measurable', 'Hidden', 'Static forever'],
      correctAnswer: 1
    },
    {
      question: 'Which chart best shows trend over time?',
      options: ['Pie chart', 'Line chart', 'Scatter plot', 'Gauge'],
      correctAnswer: 1
    },
    {
      question: 'A dashboard’s main goal is to:',
      options: ['Store raw data', 'Communicate insights', 'Replace databases', 'Hide bad metrics'],
      correctAnswer: 1
    },
    {
      question: 'What is ROI?',
      options: ['Rate of Interest', 'Return on Investment', 'Risk of Inflation', 'Return on Income'],
      correctAnswer: 1
    },
    {
      question: 'SWOT analysis stands for?',
      options: ['Strengths, Weaknesses, Opportunities, Threats', 'Sales, Work, Organization, Time', 'Strategy, Work, Operations, Tasks', 'Simple, Wide, Open, Tested'],
      correctAnswer: 0
    },
    {
      question: 'What is a stakeholder?',
      options: ['A shareholder only', 'Anyone interested in the business', 'The CEO', 'A customer only'],
      correctAnswer: 1
    },
    {
      question: 'What does B2B mean?',
      options: ['Buyer to Buyer', 'Business to Business', 'Business to Buyer', 'Back to Business'],
      correctAnswer: 1
    },
    {
      question: 'What is the primary purpose of a business plan?',
      options: ['To get a loan only', 'To outline strategy', 'To hire employees', 'To file taxes'],
      correctAnswer: 1
    },
    {
      question: 'What is net profit?',
      options: ['Revenue minus all expenses', 'Total revenue', 'Sales minus cogs', 'Gross profit'],
      correctAnswer: 0
    },
    {
      question: 'What is a market segment?',
      options: ['The whole market', 'A subgroup of people or organizations', 'A competitor', 'A product line'],
      correctAnswer: 1
    }
  ];

  const salesQuiz = [
    {
      question: 'Active listening helps you to:',
      options: ['Interrupt quickly', 'Understand customer needs', 'Talk more', 'Skip discovery'],
      correctAnswer: 1
    },
    {
      question: 'A good sales opening should:',
      options: ['Pitch instantly', 'Ask context questions', 'Share pricing first', 'End the call'],
      correctAnswer: 1
    },
    {
      question: 'A common goal in negotiation is to:',
      options: ['Win at all costs', 'Find mutual value', 'Avoid questions', 'Delay decisions'],
      correctAnswer: 1
    },
    {
      question: 'What is a lead?',
      options: ['A closed sale', 'A potential customer', 'A lost customer', 'A partner'],
      correctAnswer: 1
    },
    {
      question: 'What does CRM stand for?',
      options: ['Customer Resource Management', 'Customer Relationship Management', 'Central Route Market', 'Computer Related Marketing'],
      correctAnswer: 1
    },
    {
      question: 'What is upselling?',
      options: ['Selling a cheaper item', 'Selling a more expensive version', 'Giving a discount', 'Selling to a new customer'],
      correctAnswer: 1
    },
    {
      question: 'What is a cold call?',
      options: ['Calling a known customer', 'Calling a prospect without prior contact', 'Calling in winter', 'Calling for support'],
      correctAnswer: 1
    },
    {
      question: 'What is the sales funnel?',
      options: ['The process of selling', 'A type of chart', 'A marketing tool', 'A sales meeting'],
      correctAnswer: 0
    },
    {
      question: 'What is closing?',
      options: ['Opening a store', 'Finalizing the sale', 'Ending a call', 'Firing a salesperson'],
      correctAnswer: 1
    },
    {
      question: 'What is a gatekeeper?',
      options: ['A security guard', 'Person who controls access to decision maker', 'A manager', 'A receptionist only'],
      correctAnswer: 1
    }
  ];

  const aiQuiz = [
    {
      question: 'Which metric is useful for classification?',
      options: ['RMSE', 'F1 Score', 'MAPE', 'MAE'],
      correctAnswer: 1
    },
    {
      question: 'Overfitting means the model:',
      options: ['Generalizes well', 'Performs poorly on new data', 'Has high bias only', 'Is undertrained'],
      correctAnswer: 1
    },
    {
      question: 'Feature engineering is about:',
      options: ['Cleaning hardware', 'Creating useful input variables', 'Only choosing algorithms', 'Labeling outputs'],
      correctAnswer: 1
    },
    {
      question: 'What is a neural network?',
      options: ['A computer network', 'A model inspired by the brain', 'A social network', 'A network of sensors'],
      correctAnswer: 1
    },
    {
      question: 'What is NLP?',
      options: ['Natural Language Processing', 'New Learning Protocol', 'Neural Learning Process', 'Network Level Protocol'],
      correctAnswer: 0
    },
    {
      question: 'What is supervised learning?',
      options: ['Learning without data', 'Training with labeled data', 'Learning from mistakes', 'Unsupervised training'],
      correctAnswer: 1
    },
    {
      question: 'What is a chatbot?',
      options: ['A robot', 'AI program for conversation', 'A chat room', 'A messaging app'],
      correctAnswer: 1
    },
    {
      question: 'What is computer vision?',
      options: ['Eye glasses for computers', 'AI for interpreting visual data', 'A monitor screen', 'Virtual reality'],
      correctAnswer: 1
    },
    {
      question: 'What is reinforcement learning?',
      options: ['Learning from books', 'Learning through rewards/punishments', 'Learning by watching', 'Learning by coding'],
      correctAnswer: 1
    },
    {
      question: 'What is a dataset?',
      options: ['A single file', 'Collection of data for training', 'A database', 'A variable'],
      correctAnswer: 1
    }
  ];

  const categories = [
    {
      name: 'IT',
      level: 'Beginner',
      titles: [
        'Full Stack Web Fundamentals',
        'JavaScript for Real Projects',
        'API Development with Node',
        'Frontend Performance Boost',
        'Database Essentials',
        'Cloud Deployment Basics'
      ],
      description: 'Hands-on IT skills with practical exercises and projects.',
      quiz: itQuiz
    },
    {
      name: 'Business & Analytics',
      level: 'Intermediate',
      titles: [
        'Business Analytics Essentials',
        'Excel to Dashboard Mastery',
        'Data Storytelling for Leaders',
        'Product Metrics Deep Dive',
        'Forecasting with Confidence',
        'Operational KPI Playbook'
      ],
      description: 'Translate data into business decisions with real-world cases.',
      quiz: businessQuiz
    },
    {
      name: 'Sales & Soft Skills',
      level: 'Beginner',
      titles: [
        'High Impact Communication',
        'Sales Discovery Mastery',
        'Negotiation Confidence',
        'Client Relationship Building',
        'Objection Handling Playbook',
        'Pitching with Clarity'
      ],
      description: 'Grow influence and close deals through better communication.',
      quiz: salesQuiz
    },
    {
      name: 'AI & ML',
      level: 'Advanced',
      titles: [
        'Applied Machine Learning Bootcamp',
        'Model Evaluation Lab',
        'Feature Engineering Studio',
        'Deploying ML Systems',
        'Responsible AI Practices',
        'Deep Learning Foundations'
      ],
      description: 'Build and deploy ML solutions with modern practices.',
      quiz: aiQuiz
    }
  ];

  return categories.flatMap((cat) =>
    cat.titles.map((title) => makeCourse(cat.name, cat.level, title, cat.description, adminId, generateUniqueQuiz(cat.quiz)))
  );
};

const seed = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Course.deleteMany({}),
    Enrollment.deleteMany({})
  ]);

  const users = await User.create([
    {
      name: 'Admin User',
      email: 'admin@gmail.com',
      password: 'admin',
      role: 'admin',
      isVerified: true,
      isActive: true
    },
    {
      name: 'Student User',
      email: 'student@gmail.com',
      password: 'student',
      role: 'student',
      isVerified: true,
      isActive: true,
      assignedCourses: [] // Will be populated after courses are created
    }
  ]);

  const admin = users.find((u) => u.role === 'admin');
  const student = users.find((u) => u.role === 'student');
  
  const courses = await Course.insertMany(courseSeed(admin._id));

  // Assign first 3 courses to student as example
  if (courses.length >= 3) {
    student.assignedCourses = [courses[0]._id, courses[1]._id, courses[2]._id];
    await student.save();
    
    // Auto-enroll student in assigned courses
    await Enrollment.create([
      { student: student._id, course: courses[0]._id },
      { student: student._id, course: courses[1]._id },
      { student: student._id, course: courses[2]._id }
    ]);
  }

  console.log('Seed complete');
  console.log('Admin: admin@gmail.com / admin');
  console.log('Student: student@gmail.com / student');
  console.log(`Student has ${student.assignedCourses.length} courses assigned and enrolled`);

  await mongoose.connection.close();
};

seed().catch(async (err) => {
  console.error(err);
  await mongoose.connection.close();
  process.exit(1);
});
