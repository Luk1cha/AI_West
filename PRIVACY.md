# Data & Privacy Notes

## 📊 Data Collected

The AI-WEST system collects the following sensor data:

- **Temperature** — Environmental temperature readings
- **Humidity** — Air humidity levels
- **Soil Moisture** — Soil water content
- **Light Levels** — Ambient light intensity

## 🔐 Where Data is Stored

- **Firebase Realtime Database** — Cloud storage of sensor readings
- **Local Device** — Temporary cache on mobile device/ESP32
- **User Export** — Optional Excel/CSV export for analysis

## ⚠️ Privacy Considerations

### For Developers Using This Code

If you deploy this system, consider:

1. **User Consent** — Inform users what data is collected
2. **Data Retention** — Define how long sensor history is kept
3. **Access Control** — Secure database rules to protect sensor data
4. **Backups** — Secure any data backups
5. **Compliance** — Follow GDPR/local privacy laws if applicable

### Security Best Practices

- Use Firebase security rules to restrict data access
- Enable SSL/TLS for all connections
- Store credentials securely (.env files)
- Audit database access logs
- Consider encryption for sensitive readings

## 📋 Firebase Security Rules Template

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid",
        "devices": {
          "$deviceId": {
            "sensorData": {
              ".indexOn": ["timestamp"]
            }
          }
        }
      }
    }
  }
}
```

## ✅ Recommendations

If using AI-WEST as a foundation:

- [ ] Implement proper user authentication
- [ ] Add Firebase security rules
- [ ] Set data retention policies
- [ ] Create privacy policy for users
- [ ] Document data handling practices
- [ ] Enable audit logging
- [ ] Regular security reviews

---

*This is an educational/reference project. Implement appropriate security measures for production use.*
