# Lead AI Harvest - Intelligent Lead Generation Tool

![Project Screenshot](https://github.com/user-attachments/assets/fe5b9646-5ba8-4bb1-a14b-77b6830567f2)

An AI-powered lead generation and management system that scrapes, validates, and exports high-quality business leads.

## Features

- **Multi-Source Lead Generation**: LinkedIn, Crunchbase, AngelList, Twitter
- **AI Validation**: Priority scoring (1-10) using OpenAI
- **Smart Filtering**: By priority, source, and risk flags
- **Export Options**: CSV, Excel, and PDF formats
- **Audit Logging**: Track all system activities
- **Responsive UI**: Works on desktop and mobile

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **UI Components**: shadcn-ui
- **Backend**: FastAPI (Python), OpenAI API
- **Database**: Supabase (PostgreSQL)
- **Exporting Tools**: exceljs, react-pdf

## Dataset

Sample lead data:
- [`leads_sample.pdf`](.leads_sample.pdf)
- [`leads_sample1.xlsx`](.leads_sample1.xlsx)

> **Note:** Replace these with your actual dataset paths if different.

## Setup Instructions

### Prerequisites
- Node.js v18+
- Python 3.10+
- OpenAI API key

### Installation
```bash
# Clone repository
git clone https://github.com/yourusername/lead-ai-harvest.git
cd lead-ai-harvest

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add your OpenAI API key in .env

# Run development server
npm run dev
