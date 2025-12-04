# SMTP Configuration for Contact Form

To enable the contact form's email functionality, add the following environment variables to your `.env.local` file:

## Gmail SMTP Setup (Recommended for testing)

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourstore.com
CONTACT_EMAIL_TO=admin@yourstore.com

# Store Configuration
NEXT_PUBLIC_STORE_NAME=Your Store Name
```

**Important:** If using Gmail, you need to:
1. Enable 2-Factor Authentication on your Google Account
2. Generate an "App Password" at https://myaccount.google.com/apppasswords
3. Use the 16-character app password in `SMTP_PASSWORD`

## Other SMTP Providers

### Outlook/Hotmail
```env
SMTP_HOST=smtp.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
```

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxxxxxxxxxx
```

### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@yourdomain.com
SMTP_PASSWORD=your-password
```

### AWS SES
```env
SMTP_HOST=email-smtp.region.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASSWORD=your-smtp-password
```

## Testing the Contact Form

1. Go to `/contact` on your website
2. Fill out the contact form and submit
3. Check both:
   - Admin email (specified in `CONTACT_EMAIL_TO`)
   - Your email (the sender's email from the form)

Both should receive emails if SMTP is configured correctly.

## Troubleshooting

If emails aren't being sent:
1. Check that all SMTP environment variables are set correctly
2. Check server logs for SMTP connection errors
3. Verify the email account's password/credentials
4. Check firewall/network settings if SMTP port is blocked
5. Try a different SMTP provider if your current one isn't working

## Security Notes

- Never commit `.env.local` to version control
- Use app-specific passwords (not your main account password)
- Keep SMTP credentials secure
- Consider using a dedicated email service for production
