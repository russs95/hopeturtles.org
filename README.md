# 🐢 HopeTurtles.org

The **Hope Turtle Project** is a regenerative humanitarian technology initiative designed to deliver aid **across oceans using ocean currents** — powered by **open-source hardware** and **regenerative design principles**.

Each **Hope Turtle** is a solar-powered marine drone built from bamboo and recycled materials.  
They carry serialized bottles of food and medicine, trackable across the seas through this Node.js web platform.

---

## 🌍 Platform Overview

The web app enables:
- **Mission Planning:** Define launch hubs, missions, and destinations.
- **Turtle Tracking:** View real-time telemetry updates from GPS-enabled Hope Turtles.
- **Bottle Registry:** Manage individual bottles carried within each turtle.
- **Success Logging:** When turtles or bottles are found, users can log photos and thank-you messages.
- **Buwana Authentication:** Shared identity system across regenerative Earthen apps (GoBrik, EarthCal, etc.).

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-------------|
| Backend | Node.js (Express.js) |
| Database | MySQL |
| Frontend | EJS + TailwindCSS |
| Real-Time | Socket.io |
| Auth | Buwana Unified Login |
| Deployment | Ubuntu VPS (NodeJS 22-LTS) |

---

## 📂 Repository Structure

```
hopeturtles.org/
├── server.js
├── config/
│   ├── db.js
│   └── env.js
├── routes/
│   ├── api/
│   └── pages/
├── public/
│   ├── css/
│   ├── js/
│   ├── img/
│   └── logo/
├── views/
│   ├── index.ejs
│   ├── turtles.ejs
│   └── missions.ejs
├── hopeturtle_schema_v1.1.sql
├── .env.example
└── README.md
```

---

## 🔐 Environment Setup

1. Rename `.env.example` to `.env`
2. Edit values to match your VPS configuration:
   ```bash
   DB_HOST=103.185.52.69
   DB_USER=silabumi
   DB_PASS=mayLove&LightFlow_human2human_across|borders
   DB_NAME=hopeturtle_db
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Visit: [http://localhost:3000](http://localhost:3000)

---

## 🧭 Roadmap

- [x] Database schema setup  
- [ ] API routes for turtles, missions, telemetry, and success logs  
- [ ] Map-based tracking dashboard  
- [ ] Buwana single sign-on integration  
- [ ] Admin tools for alerts and mission management  

---

## 🪶 License
This project is licensed under the **GNU GPL-3.0 License** — freely shareable, adaptable, and open for regenerative collaboration.

> “May love and light flow human to human, across borders.” 🌏
