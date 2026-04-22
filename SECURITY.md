# Security Policy

## ⚠️ Important: Archived Project

This is a **completed Hackathon project** and is not actively maintained. Security patches will not be provided.

## Responsible Disclosure

If you discover a security vulnerability, please do **NOT** open a public GitHub issue.

Instead, please email the team or use the project's security reporting channel.

### What NOT to do:
- ❌ Do NOT post security issues publicly
- ❌ Do NOT commit credentials or API keys
- ❌ Do NOT share sensitive configuration

## Security Considerations

### Firebase Credentials
- Never commit `.env` files containing Firebase API keys
- Use `.env.example` as template only
- Store real credentials locally only
- Rotate keys regularly if running in production

### Sensitive Data
- This project may handle garden sensor data
- Ensure proper access controls if deployed
- Review Firebase security rules before use
- Consider user privacy if expanding the project

### Bluetooth Security
- BLE communications should be validated
- Consider data encryption for sensitive commands
- Implement device authentication in production

## Using This Code Safely

If you're using this code as reference or basis for your own project:

1. **Audit the code** for your use case
2. **Update dependencies** to latest versions
3. **Implement proper authentication**
4. **Review Firebase rules** and security settings
5. **Test thoroughly** before production deployment
6. **Monitor for vulnerabilities** in dependencies

## Reporting

⚠️ For security issues in derived projects, use your own security reporting procedures.

---

*Last updated: April 2025*
