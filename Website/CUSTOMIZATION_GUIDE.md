# Personal Portfolio Website - Customization Guide

## 🎯 Quick Start Checklist

### 1. Personal Information (Replace ALL placeholders in `index.html`)

**Search and replace these placeholders:**

- `Jonny Hughes` → Your actual name
- `jrhughes003@gmail.com` → Your email address
- `jrhughes003` → Your GitHub username
- `jrhughes003` → Your LinkedIn username (may be different from GitHub)

### 2. Professional Photo

- Replace the image placeholder in the Hero section
- Add your professional headshot in the `hero-image` div
- Recommended: 300x300px, high quality, professional attire

### 3. About Section Content

Update the content in the About section with:

- Your professional background
- What drives you as a developer
- Your unique value proposition
- Key achievements or certifications

### 4. Skills & Technologies

Based on your existing projects, update the skills sections with:

**Programming Languages:**

- Python ✓ (from your existing project)
- JavaScript ✓ (from website development)
- C++ ✓ (from your existing files)
- PHP ✓ (from your blog project)
- C# ✓ (from Unity game project)

**Add any additional skills you have:**

- Java, SQL, etc.

### 5. Projects Showcase

I've created templates based on your existing projects. Update with:

**Blog Platform (from your Blog_1 folder):**

- Add live demo link if hosted
- Link to GitHub repository
- Highlight specific features

**Racing Game (from CarGame_Scripts):**

- Add game demo or screenshots
- Link to GitHub repository
- Mention specific Unity features used

**Data Analysis Project:**

- Link to your Python analysis project
- Add results or visualizations
- Explain the business impact

### 6. Experience & Education

Add your:

- Current education status
- Work experience (internships, part-time jobs)
- Relevant coursework
- Certifications or achievements

### 7. Contact Information

- Verify all email links work
- Add your actual social media profiles
- Consider adding phone number if comfortable

## 🚀 Hosting Options

### Option 1: GitHub Pages (Recommended - Free)

1. Push your website files to a GitHub repository
2. Go to repository Settings → Pages
3. Select source branch (usually main)
4. Your site will be available at `https://yourusername.github.io/repository-name`

### Option 2: Netlify (Free tier)

1. Create account at netlify.com
2. Drag and drop your website folder
3. Get instant deployment with custom domain support

### Option 3: Vercel (Free tier)

1. Create account at vercel.com
2. Connect your GitHub repository
3. Auto-deploy on every commit

## 📱 Pre-Launch Testing

### Test on Different Devices:

- Desktop (Chrome, Firefox, Safari, Edge)
- Tablet (iPad, Android tablet)
- Mobile (iPhone, Android phone)

### Check These Elements:

- [ ] All navigation links work
- [ ] Contact form validation works
- [ ] All social media links are correct
- [ ] Images load properly
- [ ] Text is readable on all screen sizes
- [ ] No placeholder text remains

## 🎨 Customization Tips

### Color Scheme

You can easily change the color scheme by updating CSS variables in `styles.css`:

```css
:root {
  --primary-color: #2563eb; /* Main brand color */
  --accent-color: #f59e0b; /* Highlight color */
  /* Update these to match your personal brand */
}
```

### Adding New Projects

Copy this HTML structure in the projects section:

```html
<div class="project-card">
  <div class="project-image">
    <i class="fas fa-[icon-name]"></i>
  </div>
  <div class="project-content">
    <h3 class="project-title">Project Name</h3>
    <p class="project-description">Description...</p>
    <div class="project-tech">
      <span class="tech-tag">Technology</span>
    </div>
    <div class="project-links">
      <a href="#" class="project-link" target="_blank">
        <i class="fas fa-external-link-alt"></i> Demo
      </a>
      <a href="#" class="project-link" target="_blank">
        <i class="fab fa-github"></i> Code
      </a>
    </div>
  </div>
</div>
```

### Font Awesome Icons

The website uses Font Awesome for icons. Find icons at: https://fontawesome.com/icons

## 🔧 Advanced Features

### Contact Form Backend

Currently, the contact form shows a demo message. To make it functional:

1. **Formspree (Easy):** Add `action="https://formspree.io/f/YOUR_FORM_ID"` to the form
2. **EmailJS (Free):** JavaScript-based email service
3. **Netlify Forms:** Built-in form handling for Netlify users

### Analytics

Add Google Analytics by including the tracking code in the `<head>` section.

### SEO Improvements

- Add your custom meta description
- Include relevant keywords
- Create a favicon
- Add Open Graph tags for social media sharing

## 🎯 Content Writing Tips for Employers

### Hero Section

- Lead with your strongest skill or achievement
- Use action words: "I create," "I build," "I solve"
- Include years of experience if relevant

### About Section

- Focus on what value you bring to employers
- Mention specific technologies you're passionate about
- Include soft skills (teamwork, communication, problem-solving)

### Project Descriptions

- Start with the business problem you solved
- Explain your technical approach
- Quantify results when possible ("Improved performance by 30%")
- Highlight teamwork or leadership roles

### Skills Section

- List technologies in order of proficiency
- Group related skills together
- Include both technical and soft skills

## 📞 Support

If you need help customizing the website:

1. Check the browser console for any JavaScript errors
2. Validate your HTML at validator.w3.org
3. Test CSS changes incrementally
4. Keep backups of working versions

Remember: A great portfolio website tells your story, showcases your skills, and makes it easy for employers to contact you. Keep it professional, up-to-date, and focused on your target audience!
