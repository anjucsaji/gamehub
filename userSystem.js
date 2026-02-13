// userSystem.js - User Management and Scoring System

class UserSystem {
    constructor() {
        this.currentUser = this.loadCurrentUser();
        this.users = this.loadAllUsers();
    }

    // Load current logged-in user
    loadCurrentUser() {
        return localStorage.getItem('currentUser') || null;
    }

    // Load all users from localStorage
    loadAllUsers() {
        const saved = localStorage.getItem('allUsers');
        return saved ? JSON.parse(saved) : {};
    }

    // Save all users to localStorage
    saveUsers() {
        localStorage.setItem('allUsers', JSON.stringify(this.users));
    }

    // Create new user
    createUser(username) {
        username = username.trim().toUpperCase();
        
        if (!username) {
            return { success: false, message: 'Username cannot be empty!' };
        }

        if (username.length < 3) {
            return { success: false, message: 'Username must be at least 3 characters!' };
        }

        if (this.users[username]) {
            return { success: false, message: 'Username already exists!' };
        }

        this.users[username] = {
            username: username,
            totalPoints: 0,
            gamesPlayed: 0,
            games: {
                wordle: { wins: 0, plays: 0, bestScore: null, totalPoints: 0 },
                numberGuessing: { wins: 0, plays: 0, bestScore: null, totalPoints: 0 },
                palindrome: { checks: 0, totalPoints: 0 }
            },
            createdAt: new Date().toISOString()
        };

        this.saveUsers();
        return { success: true, message: 'User created successfully!' };
    }

    // Login user
    login(username) {
        username = username.trim().toUpperCase();
        
        if (!this.users[username]) {
            return { success: false, message: 'User not found!' };
        }

        this.currentUser = username;
        localStorage.setItem('currentUser', username);
        return { success: true, message: 'Logged in successfully!', user: this.users[username] };
    }

    // Logout
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }

    // Get current user data
    getCurrentUserData() {
        if (!this.currentUser) return null;
        return this.users[this.currentUser];
    }

    // Add points for a game
    addPoints(game, points, gameData = {}) {
        if (!this.currentUser) return false;

        const user = this.users[this.currentUser];
        
        // Update game-specific stats
        if (user.games[game]) {
            user.games[game].plays++;
            user.games[game].totalPoints += points;
            
            if (gameData.won) {
                user.games[game].wins++;
            }

            // Update best score (lower is better for some games)
            if (gameData.score !== undefined) {
                if (user.games[game].bestScore === null || gameData.score < user.games[game].bestScore) {
                    user.games[game].bestScore = gameData.score;
                }
            }
        }

        // Update total points
        user.totalPoints += points;
        user.gamesPlayed++;

        this.saveUsers();
        return true;
    }

    // Get leaderboard (top 10 users by points)
    getLeaderboard() {
        const userArray = Object.values(this.users);
        return userArray
            .sort((a, b) => b.totalPoints - a.totalPoints)
            .slice(0, 10);
    }

    // Delete user
    deleteUser(username) {
        username = username.trim().toUpperCase();
        
        if (this.users[username]) {
            delete this.users[username];
            this.saveUsers();
            
            // If deleting current user, logout
            if (this.currentUser === username) {
                this.logout();
            }
            return true;
        }
        return false;
    }
}

// Create global instance
const userSystem = new UserSystem();