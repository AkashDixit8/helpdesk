# Deploy Helpdesk SaaS on AWS Cloud Architecture

![Helpdesk System Architecture](https://raw.githubusercontent.com/AkashDixit8/helpdesk/main/docs/images/helpdesk-architecture.svg)

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
    - [2. Development \& Container Runtime Tools](#2-development--container-runtime-tools)
    - [3. Database \& ORM Tooling](#3-database--orm-tooling)
- [Infrastructure Setup](#infrastructure-setup)
  - [VPC and Networking](#vpc-and-networking)
    - [1. VPC \& Internet Gateway Provisioning](#1-vpc--internet-gateway-provisioning)
    - [2. Subnet Topology Allocation](#2-subnet-topology-allocation)
    - [3. NAT Gateway \& Route Table Configuration](#3-nat-gateway--route-table-configuration)
  - [Security Configuration](#security-configuration)
    - [1. Security Group Hierarchy](#1-security-group-hierarchy)
  - [Database Layer](#database-layer)
    - [1. RDS MySQL Instance Provisioning](#1-rds-mysql-instance-provisioning)
    - [2. Schema Migration \& Backup Execution](#2-schema-migration--backup-execution)
- [Application Setup](#application-setup)
  - [Build \& Containerization Environment](#build--containerization-environment)
    - [1. Docker Multi-Stage Builds](#1-docker-multi-stage-builds)
    - [2. Local Docker Development Orchestration](#2-local-docker-development-orchestration)
  - [Application Deployment](#application-deployment)
    - [1. Push Container Images to AWS ECR](#1-push-container-images-to-aws-ecr)
  - [Load Balancing \& ECS Fargate Execution](#load-balancing--ecs-fargate-execution)
    - [1. Register AWS ECS Fargate Task Definition](#1-register-aws-ecs-fargate-task-definition)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
  - [CloudWatch Setup](#cloudwatch-setup)
    - [1. Container Log Management Configuration](#1-container-log-management-configuration)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting Guide](#troubleshooting-guide)
  - [Common Issues and Solutions](#common-issues-and-solutions)
    - [1. ECS Task Startup Failure: ECR Image Pull Timeout (`ResourceInitializationError`)](#1-ecs-task-startup-failure-ecr-image-pull-timeout-resourceinitializationerror)
- [Contributing](#contributing)
  - [How to Contribute](#how-to-contribute)
  - [🛠️ Author \& Community](#️-author--community)

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

- Create an [AWS Free Tier Account](https://aws.amazon.com/free/)
- Install and configure AWS CLI v2:

  For Linux:
  curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
  unzip awscliv2.zip
  sudo ./aws/install

  For macOS:
  brew install awscli

  Configure AWS CLI Credentials:
  aws configure

### 2. Development & Container Runtime Tools

- **Node.js 20+** & **npm**
- **Docker Desktop** (`v24.0+`) & **Docker Compose**

  Verify Docker installation:
  docker --version
  docker-compose --version

- **Git**: Version control system

  Clone the project repository:
  git clone https://github.com/AkashDixit8/helpdesk.git
  cd helpdesk

### 3. Database & ORM Tooling

- **Prisma CLI**:

  npm install -g prisma

---

# Infrastructure Setup

## VPC and Networking

### 1. VPC & Internet Gateway Provisioning

Create primary application VPC:
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=helpdesk-vpc}]' --region ap-south-1

Create and attach Internet Gateway:
aws ec2 create-internet-gateway --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=helpdesk-igw}]' --region ap-south-1
aws ec2 attach-internet-gateway --vpc-id vpc-xxx --internet-gateway-id igw-xxx --region ap-south-1

### 2. Subnet Topology Allocation

Public Subnet A (ALB / IGW):
aws ec2 create-subnet --vpc-id vpc-xxx --cidr-block 10.0.1.0/24 --availability-zone ap-south-1a --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=helpdesk-public-a}]'

Private Application Subnet A (ECS Fargate Tasks):
aws ec2 create-subnet --vpc-id vpc-xxx --cidr-block 10.0.11.0/24 --availability-zone ap-south-1a --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=helpdesk-app-private-a}]'

Private Database Subnet A (RDS MySQL):
aws ec2 create-subnet --vpc-id vpc-xxx --cidr-block 10.0.21.0/24 --availability-zone ap-south-1a --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=helpdesk-db-private-a}]'

### 3. NAT Gateway & Route Table Configuration

Allocate Elastic IP for NAT Gateway:
aws ec2 allocate-address --domain vpc --region ap-south-1

Create Regional NAT Gateway in Public Subnet:
aws ec2 create-nat-gateway --subnet-id subnet-public-a-xxx --allocation-id eipalloc-xxx --tag-specifications 'ResourceType=natgateway,Tags=[{Key=Name,Value=helpdesk-nat}]'

Create Private Application Route Table pointing outbound traffic to NAT Gateway:
aws ec2 create-route-table --vpc-id vpc-xxx --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=helpdesk-private-app-rt}]'
aws ec2 create-route --route-table-id rtb-private-app-xxx --destination-cidr-block 0.0.0.0/0 --gateway-id nat-xxx

## Security Configuration

### 1. Security Group Hierarchy

1. Application Load Balancer Security Group (Public Ingress):
aws ec2 create-security-group --group-name helpdesk-alb-sg --description "Public ingress rule for ALB" --vpc-id vpc-xxx
aws ec2 authorize-security-group-ingress --group-id sg-alb-xxx --protocol tcp --port 80 --cidr 0.0.0.0/0

2. Backend ECS Security Group (Restricted to ALB Traffic):
aws ec2 create-security-group --group-name helpdesk-backend-sg --description "Allow inbound traffic from ALB only" --vpc-id vpc-xxx
aws ec2 authorize-security-group-ingress --group-id sg-backend-xxx --protocol tcp --port 5000 --source-group sg-alb-xxx

3. RDS Security Group (Restricted to Backend Security Group):
aws ec2 create-security-group --group-name helpdesk-rds-sg --description "Allow MySQL traffic from backend ECS tasks only" --vpc-id vpc-xxx
aws ec2 authorize-security-group-ingress --group-id sg-rds-xxx --protocol tcp --port 3306 --source-group sg-backend-xxx

## Database Layer

### 1. RDS MySQL Instance Provisioning

Create DB Subnet Group across private DB subnets:
aws rds create-db-subnet-group --db-subnet-group-name helpdesk-db-subnet-group --db-subnet-group-description "Private subnets for Helpdesk RDS MySQL" --subnet-ids '["subnet-db-a-xxx", "subnet-db-b-xxx"]'

Provision Amazon RDS MySQL Instance:
aws rds create-db-instance --db-instance-identifier helpdesk-rds --db-instance-class db.t3.micro --engine mysql --master-username root --master-user-password "YourSecurePassword123!" --allocated-storage 20 --no-publicly-accessible --vpc-security-group-ids sg-rds-xxx --db-subnet-group-name helpdesk-db-subnet-group --region ap-south-1

### 2. Schema Migration & Backup Execution

Execute Prisma Schema Migrations against target database:
npx prisma migrate deploy

Export local development database backup:
mysqldump -h localhost -u root -p helpdesk > helpdesk-backup.sql

Restore/Import SQL data into target RDS instance:
mysql -h helpdesk-rds.xxxx.ap-south-1.rds.amazonaws.com -u root -p helpdesk < helpdesk-backup.sql

---

# Application Setup

## Build & Containerization Environment

### 1. Docker Multi-Stage Builds

Frontend Dockerfile (`frontend/Dockerfile`):

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

Backend Dockerfile (`backend/Dockerfile`):

FROM node:20-alpine
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

### 2. Local Docker Development Orchestration

Spin up complete stack locally (Frontend, Backend API, MySQL):
docker-compose up -d --build

Verify container status and ports:
docker-compose ps

## Application Deployment

### 1. Push Container Images to AWS ECR

Authenticate Docker against AWS ECR:
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.ap-south-1.amazonaws.com

Create ECR Repositories:
aws ecr create-repository --repository-name helpdesk-frontend --region ap-south-1
aws ecr create-repository --repository-name helpdesk-backend --region ap-south-1

Tag and Push Images:
docker tag helpdesk-frontend:latest <aws_account_id>.dkr.ecr.ap-south-1.amazonaws.com/helpdesk-frontend:latest
docker push <aws_account_id>.dkr.ecr.ap-south-1.amazonaws.com/helpdesk-frontend:latest

docker tag helpdesk-backend:latest <aws_account_id>.dkr.ecr.ap-south-1.amazonaws.com/helpdesk-backend:latest
docker push <aws_account_id>.dkr.ecr.ap-south-1.amazonaws.com/helpdesk-backend:latest

## Load Balancing & ECS Fargate Execution

### 1. Register AWS ECS Fargate Task Definition

Task Definition Configuration:
{
  "family": "helpdesk-backend-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::<aws_account_id>:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "helpdesk-backend",
      "image": "<aws_account_id>.dkr.ecr.ap-south-1.amazonaws.com/helpdesk-backend:latest",
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

---

# Monitoring and Maintenance

## CloudWatch Setup

### 1. Container Log Management Configuration

Create CloudWatch Log Group for Backend ECS Service:
aws logs create-log-group --log-group-name /ECS/HELPDESK-BACKEND-TASK --region ap-south-1

Verify Log Stream Activity:
aws logs describe-log-streams --log-group-name /ECS/HELPDESK-BACKEND-TASK --region ap-south-1

---

# Security Best Practices

1. **Private Subnet Execution**: All compute tasks run in private application subnets without direct public IP addresses.
2. **Cascading Security Groups**: Network ingress is tightly constrained to upstream security group IDs rather than broad IP ranges.
3. **Non-Public Database Hosting**: Amazon RDS instances are configured without public accessibility (`PubliclyAccessible: false`).
4. **Secrets Management**: Sensitive credentials, JWT secrets, and database passwords are injected dynamically via environment variables.

---

# Troubleshooting Guide

## Common Issues and Solutions

### 1. ECS Task Startup Failure: ECR Image Pull Timeout (`ResourceInitializationError`)

ResourceInitializationError: unable to pull image or logs: api error: Cannot pull image: Get "https://<aws_account_id>.dkr.ecr.ap-south-1.amazonaws.com/v2/": i/o timeout

- **Root Cause**: ECS Fargate tasks deployed inside private subnets lack a route to reach external AWS ECR endpoints over HTTPS (port 443).
- **Resolution Path**:
  1. Ensure the private subnet route table (`helpdesk-private-app-rt`) contains a valid `0.0.0.0/0` default route pointing to an active Regional **NAT Gateway** located in a public subnet.
  2. Verify that the egress rules of `helpdesk-backend-sg` permit outbound HTTPS (443) traffic.
  3. Alternatively, provision AWS VPC Interface Endpoints for ECR (`com.amazonaws.ap-south-1.ecr.dkr`, `com.amazonaws.ap-south-1.ecr.api`, and `s3` gateway endpoint) inside the VPC.

---

# Contributing

## How to Contribute

1. Fork the repository (`https://github.com/AkashDixit8/helpdesk`)
2. Create a feature branch (`git checkout -b feature/NewHelpdeskFeature`)
3. Commit your updates (`git commit -m 'Add new ticket analytics feature'`)
4. Push to the branch (`git push origin feature/NewHelpdeskFeature`)
5. Open a Pull Request for code review

---

## 🛠️ Author & Community

This project is engineered and maintained by **[Akash Dixit](https://github.com/AkashDixit8)**.

- **Role**: Junior Software Engineer | DevOps | AWS Cloud | Infrastructure
- **GitHub**: [@AkashDixit8](https://github.com/AkashDixit8)
- **Repository**: [AkashDixit8/helpdesk](https://github.com/AkashDixit8/helpdesk)

> [!Important]
> This documentation is continuously updated alongside infrastructure and application releases. Check back regularly for setup updates.