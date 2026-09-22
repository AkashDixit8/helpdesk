# Deploy Helpdesk SaaS on AWS Cloud Architecture

![Helpdesk System Architecture](docs/images/helpdesk-architecture.svg)

## Table of Contents

- [Deploy Helpdesk SaaS on AWS Cloud Architecture](#deploy-helpdesk-saas-on-aws-cloud-architecture)
  - [Table of Contents](#table-of-contents)
- [Project Overview](#project-overview)
  - [Introduction](#introduction)
    - [Key Features](#key-features)
  - [Architecture Overview](#architecture-overview)
    - [Infrastructure Components](#infrastructure-components)
    - [Network Architecture](#network-architecture)
- [Pre-Requisites](#pre-requisites)
  - [Required Accounts and Tools](#required-accounts-and-tools)
    - [1. AWS Account \& CLI Setup](#1-aws-account--cli-setup)
- [For Linux](#for-linux)
- [For macOS](#for-macos)
- [Configure AWS CLI Credentials](#configure-aws-cli-credentials)
  - [Table of Contents](#table-of-contents-1)
- [Project Overview](#project-overview-1)
  - [Introduction](#introduction-1)
    - [Key Features](#key-features-1)
  - [Architecture Overview](#architecture-overview-1)
    - [Infrastructure Components](#infrastructure-components-1)
    - [Network Architecture](#network-architecture-1)
- [Pre-Requisites](#pre-requisites-1)
  - [Required Accounts and Tools](#required-accounts-and-tools-1)
    - [1. AWS Account \& CLI Setup](#1-aws-account--cli-setup-1)
- [For Linux](#for-linux-1)
- [For macOS](#for-macos-1)
- [Configure AWS CLI Credentials](#configure-aws-cli-credentials-1)
- [Create and attach Internet Gateway](#create-and-attach-internet-gateway)
- [Private Application Subnet A (ECS Fargate Tasks)](#private-application-subnet-a-ecs-fargate-tasks)
- [Private Database Subnet A (RDS MySQL)](#private-database-subnet-a-rds-mysql)
- [Create Regional NAT Gateway in Public Subnet](#create-regional-nat-gateway-in-public-subnet)
- [Create Private Application Route Table pointing outbound traffic to NAT Gateway](#create-private-application-route-table-pointing-outbound-traffic-to-nat-gateway)
- [2. Backend ECS Security Group (Restricted to ALB Traffic)](#2-backend-ecs-security-group-restricted-to-alb-traffic)
- [3. RDS Security Group (Restricted to Backend Security Group)](#3-rds-security-group-restricted-to-backend-security-group)
- [Provision Amazon RDS MySQL Instance](#provision-amazon-rds-mysql-instance)
- [Export local development database backup (Do NOT commit to repository)](#export-local-development-database-backup-do-not-commit-to-repository)
- [Restore/Import SQL data into target RDS instance (Via bastion host or migration runner)](#restoreimport-sql-data-into-target-rds-instance-via-bastion-host-or-migration-runner)
- [Stage 2: Production Web Server](#stage-2-production-web-server)
- [Verify container status and ports](#verify-container-status-and-ports)
- [Create ECR Repositories](#create-ecr-repositories)
- [Tag and Push Images](#tag-and-push-images)
- [Verify Log Stream Activity](#verify-log-stream-activity)

---

![Network Topology & Subnet Design](docs/images/network-architecture.svg)

---

# Project Overview

## Introduction

**Helpdesk SaaS** (`AkashDixit8/helpdesk`) is an enterprise-grade IT Support & Ticket Management Platform engineered using a modern decoupled architecture. The platform orchestrates the complete lifecycle of IT service requests through strict Role-Based Access Control (RBAC), supporting Customers, Support Agents, and System Administrators.

The project features a **production-oriented AWS Cloud architecture** leveraging containerization (Docker, AWS ECR), serverless container orchestration (AWS ECS Fargate), application load balancing (ALB), high-availability database hosting (Amazon RDS MySQL), and isolated VPC networking across public and private subnets.

### Key Features

- **Multi-Role Helpdesk Workflows**: Isolated views, permissions, and ticket management actions for Customers, Agents, and Administrators.
- **Internal Support Communications**: Dedicated internal agent notes (`isInternal` flag) separated from customer-visible ticket replies.
- **Microservices-Ready Container Architecture**: Decoupled React + Nginx frontend and Node.js + Express + TypeScript + Prisma backend containers.
- **Production-Grade AWS Network Isolation**: Public ALB ingress with ECS Fargate tasks running strictly inside private application subnets.
- **Database Schema Management**: Type-safe database operations and seamless migrations using Prisma ORM against Amazon RDS.
- **Zero-Trust Security Chain**: Strictly enforced security group cascading (`ALB -> Frontend/Backend -> RDS`).

## Architecture Overview

### Infrastructure Components

1. **Presentation Tier (Frontend Container)**
   - Production React + Vite single-page application compiled into static assets.
   - High-performance Nginx Alpine web server acting as reverse proxy on port 80.
   - Proxies `/api/*` requests seamlessly to backend services.

2. **Application Tier (Backend API)**
   - Express.js backend written in TypeScript running on Node.js 20.
   - Health check monitoring endpoint at `/api/health`.
   - Data access abstraction via Prisma ORM connected over MySQL port 3306.

3. **Data Tier (Database Layer)**
   - Amazon RDS MySQL running inside isolated private database subnets (`helpdesk-db-subnet-group`).
   - Non-publicly accessible database instance (`PubliclyAccessible: false`).
   - Audited schema migrations managed through `prisma migrate deploy`.

### Network Architecture

- **AWS VPC Design (`10.0.0.0/16`)**
  - **Public Subnets**: Multi-AZ (`10.0.1.0/24`, `10.0.2.0/24`) housing AWS Application Load Balancer and Regional NAT Gateway.
  - **Private Application Subnets**: Multi-AZ (`10.0.11.0/24`, `10.0.12.0/24`) housing private ECS Fargate tasks.
  - **Private Database Subnets**: Multi-AZ (`10.0.21.0/24`, `10.0.22.0/24`) housing Amazon RDS instances.
  - **Internet Access Path**: Internet Gateway (`helpdesk-igw`) for public traffic; Regional NAT Gateway (`helpdesk-nat`) for outbound private task connectivity (AWS ECR, APIs).

---

# Pre-Requisites

## Required Accounts and Tools

### 1. AWS Account & CLI Setup
- Create an [AWS Free Tier Account](https://aws.amazon.com/free/)
- Install and configure AWS CLI v2:
  ```bash
  # For Linux
  curl "[https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip](https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip)" -o "awscliv2.zip"
  unzip awscliv2.zip
  sudo ./aws/install

  # For macOS
  brew install awscli

  # Configure AWS CLI Credentials
  aws configure


  Here is the entire README.md file from top to bottom, without breaking it up or leaving anything out.You can copy the raw markdown inside the box below and overwrite your existing file completely:Markdown# Deploy Helpdesk SaaS on AWS Cloud Architecture

![Helpdesk System Architecture](https://raw.githubusercontent.com/AkashDixit8/helpdesk/main/docs/images/helpdesk-architecture.svg)

## Table of Contents

1. [Project Overview](#project-overview)
   - [Introduction](#introduction)
   - [Key Features](#key-features)
   - [Architecture Overview](#architecture-overview)
2. [Pre-Requisites](#pre-requisites)
   - [Required Accounts and Tools](#required-accounts-and-tools)
3. [Infrastructure Setup](#infrastructure-setup)
   - [VPC and Networking](#vpc-and-networking)
   - [Security Configuration](#security-configuration)
   - [Database Layer](#database-layer)
4. [Application Setup](#application-setup)
   - [Build & Containerization Environment](#build--containerization-environment)
   - [Application Deployment](#application-deployment)
   - [Load Balancing & ECS Fargate Execution](#load-balancing--ecs-fargate-execution)
5. [Monitoring and Maintenance](#monitoring-and-maintenance)
   - [CloudWatch Setup](#cloudwatch-setup)
6. [Security Best Practices](#security-best-practices)
7. [Troubleshooting Guide](#troubleshooting-guide)
8. [Contributing](#contributing)

---

![Network Topology & Subnet Design](https://raw.githubusercontent.com/AkashDixit8/helpdesk/main/docs/images/network-architecture.svg)

---

# Project Overview

## Introduction

**Helpdesk SaaS** (`AkashDixit8/helpdesk`) is an enterprise-grade IT Support & Ticket Management Platform engineered using a modern decoupled architecture. The platform orchestrates the complete lifecycle of IT service requests through strict Role-Based Access Control (RBAC), supporting Customers, Support Agents, and System Administrators.

The project features a **production-oriented AWS Cloud architecture** leveraging containerization (Docker, AWS ECR), serverless container orchestration (AWS ECS Fargate), application load balancing (ALB), high-availability database hosting (Amazon RDS MySQL), and isolated VPC networking across public and private subnets.

### Key Features

- **Multi-Role Helpdesk Workflows**: Isolated views, permissions, and ticket management actions for Customers, Agents, and Administrators.
- **Internal Support Communications**: Dedicated internal agent notes (`isInternal` flag) separated from customer-visible ticket replies.
- **Microservices-Ready Container Architecture**: Decoupled React + Nginx frontend and Node.js + Express + TypeScript + Prisma backend containers.
- **Production-Grade AWS Network Isolation**: Public ALB ingress with ECS Fargate tasks running strictly inside private application subnets.
- **Database Schema Management**: Type-safe database operations and seamless migrations using Prisma ORM against Amazon RDS.
- **Zero-Trust Security Chain**: Strictly enforced security group cascading (`ALB -> Frontend/Backend -> RDS`).

## Architecture Overview

### Infrastructure Components

1. **Presentation Tier (Frontend Container)**
   - Production React + Vite single-page application compiled into static assets.
   - High-performance Nginx Alpine web server acting as reverse proxy on port 80.
   - Proxies `/api/*` requests seamlessly to backend services.

2. **Application Tier (Backend API)**
   - Express.js backend written in TypeScript running on Node.js 20.
   - Health check monitoring endpoint at `/api/health`.
   - Data access abstraction via Prisma ORM connected over MySQL port 3306.

3. **Data Tier (Database Layer)**
   - Amazon RDS MySQL running inside isolated private database subnets (`helpdesk-db-subnet-group`).
   - Non-publicly accessible database instance (`PubliclyAccessible: false`).
   - Audited schema migrations managed through `prisma migrate deploy`.

### Network Architecture

- **AWS VPC Design (`10.0.0.0/16`)**
  - **Public Subnets**: Multi-AZ (`10.0.1.0/24`, `10.0.2.0/24`) housing AWS Application Load Balancer and Regional NAT Gateway.
  - **Private Application Subnets**: Multi-AZ (`10.0.11.0/24`, `10.0.12.0/24`) housing private ECS Fargate tasks.
  - **Private Database Subnets**: Multi-AZ (`10.0.21.0/24`, `10.0.22.0/24`) housing Amazon RDS instances.
  - **Internet Access Path**: Internet Gateway (`helpdesk-igw`) for public traffic; Regional NAT Gateway (`helpdesk-nat`) for outbound private task connectivity (AWS ECR, APIs).

---

# Pre-Requisites

## Required Accounts and Tools

### 1. AWS Account & CLI Setup
- Create an [AWS Free Tier Account](https://aws.amazon.com/free/)[cite: 4]
- Install and configure AWS CLI v2:
  ```bash
  # For Linux
  curl "[https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip](https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip)" -o "awscliv2.zip"
  unzip awscliv2.zip
  sudo ./aws/install

  # For macOS
  brew install awscli

  # Configure AWS CLI Credentials
  aws configure
2. Development & Container Runtime ToolsNode.js 20+ & npm   Docker Desktop (v24.0+) & Docker Compose   Bash# Verify Docker installation
docker --version
docker-compose --version
Git: Version control system   Bash# Clone the project repository
git clone [https://github.com/AkashDixit8/helpdesk.git](https://github.com/AkashDixit8/helpdesk.git)
cd helpdesk
3. Database & ORM ToolingPrisma CLI:   Bashnpm install -g prisma
Infrastructure SetupVPC and Networking1. VPC & Internet Gateway ProvisioningBash# Create primary application VPC
aws ec2 create-vpc \
    --cidr-block 10.0.0.0/16 \
    --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=helpdesk-vpc}]' \
    --region ap-south-1

# Create and attach Internet Gateway
aws ec2 create-internet-gateway \
    --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=helpdesk-igw}]' \
    --region ap-south-1

aws ec2 attach-internet-gateway \
    --vpc-id vpc-xxx \
    --internet-gateway-id igw-xxx \
    --region ap-south-1
2. Subnet Topology AllocationBash# Public Subnet A (ALB / IGW)
aws ec2 create-subnet \
    --vpc-id vpc-xxx \
    --cidr-block 10.0.1.0/24 \
    --availability-zone ap-south-1a \
    --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=helpdesk-public-a}]'

# Private Application Subnet A (ECS Fargate Tasks)
aws ec2 create-subnet \
    --vpc-id vpc-xxx \
    --cidr-block 10.0.11.0/24 \
    --availability-zone ap-south-1a \
    --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=helpdesk-app-private-a}]'

# Private Database Subnet A (RDS MySQL)
aws ec2 create-subnet \
    --vpc-id vpc-xxx \
    --cidr-block 10.0.21.0/24 \
    --availability-zone ap-south-1a \
    --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=helpdesk-db-private-a}]'
3. NAT Gateway & Route Table ConfigurationBash# Allocate Elastic IP for NAT Gateway
aws ec2 allocate-address --domain vpc --region ap-south-1

# Create Regional NAT Gateway in Public Subnet
aws ec2 create-nat-gateway \
    --subnet-id subnet-public-a-xxx \
    --allocation-id eipalloc-xxx \
    --tag-specifications 'ResourceType=natgateway,Tags=[{Key=Name,Value=helpdesk-nat}]'

# Create Private Application Route Table pointing outbound traffic to NAT Gateway
aws ec2 create-route-table \
    --vpc-id vpc-xxx \
    --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=helpdesk-private-app-rt}]'

aws ec2 create-route \
    --route-table-id rtb-private-app-xxx \
    --destination-cidr-block 0.0.0.0/0 \
    --gateway-id nat-xxx
Security Configuration1. Security Group HierarchyBash# 1. Application Load Balancer Security Group (Public Ingress)
aws ec2 create-security-group \
    --group-name helpdesk-alb-sg \
    --description "Public ingress rule for ALB" \
    --vpc-id vpc-xxx

aws ec2 authorize-security-group-ingress \
    --group-id sg-alb-xxx \
    --protocol tcp --port 80 --cidr 0.0.0.0/0

# 2. Backend ECS Security Group (Restricted to ALB Traffic)
aws ec2 create-security-group \
    --group-name helpdesk-backend-sg \
    --description "Allow inbound traffic from ALB only" \
    --vpc-id vpc-xxx

aws ec2 authorize-security-group-ingress \
    --group-id sg-backend-xxx \
    --protocol tcp --port 5000 \
    --source-group sg-alb-xxx

# 3. RDS Security Group (Restricted to Backend Security Group)
aws ec2 create-security-group \
    --group-name helpdesk-rds-sg \
    --description "Allow MySQL traffic from backend ECS tasks only" \
    --vpc-id vpc-xxx

aws ec2 authorize-security-group-ingress \
    --group-id sg-rds-xxx \
    --protocol tcp --port 3306 \
    --source-group sg-backend-xxx
Database Layer1. RDS MySQL Instance ProvisioningBash# Create DB Subnet Group across private DB subnets
aws rds create-db-subnet-group \
    --db-subnet-group-name helpdesk-db-subnet-group \
    --db-subnet-group-description "Private subnets for Helpdesk RDS MySQL" \
    --subnet-ids '["subnet-db-a-xxx", "subnet-db-b-xxx"]'

# Provision Amazon RDS MySQL Instance
aws rds create-db-instance \
    --db-instance-identifier helpdesk-rds \
    --db-instance-class db.t3.micro \
    --engine mysql \
    --master-username root \
    --master-user-password "YourSecurePassword123!" \
    --allocated-storage 20 \
    --no-publicly-accessible \
    --vpc-security-group-ids sg-rds-xxx \
    --db-subnet-group-name helpdesk-db-subnet-group \
    --region ap-south-1
2. Schema Migration & Backup ExecutionBash# Execute Prisma Schema Migrations against target database
npx prisma migrate deploy

# Export local development database backup (Do NOT commit to repository)
mysqldump -h localhost -u root -p helpdesk > helpdesk-backup.sql

# Restore/Import SQL data into target RDS instance (Via bastion host or migration runner)
mysql -h helpdesk-rds.xxxx.ap-south-1.rds.amazonaws.com -u root -p helpdesk < helpdesk-backup.sql
Application SetupBuild & Containerization Environment1. Docker Multi-Stage BuildsFrontend Dockerfile (frontend/Dockerfile)Dockerfile# Stage 1: Build React Production Bundle
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production Web Server
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
Backend Dockerfile (backend/Dockerfile)DockerfileFROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
RUN npx prisma generate
COPY . .
RUN npm run build
EXPOSE 5000
ENV NODE_ENV=production
CMD ["npm", "run", "start"]
2. Local Docker Development OrchestrationBash# Spin up complete stack locally (Frontend, Backend API, MySQL)
docker-compose up -d --build

# Verify container status and ports
docker-compose ps
Application Deployment1. Push Container Images to AWS ECR[cite: 4]Bash# Authenticate Docker against AWS ECR
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.ap-south-1.amazonaws.com

# Create ECR Repositories
aws ecr create-repository --repository-name helpdesk-frontend --region ap-south-1
aws ecr create-repository --repository-name helpdesk-backend --region ap-south-1

# Tag and Push Images
docker tag helpdesk-frontend:latest <aws_account_id>[.dkr.ecr.ap-south-1.amazonaws.com/helpdesk-frontend:latest](https://.dkr.ecr.ap-south-1.amazonaws.com/helpdesk-frontend:latest)
docker push <aws_account_id>[.dkr.ecr.ap-south-1.amazonaws.com/helpdesk-frontend:latest](https://.dkr.ecr.ap-south-1.amazonaws.com/helpdesk-frontend:latest)

docker tag helpdesk-backend:latest <aws_account_id>[.dkr.ecr.ap-south-1.amazonaws.com/helpdesk-backend:latest](https://.dkr.ecr.ap-south-1.amazonaws.com/helpdesk-backend:latest)
docker push <aws_account_id>[.dkr.ecr.ap-south-1.amazonaws.com/helpdesk-backend:latest](https://.dkr.ecr.ap-south-1.amazonaws.com/helpdesk-backend:latest)
Load Balancing & ECS Fargate Execution1. Register AWS ECS Fargate Task Definition[cite: 4]JSON{
  "family": "helpdesk-backend-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::<aws_account_id>:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "helpdesk-backend",
      "image": "<aws_account_id>[.dkr.ecr.ap-south-1.amazonaws.com/helpdesk-backend:latest](https://.dkr.ecr.ap-south-1.amazonaws.com/helpdesk-backend:latest)",
      "portMappings": [
        {
          "containerPort": 5000,
          "hostPort": 5000,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ECS/HELPDESK-BACKEND-TASK",
          "awslogs-region": "ap-south-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
Monitoring and MaintenanceCloudWatch Setup1. Container Log Management Configuration[cite: 4]Bash# Create CloudWatch Log Group for Backend ECS Service
aws logs create-log-group \
    --log-group-name /ECS/HELPDESK-BACKEND-TASK \
    --region ap-south-1

# Verify Log Stream Activity
aws logs describe-log-streams \
    --log-group-name /ECS/HELPDESK-BACKEND-TASK \
    --region ap-south-1
Security Best PracticesPrivate Subnet Execution: All compute tasks run in private application subnets without direct public IP addresses[cite: 4].Cascading Security Groups: Network ingress is tightly constrained to upstream security group IDs rather than broad IP ranges[cite: 4].Non-Public Database Hosting: Amazon RDS instances are configured without public accessibility (PubliclyAccessible: false)[cite: 4].Secrets Management: Sensitive credentials, JWT secrets, and database passwords are injected dynamically via environment variables[cite: 4].Troubleshooting GuideCommon Issues and Solutions1. ECS Task Startup Failure: ECR Image Pull Timeout (ResourceInitializationError)[cite: 4]PlaintextResourceInitializationError: unable to pull image or logs: api error: 
Cannot pull image: Get "https://<aws_account_id>[.dkr.ecr.ap-south-1.amazonaws.com/v2/](https://.dkr.ecr.ap-south-1.amazonaws.com/v2/)": i/o timeout
Root Cause: ECS Fargate tasks deployed inside private subnets lack a route to reach external AWS ECR endpoints over HTTPS (port 443)[cite: 4].Resolution Path:[cite: 4]Ensure the private subnet route table (helpdesk-private-app-rt) contains a valid 0.0.0.0/0 default route pointing to an active Regional NAT Gateway located in a public subnet[cite: 4].Verify that the egress rules of helpdesk-backend-sg permit outbound HTTPS (443) traffic[cite: 4].Alternatively, provision AWS VPC Interface Endpoints for ECR (com.amazonaws.ap-south-1.ecr.dkr, com.amazonaws.ap-south-1.ecr.api, and s3 gateway endpoint) inside the VPC[cite: 4].ContributingHow to ContributeFork the repository (https://github.com/AkashDixit8/helpdesk)[cite: 4]Create a feature branch (git checkout -b feature/NewHelpdeskFeature)[cite: 4]Commit your updates (git commit -m 'Add new ticket analytics feature')[cite: 4]Push to the branch (git push origin feature/NewHelpdeskFeature)[cite: 4]Open a Pull Request for code review[cite: 4]🛠️ Author & CommunityThis project is engineered and maintained by Akash Dixit[cite: 4].Role: Junior Software Engineer | DevOps | AWS Cloud | Infrastructure[cite: 4]GitHub: @AkashDixit8[cite: 4]Repository: AkashDixit8/helpdesk[cite: 4][!Important]
This documentation is continuously updated alongside infrastructure and application releases[cite: 4]. Check back regularly for setup updates[cite: 4]