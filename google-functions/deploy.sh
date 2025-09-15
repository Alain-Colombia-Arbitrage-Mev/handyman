#!/bin/bash

# Deployment script for Handyman Auction Google Cloud Functions
# Author: Development Team
# Version: 1.0.0

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="${FIREBASE_PROJECT_ID:-handyman-auction-prod}"
REGION="us-central1"
ENV="${DEPLOY_ENV:-production}"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."

    # Check if Firebase CLI is installed
    if ! command -v firebase &> /dev/null; then
        print_error "Firebase CLI is not installed. Please install it first:"
        print_error "npm install -g firebase-tools"
        exit 1
    fi

    # Check if logged in to Firebase
    if ! firebase projects:list &> /dev/null; then
        print_error "Not logged in to Firebase. Please run: firebase login"
        exit 1
    fi

    # Check if Node.js version is compatible
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1)
    if [ "$NODE_MAJOR_VERSION" -lt 20 ]; then
        print_error "Node.js version 20 or higher is required. Current version: $NODE_VERSION"
        exit 1
    fi

    print_success "Prerequisites check passed"
}

# Function to validate environment variables
validate_environment() {
    print_status "Validating environment variables..."

    REQUIRED_VARS=(
        "JWT_SECRET"
        "JWT_REFRESH_SECRET"
        "FIREBASE_PROJECT_ID"
        "CONVEX_URL"
    )

    MISSING_VARS=()

    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            MISSING_VARS+=("$var")
        fi
    done

    if [ ${#MISSING_VARS[@]} -ne 0 ]; then
        print_error "Missing required environment variables:"
        for var in "${MISSING_VARS[@]}"; do
            print_error "  - $var"
        done
        print_error "Please set these variables in your environment or .env file"
        exit 1
    fi

    # Optional variables that should be warned about
    OPTIONAL_VARS=(
        "STRIPE_SECRET_KEY"
        "SENDGRID_API_KEY"
        "TWILIO_ACCOUNT_SID"
    )

    for var in "${OPTIONAL_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            print_warning "Optional variable $var is not set. Some features may not work."
        fi
    done

    print_success "Environment validation completed"
}

# Function to run tests
run_tests() {
    if [ "$SKIP_TESTS" != "true" ]; then
        print_status "Running tests..."

        if npm test; then
            print_success "All tests passed"
        else
            print_error "Tests failed. Use SKIP_TESTS=true to skip tests."
            exit 1
        fi
    else
        print_warning "Skipping tests (SKIP_TESTS=true)"
    fi
}

# Function to build the project
build_project() {
    print_status "Building project..."

    # Clean previous build
    rm -rf lib/

    # Install dependencies
    if [ "$SKIP_INSTALL" != "true" ]; then
        print_status "Installing dependencies..."
        npm ci
        print_success "Dependencies installed"
    else
        print_warning "Skipping dependency installation (SKIP_INSTALL=true)"
    fi

    # Run linting
    if [ "$SKIP_LINT" != "true" ]; then
        print_status "Running linter..."
        if npm run lint; then
            print_success "Linting passed"
        else
            print_error "Linting failed. Fix issues or use SKIP_LINT=true to skip."
            exit 1
        fi
    else
        print_warning "Skipping linting (SKIP_LINT=true)"
    fi

    # Build TypeScript
    print_status "Compiling TypeScript..."
    if npm run build; then
        print_success "Build completed successfully"
    else
        print_error "Build failed"
        exit 1
    fi
}

# Function to deploy specific functions
deploy_functions() {
    print_status "Deploying functions to $ENV environment..."

    # Set Firebase project
    firebase use "$PROJECT_ID"

    if [ "$FUNCTIONS" ]; then
        # Deploy specific functions
        print_status "Deploying specific functions: $FUNCTIONS"
        firebase deploy --only "functions:$FUNCTIONS" --project "$PROJECT_ID"
    else
        # Deploy all functions
        print_status "Deploying all functions..."
        firebase deploy --only functions --project "$PROJECT_ID"
    fi

    print_success "Functions deployed successfully"
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment..."

    # Test health check endpoint
    HEALTH_URL="https://$REGION-$PROJECT_ID.cloudfunctions.net/healthCheck"

    if curl -s -f "$HEALTH_URL" > /dev/null; then
        print_success "Health check passed"
    else
        print_warning "Health check failed. Functions may still be initializing."
    fi

    # List deployed functions
    print_status "Listing deployed functions..."
    firebase functions:list --project "$PROJECT_ID"
}

# Function to setup environment variables in Firebase
setup_firebase_env() {
    if [ "$SETUP_ENV" == "true" ]; then
        print_status "Setting up environment variables in Firebase..."

        # Core environment variables
        firebase functions:config:set \
            jwt.secret="$JWT_SECRET" \
            jwt.refresh_secret="$JWT_REFRESH_SECRET" \
            convex.url="$CONVEX_URL" \
            --project "$PROJECT_ID"

        # Optional environment variables (only if set)
        if [ -n "$STRIPE_SECRET_KEY" ]; then
            firebase functions:config:set stripe.secret_key="$STRIPE_SECRET_KEY" --project "$PROJECT_ID"
        fi

        if [ -n "$SENDGRID_API_KEY" ]; then
            firebase functions:config:set sendgrid.api_key="$SENDGRID_API_KEY" --project "$PROJECT_ID"
        fi

        if [ -n "$TWILIO_ACCOUNT_SID" ]; then
            firebase functions:config:set \
                twilio.account_sid="$TWILIO_ACCOUNT_SID" \
                twilio.auth_token="$TWILIO_AUTH_TOKEN" \
                --project "$PROJECT_ID"
        fi

        print_success "Environment variables configured"
    fi
}

# Function to show deployment summary
show_summary() {
    print_success "=== Deployment Summary ==="
    echo -e "  ${BLUE}Project:${NC} $PROJECT_ID"
    echo -e "  ${BLUE}Environment:${NC} $ENV"
    echo -e "  ${BLUE}Region:${NC} $REGION"
    echo -e "  ${BLUE}Functions URL:${NC} https://$REGION-$PROJECT_ID.cloudfunctions.net"
    echo ""
    print_success "Deployment completed successfully!"
}

# Function to cleanup on error
cleanup() {
    print_error "Deployment failed. Cleaning up..."
    # Add any cleanup logic here
    exit 1
}

# Main deployment function
main() {
    print_status "Starting deployment process..."
    print_status "Environment: $ENV"
    print_status "Project: $PROJECT_ID"

    # Set error trap
    trap cleanup ERR

    # Load environment variables from .env file if it exists
    if [ -f .env ]; then
        print_status "Loading environment variables from .env file..."
        export $(cat .env | grep -v '^#' | xargs)
    fi

    # Execute deployment steps
    check_prerequisites
    validate_environment
    run_tests
    build_project
    setup_firebase_env
    deploy_functions
    verify_deployment
    show_summary
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --env)
            ENV="$2"
            shift 2
            ;;
        --project)
            PROJECT_ID="$2"
            shift 2
            ;;
        --functions)
            FUNCTIONS="$2"
            shift 2
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-lint)
            SKIP_LINT=true
            shift
            ;;
        --skip-install)
            SKIP_INSTALL=true
            shift
            ;;
        --setup-env)
            SETUP_ENV=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --env ENV           Deployment environment (default: production)"
            echo "  --project PROJECT   Firebase project ID"
            echo "  --functions FUNCS   Comma-separated list of functions to deploy"
            echo "  --skip-tests        Skip running tests"
            echo "  --skip-lint         Skip linting"
            echo "  --skip-install      Skip npm install"
            echo "  --setup-env         Setup environment variables in Firebase"
            echo "  --help              Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                                    # Deploy all functions"
            echo "  $0 --functions auth,payments          # Deploy specific functions"
            echo "  $0 --env staging --project my-proj   # Deploy to staging"
            echo "  $0 --skip-tests --setup-env           # Skip tests and setup env"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            print_error "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Run main function
main