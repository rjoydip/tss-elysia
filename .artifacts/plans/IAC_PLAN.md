# Dynamic Multi-Cloud Infrastructure as Code (IaC) Plan

## Overview

Create a cloud-agnostic Infrastructure as Code solution using **Pulumi (native TypeScript)** that allows users to deploy to any cloud provider through a unified YAML configuration. Integrates with existing Docker setup and includes cost estimation via Infracost.

## Goals

- [ ] Design cloud-agnostic configuration schema
- [ ] Implement provider adapters for AWS, GCP, Azure, and DigitalOcean
- [ ] Create abstraction layer for common infrastructure resources
- [ ] Build deployment automation pipeline
- [ ] Add multi-environment support (dev, staging, prod)
- [ ] Implement state management with provider-specific backends
- [ ] Add drift detection and rollback capability
- [ ] Integrate Infracost for cost estimation

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     IaC Architecture                             │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌─────────────────┐     ┌──────────────────┐
│   User       │────▶│  Configuration  │────▶│   Pulumi Engine   │
│   (CLI/API)  │     │   (YAML/JSON)   │     │   (TypeScript)   │
└──────────────┘     └─────────────────┘     └────────┬─────────┘
                                                       │
                        ┌──────────────────────────────┼──────────────────────┐
                        │                              │                      │
                        ▼                              ▼                      ▼
              ┌─────────────────┐         ┌─────────────────┐    ┌─────────────────┐
              │  AWS Provider  │         │  GCP Provider   │    │ Azure Provider  │
              │  (@pulumi/aws) │         │(@pulumi/google) │    │(@pulumi/azure)  │
              └─────────────────┘         └─────────────────┘    └─────────────────┘
                        │                              │                      │
                        ▼                              ▼                      ▼
              ┌─────────────────┐         ┌─────────────────┐    ┌─────────────────┐
              │  S3 Backend     │         │  GCS Backend    │    │  Blob Backend   │
              │  (State)       │         │  (State)        │    │  (State)        │
              └─────────────────┘         └─────────────────┘    └─────────────────┘

                        ┌─────────────────────────────────────────┐
                        │        DigitalOcean Provider            │
                        │      (@pulumi/digitalocean)             │
                        └──────────────────┬──────────────────────┘
                                           │
                                           ▼
                        ┌─────────────────────────────────────────┐
                        │        Spaces Backend (State)           │
                        └─────────────────────────────────────────┘
```

## Supported Cloud Providers

| Provider     | Pulumi Package       | Compute              | Database         | Storage      | State Backend |
| ------------ | -------------------- | -------------------- | ---------------- | ------------ | ------------- |
| AWS          | @pulumi/aws          | EC2, ECS, Lambda     | RDS, ElastiCache | S3           | S3            |
| GCP          | @pulumi/google       | GCE, GKE, Cloud Run  | Cloud SQL        | GCS          | GCS           |
| Azure        | @pulumi/azure        | VM, AKS, App Service | SQL Database     | Blob Storage | Blob          |
| DigitalOcean | @pulumi/digitalocean | Droplets, DOKS       | Managed DB       | Spaces       | Spaces        |

## Configuration Schema

### Main Configuration File (`infrastructure/config.yaml`)

```yaml
version: "1.0"

environment: ${IAC_ENVIRONMENT}

cloud:
  provider: ${IAC_CLOUD_PROVIDER}
  region: ${IAC_REGION}
  project: ${GCP_PROJECT}

resources:
  compute:
    - name: app-server
      type: ${COMPUTE_TYPE}
      instanceType: ${INSTANCE_TYPE}
      autoscaling:
        minReplicas: 1
        maxReplicas: 10
        targetCpuPercent: 70

  database:
    - name: main-db
      engine: postgres
      size: ${DB_SIZE}
      storage: 20GB
      backup:
        enabled: true
        retentionDays: 7

  storage:
    - name: assets
      type: bucket
      versioning: true
      publicAccess: false

  network:
    - name: vpc
      cidr: 10.0.0.0/16
      enableNatGateway: true

  firewall:
    - name: web
      ingress:
        - ports: [80, 443]
          source: 0.0.0.0/0
        - ports: [22]
          source: ${TRUSTED_IP}

  tls:
    - name: main-tls
      domains:
        - example.com
        - "*.example.com"
      issuer: letsencrypt

monitoring:
  logging: true
  metrics: true
  alerting:
    email: admin@example.com

costEstimate:
  enabled: true
  currency: USD
```

### Environment-Specific Overrides

```yaml
# configs/dev.yaml
resources:
  compute:
    - instanceType: t3.micro
  database:
    - size: small

# configs/prod.yaml
resources:
  compute:
    - instanceType: t3.large
      autoscaling:
        minReplicas: 3
        maxReplicas: 20
  database:
    - size: large
    - backup:
        retentionDays: 30
