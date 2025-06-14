# DM Decoder - AI Message Analysis & Reply Suggestions

**Live App**: [https://reply-mind.lovable.app](https://reply-mind.lovable.app)

## Overview

DM Decoder is an AI-powered web application that analyzes message intent and generates smart, human-like replies with different tones. Whether you're dealing with customer service inquiries, social media messages, or professional communications, DM Decoder helps you craft the perfect response.

## Features

### 🤖 AI-Powered Analysis
- **Message Intent Analysis**: Understand the underlying meaning and sentiment of incoming messages
- **Smart Reply Generation**: Get contextually appropriate responses powered by Google's Gemini AI
- **Multiple Tone Options**: Choose from friendly, formal, or witty response styles

### 🎯 Tone Customization
- **Friendly**: Warm, approachable responses with casual language and emojis
- **Formal**: Professional, business-appropriate replies with proper grammar
- **Witty**: Clever, engaging responses with light humor and wordplay

### 📊 Usage Management
- **Free Demo**: 3 free analyses for new users
- **Pro Subscription**: Unlimited AI-powered analysis and reply generation
- **Usage Tracking**: Real-time tracking of remaining free analyses

### 🔐 Authentication & Security
- Secure user authentication via Supabase Auth
- Protected routes and user-specific data
- Subscription management with Stripe integration

### 📱 Responsive Design
- Mobile-friendly interface built with Tailwind CSS
- Clean, modern UI with shadcn/ui components
- Optimized for both desktop and mobile usage

## Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **React Router** - Client-side routing
- **TanStack Query** - Server state management

### Backend & Infrastructure
- **Supabase** - Backend-as-a-Service platform
  - Database (PostgreSQL)
  - Authentication
  - Edge Functions
  - Real-time subscriptions
- **Stripe** - Payment processing for subscriptions
- **Google Gemini AI** - AI-powered message analysis and reply generation

## Project Structure

```
src/
├── components/
│   ├── Auth/                 # Authentication components
│   ├── Dashboard/            # Main dashboard components
│   │   ├── AnalysisSection.tsx
│   │   ├── AnalysisResults.tsx
│   │   ├── DashboardHeader.tsx
│   │   ├── DashboardLayout.tsx
│   │   ├── FreeUsageNotice.tsx
│   │   ├── MessageInput.tsx
│   │   ├── ToneSelector.tsx
│   │   └── UsageManagement.tsx
│   ├── MessageHistory.tsx    # Message history for pro users
│   └── ui/                   # Reusable UI components
├── contexts/
│   └── AuthContext.tsx       # Authentication context
├── hooks/                    # Custom React hooks
├── integrations/
│   └── supabase/            # Supabase client and types
├── lib/                     # Utility functions
└── pages/
    ├── Dashboard.tsx        # Main dashboard page
    ├── Index.tsx           # Landing page
    └── NotFound.tsx        # 404 page
```

## Database Schema

### Tables
- **subscribers**: User subscription status and details
- **free_usage_tracking**: Track free tier usage per user
- **message_history**: Store analyzed messages for pro users

### Edge Functions
- **analyze-message**: Full AI analysis for subscribed users
- **generate-demo-reply**: Demo reply generation for free users
- **create-checkout**: Stripe checkout session creation
- **check-subscription**: Subscription status verification

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Stripe account (for payments)
- Google AI API key (for Gemini)

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd dm-decoder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Deployment

The app is deployed on Lovable's platform and automatically updates with changes pushed to the main branch.

**Live URL**: [https://reply-mind.lovable.app](https://reply-mind.lovable.app)

## Usage

1. **Sign Up/Login**: Create an account or sign in with existing credentials
2. **Enter Message**: Paste the message you want to analyze
3. **Select Tone**: Choose your preferred response style (friendly, formal, or witty)
4. **Analyze**: Click "Analyze Message" to get AI-powered insights and reply suggestions
5. **Upgrade**: Subscribe to Pro for unlimited usage and message history

## API Integration

### Supabase Edge Functions
- **analyze-message**: Comprehensive analysis with intent recognition and multiple reply options
- **generate-demo-reply**: Simplified reply generation for free tier users
- **create-checkout**: Stripe payment integration
- **check-subscription**: Real-time subscription status checking

### External APIs
- **Google Gemini AI**: Powers the message analysis and reply generation
- **Stripe**: Handles subscription payments and billing

## Contributing

This project follows modern React best practices:
- Functional components with hooks
- TypeScript for type safety
- Component composition over inheritance
- Custom hooks for shared logic
- Context for global state management

## License

This project is created with [Lovable](https://lovable.dev) and uses modern web technologies for optimal performance and user experience.

## Support

For support or questions about DM Decoder, please visit our live application at [https://reply-mind.lovable.app](https://reply-mind.lovable.app).

---

Built with ❤️ using [Lovable](https://lovable.dev)
