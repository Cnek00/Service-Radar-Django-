# Service Radar - User Guide: Firma Paneli

## How to Access Firma Panel

1. **Login** as a firm manager (user with `is_firm_manager=true`)
2. Navigate to **"Firma Paneli"** link in the header (after login)
3. You'll be redirected to `/firma-panel/requests` (default)

---

## Firma Paneli Tabs

### 1. 🔔 Gelen Talepler (Incoming Referrals)
**Route**: `/firma-panel/requests`

#### What You See:
- List of all customer requests for your firm's services
- For each request:
  - Service title
  - Customer name
  - Request date
  - Status badge (Beklemede/Pending, Kabul Edildi/Accepted, Reddedildi/Rejected)

#### What You Can Do:
- **Kabul Et** (Accept) - Accept the referral (only for pending ones)
- **Reddet** (Reject) - Reject the referral (only for pending ones)

#### Example Flow:
```
Customer requests: "Web Design Service"
  ↓
Your firm sees in "Gelen Talepler" tab
  ↓
You click "Kabul Et" to accept
  ↓
Status changes to "Kabul Edildi" (Accepted)
  ↓
Commission is marked as due
```

---

### 2. 📦 Hizmet Yönetimi (Service Management)
**Route**: `/firma-panel/services`

#### What You See:
- List of all services your firm has added
- For each service:
  - Service title
  - Description
  - Price range (Min - Max TL)
  - Category (if assigned)

#### What You Can Do:
- **"Yeni Hizmet Ekle"** button - Add a new service
  - Service title (required)
  - Description
  - Price range (min and max)
  - Category (optional dropdown from 10 available categories)
  
- **"Düzenle"** button on each service - Edit existing service
  
- **"Sil"** button on each service - Delete service
  - Requires confirmation

#### Example:
```
Your firm: "Firma 1 - Web Development"
  ├── Service 1: "Web Design" (Category: Yazılım)
  ├── Service 2: "Mobile App Dev" (Category: Yazılım)
  └── Service 3: "Consulting" (Category: Danışmanlık)
```

**Note**: All services you add here will:
- ✅ Appear on the homepage for customers to search
- ✅ Appear in Django admin panel
- ✅ Be filterable by category
- ✅ Be searchable by customers

---

### 3. 👥 Kullanıcı Yönetimi (User/Employee Management)
**Route**: `/firma-panel/users`

#### What You See:
- Table of all employees in your firm
- For each employee:
  - Full name
  - Username / Email
  - Role badge (Yönetici / Manager OR Standart Çalışan / Standard Employee)

#### What You Can Do:
- **"Yeni Çalışan Ekle"** button - Add new employee
  - Full name
  - Username
  - Email
  - Temporary password
  
- **"Yönetici Yap"** or **"Standart Yap"** - Toggle employee role
  
- **"Sil"** button - Delete employee

#### Protections:
- ✅ Cannot delete yourself
- ✅ Cannot remove your own manager status
- ✅ Your account is marked with "Siz" (You) label
- ✅ Only managers can perform these actions

#### Example Roles:
```
Your firm employees:
├── Ahmet Yıldız (you) - Yönetici [Can't change yourself]
├── Ayşe Kaya - Yönetici [Can toggle to Standart Çalışan]
└── Mehmet Demir - Standart Çalışan [Can toggle to Yönetici]
```

---

### 4. ⚙️ Firma Ayarları (Firm Settings)
**Route**: `/firma-panel/settings`

#### What You Can Edit:
- **Firma Bilgileri** (Company Info):
  - Firma adı (Company name)
  - Açıklama (Description)
  - Konum (Location/Address)

- **İletişim** (Contact):
  - Telefon (Phone)
  - E-posta (Email)

- **Vergi & Ticaret** (Tax & Trade):
  - Vergi Numarası (Tax ID)
  - Ticaret Odası Kayıt No (Trade Registry)

- **Operasyon Ayarları** (Operations):
  - Min. Sipariş Tutarı (Minimum Order Amount)
  - Varsayılan Kargo Ücreti (Default Delivery Fee)
  - Tahmini Teslimat Süresi (Estimated Delivery Time in minutes)

