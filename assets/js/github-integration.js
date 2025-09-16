// GitHub API integration for real-time data
class GitHubIntegration {
    constructor(username) {
        this.username = username;
        this.apiBase = 'https://api.github.com';
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    }

    // Generic API call with caching
    async fetchWithCache(url, cacheKey) {
        const now = Date.now();
        const cached = this.cache.get(cacheKey);
        
        if (cached && now - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            this.cache.set(cacheKey, { data, timestamp: now });
            return data;
        } catch (error) {
            console.warn(`GitHub API error for ${cacheKey}:`, error);
            return cached ? cached.data : null;
        }
    }

    // Get user profile information
    async getUserProfile() {
        return this.fetchWithCache(
            `${this.apiBase}/users/${this.username}`,
            'user_profile'
        );
    }

    // Get repository information
    async getRepository(repoName) {
        return this.fetchWithCache(
            `${this.apiBase}/repos/${this.username}/${repoName}`,
            `repo_${repoName}`
        );
    }

    // Get latest release for a repository
    async getLatestRelease(repoName) {
        return this.fetchWithCache(
            `${this.apiBase}/repos/${this.username}/${repoName}/releases/latest`,
            `release_${repoName}`
        );
    }

    // Get repository statistics
    async getRepoStats(repoName) {
        const repo = await this.getRepository(repoName);
        if (!repo) return null;

        return {
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            issues: repo.open_issues_count,
            language: repo.language,
            lastUpdated: new Date(repo.updated_at).toLocaleDateString(),
            size: Math.round(repo.size / 1024) // Convert KB to MB
        };
    }

    // Update repository cards with real-time data
    async updateRepositoryCards() {
        const repoNames = [
            'StashOpusPlayer',
            'ImageCropperMobile',
            'enhanced-image-cropper',
            'Image-Cropper',
            'backup-manager-pro',
            'Linux-System-Startup-Auto-Cleaner',
            'animeverse-app',
            'EQPad'
        ];

        const promises = repoNames.map(async (repoName) => {
            try {
                const [stats, release] = await Promise.all([
                    this.getRepoStats(repoName),
                    this.getLatestRelease(repoName).catch(() => null)
                ]);

                return { repoName, stats, release };
            } catch (error) {
                console.warn(`Failed to fetch data for ${repoName}:`, error);
                return { repoName, stats: null, release: null };
            }
        });

        const results = await Promise.all(promises);
        
        results.forEach(({ repoName, stats, release }) => {
            this.updateCardWithStats(repoName, stats, release);
        });
    }

    // Update individual card with statistics
    updateCardWithStats(repoName, stats, release) {
        // Find the card by looking for h3 containing the repo name or similar title
        const cards = document.querySelectorAll('.card');
        let targetCard = null;

        cards.forEach(card => {
            const title = card.querySelector('h3');
            const githubLink = card.querySelector('a[href*="github.com"]');
            
            if (githubLink && githubLink.href.includes(repoName)) {
                targetCard = card;
            }
        });

        if (!targetCard || !stats) return;

        // Create or update stats container
        let statsContainer = targetCard.querySelector('.repo-stats');
        if (!statsContainer) {
            statsContainer = document.createElement('div');
            statsContainer.className = 'repo-stats';
            
            const badgesContainer = targetCard.querySelector('.badges');
            if (badgesContainer) {
                badgesContainer.parentNode.insertBefore(statsContainer, badgesContainer.nextSibling);
            }
        }

        // Update stats HTML
        statsContainer.innerHTML = `
            <div class="stats-row">
                <span class="stat-item">⭐ ${stats.stars}</span>
                <span class="stat-item">🍴 ${stats.forks}</span>
                <span class="stat-item">🐛 ${stats.issues}</span>
                <span class="stat-item">📅 ${stats.lastUpdated}</span>
            </div>
        `;

        // Update release information if available
        if (release) {
            let releaseInfo = targetCard.querySelector('.release-info');
            if (!releaseInfo) {
                releaseInfo = document.createElement('div');
                releaseInfo.className = 'release-info';
                statsContainer.appendChild(releaseInfo);
            }

            const releaseDate = new Date(release.published_at).toLocaleDateString();
            releaseInfo.innerHTML = `
                <small>Latest: <strong>${release.tag_name}</strong> (${releaseDate})</small>
            `;
        }
    }

    // Add last commit information to footer
    async updateFooterWithLastCommit() {
        try {
            const commits = await this.fetchWithCache(
                `${this.apiBase}/repos/${this.username}/${this.username}.github.io/commits?per_page=1`,
                'last_commit'
            );

            if (commits && commits.length > 0) {
                const lastCommit = commits[0];
                const commitDate = new Date(lastCommit.commit.author.date);
                const timeAgo = this.timeAgo(commitDate);
                
                const footer = document.querySelector('.site-footer');
                if (footer) {
                    let commitInfo = footer.querySelector('.last-commit');
                    if (!commitInfo) {
                        commitInfo = document.createElement('p');
                        commitInfo.className = 'last-commit';
                        footer.appendChild(commitInfo);
                    }
                    
                    commitInfo.innerHTML = `
                        <small>Last updated: ${timeAgo} 
                        (<a href="https://github.com/${this.username}/${this.username}.github.io/commit/${lastCommit.sha}" target="_blank" rel="noopener">${lastCommit.sha.substring(0, 7)}</a>)
                        </small>
                    `;
                }
            }
        } catch (error) {
            console.warn('Failed to fetch last commit:', error);
        }
    }

    // Helper function to calculate time ago
    timeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    }

    // Initialize all real-time features
    async init() {
        console.log('Initializing GitHub integration...');
        
        try {
            await Promise.all([
                this.updateRepositoryCards(),
                this.updateFooterWithLastCommit()
            ]);
            
            console.log('GitHub integration initialized successfully');
            
            // Set up periodic updates every 5 minutes
            setInterval(() => {
                this.updateRepositoryCards();
                this.updateFooterWithLastCommit();
            }, 5 * 60 * 1000);
            
        } catch (error) {
            console.error('Failed to initialize GitHub integration:', error);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const github = new GitHubIntegration('DarrylClay2005');
    github.init();
});
