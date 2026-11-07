export const environment = {
  production: false,
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
  // Integración con la web padre (iframe) — ver src/app/models/embed-protocol.ts
  embed: {
    // Web padre que aloja nuestro recorrido: singapur-tower.skaleon.ai
    // (en dev queda "*" para poder probar con el harness local del puerto 4400)
    parentOrigin: "*" as string,
    allowedOrigins: [
      "https://singapur-tower.skaleon.ai",
      "http://localhost:4400",
      "http://localhost:4200",
    ] as string[],
  },
};
