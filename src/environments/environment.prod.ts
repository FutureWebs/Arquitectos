export const environment = {
  production: true,
  firebaseConfig: {
    apiKey: "AIzaSyDvMu6-8qtszSxd11s-IhOQ-hz3iFgJXSw",
    authDomain: "future-e5d0f.firebaseapp.com",
    projectId: "future-e5d0f",
    storageBucket: "future-e5d0f.firebasestorage.app",
    messagingSenderId: "409236120599",
    appId: "1:409236120599:web:5d7ef275d074572208a852",
    measurementId: "G-Z2HH78RXH2"
  },

  // Integración con la web padre (iframe) — ver src/app/models/embed-protocol.ts
  embed: {
    // Web padre que aloja nuestro recorrido (Singapur Tower / skaleon)
    parentOrigin: "https://singapur-tower.skaleon.ai" as string,
    allowedOrigins: ["https://singapur-tower.skaleon.ai"] as string[],
  },
};
