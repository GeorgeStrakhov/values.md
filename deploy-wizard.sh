#!/bin/bash

# VALUES.MD DEPLOYMENT WIZARD
# Professional, ergonomic deployment management

set -e  # Exit on any error

# Colors for beautiful output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Icons for clarity
SUCCESS="✅"
ERROR="❌"
INFO="ℹ️"
ROCKET="🚀"
GEAR="⚙️"
NETWORK="🌐"
DATABASE="💾"

# Clear screen and show header
clear
echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                   VALUES.MD DEPLOY WIZARD                ║${NC}"
echo -e "${CYAN}║              Professional Deployment Management          ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function: Beautiful status reporting
show_status() {
    local service="$1"
    local status="$2"
    local details="$3"
    
    if [ "$status" = "running" ]; then
        echo -e "${GREEN}${SUCCESS} ${service}${NC} - ${details}"
    elif [ "$status" = "stopped" ]; then
        echo -e "${RED}${ERROR} ${service}${NC} - ${details}"
    else
        echo -e "${YELLOW}${INFO} ${service}${NC} - ${details}"
    fi
}

# Function: Check system status
check_system_status() {
    echo -e "${BLUE}${GEAR} System Status Check${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Node.js version
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node --version)
        show_status "Node.js" "running" "$NODE_VERSION"
    else
        show_status "Node.js" "stopped" "Not installed"
    fi
    
    # npm version
    if command -v npm >/dev/null 2>&1; then
        NPM_VERSION=$(npm --version)
        show_status "npm" "running" "v$NPM_VERSION"
    else
        show_status "npm" "stopped" "Not installed"
    fi
    
    # Git status
    if [ -d ".git" ]; then
        CURRENT_BRANCH=$(git branch --show-current)
        LAST_COMMIT=$(git log -1 --pretty=format:"%h - %s" 2>/dev/null || echo "No commits")
        show_status "Git Repository" "running" "Branch: $CURRENT_BRANCH"
        echo -e "    ${CYAN}Latest:${NC} $LAST_COMMIT"
    else
        show_status "Git Repository" "stopped" "Not a git repository"
    fi
    
    # Environment files
    if [ -f ".env.local" ]; then
        show_status "Environment" "running" ".env.local exists"
    else
        show_status "Environment" "stopped" "No .env.local file"
    fi
    
    # Dependencies
    if [ -d "node_modules" ]; then
        show_status "Dependencies" "running" "node_modules exists"
    else
        show_status "Dependencies" "stopped" "Run npm install"
    fi
    
    # Running processes
    NEXT_PROCESS=$(pgrep -f "next dev" | wc -l)
    if [ "$NEXT_PROCESS" -gt 0 ]; then
        PORTS=$(lsof -t -i :3000,3001 2>/dev/null | wc -l)
        show_status "Next.js Dev Server" "running" "$NEXT_PROCESS process(es), $PORTS port(s)"
    else
        show_status "Next.js Dev Server" "stopped" "Not running"
    fi
    
    echo ""
}

# Function: Check port availability
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1  # Port is busy
    else
        return 0  # Port is free
    fi
}

# Function: Find available port
find_available_port() {
    local start_port=$1
    local port=$start_port
    
    while [ $port -le $((start_port + 100)) ]; do
        if check_port $port; then
            echo $port
            return 0
        fi
        port=$((port + 1))
    done
    
    echo "0"  # No port found
    return 1
}

# Function: Setup firewall if needed
setup_firewall() {
    local port=$1
    
    # Check if ufw is installed and active
    if command -v ufw >/dev/null 2>&1; then
        UFW_STATUS=$(ufw status 2>/dev/null | head -1 | grep -o "active\|inactive" || echo "unknown")
        
        if [ "$UFW_STATUS" = "active" ]; then
            echo -e "${YELLOW}${INFO} UFW firewall is active${NC}"
            echo -e "   ${CYAN}Opening port $port...${NC}"
            
            # Try to add rule (might need sudo)
            if sudo ufw allow $port >/dev/null 2>&1; then
                show_status "Firewall" "running" "Port $port opened"
            else
                echo -e "${YELLOW}${INFO} Could not modify firewall rules${NC}"
                echo -e "   ${CYAN}You may need to manually run: sudo ufw allow $port${NC}"
            fi
        else
            show_status "Firewall" "info" "UFW is inactive, no changes needed"
        fi
    else
        show_status "Firewall" "info" "UFW not installed, no changes needed"
    fi
}

