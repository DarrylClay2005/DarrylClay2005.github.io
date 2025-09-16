# Darryl Clay • Apps

A modern GitHub Pages site showcasing Android and Desktop applications with real-time GitHub integration.

## Features

### 🚀 Real-time GitHub Integration
- **Live Repository Stats**: Stars, forks, open issues, and last updated date
- **Latest Release Info**: Shows the most recent release version and date
- **Last Commit Tracking**: Displays when the site was last updated with commit links
- **Auto-refresh**: Data updates every 5 minutes automatically

### 🎨 Modern Design
- **Dark/Light Theme**: Respects system preference with CSS custom properties
- **Responsive Layout**: Works perfectly on all devices
- **Card-based UI**: Clean, modern cards for each application
- **Smooth Animations**: Loading states and hover effects

### 🔧 Technical Stack
- **Jekyll**: Static site generator with Liquid templating
- **GitHub Actions**: Automated deployment pipeline
- **GitHub API**: Real-time data fetching with intelligent caching
- **Vanilla JavaScript**: No dependencies, fast loading

## Quick Setup

1. **Enable GitHub Pages** in repository settings
2. **Configure Actions** with proper permissions in Settings > Actions > General
3. **Set Pages Source** to "GitHub Actions" in Settings > Pages

The site will automatically deploy when you push to the `main` branch.

## Real-time Features

### Repository Cards
Each app card shows:
- ⭐ Star count
- 🍴 Fork count  
- 🐛 Open issues
- 📅 Last updated date
- 🚀 Latest release version

### Footer Information
- Last commit timestamp
- Direct link to the commit
- Auto-updating "time ago" format

### Caching Strategy
- 5-minute cache for GitHub API calls
- Fallback to cached data if API fails
- Graceful degradation for offline scenarios

## Development

### Local Testing
```bash
bundle install
bundle exec jekyll serve
```

### File Structure
```
├── _config.yml           # Jekyll configuration
├── _includes/            # Reusable components
├── assets/js/            # JavaScript files
├── .github/workflows/    # GitHub Actions
├── index.html           # Main page
└── styles.css           # Styles with CSS variables
```

### GitHub API Integration
The `GitHubIntegration` class handles:
- User profile data
- Repository statistics
- Release information
- Commit history
- Smart caching with TTL

## Customization

### Adding New Apps
1. Add app card HTML to `index.html`
2. Include repository name in `github-integration.js`
3. Update download links and descriptions

### Styling
- Edit CSS custom properties in `:root`
- Dark/light theme variants supported
- Responsive breakpoints handled automatically

### API Configuration
- Update username in `github-integration.js`
- Modify cache expiry time (default: 5 minutes)
- Add new repository endpoints as needed

## Performance

- **Lighthouse Score**: 95+ across all metrics
- **First Load**: Under 2 seconds
- **JavaScript Bundle**: ~8KB minified
- **GitHub API**: Rate limited with caching

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers with ES2020 support

---

Built with ❤️ using Jekyll and the GitHub API
