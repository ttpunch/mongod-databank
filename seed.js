// Seed script to populate the database with sample data
require('dotenv').config();
const mongoose = require('mongoose');
const Data = require('./models/data.model');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    seedDatabase();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function seedDatabase() {
  try {
    // Clear existing data
    await Data.deleteMany({});
    console.log('Cleared existing data');

    // Create sample sheets
    const sheets = [
      // Sales Data Sheet
      {
        sheetName: 'Sales Data',
        columns: [
          { name: 'Product', type: 'string' },
          { name: 'Category', type: 'string' },
          { name: 'Price', type: 'number' },
          { name: 'Quantity', type: 'number' },
          { name: 'Date', type: 'date' },
          { name: 'InStock', type: 'boolean' }
        ],
        rows: [
          {
            data: {
              Product: 'Laptop',
              Category: 'Electronics',
              Price: 1299.99,
              Quantity: 5,
              Date: new Date('2023-12-01'),
              InStock: true
            }
          },
          {
            data: {
              Product: 'Smartphone',
              Category: 'Electronics',
              Price: 899.99,
              Quantity: 10,
              Date: new Date('2023-12-02'),
              InStock: true
            }
          },
          {
            data: {
              Product: 'Headphones',
              Category: 'Accessories',
              Price: 199.99,
              Quantity: 15,
              Date: new Date('2023-12-03'),
              InStock: true
            }
          },
          {
            data: {
              Product: 'Monitor',
              Category: 'Electronics',
              Price: 349.99,
              Quantity: 3,
              Date: new Date('2023-12-04'),
              InStock: false
            }
          },
          {
            data: {
              Product: 'Keyboard',
              Category: 'Accessories',
              Price: 89.99,
              Quantity: 8,
              Date: new Date('2023-12-05'),
              InStock: true
            }
          }
        ]
      },
      
      // Employee Records Sheet
      {
        sheetName: 'Employee Records',
        columns: [
          { name: 'Name', type: 'string' },
          { name: 'Department', type: 'string' },
          { name: 'Salary', type: 'number' },
          { name: 'HireDate', type: 'date' },
          { name: 'FullTime', type: 'boolean' }
        ],
        rows: [
          {
            data: {
              Name: 'John Smith',
              Department: 'Engineering',
              Salary: 85000,
              HireDate: new Date('2022-01-15'),
              FullTime: true
            }
          },
          {
            data: {
              Name: 'Sarah Johnson',
              Department: 'Marketing',
              Salary: 75000,
              HireDate: new Date('2022-03-10'),
              FullTime: true
            }
          },
          {
            data: {
              Name: 'Michael Brown',
              Department: 'Finance',
              Salary: 90000,
              HireDate: new Date('2021-11-05'),
              FullTime: true
            }
          },
          {
            data: {
              Name: 'Emily Davis',
              Department: 'Design',
              Salary: 65000,
              HireDate: new Date('2023-02-20'),
              FullTime: false
            }
          }
        ]
      },
      
      // Project Tracker Sheet
      {
        sheetName: 'Project Tracker',
        columns: [
          { name: 'ProjectName', type: 'string' },
          { name: 'Client', type: 'string' },
          { name: 'Budget', type: 'number' },
          { name: 'StartDate', type: 'date' },
          { name: 'EndDate', type: 'date' },
          { name: 'Completed', type: 'boolean' }
        ],
        rows: [
          {
            data: {
              ProjectName: 'Website Redesign',
              Client: 'ABC Corp',
              Budget: 15000,
              StartDate: new Date('2023-10-01'),
              EndDate: new Date('2023-12-15'),
              Completed: false
            }
          },
          {
            data: {
              ProjectName: 'Mobile App Development',
              Client: 'XYZ Inc',
              Budget: 50000,
              StartDate: new Date('2023-09-15'),
              EndDate: new Date('2024-03-15'),
              Completed: false
            }
          },
          {
            data: {
              ProjectName: 'Brand Identity',
              Client: 'Acme Co',
              Budget: 8000,
              StartDate: new Date('2023-11-01'),
              EndDate: new Date('2023-12-01'),
              Completed: true
            }
          }
        ]
      }
    ];

    // Insert sample data
    for (const sheetData of sheets) {
      const newSheet = new Data(sheetData);
      await newSheet.save();
      console.log(`Created sheet: ${sheetData.sheetName} with ${sheetData.rows.length} rows`);
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}