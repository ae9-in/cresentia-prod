require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const connectDB = require('../config/db');

const videoByTitle = {
  'Full Stack Web Fundamentals': 'https://www.youtube.com/watch?v=7NaeDBTRY1k',
  'JavaScript for Real Projects': 'https://www.youtube.com/watch?v=lkIFF4maKMU',
  'API Development with Node': 'https://www.youtube.com/watch?v=-MTSQjw5DrM',
  'Frontend Performance Boost': 'https://www.youtube.com/watch?v=CaShN6mCJB0',
  'Database Essentials': 'https://www.youtube.com/watch?v=wR0jg0eQsZA',
  'Cloud Deployment Basics': 'https://www.youtube.com/watch?v=N0SYCyS2xZA',
  'Business Analytics Essentials': 'https://www.youtube.com/watch?v=diaZdX1s5L4',
  'Excel to Dashboard Mastery': 'https://www.youtube.com/watch?v=l5qkg8gzY6E',
  'Data Storytelling for Leaders': 'https://www.youtube.com/watch?v=r5_34YnCmMY',
  'Product Metrics Deep Dive': 'https://www.youtube.com/watch?v=N07ncCovXl8',
  'Forecasting with Confidence': 'https://www.youtube.com/watch?v=6rqhMnOgQnU&t=333s',
  'Operational KPI Playbook': 'https://www.youtube.com/watch?v=sC0w7FlcnyQ',
  'High Impact Communication': 'https://www.youtube.com/watch?v=LI57EB_T38c',
  'Sales Discovery Mastery': 'https://www.youtube.com/watch?v=_DbSgU5naDQ',
  'Negotiation Confidence': 'https://www.youtube.com/watch?v=Z3HJCQJ2Lmo',
  'Client Relationship Building': 'https://www.youtube.com/watch?v=sMlczYnSVYo',
  'Objection Handling Playbook': 'https://www.youtube.com/watch?v=etY48E4SF00',
  'Pitching with Clarity': 'https://www.youtube.com/watch?v=dkZU_VUEMPI',
  'Applied Machine Learning Bootcamp': 'https://www.youtube.com/watch?v=Y4qO9unerGs&list=PLao4QLdbxX2eR9LODnk0C6aIrNYzPGqZH',
  'Model Evaluation Lab': 'https://www.youtube.com/watch?v=IFXRyOM_Bqo',
  'Feature Engineering Studio': 'https://www.youtube.com/watch?v=Bg3CjiJ67Cc',
  'Deploying ML Systems': 'https://www.youtube.com/watch?v=mAvyG9OS4uY',
  'Responsible AI Practices': 'https://www.youtube.com/watch?v=IHsYWHfIe0Y',
  'Deep Learning Foundations': 'https://www.youtube.com/watch?v=Beh13Cd_QbY'
};

const makeCourse = (category, level, title, description, createdBy, quizQuestions) => ({
  category,
  level,
  title,
  description,
  videos: [
    {
      title: `${title} (YouTube)`,
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

const courseSeed = (instructorId) => {
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
    cat.titles.map((title) => makeCourse(cat.name, cat.level, title, cat.description, instructorId, generateUniqueQuiz(cat.quiz)))
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

  const instructor = users.find((u) => u.role === 'instructor');
  await Course.insertMany(courseSeed(instructor._id));

  console.log('Seed complete');
  console.log('Admin: admin@learnera.com / Admin@123');
  console.log('Instructor: instructor@learnera.com / Instructor@123');
  console.log('Student: student@learnera.com / Student@123');

  await mongoose.connection.close();
};

seed().catch(async (err) => {
  console.error(err);
  await mongoose.connection.close();
  process.exit(1);
});
