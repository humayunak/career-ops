# Job Application Assistant

A Claude skill that helps you create tailored resumes, cover letters, and interview preparation materials for specific job applications.

## What It Does

- ✅ Analyzes job descriptions to identify key requirements
- ✅ Generates tailored resumes in Word format
- ✅ Writes personalized cover letters
- ✅ Prepares interview question answers using your real experience
- ✅ Provides strategic advice on applications
- ✅ Identifies gaps and suggests how to address them

## Quick Start

1. **Install the skill** - Add `job-application-assistant.skill` to your Claude
2. **Create your profile** - Fill out `profile-template.json` with your career info
3. **Save as** `profile-data.json` in the skill folder
4. **Start using**: "I want to apply for [paste job description]"

Read `SETUP.md` for detailed instructions.

## File Structure

```
job-application-assistant/
├── SKILL.md                      # Main skill instructions
├── SETUP.md                      # Detailed setup guide
├── README.md                     # This file
├── profile-data.json            # YOUR profile (you create this)
└── templates/
    ├── profile-template.json    # Empty template to fill out
    └── example-profile.json     # Example of completed profile
```

## Example Usage

**Apply for a job:**
```
I want to apply for this Senior Engineer role at TechCorp:
[paste job description]

Please create a tailored resume and cover letter.
```

**Prepare for interview:**
```
Help me prepare for an interview for Product Manager at StartupXYZ.
Job description: [paste JD]
```

**Answer specific question:**
```
Help me answer: "Tell me about a time you resolved a conflict on your team"
```

## What Makes This Different

Unlike generic resume builders, this skill:
- Uses YOUR actual experience and achievements
- Tailors materials to each specific job
- Provides strategic insights on the application
- Creates interview answers from your real stories
- Never invents or exaggerates - only uses what's in your profile

## Requirements

- Your profile data in `profile-data.json`
- Claude with file creation enabled
- The docx skill (for Word document generation)

## Privacy

Your profile data stays local. It's only read when you trigger the skill and is never shared externally.

## Tips for Success

1. **Be detailed in your profile** - More detail = better tailored materials
2. **Include metrics** - Quantify achievements whenever possible
3. **Keep it updated** - Add new experiences as they happen
4. **Prepare STAR stories** - Have 5-7 ready for interviews
5. **Customize every time** - Never use the same resume twice

## Support

For issues or questions, refer to `SETUP.md` or ask Claude for help.

---

Built to help you land your dream job! 🎯
