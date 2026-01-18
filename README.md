# Wipp - Community-Driven Creative Platform

Wipp is a modern web application built with Astro and Supabase, designed for creators, freelancers, and communities to showcase projects, offer services, and engage in discussions.

## Features

### 🔐 Authentication
- User registration and login via Supabase Auth
- Secure session management
- Profile creation with avatars and bios

### 👤 User Profiles
- Personalized profiles with username, full name, bio, and avatar
- View other users' profiles and their projects/services

### 🚀 Projects Showcase
- Upload and display creative projects
- Image uploads with Supabase Storage
- Public project galleries
- Comment system for feedback

### 💼 Services Marketplace
- Freelancers can offer services with pricing and delivery times
- Service listings with descriptions
- Potential for marketplace functionality

### 💬 Discussions
- User-to-user messaging/discussions
- Profile-based conversations

### 🌍 Communities
- Create and join communities
- Community-specific posts and discussions
- Admin controls for community management
- Membership system with roles

### 🌓 Dark/Light Theme
- Theme toggle for user preference
- Persistent theme settings

## Tech Stack

- **Frontend**: Astro (SSR framework)
- **Backend**: Supabase (PostgreSQL + Auth + Storage + RLS)
- **Styling**: Tailwind CSS
- **Deployment**: Ready for static hosting

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account and project

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd wipp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your Supabase URL and anon key

4. Run the Supabase setup script:
   - Go to your Supabase dashboard > SQL Editor
   - Run the contents of `supabase-setup.sql`

5. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── layouts/        # Page layouts
├── pages/          # Astro pages and API routes
│   ├── api/        # Server-side API endpoints
│   ├── c/          # Community pages
│   ├── communities/# Community management
│   ├── profile/    # User profiles
│   └── project/    # Project pages
└── lib/            # Utilities (Supabase client)
```

## Key Pages

- `/` - Homepage with featured content
- `/explore` - Browse projects and services
- `/communities` - View and create communities
- `/login` / `/signup` - Authentication
- `/profile/[id]` - User profiles
- `/project/[id]` - Project details
- `/c/[id]` - Community details

## Database Schema

### Core Tables
- `profiles` - User information
- `projects` - User projects
- `services` - Offered services
- `communities` - Community groups
- `community_members` - Membership tracking
- `posts` - Community posts
- `comments` - Project comments
- `discussions` - User discussions

All tables use Row Level Security (RLS) for data protection.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source. Check the license file for details.