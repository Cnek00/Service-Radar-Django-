# Service Radar Frontend - Kurulum ve Kullanım Kılavuzu

## 📋 Gereksinimler

- Node.js 16+
- npm veya yarn
- Django Backend (çalışır durumda)

## 🚀 Hızlı Başlangıç

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Uygulama http://localhost:5173 adresinde çalışacaktır.

### 3. Production Build

```bash
npm run build
```

Build dosyaları `dist/` klasöründe oluşturulacaktır.

## 🔧 Konfigürasyon

### Backend API URL

Backend API URL'i dosyalarda şu şekilde ayarlıdır:
```typescript
const API_BASE_URL = 'http://127.0.0.1:8000/api';
```

Farklı bir backend URL'i kullanmak için bu değeri değiştirin.

## 📁 Klasör Yapısı

```
src/
├── components/              # Yeniden kullanılabilir UI bileşenleri
│   ├── AdvancedSearchBar.tsx      # Gelişmiş arama çubuğu
│   ├── EnhancedServiceCard.tsx    # İyileştirilmiş hizmet kartı
│   ├── FilterPanel.tsx            # Filtreleme paneli
│   ├── FavoritesPanel.tsx         # Favoriler paneli
│   ├── SettingsPanel.tsx          # Ayarlar paneli
│   ├── EnhancedHeader.tsx         # Gelişmiş header
│   └── AnalyticsDashboard.tsx     # Analytics gösterge paneli
│
├── contexts/               # React Context'ler
│   └── ThemeContext.tsx           # Dark/Light mode yönetimi
│
├── pages/                  # Sayfa bileşenleri
│   └── HomePage.tsx               # Ana sayfa
│
├── types/                  # TypeScript tip tanımları
│   └── index.ts                   # Tüm interface'ler
│
├── utils/                  # Yardımcı fonksiyonlar
│   ├── storage.ts                 # LocalStorage yönetimi
│   └── theme.ts                   # Tema yönetimi
│
├── App.tsx                 # Ana uygulama bileşeni
├── App.css                # Uygulama stilleri
├── index.css              # Global stiller ve Tailwind
└── main.tsx               # Uygulama giriş noktası
```

## ✨ Özellikler

### 1. Gelişmiş Arama
- Otomatik tamamlama
- Son aramalar kaydı
- Arama önerileri
- Konum bazlı filtreleme

### 2. Akıllı Filtreleme
- Fiyat aralığı (min-max)
- Konum filtresi
- Kategori seçimi
- Çoklu sıralama seçenekleri

### 3. Kişiselleştirme
- Favori hizmetler
- Kullanıcı tercihleri
- Tema seçimi (Dark/Light/System)
- Bildirim ayarları

### 4. Modern UI/UX
- Responsive tasarım
- Smooth animasyonlar
- Dark mode desteği
- Mikro-etkileşimler

### 5. Analytics (Firma Paneli)
- Talep istatistikleri
- Tamamlanma oranı
- Gelir gösterimi
- Görsel dashboard

## 🎨 Tema Sistemi

Uygulama 3 tema modunu destekler:

1. **Light Mode**: Açık renkli, günlük kullanım
2. **Dark Mode**: Koyu renkli, gece kullanımı
3. **System**: İşletim sistemi tercihini takip eder

Tema tercihi LocalStorage'da saklanır ve her ziyarette hatırlanır.

## 💾 LocalStorage Kullanımı

Uygulama şu verileri LocalStorage'da saklar:

- `user_preferences`: Kullanıcı ayarları
- `recent_searches`: Son aramalar (max 10)
- `favorite_services`: Favori hizmetler
- `theme_preference`: Tema tercihi
- `accessToken`: JWT token (authentication)
- `refreshToken`: Yenileme token'ı
- `user_is_superuser`: Admin yetkisi
- `user_is_firm_manager`: Firma yöneticisi yetkisi

## 🔐 Authentication

Authentication Django backend ile entegre çalışır:

1. Kullanıcı giriş yapar
2. Backend JWT token döner
3. Token LocalStorage'da saklanır
4. Her API isteğinde token gönderilir

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🎯 API Entegrasyonu

Tüm API çağrıları Django backend ile uyumludur:

```typescript
// Örnek API çağrısı
const searchServices = async (query: string, location: string) => {
  const params = new URLSearchParams();
  if (query) params.append('query', query);
  if (location) params.append('location', location);

  const response = await fetch(`${API_BASE_URL}/search/?${params}`);
  return await response.json();
};
```

## 🐛 Hata Ayıklama

### Build Hataları

```bash
# Bağımlılıkları temizle ve yeniden yükle
rm -rf node_modules package-lock.json
npm install
```

### Tip Hataları

```bash
# TypeScript kontrolü
npm run typecheck
```

### Lint Hataları

```bash
# ESLint kontrolü
npm run lint
```

## 🚀 Deployment

### Vercel

```bash
vercel deploy
```

### Netlify

```bash
netlify deploy --prod
```

### Manuel

```bash
npm run build
# dist/ klasörünü sunucuya yükleyin
```

## 📊 Performans

- **Bundle Size**: ~220 KB (gzipped: ~67 KB)
- **CSS Size**: ~30 KB (gzipped: ~5.4 KB)
- **First Load**: < 2 saniye
- **Lighthouse Score**: 90+

## 🔄 Güncelleme Notları

Bu frontend, mevcut Django backend API'lerinizi bozmadan çalışacak şekilde tasarlanmıştır:

- ✅ API endpoint'leri korunmuş
- ✅ Authentication sistemi aynı
- ✅ Veri yapıları uyumlu
- ✅ Backward compatible

## 📝 Geliştirme Notları

### Yeni Bileşen Ekleme

```typescript
// src/components/YeniComponent.tsx
import { useState } from 'react';

export default function YeniComponent() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg">
      {/* Component içeriği */}
    </div>
  );
}
```

### Dark Mode Kullanımı

```typescript
// Tailwind sınıflarında dark: prefix kullanın
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  İçerik
</div>
```

### LocalStorage Kullanımı

```typescript
import { storage } from '../utils/storage';

// Favori ekleme
storage.addFavorite(service);

// Son arama ekleme
storage.addRecentSearch(query, location);

// Tema değiştirme
storage.setTheme('dark');
```

## 🆘 Destek

Herhangi bir sorun yaşarsanız:

1. Console logları kontrol edin
2. Network sekmesinde API çağrılarını inceleyin
3. LocalStorage'ı temizleyin
4. Browser cache'ini silin
5. Farklı bir tarayıcıda test edin

## 📄 Lisans

Bu proje size özeldir ve tam kullanım hakkına sahipsiniz.

## 🎉 Başarılar!

Frontend hazır ve kullanıma sunuldu. Keyifli kullanımlar!