#### How to Save:
1. Edit any fields you want to change
2. Click **"Kaydet"** button at the bottom
3. Wait for confirmation message
4. Changes are immediately saved to your company profile

#### Example:
```
Before:
  Firma Adı: firma01

After Edit:
  Firma Adı: "Web Tasarım Şirketi"
  Telefon: "0212-555-1234"
  Email: "info@webtasarım.com"
  Min. Sipariş: 500 TL
  Teslimat Süresi: 24 hours

Click "Kaydet" → Changes saved ✓
```

---

## Features Availability by Role

| Feature | Customer | Firm Employee | Firm Manager | Admin |
|---------|----------|---------------|--------------|-------|
| View services | ✅ | ❌ | ✅ | ✅ |
| Search & filter | ✅ | ❌ | ✅ | ✅ |
| Create referral | ✅ | ❌ | ✅ | ✅ |
| View referrals | ❌ | ✅ | ✅ | ✅ |
| Accept/Reject | ❌ | ❌ | ✅ | ✅ |
| Manage services | ❌ | ❌ | ✅ | ✅ |
| Manage employees | ❌ | ❌ | ✅ | ✅ |
| Edit firm settings | ❌ | ❌ | ✅ | ✅ |
| View all referrals | ❌ | ❌ | ❌ | ✅ |

---

## Typical Firm Manager Workflow

### Day 1: Setup
```
1. Login → Firma Paneli → Firma Ayarları
2. Update company information (address, phone, tax ID)
3. Set delivery fee and minimum order
4. Go to Hizmet Yönetimi → Yeni Hizmet Ekle
5. Add 3-5 main services with categories
```

### Day 2: Add Team
```
1. Go to Kullanıcı Yönetimi
2. Click "Yeni Çalışan Ekle"
3. Add employees and set their roles
4. Send them login credentials
```

### Day 3+: Manage Incoming Requests
```
1. Check Gelen Talepler tab regularly
2. Review pending requests
3. Accept qualified leads
4. Reject unsuitable requests
5. Update services as needed in Hizmet Yönetimi
```

---

## Common Questions

### Q: What happens when I delete a service?
**A**: The service is permanently removed. Customers won't see it in search. Existing referrals for that service are kept in history.

### Q: Can employees add services?
**A**: No. Only firm managers can add/edit/delete services. Employees can only view incoming requests.

### Q: How do customers find my services?
**A**: 
1. They go to homepage
2. Click a category or search
3. Your services appear if they match
4. They can create a referral request

### Q: What does "Commission" mean?
**A**: When you accept a referral, it marks that you may have earned a commission from that customer for that service.

### Q: Can I edit accepted referrals?
**A**: No. Only pending referrals can be accepted or rejected. Accepted/rejected ones are final.

---

## Troubleshooting

### Issue: Services not showing up after adding
**Solution**: 
- Check if they have a category assigned
- Wait for page to refresh
- Check Django admin to see if they're really saved

### Issue: Can't add new employees
**Solution**:
- Make sure you're logged in as a firm manager
- Check that employee email/username isn't already used
- Ensure password field is filled

### Issue: Firma Ayarları tab missing
**Solution**:
- You need to be logged in as a firm manager
- Regular employees only see Gelen Talepler tab

### Issue: Can't accept a referral
**Solution**:
- Make sure referral status is "Beklemede" (Pending)
- Check if you have proper permissions (must be firm manager)
- Try refreshing and clicking accept again

---

## Tips & Best Practices

✅ **Do**:
- Keep service descriptions detailed
- Update firm information regularly
- Assign categories to services for better discovery
- Review pending requests daily
- Maintain employee records

❌ **Don't**:
- Use similar service titles (confusing for customers)
- Leave contact info blank (customers can't reach you)
- Delete services without backing up info first
- Share manager credentials with employees

---

## Support

For issues or questions:
1. Check your email for system notifications
2. Review service descriptions for clarity
3. Verify all required fields are filled
4. Contact system administrator if problems persist

