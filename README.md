# Account Bot-Check Frontend

A modern React TypeScript frontend for real-time social media bot detection analysis. Features live progress tracking, Socket.IO integration, and comprehensive result visualization.

![Bot-Check Demo](https://placeholder-image-url)

## Features

- 🤖 **Real-time Bot Analysis** - Live progress tracking via Socket.IO
- 📊 **Comprehensive Results** - Human likelihood scores with detailed explanations  
- 🔍 **Signal Analysis** - Top behavioral signals with weights and explanations
- 📋 **Action Recommendations** - Prioritized actions with effort estimates
- 🔐 **API Key Management** - Secure authentication support
- 📱 **Responsive Design** - Works on desktop and mobile
- 🌙 **Dark Theme** - Professional cybersecurity aesthetic
- 💾 **Local Storage** - Persists progress logs and settings
- 🔄 **Auto-Reconnect** - Robust Socket.IO connection handling

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Backend server running on `http://localhost:3000` (or configured endpoint)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd bot-check-frontend

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Configuration

Create a `.env` file in the root directory:

```bash
# Backend API base URL
VITE_API_BASE=http://localhost:3000

# Socket.IO server URL  
VITE_SOCKET_URL=http://localhost:3000

# Optional API key for authenticated requests
VITE_API_KEY=your_api_key_here
```

## Usage

### Starting a Bot Check

1. Navigate to the home page
2. Enter a social media username (without @)
3. Optionally configure an API key for authenticated requests
4. Click "Start Bot Check"
5. You'll be redirected to the job page with live progress

### Monitoring Progress

The job page provides:
- **Real-time progress bar** with stage-based completion estimates
- **Live log stream** with timestamps and stage indicators
- **Connection status** indicator
- **Auto-reconnection** on network issues
- **Buffered event replay** for late joins

### Viewing Results

When analysis completes, you'll see:
- **Human likelihood score** (0-100) with confidence level
- **Summary bullets** highlighting key findings
- **Top signals table** showing behavioral indicators
- **Action recommendations** prioritized by importance
- **Download/copy options** for JSON results

### API Key Management

- Click the API Key section to add/edit your key
- Keys are stored securely in localStorage
- Used for authenticated requests to backend
- Optional but may provide enhanced analysis

## API Integration

The frontend expects these backend endpoints:

### HTTP Endpoints

```typescript
// Start bot check
GET /api/botcheck/:username
Response: { "jobId": "uuid" }

// Get job metadata  
GET /api/job/:jobId
Response: JobMetadata

// Get final results
GET /api/job/:jobId/result
Response: ScoringResult
```

### Socket.IO Events

```typescript
// Client events
socket.emit('joinJobRoom', { jobId: string })

// Server events  
socket.on('progress', (event: ProgressEvent) => {
  // Real-time progress updates
})
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── ActionTable.tsx # Action recommendations display
│   ├── ApiKeyManager.tsx # API key configuration
│   ├── LogList.tsx     # Progress log viewer
│   ├── ProgressBar.tsx # Stage progress indicator
│   ├── ResultCard.tsx  # Score summary card
│   └── SignalTable.tsx # Signal analysis table
├── hooks/              # Custom React hooks
│   └── useSocketJob.ts # Socket.IO job management
├── pages/              # Application pages
│   ├── StartPage.tsx   # Landing page with form
│   ├── JobPage.tsx     # Job monitoring page
│   └── NotFound.tsx    # 404 error page
├── services/           # External service integration
│   └── api.ts          # HTTP API client
├── utils/              # Utility functions
│   └── localStore.ts   # localStorage management
├── types.ts            # TypeScript type definitions
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build

# Preview production build  
npm run preview

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- LogList.test.tsx
```

### Code Quality

The project uses:
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Zod** for runtime validation
- **Vitest** for unit testing

## Architecture

### State Management
- React hooks for local component state
- Context API for global state (if needed)
- localStorage for persistence
- React Query for server state

### Real-time Communication
- Socket.IO client for live updates
- Automatic reconnection with exponential backoff
- Event buffering and replay
- Connection status monitoring

### Error Handling
- Zod validation for all external data
- Graceful degradation on network issues
- User-friendly error messages
- Retry mechanisms for failed operations

### Performance
- Code splitting with React.lazy
- Memoized components with React.memo
- Debounced input validation
- Optimistic UI updates

## Browser Support

- Chrome 88+
- Firefox 85+ 
- Safari 14+
- Edge 88+

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues and questions:
- Create an issue in this repository
- Check existing documentation
- Review the troubleshooting guide below

## Troubleshooting

### Common Issues

**Connection Failed**
- Verify backend server is running
- Check VITE_SOCKET_URL in .env
- Ensure firewall allows Socket.IO connections

**Job Not Found**
- Verify job ID format (must be UUID)
- Check if job exists on backend
- Try refreshing the page

**API Errors**
- Verify VITE_API_BASE configuration
- Check network connectivity
- Ensure API key is valid (if required)

**Build Errors**
- Run `npm install` to update dependencies
- Clear node_modules and reinstall
- Check Node.js version compatibility

### Performance Issues

- Enable React DevTools for component profiling
- Check Network tab for slow requests
- Monitor console for Socket.IO connection issues
- Verify localStorage isn't full

---

Built with ❤️ using React, TypeScript, and Socket.IO