```

## Tasks

### Phase 1: Project Setup

- [ ] Create `infrastructure/` directory structure
- [ ] Initialize Pulumi project with `bunx pulumi new`
- [ ] Set up TypeScript configuration
- [ ] Add Pulumi packages: `@pulumi/pulumi`, `@pulumi/aws`, `@pulumi/google`, `@pulumi/azure`, `@pulumi/digitalocean`, `@pulumi/kubernetes`
- [ ] Create configuration schema with Zod validation
- [ ] Implement environment variable substitution system

### Phase 2: Core Abstraction Layer

- [ ] Define `CloudProvider` interface/trait
- [ ] Create `ProviderFactory` to instantiate providers
- [ ] Implement base provider class with common operations
- [ ] Create resource abstraction interfaces:
  - `IComputeResource`
  - `IDatabaseResource`
  - `IStorageResource`
  - `INetworkResource`
  - `ISecurityResource`

### Phase 3: Provider Implementations

- [ ] **AWS Provider**
  - Implement `AwsProvider` class
  - Map abstract resources to AWS services
  - Configure S3 state backend
  - Create IAM roles and policies
  - Implement VPC and subnet creation

- [ ] **GCP Provider**
  - Implement `GcpProvider` class
  - Map abstract resources to GCP services
  - Configure GCS state backend
  - Create service account and permissions
  - Implement VPC and subnets

- [ ] **Azure Provider**
  - Implement `AzureProvider` class
  - Map abstract resources to Azure resources
  - Configure Blob Storage state backend
  - Create service principal
  - Implement virtual network

- [ ] **DigitalOcean Provider**
  - Implement `DigitalOceanProvider` class
  - Map abstract resources to DO resources
  - Configure Spaces state backend
  - Create VPC networking

### Phase 4: Resource Implementations

- [ ] **Compute Resources**
  - Virtual Machines (EC2, GCE, VM, Droplet)
  - Container Services (ECS, GKE, AKS, DOKS)
  - Serverless (Lambda, Cloud Functions, Functions, App Platform)

- [ ] **Database Resources**
  - Managed Databases (RDS, Cloud SQL, SQL DB, Managed DB)
  - Redis/Cache (ElastiCache, Memorystore, Cache, Redis)

- [ ] **Storage Resources**
  - Object Storage (S3, GCS, Blob, Spaces)
  - File Storage (EFS, Filestore, Files, NFS)

- [ ] **Network Resources**
  - VPC/Network creation
  - Subnet configuration
  - NAT Gateway
  - Load Balancers (ALB, CLB, SLB, Load Balancer)

- [ ] **Security Resources**
  - TLS Certificates (ACM, Certificate Manager, Key Vault, Spaces SSL)
  - Security Groups/Firewall Rules
  - IAM Policies/\_roles

### Phase 5: Deployment Engine

- [ ] Implement Pulumi stack management
- [ ] Create state backend configuration per provider
- [ ] Implement `plan` command (preview changes)
- [ ] Implement `apply` command (deploy)
- [ ] Implement `destroy` command (teardown)
- [ ] Add drift detection capability
- [ ] Implement rollback on failure

### Phase 6: CLI Tool

- [ ] Create `iac` CLI with commands:
  - `init` - Scaffold new infrastructure project
  - `plan` - Preview infrastructure changes
  - `apply` - Deploy infrastructure
  - `destroy` - Tear down infrastructure
  - `status` - Show current state
  - `cost` - Show cost estimate

- [ ] Implement CLI options:
  - `--config` - Custom config path
  - `--stack` - Pulumi stack name
  - `--verbose` - Verbose output
  - `--dry-run` - Preview without apply

### Phase 7: Integration

- [ ] Integrate with existing Docker setup
  - Generate Dockerfile based on compute type
  - Create docker-compose.override.yml
- [ ] Add environment configs (dev, staging, prod)
- [ ] Create GitHub Actions workflow for IaC
- [ ] Add Infracost integration for cost estimation

### Phase 8: Docker Integration

- [ ] Create `infrastructure/docker/` directory
- [ ] Generate app Dockerfile based on compute type
- [ ] Create docker-compose templates per provider
- [ ] Add health check configuration
- [ ] Configure logging driver

## File Structure

```
infrastructure/
├── package.json
├── tsconfig.json
├── Pulumi.yaml
├── configs/
│   ├── base.yaml           # Base configuration
│   ├── dev.yaml            # Development overrides
│   ├── staging.yaml        # Staging overrides
│   └── prod.yaml           # Production overrides
├── src/
│   ├── index.ts            # CLI entry point
│   ├── config/
│   │   ├── schema.ts       # Zod configuration schema
│   │   ├── loader.ts       # Configuration loader
│   │   └── types.ts       # TypeScript types
│   ├── providers/
│   │   ├── index.ts        # Provider factory
│   │   ├── base.ts         # Base provider class
│   │   ├── types.ts        # Provider types
│   │   ├── aws.ts          # AWS provider
│   │   ├── gcp.ts          # GCP provider
│   │   ├── azure.ts        # Azure provider
│   │   └── digitalocean.ts # DigitalOcean provider
│   ├── resources/
│   │   ├── compute.ts      # Compute abstraction
│   │   ├── database.ts     # Database abstraction
│   │   ├── storage.ts      # Storage abstraction
│   │   ├── network.ts      # Network abstraction
│   │   └── security.ts     # Security abstraction
│   ├── engine/
│   │   ├── runner.ts       # Pulumi runner
│   │   ├── state.ts        # State management
│   │   └── cost.ts         # Infracost integration
│   └── cli/
│       ├── commands/
│       │   ├── init.ts
│       │   ├── plan.ts
│       │   ├── apply.ts
│       │   ├── destroy.ts
│       │   ├── status.ts
│       │   └── cost.ts
│       └── options.ts
├── templates/
│   └── docker/
│       ├── Dockerfile.app
│       └── docker-compose.yaml
└── .env.example
```

## Environment Variables

| Variable             | Required | Description                      |
| -------------------- | -------- | -------------------------------- |
| `IAC_CLOUD_PROVIDER` | Yes      | aws, gcp, azure, digitalocean    |
| `IAC_ENVIRONMENT`    | Yes      | dev, staging, prod               |
| `IAC_REGION`         | Yes      | Cloud region                     |
| `IAC_PROJECT_NAME`   | Yes      | Project name for resource naming |

### AWS

| Variable                | Required | Description                  |
| ----------------------- | -------- | ---------------------------- |
| `AWS_ACCESS_KEY_ID`     | Yes\*    | AWS access key               |
| `AWS_SECRET_ACCESS_KEY` | Yes\*    | AWS secret key               |
| `AWS_SESSION_TOKEN`     | No       | AWS session token (optional) |
| `IAC_TF_STATE_BUCKET`   | Yes\*    | S3 bucket for state          |

### GCP

| Variable                  | Required | Description              |
| ------------------------- | -------- | ------------------------ |
| `GCP_PROJECT`             | Yes\*    | GCP project ID           |
| `GCP_SERVICE_ACCOUNT_KEY` | Yes\*    | GCP service account JSON |
| `GCP_REGION`              | Yes\*    | GCP region               |

### Azure

| Variable                | Required | Description           |
| ----------------------- | -------- | --------------------- |
| `AZURE_SUBSCRIPTION_ID` | Yes\*    | Azure subscription ID |
| `AZURE_TENANT_ID`       | Yes\*    | Azure tenant ID       |
| `AZURE_CLIENT_ID`       | Yes\*    | Azure client ID       |
| `AZURE_CLIENT_SECRET`   | Yes\*    | Azure client secret   |

### DigitalOcean

| Variable             | Required | Description            |
| -------------------- | -------- | ---------------------- |
| `DIGITALOCEAN_TOKEN` | Yes\*    | DigitalOcean API token |

\*Provider variables only required when using that provider

## Usage

### Initialize Project

```bash
cd infrastructure
bun install

