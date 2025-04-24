# SMS Panel - Quantum Hub

A powerful SMS management platform built with Next.js, TypeScript, and Prisma.

## Features

- User authentication with NextAuth.js
- SMS message sending and tracking
- Campaign management
- Real-time message status updates
- User balance management
- Dark/Light theme support
- Responsive design

## Tech Stack

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Database:** SQLite (via Prisma)
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Form Handling:** React Hook Form
- **Validation:** Zod
- **State Management:** React Hooks
- **API:** Next.js API Routes

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/sms-panel.git
   cd sms-panel
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up the database:
   ```bash
   pnpm prisma generate
   pnpm prisma db push
   ```

4. Create a `.env` file in the root directory with the following variables:
   ```env
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

The application will be available at `http://localhost:3000`.

## Project Structure

```
sms-panel/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── login/            # Authentication pages
│   └── register/         # Registration pages
├── components/            # React components
├── lib/                   # Utility functions
├── prisma/               # Database schema
└── public/               # Static assets
```

## API Routes

### Authentication

- `POST /api/auth/[...nextauth]` - NextAuth.js authentication
- `POST /api/register` - User registration

### User Management

- `GET /api/user` - Get user profile
- `PATCH /api/user` - Update user profile
- `PATCH /api/user/password` - Update user password

### Messages

- `GET /api/messages` - Get user messages
- `POST /api/messages/send` - Send a message

### Campaigns

- `GET /api/campaigns` - Get user campaigns
- `POST /api/campaigns` - Create a campaign
- `GET /api/campaigns/[id]` - Get campaign details
- `PATCH /api/campaigns/[id]` - Update campaign
- `DELETE /api/campaigns/[id]` - Delete campaign
- `GET /api/campaigns/[id]/messages` - Get campaign messages

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 