# Function: Deploy locally
deploy_local() {
    echo -e "${BLUE}${ROCKET} Local Deployment${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        echo -e "${RED}${ERROR} Not in a Node.js project directory${NC}"
        exit 1
    fi
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo -e "${CYAN}${GEAR} Installing dependencies...${NC}"
        npm install
        show_status "Dependencies" "running" "Installed successfully"
    fi
    
    # Check environment
    if [ ! -f ".env.local" ]; then
        echo -e "${YELLOW}${INFO} No .env.local file found${NC}"
        echo -e "   ${CYAN}Copy .env.example to .env.local and configure your credentials${NC}"
        
        if [ -f ".env.example" ]; then
            echo -e "   ${CYAN}Would you like me to copy .env.example? (y/n)${NC}"
            read -r response
            if [ "$response" = "y" ] || [ "$response" = "Y" ]; then
                cp .env.example .env.local
                echo -e "${GREEN}${SUCCESS} Created .env.local from template${NC}"
                echo -e "${YELLOW}${INFO} Please edit .env.local with your credentials before continuing${NC}"
                exit 0
            fi
        fi
    fi
    
    # Find available port
    echo -e "${CYAN}${GEAR} Finding available port...${NC}"
    PORT=$(find_available_port 3000)
    
    if [ "$PORT" = "0" ]; then
        echo -e "${RED}${ERROR} No available ports found in range 3000-3100${NC}"
        exit 1
    fi
    
    show_status "Port Selection" "running" "Using port $PORT"
    
    # Setup firewall if needed
    setup_firewall $PORT
    
    # Kill existing processes on this port
    EXISTING_PID=$(lsof -t -i:$PORT 2>/dev/null || echo "")
    if [ ! -z "$EXISTING_PID" ]; then
        echo -e "${YELLOW}${INFO} Stopping existing process on port $PORT (PID: $EXISTING_PID)${NC}"
        kill $EXISTING_PID 2>/dev/null || true
        sleep 2
    fi
    
    # Start the development server
    echo -e "${CYAN}${ROCKET} Starting development server...${NC}"
    
    # Set port in environment
    export PORT=$PORT
    
    # Get local IP for network access
    LOCAL_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost")
    
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    DEPLOYMENT READY                     ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}${NETWORK} Local Access:${NC}     http://localhost:$PORT"
    echo -e "${CYAN}${NETWORK} Network Access:${NC}   http://$LOCAL_IP:$PORT"
    echo -e "${CYAN}${DATABASE} Database:${NC}        $(grep DATABASE_URL .env.local 2>/dev/null | cut -d'=' -f2 | cut -d'@' -f2 | cut -d'/' -f1 || echo 'Not configured')"
    echo -e "${CYAN}${GEAR} Environment:${NC}     Development"
    echo ""
    echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
    echo ""
    
    # Start Next.js with custom port
    if [ "$PORT" != "3000" ]; then
        npm run dev -- --port $PORT
    else
        npm run dev
    fi
}

# Function: Deploy to production
deploy_production() {
    echo -e "${BLUE}${ROCKET} Production Deployment${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Check git status
    if ! git diff-index --quiet HEAD --; then
        echo -e "${YELLOW}${INFO} You have uncommitted changes${NC}"
        echo -e "   ${CYAN}Commit them before deploying to production? (y/n)${NC}"
        read -r response
        if [ "$response" = "y" ] || [ "$response" = "Y" ]; then
            git add .
            echo -e "   ${CYAN}Enter commit message:${NC}"
            read -r commit_msg
            git commit -m "$commit_msg"
        fi
    fi
    
    # Push to main branch
    echo -e "${CYAN}${GEAR} Pushing to GitHub...${NC}"
    git push origin main
    
    echo ""
    echo -e "${GREEN}${SUCCESS} Pushed to GitHub${NC}"
    echo -e "${CYAN}${INFO} Vercel will auto-deploy from main branch${NC}"
    echo -e "${CYAN}${NETWORK} Production URL: https://values.md${NC}"
    echo -e "${CYAN}${NETWORK} Vercel Dashboard: https://vercel.com/dashboard${NC}"
    echo ""
}

# Function: Show deployment menu
show_menu() {
    echo -e "${PURPLE}Choose deployment option:${NC}"
    echo ""
    echo -e "${CYAN}1)${NC} 🖥️  Local Development Server"
    echo -e "${CYAN}2)${NC} 🌐  Deploy to Production (values.md)"
    echo -e "${CYAN}3)${NC} 📊  System Status Report"
    echo -e "${CYAN}4)${NC} 🔧  Setup Environment"
    echo -e "${CYAN}5)${NC} 📋  View Logs"
    echo -e "${CYAN}6)${NC} 🚪  Exit"
    echo ""
    echo -e "${CYAN}Enter your choice (1-6):${NC}"
}

# Function: Setup environment
setup_environment() {
    echo -e "${BLUE}${GEAR} Environment Setup${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [ ! -f ".env.local" ] && [ -f ".env.example" ]; then
        echo -e "${CYAN}Creating .env.local from template...${NC}"
        cp .env.example .env.local
        show_status "Environment File" "running" ".env.local created"
        echo -e "${YELLOW}${INFO} Please edit .env.local with your actual credentials${NC}"
    elif [ -f ".env.local" ]; then
        show_status "Environment File" "running" ".env.local already exists"
    else
        echo -e "${RED}${ERROR} No .env.example template found${NC}"
    fi
    
    echo -e "${CYAN}Press Enter to continue...${NC}"
    read
}

# Function: View logs
view_logs() {
    echo -e "${BLUE}${INFO} Application Logs${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Check for running Next.js processes
    NEXT_PIDS=$(pgrep -f "next dev" || echo "")
    
    if [ ! -z "$NEXT_PIDS" ]; then
        echo -e "${GREEN}${SUCCESS} Found running Next.js processes:${NC}"
        echo "$NEXT_PIDS" | while read pid; do
            if [ ! -z "$pid" ]; then
                echo -e "   ${CYAN}PID: $pid${NC}"
            fi
        done
    else
        echo -e "${YELLOW}${INFO} No running Next.js processes found${NC}"
    fi
    
    echo -e "${CYAN}Press Enter to continue...${NC}"
    read
}

# Main execution
main() {
    check_system_status
    
    while true; do
        show_menu
        read -r choice
        
        case $choice in
            1)
                deploy_local
                ;;
            2)
                deploy_production
                ;;
            3)
                clear
                check_system_status
                echo -e "${CYAN}Press Enter to continue...${NC}"
                read
                ;;
            4)
                setup_environment
                ;;
            5)
                view_logs
                ;;
            6)
                echo -e "${GREEN}${SUCCESS} Goodbye!${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}${ERROR} Invalid choice. Please enter 1-6.${NC}"
                ;;
        esac
        
        echo ""
    done
}

# Run the wizard
main