# Project Context

## Purpose
Multi-robot dashboard for real-time monitoring, teleoperation, and mission management with ROS 2 integration. Provides web-based interface for operators to control autonomous robots through visual maps, waypoint navigation, and emergency stop controls.

## Tech Stack
- **Backend**: Fastify + TypeScript on Node 24, MongoDB with Prisma ORM
- **Frontend**: React 19 + Vite + TypeScript, Tailwind CSS + shadcn UI
- **Real-time**: Socket.io for telemetry streaming, rosbridge_suite for ROS 2 WebSocket communication
- **Visualization**: Foxglove embedded viewer or Konvo overlays for 2D robot mapping
- **Authentication**: Better Auth with JWT-based auth + role-based access control (RBAC)
- **Development**: pnpm package manager, Vitest testing framework

## Project Conventions

### Code Style
- TypeScript strict mode with comprehensive type safety
- Prisma schema-first database design with MongoDB provider
- Zod schemas for API validation and type generation
- ESLint + Prettier formatting, kebab-case for file/directory names
- Verb-led naming for change IDs (add-, update-, remove-, refactor-)

### Architecture Patterns
- **Microservice-style**: Separate services for auth, telemetry, robot control, and mission management
- **Event-driven**: ROS topics → Socket.io rooms → real-time UI updates
- **Repository pattern**: Data access through Prisma repository abstractions
- **Command/query separation**: Read operations via REST, write operations via ROS bridge
- **Role-based security**: Admin/Developer/Operator roles with scoped permissions

### Testing Strategy
- Unit tests (Vitest) for repositories, auth guards, rosbridge client (mocked WebSocket)
- Integration tests with Fastify instance + Mongo Memory Server
- Socket.io integration tests using socket.io-client
- Manual rosbridge testing with recorded ROS bag files
- Rate limiting and command validation in teleop workflows

### Git Workflow
- Feature branches from main, conventional commits with type(scope): description
- Change proposals via OpenSpec before implementation
- PR review required for all changes
- Archive completed changes to archive/YYYY-MM-DD-[name]/ directory

## Domain Context

### Robot Operations
- **ROS 2 Integration**: Robots publish maps, pose, telemetry, diagnostics via rosbridge WebSocket servers
- **Telemetry Topics**: /map, /costmap, /robot_pose, /battery_state, /laser_scan
- **Command Topics**: /goal_pose for navigation, /cmd_vel for teleop, estop service calls
- **Mission Types**: Autonomous navigation, waypoint following, teleoperation modes

### User Roles
- **ADMIN**: User management, robot registration, system configuration
- **DEVELOPER**: Mission planning, waypoint management, robot assignment
- **OPERATOR**: Daily teleoperation, mission monitoring, emergency stop control

### Data Models
- **Robot**: metadata, capabilities, status, firmware version, battery, last heartbeat
- **Waypoint**: labeled poses (x,y,theta) with tolerance and sequence indices
- **Mission**: waypoint collections with progress tracking and status management
- **Telemetry**: time-series snapshots for pose, velocity, battery, and alerts
- **Audit Logs**: E-stop events, user actions, system changes with timestamps

## Important Constraints

### Performance Requirements
- Real-time telemetry streaming with <100ms latency
- Support for 10+ concurrent robots with 30Hz update rates
- Compressed occupancy grids for efficient network transmission
- Auto-halt on teleop disconnect (safety critical)

### Safety & Reliability
- Immediate emergency stop with audit logging
- Robot offline detection via heartbeat monitoring
- Rate-limited teleop commands (10Hz) with speed caps
- Command validation and role-based permissions

### Scalability Limits
- WebSocket connection limits per browser tab
- MongoDB document size limits for telemetry storage
- Rosbridge connection multiplexing strategies
- Frontend state management for multiple concurrent robots

## External Dependencies

### ROS 2 Ecosystem
- **rosbridge_suite**: WebSocket bridge to ROS 2 topics
- **Navigation Stack**: Autonomous navigation and path planning
- **Robot Hardware**: LiDAR, odometers, battery management systems

### Third-party Services
- **Better Auth**: Authentication provider with MFA support
- **Foxglove**: Embedded robotics visualization viewer
- **MongoDB Atlas**: Cloud database for telemetry storage
- **Vercel/AWS**: Frontend hosting and backend deployment

### Browser Requirements
- WebGL support for 2D map visualization
- WebSocket capabilities for real-time communication
- Modern browser with ES2020+ JavaScript support
- Responsive design for tablet and desktop operations
