# 🚕 Sujido - Modern Cab Booking Platform

<div align="center">

![Django](https://img.shields.io/badge/Django-5.2.6-green?style=for-the-badge&logo=django)
![Python](https://img.shields.io/badge/Python-3.x-blue?style=for-the-badge&logo=python)
![SQLite](https://img.shields.io/badge/SQLite-3-lightblue?style=for-the-badge&logo=sqlite)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript)

**The most trusted and reliable taxi booking service** 🎯

[🚀 Live Demo](#-live-demo) • [📖 Features](#-features) • [🛠️ Installation](#️-installation) • [📱 Screenshots](#-screenshots) • [🤝 Contributing](#-contributing)

</div>

---

## 🌟 About Sujido

Sujido is a modern, full-stack taxi booking platform built with Django that connects customers with drivers seamlessly. Whether you're a customer looking for a quick ride or a driver wanting to earn money, Sujido provides an intuitive and reliable solution.

### 🎯 Why Choose Sujido?

- 🚀 **Lightning Fast** - Quick booking and instant driver matching
- 💰 **Transparent Pricing** - Real-time fare calculation with no hidden charges
- 🗺️ **Smart Navigation** - Integrated maps with route optimization
- 💳 **Digital Wallet** - Secure in-app payment system
- 🔒 **Secure & Reliable** - Built with Django's robust security features
- 📱 **Responsive Design** - Works perfectly on all devices

---

## ✨ Features

### 👥 **Dual User System**
- **Customer Interface** 🧑‍💼
  - Easy ride booking with pickup/destination selection
  - Real-time fare calculation based on distance and vehicle type
  - Digital wallet for seamless payments
  - Address autocomplete for quick location entry
  - Multiple vehicle options (Mini, Plus, Premium)

- **Driver Interface** 🚗
  - Dedicated driver dashboard
  - Real-time ride requests
  - Earnings tracking
  - Profile management

### 🗺️ **Smart Location Services**
- **Geocoding API Integration** - Convert addresses to coordinates
- **Route Matrix API** - Calculate distance and travel time
- **Address Autocomplete** - Smart suggestions as you type
- **Interactive Maps** - Visual route planning

### 💳 **Payment & Wallet System**
- **Digital Wallet** - Store money securely in your account
- **Automatic Deduction** - Seamless payment processing
- **Real-time Balance** - Track your spending and earnings
- **Transaction History** - Complete payment records

### 🎨 **Modern UI/UX**
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Beautiful Animations** - Smooth transitions and interactions
- **Intuitive Navigation** - Easy-to-use interface
- **Dark/Light Themes** - Customizable appearance

---

## 🛠️ Installation

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)
- Git

### Quick Start

1. **Clone the repository** 📥
   ```bash
   git clone https://github.com/yourusername/sujido-cab-booking.git
   cd sujido-cab-booking
   ```

2. **Create a virtual environment** 🐍
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies** 📦
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up the database** 🗄️
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Create a superuser** 👑
   ```bash
   python manage.py createsuperuser
   ```

6. **Run the development server** 🚀
   ```bash
   python manage.py runserver
   ```

7. **Open your browser** 🌐
   Navigate to `http://127.0.0.1:8000` and start exploring!

---

## 📱 Screenshots

<div align="center">

### 🏠 Landing Page
![Landing Page](static/pexels-tim-samuel-5834943.jpg)
*Beautiful landing page with modern design*

### 📋 Booking Interface
![Booking](static/pexels-cottonbro-4606338.jpg)
*Intuitive booking form with map integration*

### 💰 Wallet Dashboard
![Wallet](static/wallet.png)
*Digital wallet with transaction history*

### 🚗 Driver Interface
![Driver](static/pngimg.com%20-%20taxi_PNG41.png)
*Driver dashboard for managing rides*

</div>

---

## 🏗️ Project Structure

```
sujido-cab-booking/
├── 📁 cab/                          # Main Django project
│   ├── 📁 cab/                     # Project settings
│   │   ├── settings.py             # Django configuration
│   │   ├── urls.py                 # URL routing
│   │   └── wsgi.py                 # WSGI configuration
│   ├── 📁 myapp/                   # Main application
│   │   ├── models.py               # Database models
│   │   ├── views.py                # Business logic
│   │   ├── urls.py                 # App URL patterns
│   │   └── admin.py                # Admin interface
│   ├── 📁 templates/               # HTML templates
│   │   ├── landing.html            # Home page
│   │   ├── booking.html            # Booking interface
│   │   ├── driver.html             # Driver dashboard
│   │   ├── wallet.html             # Wallet management
│   │   └── signup_login.html       # Authentication
│   ├── 📁 static/                  # Static files
│   │   ├── 📁 css/                 # Stylesheets
│   │   ├── 📁 js/                  # JavaScript files
│   │   └── 📁 images/              # Images and icons
│   └── db.sqlite3                  # SQLite database
├── requirements.txt                # Python dependencies
└── README.md                       # This file
```

---

## 🔧 Configuration

### API Keys Setup
To use the location services, you'll need to configure API keys:

1. **Geoapify API** (for geocoding and routing)
   - Sign up at [Geoapify](https://geoapify.com/)
   - Get your API key
   - Update the API key in `views.py`

2. **Environment Variables** (Recommended)
   ```bash
   # Create a .env file
   GEOAPIFY_API_KEY=your_api_key_here
   ```

---

## 🚀 Usage

### For Customers 👤
1. **Sign Up/Login** - Create your account or sign in
2. **Book a Ride** - Enter pickup and destination
3. **Select Vehicle** - Choose from Mini, Plus, or Premium
4. **Pay Securely** - Use your digital wallet
5. **Track Your Ride** - Monitor your journey in real-time

### For Drivers 🚗
1. **Register as Driver** - Create your driver account
2. **Access Dashboard** - View available rides
3. **Accept Rides** - Pick up customers
4. **Earn Money** - Track your earnings
5. **Manage Profile** - Update your information

---

## 🛡️ Security Features

- 🔐 **Django's Built-in Security** - CSRF protection, SQL injection prevention
- 🔑 **User Authentication** - Secure login/logout system
- 🛡️ **Role-based Access** - Separate interfaces for customers and drivers
- 💳 **Secure Payments** - Safe wallet transactions
- 🔒 **Data Validation** - Input sanitization and validation

---

## 🧪 Testing

```bash
# Run the test suite
python manage.py test

# Run with coverage
coverage run --source='.' manage.py test
coverage report
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository** 🍴
2. **Create a feature branch** 🌿
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes** 💾
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch** 📤
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request** 🔄

### 🐛 Bug Reports
Found a bug? Please create an issue with:
- 🐛 Clear description of the bug
- 📱 Steps to reproduce
- 💻 Expected vs actual behavior
- 📸 Screenshots (if applicable)

### ✨ Feature Requests
Have an idea? We'd love to hear it!
- 💡 Describe the feature
- 🎯 Explain the use case
- 🚀 Suggest implementation approach

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

<div align="center">

**Made with ❤️ by the Raj**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/yourusername)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/yourprofile)
[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/yourhandle)

</div>

---

## 🙏 Acknowledgments

- 🗺️ **MapMyIndia** - For providing excellent geocoding and routing APIs
- 🎨 **Unsplash/Pexels** - For beautiful stock images
- 🚀 **Django Community** - For the amazing framework
- 💡 **Open Source Contributors** - For inspiration and tools

---

<div align="center">

### ⭐ Star this repository if you found it helpful!

**Happy Coding! 🚀✨**

</div>
