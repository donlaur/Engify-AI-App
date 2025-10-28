# Security Policy

## Reporting Security Issues

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, email: security@engify.ai

Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We'll respond within 48 hours.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Measures

### Data Protection

- All data encrypted in transit (HTTPS/TLS 1.3)
- MongoDB encryption at rest
- Secure session management
- No plain-text password storage

### API Security

- Rate limiting on all endpoints
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF tokens

### Authentication

- Secure session cookies (httpOnly, secure, sameSite)
- Password hashing (bcrypt)
- Session expiration
- Logout on all devices

### Infrastructure

- Regular dependency updates
- Automated security scanning
- Environment variable protection
- No secrets in code

## Best Practices

### For Users

- Use strong passwords
- Enable 2FA (when available)
- Don't share API keys
- Review permissions
- Report suspicious activity

### For Developers

- Never commit secrets
- Use environment variables
- Validate all inputs
- Sanitize outputs
- Follow OWASP guidelines

## Vulnerability Disclosure

We follow responsible disclosure:

1. Report received
2. Acknowledged within 48h
3. Fix developed and tested
4. Security advisory published
5. Credit given to reporter

## Security Updates

Subscribe to security advisories:

- GitHub Security Advisories
- Email: security-updates@engify.ai
- RSS: /security/feed

## Compliance

- GDPR compliant
- SOC 2 Type II (in progress)
- OWASP Top 10 addressed
- Regular penetration testing

## Contact

Security Team: security@engify.ai
PGP Key: Available on request

---

**Last Updated**: October 2025
