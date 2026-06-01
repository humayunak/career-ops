# Job Application Assistant - Setup Guide

## What You Just Got

A custom skill that helps you tailor your resume, write cover letters, and prepare for interviews for specific job applications. The skill analyzes job descriptions and matches them to your profile to create personalized application materials.

## Installation

1. **Download the skill file**: `job-application-assistant.skill`
2. **Install it** in your Claude interface (exact steps depend on your Claude setup)

## Initial Setup - IMPORTANT!

Before you can use the skill, you need to create your master profile. This is a one-time setup:

### Option 1: Start from Template

1. Copy the `profile-template.json` file from the skill's templates folder
2. Fill in all sections with your real information:
   - Personal info (name, contact, LinkedIn, etc.)
   - Work experience with detailed achievements
   - Education
   - Skills (technical and soft skills)
   - Projects
   - Certifications
   - Interview stories
   
3. Save it as `profile-data.json` in the skill folder: `/mnt/skills/user/job-application-assistant/profile-data.json`

### Option 2: Learn from Example

Check out `example-profile.json` to see what a completed profile looks like. This shows you:
- The level of detail to include
- How to quantify achievements
- What makes a good STAR story
- How to organize your information

### Tips for Your Profile

**Be specific and quantitative:**
- ❌ "Improved website performance"
- ✅ "Reduced page load time by 40% through code optimization, improving user engagement by 25%"

**Include STAR stories:**
These are gold for interviews. Have 5-7 strong examples of:
- Leadership
- Problem solving
- Conflict resolution
- Technical challenges
- Team collaboration
- Innovation

**Keep it updated:**
When you complete a major project or achievement, add it to your profile immediately. Don't wait!

## How to Use the Skill

Once your profile is set up:

### Example 1: Applying for a Specific Job

```
I want to apply for this role: [paste job description]

Please create a tailored resume and cover letter.
```

The skill will:
1. Analyze the job requirements
2. Match them to your profile
3. Generate a tailored resume (Word doc)
4. Write a customized cover letter
5. Give you strategic advice on the application

### Example 2: Interview Prep

```
Help me prepare for an interview for [role/company].
The job description is: [paste JD]
```

The skill will:
1. Generate answers to common interview questions
2. Prepare role-specific behavioral questions
3. Create STAR-format answers from your experience
4. Suggest questions you should ask the interviewer

### Example 3: Quick Question Answers

```
Help me answer: "Tell me about a time you led a cross-functional team"
```

The skill will pull relevant examples from your profile and craft a STAR-format answer.

### Example 4: Resume Review

```
I have a resume for [company/role]. Can you review it and suggest improvements?
```

## What the Skill Generates

1. **Tailored Resumes** (.docx format)
   - ATS-friendly formatting
   - Keyword-optimized for the specific job
   - Emphasizes most relevant experience
   - Professional layout

2. **Cover Letters** (.docx or .md format)
   - Personalized to the company and role
   - Connects your experience to their needs
   - Professional but personable tone

3. **Interview Prep Guides** (.md format)
   - Common interview questions with answers
   - Role-specific behavioral questions
   - STAR-format responses from your real experience
   - Questions to ask the interviewer

4. **Strategic Advice**
   - Gap analysis (what you're missing)
   - How to address gaps honestly
   - Research suggestions
   - Follow-up strategies

## File Organization

After using the skill, you'll find your materials in `/mnt/user-data/outputs/`:

```
outputs/
├── Senior_Engineer_TechCorp_Resume.docx
├── Senior_Engineer_TechCorp_CoverLetter.docx
├── Senior_Engineer_TechCorp_InterviewPrep.md
├── Product_Manager_StartupXYZ_Resume.docx
└── ...
```

## Best Practices

### 1. Customize for EVERY Job
Never send the same resume twice. Always tailor it.

### 2. Be Honest
Only include truthful information. The skill won't make things up.

### 3. Update Your Profile Regularly
After completing projects, gaining new skills, or achievements - update your profile immediately.

### 4. Save Job Descriptions
Keep a copy of job descriptions for roles you apply to. Helpful for interview prep later.

### 5. Quality Over Quantity
Better to apply to 10 jobs with excellent tailored materials than 50 with generic ones.

## Updating Your Profile

To add new experience or update your profile:

```
I want to add [new job/skill/project] to my profile
```

The skill will help you update your `profile-data.json` file.

## Privacy Note

Your profile data stays on your machine. It's not shared anywhere. The skill only reads it when you trigger it.

## Troubleshooting

**"Profile not found" error:**
- Make sure you created `profile-data.json` in the skill folder
- Check the file path: `/mnt/skills/user/job-application-assistant/profile-data.json`

**Generated materials don't match the job:**
- Make sure your profile has enough detail
- Add more specific achievements and metrics
- Include the skills/technologies you actually have

**Need more customization:**
- You can always ask for revisions: "Make the cover letter more enthusiastic" or "Add more technical details to the resume"

## Getting Started Checklist

- [ ] Install the `job-application-assistant.skill` file
- [ ] Create your `profile-data.json` (use the template)
- [ ] Fill in all sections with detailed information
- [ ] Add at least 5 STAR stories for interviews
- [ ] Test it with a recent job description
- [ ] Update your profile after each major achievement

## Example Workflow

1. **See interesting job posting** → Copy the job description
2. **Ask Claude**: "I want to apply for this role: [paste JD]. Create resume, cover letter, and interview prep."
3. **Review materials** → Ask for any tweaks needed
4. **Download and apply** → Materials saved to outputs folder
5. **Interview scheduled** → Use the interview prep guide
6. **After interview** → Update profile with new insights

---

Good luck with your job search! 🚀
