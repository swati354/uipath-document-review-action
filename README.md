# UiPath Document Review Action

A professional UiPath Action App for reviewing documents from Storage Buckets, analyzing Data Fabric entity records, and capturing reviewer decisions with remarks.

[cloudflarebutton]

## Overview

The UiPath Document Review Action is an enterprise-grade web application designed to streamline human-in-the-loop document and data review processes within the UiPath ecosystem. This application provides a comprehensive interface for reviewers to efficiently assess multiple documents from UiPath Storage Buckets, analyze structured data from UiPath Data Fabric entities, and record their decisions and remarks.

## Key Features

- **Document Review**: View up to three documents (images, PDFs, text files) from UiPath Storage Buckets with automatic content type detection
- **Entity Records Analysis**: Dynamic table view of UiPath Data Fabric entity records with formatted data display
- **Reviewer Decision Capture**: Professional interface for capturing remarks and approve/reject decisions
- **Professional UI/UX**: Enterprise-grade design with information density and corporate aesthetic
- **Action Center Integration**: Seamless integration with UiPath Orchestrator and Action Center
- **Responsive Design**: Works across all device sizes with mobile-first approach

## Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React component library

### UiPath Integration
- **uipath-sdk** - Official UiPath TypeScript SDK
- **React Query** - Data fetching and state management
- **Action Center** - Human-in-the-loop task management

### Additional Libraries
- **react-pdf** - PDF rendering in sandboxed environments
- **Lucide React** - Beautiful icon library
- **date-fns** - Date manipulation utilities
- **Zustand** - Lightweight state management
- **Framer Motion** - Animation library

### Infrastructure
- **Cloudflare Pages** - Static site hosting
- **Cloudflare Workers** - Serverless backend functions

## Prerequisites

- **Bun** - Fast JavaScript runtime and package manager
- **UiPath Orchestrator** - Access to UiPath cloud or on-premises instance
- **UiPath Action Center** - For human-in-the-loop workflows

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd uipath-doc-review-action
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your UiPath credentials:
   ```env
   VITE_UIPATH_BASE_URL=https://your-uipath-instance.com
   VITE_UIPATH_ORG_NAME=your-org-name
   VITE_UIPATH_TENANT_NAME=your-tenant-name
   VITE_UIPATH_ACCESS_TOKEN=your-access-token
   ```

4. **Start development server**
   ```bash
   bun dev
   ```

The application will be available at `http://localhost:3000`.

## Usage

### Action Schema Configuration

The application expects the following input parameters in `action-schema.json`:

```json
{
  "inputs": {
    "type": "object",
    "properties": {
      "bucketId": { "type": "integer", "required": true },
      "folderId": { "type": "integer", "required": true },
      "path1": { "type": "string", "required": true },
      "path2": { "type": "string", "required": false },
      "path3": { "type": "string", "required": false },
      "entityName": { "type": "string", "required": true }
    }
  },
  "outputs": {
    "type": "object",
    "properties": {
      "remarks": { "type": "string", "required": true }
    }
  },
  "outcomes": {
    "type": "object",
    "properties": {
      "Approve": { "type": "string" },
      "Reject": { "type": "string" }
    }
  }
}
```

### Document Review Workflow

1. **Document Review Tab**: View up to three documents from specified Storage Bucket paths
2. **Entity Records Tab**: Analyze structured data from Data Fabric entities
3. **Reviewer Section Tab**: Input remarks and make approve/reject decisions

### Integration with UiPath

The application automatically integrates with UiPath Action Center when deployed. It receives task data including:
- Document paths and bucket information
- Entity names for data analysis
- Task metadata and user context

## Development

### Project Structure

```
src/
├── components/          # React components
│   ├── action/         # Action Center specific components
│   ├── ui/             # shadcn/ui components
│   └── layout/         # Layout components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── pages/              # Page components
└── types/              # TypeScript type definitions
```

### Key Components

- **ActionPage.tsx** - Main application page with tabbed interface
- **useActionContext** - Hook for Action Center integration
- **useBucketFile** - Hook for Storage Bucket file access
- **useEntityRecords** - Hook for Data Fabric entity queries
- **PDFViewer** - Sandboxed PDF rendering component

### Development Commands

```bash
# Start development server
bun dev

# Build for production
bun build

# Preview production build
bun preview

# Run linting
bun lint
```

### Environment Setup

For local development, the application uses mock data when not running in Action Center. The `hasActionCenterData` flag indicates when real data is available.

## Deployment

### Cloudflare Pages

[cloudflarebutton]

1. **Build the application**
   ```bash
   bun build
   ```

2. **Deploy to Cloudflare Pages**
   ```bash
   npx wrangler pages deploy dist
   ```

3. **Configure environment variables** in Cloudflare Pages dashboard:
   - `VITE_UIPATH_BASE_URL`
   - `VITE_UIPATH_ORG_NAME`
   - `VITE_UIPATH_TENANT_NAME`
   - `VITE_UIPATH_ACCESS_TOKEN`

### UiPath Action Center

1. Package the built application as a UiPath Action
2. Upload to UiPath Orchestrator
3. Configure the action schema with required inputs/outputs
4. Deploy to Action Center for human-in-the-loop workflows

## Configuration

### Action Schema

Update `action-schema.json` to match your specific requirements:
- **Inputs**: Data provided by automation (bucket IDs, paths, entity names)
- **Outputs**: Data collected from users (remarks, assessments)
- **Outcomes**: Available decision options (Approve, Reject, etc.)

### UiPath SDK

The application automatically initializes the UiPath SDK when running in Action Center. For local development, configure credentials in `.env`.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- UiPath Community Forum
- UiPath Documentation
- GitHub Issues

## Acknowledgments

- Built with UiPath TypeScript SDK
- Powered by Cloudflare Pages
- UI components by shadcn/ui
- Icons by Lucide React