# Initialize with AWS
bun run iac init --provider aws --env dev

# Initialize with GCP
bun run iac init --provider gcp --env prod

# Initialize with Azure
bun run iac init --provider azure --env staging

# Initialize with DigitalOcean
bun run iac init --provider digitalocean --env dev
```

### Preview Changes

```bash
bun run iac plan
```

### Deploy Infrastructure

```bash
bun run iac apply
```

### View Cost Estimate

```bash
bun run iac cost
```

### Destroy Resources

```bash
bun run iac destroy
```

### Check Status

```bash
bun run iac status
```

## Pulumi Stack Management

- Stacks are isolated per environment
- State stored in provider-specific backend:
  - AWS → S3
  - GCP → GCS
  - Azure → Blob Storage
  - DigitalOcean → Spaces

## Cost Estimation (Infracost)

- Run cost estimate before apply
- Show monthly/yearly costs
- Breakdown by resource
- Compare across environments

## Notes

- Use Pulumi's native TypeScript SDK for all providers
- Never commit secrets - use environment variables
- Implement validation at configuration load time
- Use stack configurations for environment isolation
- Implement proper error handling and rollback
- Add comprehensive logging
- Support both YAML and JSON configuration formats

## References

- [Pulumi Documentation](https://www.pulumi.com/docs/)
- [Pulumi AWS Provider](https://www.pulumi.com/registry/packages/aws/)
- [Pulumi GCP Provider](https://www.pulumi.com/registry/packages/gcp/)
- [Pulumi Azure Provider](https://www.pulumi.com/registry/packages/azure/)
- [Pulumi DigitalOcean Provider](https://www.pulumi.com/registry/packages/digitalocean/)
- [Infracost Documentation](https://www.infracost.io/docs/)
- [Existing Docker Setup](../docker/)